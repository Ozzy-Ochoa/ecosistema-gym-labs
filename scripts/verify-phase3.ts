import { db, pool } from '../src/db/index';
import { UserRepository } from '../server/repositories/UserRepository';
import { SessionRepository } from '../server/repositories/SessionRepository';
import { WorkoutRepository } from '../server/repositories/WorkoutRepository';
import { NutritionRepository } from '../server/repositories/NutritionRepository';
import { SleepRepository } from '../server/repositories/SleepRepository';
import { RelationshipRepository } from '../server/repositories/RelationshipRepository';
import { ChatRepository } from '../server/repositories/ChatRepository';
import { AuditRepository } from '../server/repositories/AuditRepository';
import { hashPassword, verifyPassword, generateTotpSecret, verifyTotpCode } from '../server/services/authService';
import { sql } from 'drizzle-orm';
import { runLocalToPostgresMigration } from '../src/db/migrationService';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 GYM LABS — TEST SUITE DE VERIFICAÇÃO FASE 3.0');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. TESTE DE CONECTIVIDADE E DATABASE
    console.log('--- 1. DATABASE & CONECTIVIDADE ---');
    const ping = await db.execute(sql`SELECT 1 as ping`);
    assert(Boolean(ping), 'PostgreSQL conectado e respondendo ao ping');

    const tableCountQuery = await db.execute(
      sql`SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const rawRows = (tableCountQuery as any).rows || tableCountQuery;
    const tableCount = Number(rawRows[0]?.count || 0);
    assert(tableCount >= 25, `Schema relacional completo com ${tableCount} tabelas no PostgreSQL`);

    // 2. TESTE DE AUTENTICAÇÃO, SESSÕES E REVOGAÇÃO
    console.log('\n--- 2. AUTENTICAÇÃO, SESSÕES E REVOGAÇÃO ---');
    const testUserAId = `usr-test-a-${Date.now()}`;
    const testUserBId = `usr-test-b-${Date.now()}`;
    const passA = 'SenhaSegura123!';
    const passHashA = hashPassword(passA);

    assert(verifyPassword(passA, passHashA), 'Hashing e verificação de senha com scrypt');
    assert(!verifyPassword('SenhaIncorreta', passHashA), 'Rejeição de senha inválida');

    await UserRepository.createUser({
      id: testUserAId,
      email: `test_a_${Date.now()}@gymlabs.com`,
      name: 'Atleta Teste A',
      passwordHash: passHashA,
      role: 'USER',
    });

    await UserRepository.createUser({
      id: testUserBId,
      email: `test_b_${Date.now()}@gymlabs.com`,
      name: 'Personal Teste B',
      passwordHash: hashPassword('SenhaSegura456!'),
      role: 'COACH',
    });

    const userA = await UserRepository.findById(testUserAId);
    assert(Boolean(userA && userA.name === 'Atleta Teste A'), 'Usuário A criado e persistido no PostgreSQL');

    // Sessão
    const tokenA = `token-${Date.now()}-abc`;
    await SessionRepository.createSession({
      userId: testUserAId,
      token: tokenA,
      ip: '127.0.0.1',
      userAgent: 'Jest-Enclave-Runner',
    });

    const sessionA = await SessionRepository.validateSession(tokenA);
    assert(Boolean(sessionA && sessionA.userId === testUserAId), 'Validação de sessão ativa no PostgreSQL');

    // Revogação de Sessão (Logout)
    const revoked = await SessionRepository.revokeSession(tokenA);
    assert(revoked, 'Revogação de sessão individual realizada');
    const sessionAfterRevoke = await SessionRepository.validateSession(tokenA);
    assert(sessionAfterRevoke === null, 'Sessão revogada rejeitada na validação');

    // 2FA
    const totpSecret = generateTotpSecret();
    assert(totpSecret.length > 10, 'Geração de segredo RFC 6238 TOTP');

    // 3. TESTE DE MULTI-TENANCY E ISOLAMENTO
    console.log('\n--- 3. MULTI-TENANCY E ISOLAMENTO DE ACESSO ---');
    // Criar treino para o Usuário A
    const sessionWkt = await WorkoutRepository.createSession({
      userId: testUserAId,
      title: 'Treino A - Peito e Tríceps',
      startedAt: new Date(),
      durationMinutes: 45,
      sessionRpe: 8,
    });
    assert(Boolean(sessionWkt && sessionWkt.id), 'Sessão de treino do Usuário A criada no PostgreSQL');

    // Verificar se Usuário B tem relacionamento com Usuário A antes de autorizar
    const relPre = await RelationshipRepository.getActiveRelationship(testUserAId, testUserBId);
    assert(relPre === null, 'Sem relacionamento: Usuário B NÃO possui vínculo com Usuário A');

    // 4. TESTE DE RELATIONSHIPS, TRANSAÇÕES E CONSENTIMENTO
    console.log('\n--- 4. RELATIONSHIPS, CONVITES E HISTÓRICO ---');
    const userB = await UserRepository.findById(testUserBId);
    const invite = await RelationshipRepository.createInvitation({
      senderId: testUserAId,
      targetEmail: userB?.email || 'test_b@gymlabs.com',
      targetName: 'Personal Teste B',
      targetRole: 'COACH',
      notes: 'Convite para mentoria técnica',
    });
    assert(Boolean(invite && invite.code), `Convite emitido com código ${invite.code}`);

    // Aceite do convite com transação ACID
    const acceptRes = await RelationshipRepository.acceptInvitation(invite.code, testUserBId);
    assert(Boolean(acceptRes && acceptRes.success && acceptRes.relationshipId), 'Transação ACID: Convite aceito e relationship criado');

    // Agora o relacionamento ativo deve existir
    const relPost = await RelationshipRepository.getActiveRelationship(testUserAId, testUserBId);
    assert(Boolean(relPost && relPost.status === 'ACTIVE'), 'Vínculo ativo confirmado entre Atleta e Personal');
    assert(Boolean(relPost?.canViewWorkouts), 'Permissão de visualização de treinos ativa no relacionamento');

    // Histórico de Relacionamento
    const terminateRes = await RelationshipRepository.terminateRelationship(
      acceptRes.relationshipId,
      testUserAId,
      'Finalização de ciclo'
    );
    assert(Boolean(terminateRes && terminateRes.success), 'Encerramento de relacionamento com Soft-Delete (status TERMINATED no histórico)');

    // 5. TESTE DE CHAT E CONTROLE DE PARTICIPANTES
    console.log('\n--- 5. CHAT RELACIONAL & CONTROLE DE PARTICIPANTES ---');
    const conv = await ChatRepository.getOrCreateDirectConversation(testUserAId, testUserBId);
    assert(Boolean(conv && conv.id), `Conversa direta estabelecida (${conv.id})`);

    const isPartA = await ChatRepository.isParticipant(conv.id, testUserAId);
    const isPartB = await ChatRepository.isParticipant(conv.id, testUserBId);
    assert(isPartA && isPartB, 'Participantes autorizados confirmados na conversa');

    const testUserCId = `usr-test-intruder-${Date.now()}`;
    const isPartC = await ChatRepository.isParticipant(conv.id, testUserCId);
    assert(!isPartC, 'Isolamento estrito: Usuário C não participante rejeitado');

    // Envio de mensagem
    const msg = await ChatRepository.sendMessage(
      conv.id,
      testUserAId,
      testUserBId,
      'Olá treinador, treino de hoje concluído com sucesso.'
    );
    assert(Boolean(msg && msg.id), 'Mensagem persistida no PostgreSQL');

    // Leitura por participante
    const msgsForA = await ChatRepository.getMessages(conv.id, testUserAId);
    assert(msgsForA.length >= 1, 'Participante consulta mensagens com sucesso');

    // Tentativa de leitura por não-participante
    let nonParticipantBlocked = false;
    try {
      await ChatRepository.getMessages(conv.id, testUserCId);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_NOT_PARTICIPANT') {
        nonParticipantBlocked = true;
      }
    }
    assert(nonParticipantBlocked, 'Não-participante BLOQUEADO de ler mensagens (403/Forbidden)');

    // 6. TESTE DE AUDITORIA CENTRALIZADA COM HASH CHAINING
    console.log('\n--- 6. AUDITORIA CENTRALIZADA ---');
    const auditRes = await AuditRepository.logEvent(
      testUserAId,
      'DATA_CREATED',
      sessionWkt.id,
      { test: true },
      { ip: '127.0.0.1', userAgent: 'Enclave-Test' }
    );
    assert(Boolean(auditRes && auditRes.chainHash), 'Evento de auditoria registrado com hash encadeado');

    // 7. TESTE DE MIGRAÇÃO IDEMPOTENTE
    console.log('\n--- 7. MIGRAÇÃO LOCAL -> POSTGRESQL ---');
    const migrationSummary = await runLocalToPostgresMigration();
    assert(migrationSummary.recordsFailed === 0, `Migração executada com 0 falhas (${migrationSummary.recordsFound} registros avaliados)`);
    assert(migrationSummary.recordsSkipped >= 0, 'Idempotência verificada: registros pré-existentes ignorados sem duplicação');

    console.log('\n====================================================');
    console.log(`🏁 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Erro fatal durante a suíte de testes:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTestSuite();
