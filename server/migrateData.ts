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
  const summary = await runLocalToPostgresMigration();
  console.log('✓ Resumo da migração de dados legados:');
  console.log(JSON.stringify(summary, null, 2));

  if (summary.recordsFailed > 0) {
    console.warn(`Atenção: ${summary.recordsFailed} registros falharam durante a migração.`);
    process.exit(1);
  }

  process.exit(0);
}

runDataMigration().catch((err) => {
  console.error('Falha crítica na migração de dados legados:', err);
  process.exit(1);
});
