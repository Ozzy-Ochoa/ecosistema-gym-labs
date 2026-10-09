import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Pool } from 'pg';

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints?: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

export async function runSchemaMigration() {
  console.log('=== DRIZZLE — EXECUÇÃO DE MIGRATIONS ESTRUTURAIS VERSIONADAS ===');
  
  const adminPool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_ADMIN_USER || process.env.SQL_USER,
    password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
  });

  const client = await adminPool.connect();
  try {
    console.log('✓ Conectividade com o PostgreSQL (usuário administrativo DDL) estabelecida com sucesso.');

    // 1. Garante tabela de controle de migrations no schema public
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint NOT NULL
      );
    `);

    // 2. Lê histórico de migrations aplicadas
    const appliedRes = await client.query(`SELECT created_at FROM public.__drizzle_migrations;`);
    const appliedSet = new Set<string>(appliedRes.rows.map((r) => String(r.created_at)));

    // 3. Lê o journal de migrations gerado pelo drizzle-kit
    const journalPath = path.join(process.cwd(), 'drizzle', 'meta', '_journal.json');
    if (!fs.existsSync(journalPath)) {
      console.log('Nenhuma migration encontrada em ./drizzle/meta/_journal.json');
      return;
    }

    const journalContent = fs.readFileSync(journalPath, 'utf-8');
    const journal: Journal = JSON.parse(journalContent);

    let executedCount = 0;

    for (const entry of journal.entries) {
      if (appliedSet.has(String(entry.when))) {
        console.log(`- Migration [${entry.tag}] já aplicada anteriormente (idx: ${entry.idx}).`);
        continue;
      }

      const sqlFilePath = path.join(process.cwd(), 'drizzle', `${entry.tag}.sql`);
      if (!fs.existsSync(sqlFilePath)) {
        throw new Error(`Arquivo SQL da migration não encontrado: ${sqlFilePath}`);
      }

      const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
      const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');

      // Divide por breakpoints de declarações
      const statements = sqlContent
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      console.log(`Aplicando migration [${entry.tag}] (${statements.length} instruções SQL)...`);

      // Executa a migration dentro de transação ACID
      await client.query('BEGIN');
      try {
        for (const statement of statements) {
          await client.query('SAVEPOINT stmt_step');
          try {
            await client.query(statement);
            await client.query('RELEASE SAVEPOINT stmt_step');
          } catch (stmtErr: any) {
            await client.query('ROLLBACK TO SAVEPOINT stmt_step');
            if (stmtErr.code === '42P07' || stmtErr.message?.includes('already exists')) {
              // Objeto de banco já existente, continuidade idempotente
            } else {
              throw stmtErr;
            }
          }
        }

        await client.query(
          `INSERT INTO public.__drizzle_migrations (hash, created_at) VALUES ($1, $2);`,
          [hash, entry.when]
        );

        await client.query('COMMIT');
        console.log(`✓ Migration [${entry.tag}] aplicada com sucesso!`);
        executedCount++;
      } catch (err: any) {
        await client.query('ROLLBACK');
        throw new Error(`Falha ao executar migration [${entry.tag}]: ${err.message}`);
      }
    }

    // 4. Garante permissões DML para o usuário da aplicação
    if (process.env.SQL_USER && process.env.SQL_USER !== process.env.SQL_ADMIN_USER) {
      await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${process.env.SQL_USER}";`).catch(() => {});
      await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${process.env.SQL_USER}";`).catch(() => {});
    }

    console.log(`✓ Processamento concluído. ${executedCount} nova(s) migration(s) executada(s).`);
  } finally {
    client.release();
    await adminPool.end();
  }
}

if (process.argv[1]?.endsWith('migrateSchema.ts')) {
  runSchemaMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('✗ Erro na migração estrutural:', err.message);
      process.exit(1);
    });
}
