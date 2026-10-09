import { runLocalToPostgresMigration } from '../src/db/migrationService';
import { pool } from '../src/db/index';

async function runDataMigration() {
  console.log('=== GYM LABS — MIGRAÇÃO E SINCRONIZAÇÃO DE DADOS LEGADOS ===');
  try {
    const client = await pool.connect();
    client.release();
    console.log('✓ Conectividade com o PostgreSQL estabelecida com sucesso.');
  } catch (err: any) {
    console.error('✗ Falha na conexão com o PostgreSQL:', err.message);
    process.exit(1);
  }

  console.log('Iniciando migração idempotente de partições locais para o PostgreSQL...');
  try {
    const summary = await runLocalToPostgresMigration();
    console.log('\n--- RESUMO DA MIGRAÇÃO DE DADOS LEGADOS ---');
    console.log(`Registros Encontrados: ${summary.recordsFound}`);
    console.log(`Registros Migrados:    ${summary.recordsMigrated}`);
    console.log(`Registros Ignorados:   ${summary.recordsSkipped}`);
    console.log(`Registros Falhados:    ${summary.recordsFailed}`);

    if (summary.recordsFailed > 0 || summary.errors.length > 0) {
      console.error('\n✗ ERROS NA MIGRAÇÃO:');
      summary.errors.forEach((err, idx) => console.error(`  [${idx + 1}] ${err}`));
      process.exit(1);
    }

    console.log('\n✓ Migração de dados legados concluída com sucesso!');
    process.exit(0);
  } finally {
    try {
      await pool.end();
    } catch {}
  }
}

runDataMigration().catch((err) => {
  console.error('Falha crítica na migração de dados legados:', err);
  process.exit(1);
});
