import { runLocalToPostgresMigration } from '../src/db/migrationService';

async function main() {
  console.log('--- INICIANDO MIGRAÇÃO LOCAL -> CLOUD SQL (POSTGRESQL) ---');
  const summary = await runLocalToPostgresMigration();
  console.log('--- RESULTADO DA MIGRAÇÃO ---');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Falha crítica na migração:', err);
  process.exit(1);
});
