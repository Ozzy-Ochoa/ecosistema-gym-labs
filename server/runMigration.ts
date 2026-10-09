import { runLocalToPostgresMigration } from '../src/db/migrationService';
import { db, pool } from '../src/db/index';

async function main() {
  console.log('=== GYM LABS — ENGINE DE MIGRAÇÃO E PERSISTÊNCIA RELACIONAL ===');
  console.log('1. Verificando conectividade com o Cloud SQL...');
  try {
    const client = await pool.connect();
    client.release();
    console.log('✓ Conectividade com PostgreSQL estabelecida com sucesso.');
  } catch (err: any) {
    console.error('✗ Erro ao conectar ao PostgreSQL:', err.message);
    process.exit(1);
  }

  console.log('2. Executando sincronização e carga idempotente do schema relacional...');
  const summary = await runLocalToPostgresMigration();
  console.log('✓ Migração concluída com sucesso!');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Falha crítica na migração:', err);
  process.exit(1);
});
