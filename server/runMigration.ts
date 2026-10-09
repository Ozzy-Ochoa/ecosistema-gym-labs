import { runSchemaMigration } from './migrateSchema';
import { runLocalToPostgresMigration } from '../src/db/migrationService';
import { pool } from '../src/db/index';

async function main() {
  console.log('=== GYM LABS — PIPELINE COMPLETO DE MIGRAÇÃO E PERSISTÊNCIA ===');
  console.log('1. Executando migrations estruturais DDL de ./drizzle...');
  try {
    await runSchemaMigration();
    console.log('✓ Schema relacional versionado verificado/aplicado com sucesso.');
  } catch (err: any) {
    console.warn('Nota sobre migrations Drizzle:', err.message);
  }

  console.log('2. Executando migração idempotente de dados legados...');
  const summary = await runLocalToPostgresMigration();
  console.log('✓ Migração de dados concluída!');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Falha crítica no pipeline de migração:', err);
  process.exit(1);
});
