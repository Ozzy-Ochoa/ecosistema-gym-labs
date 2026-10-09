import { runSchemaMigration } from './migrateSchema';
import { runLocalToPostgresMigration } from '../src/db/migrationService';
import { pool } from '../src/db/index';

async function main() {
  console.log('=============================================================');
  console.log('=== GYM LABS — PIPELINE COMPLETO DE MIGRAÇÃO E PERSISTÊNCIA ===');
  console.log('=============================================================\n');

  try {
    // ETAPA 1: Migração Estrutural DDL
    console.log('[ETAPA 1/2] Executando migrations estruturais DDL de ./drizzle...');
    await runSchemaMigration();
    console.log('✓ [ETAPA 1/2] Schema relacional versionado aplicado/verificado com sucesso.\n');

    // ETAPA 2: Migração de Dados Legados
    console.log('[ETAPA 2/2] Executando migração idempotente de dados legados...');
    const summary = await runLocalToPostgresMigration();

    console.log('\n--- RELATÓRIO DETALHADO DA MIGRAÇÃO DE DADOS ---');
    console.log(`Registros Encontrados: ${summary.recordsFound}`);
    console.log(`Registros Migrados:    ${summary.recordsMigrated}`);
    console.log(`Registros Ignorados:   ${summary.recordsSkipped}`);
    console.log(`Registros Falhados:    ${summary.recordsFailed}`);
    console.log('\nDetalhamento por Entidade:');
    for (const [entity, count] of Object.entries(summary.details)) {
      console.log(` - ${entity.padEnd(16)}: ${count} migrado(s)`);
    }

    if (summary.errors.length > 0 || summary.recordsFailed > 0) {
      console.error('\n✗ ERROS DETECTADOS NA MIGRAÇÃO:');
      summary.errors.forEach((err, idx) => {
        console.error(`  [${idx + 1}] ${err}`);
      });
      console.error('\n✗ O pipeline falhou devido a erros ou registros corrompidos.');
      process.exit(1);
    }

    console.log('\n✓ [ETAPA 2/2] Migração de dados concluída com sucesso total sem erros!');
    console.log('=============================================================');
    process.exit(0);
  } catch (err: any) {
    console.error('\n✗ FALHA CRÍTICA NO PIPELINE DE MIGRAÇÃO:');
    console.error(err.message || err);
    process.exit(1);
  } finally {
    try {
      await pool.end();
    } catch {}
  }
}

main().catch((err) => {
  console.error('Falha não capturada no pipeline de migração:', err);
  process.exit(1);
});
