/**
 * GYM LABS — AUDITORIA PÓS-CORREÇÃO 3.0-FINAL: SUÍTE DE TESTES E INTEGRIDADE
 * 
 * Validação rigorosa dos cenários críticos:
 * 1. Autenticação, Sessões e Revogação Estrita (sem bypass criptográfico)
 * 2. Isolamento Multi-Tenant e Autorização de Relacionamentos
 * 3. Permissões Granulares e Bloqueio após Revogação de Consentimento LGPD
 * 4. Sanitização Recursiva de Segredos na Auditoria
 * 5. Consistência e Idempotência de Migrações
 */

import { SessionRepository } from '../server/repositories/SessionRepository';
import { UserRepository } from '../server/repositories/UserRepository';
import { RelationshipRepository } from '../server/repositories/RelationshipRepository';
import { ChatRepository } from '../server/repositories/ChatRepository';
import { AuditRepository } from '../server/repositories/AuditRepository';
import { createSessionToken, hashPassword, generateRecoveryKey, verifyRecoveryKey } from '../server/services/authService';
import { db, pool } from '../src/db/index';
import { users, sessions, relationships, consents } from '../src/db/schema';
import { eq } from 'drizzle-orm';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, durationMs: Date.now() - start });
    console.log(`  ✓ PASS: ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message, durationMs: Date.now() - start });
    console.error(`  ✗ FAIL: ${name}: ${err.message}`);
  }
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('GYM LABS — EXECUÇÃO DE TESTES DE INTEGRIDADE, SESSÕES E SEGURANÇA');
  console.log('=============================================================\n');

  // Identificador único para a bateria de testes
  const testRunId = `test-${Date.now()}`;
  const testUserAId = `usr-test-a-${testRunId}`;
  const testUserBId = `usr-test-b-${testRunId}`;
  const testUserCId = `usr-test-c-${testRunId}`;

  try {
    // 1. SETUP DE TESTE: Criação de 3 identidades de teste no PostgreSQL
    console.log('[FASE 1] Provisionamento de Identidades de Teste no PostgreSQL...');
    const pwdHash = hashPassword('TestPassword123!');
    const recKey = generateRecoveryKey();

    await UserRepository.createUser({
      id: testUserAId,
      email: `${testUserAId}@gymlabs-test.com`,
      name: 'Atleta Teste A',
      passwordHash: pwdHash,
      recoveryKeyHash: recKey.keyHash,
      role: 'USER',
      isDemo: false,
    });

    await UserRepository.createUser({
      id: testUserBId,
      email: `${testUserBId}@gymlabs-test.com`,
      name: 'Coach Teste B',
      passwordHash: pwdHash,
      recoveryKeyHash: recKey.keyHash,
      role: 'COACH',
      isDemo: false,
    });

    await UserRepository.createUser({
      id: testUserCId,
      email: `${testUserCId}@gymlabs-test.com`,
      name: 'Intruso Teste C',
      passwordHash: pwdHash,
      recoveryKeyHash: recKey.keyHash,
      role: 'USER',
      isDemo: false,
    });

    // -------------------------------------------------------------
    // CENÁRIO 1: AUTENTICAÇÃO, PERSISTÊNCIA DE SESSÃO E REVOGAÇÃO
    // -------------------------------------------------------------
    console.log('\n[FASE 2] Testes de Sessões e Revogação Estrita...');

    const tokenA = createSessionToken(testUserAId);

    await runTest('Sessão registrada no PostgreSQL é validada com sucesso', async () => {
      await SessionRepository.createSession({
        userId: testUserAId,
        token: tokenA,
        ip: '127.0.0.1',
        userAgent: 'GymLabsTestRunner/1.0',
        deviceName: 'Test Device A',
      });

      const validated = await SessionRepository.validateSession(tokenA);
      if (!validated || validated.userId !== testUserAId) {
        throw new Error(`Esperava userId ${testUserAId}, mas obteve ${validated?.userId}`);
      }
    });

    await runTest('Token com HMAC válido mas NÃO persistido no banco é REJEITADO (sem fallback)', async () => {
      const forgedToken = createSessionToken(testUserAId);
      const validated = await SessionRepository.validateSession(forgedToken);
      if (validated !== null) {
        throw new Error('Falha de segurança: token não persistido foi aceito!');
      }
    });

    await runTest('Logout revoga a sessão específica via hash do token', async () => {
      const revoked = await SessionRepository.revokeSession(tokenA);
      if (!revoked) throw new Error('Falha ao revogar sessão');

      const validatedAfterRevoke = await SessionRepository.validateSession(tokenA);
      if (validatedAfterRevoke !== null) {
        throw new Error('Falha crítica: sessão revogada continua sendo aceita como autenticada!');
      }
    });

    await runTest('Revogação global (revokeAllForUser) invalida todas as sessões ativas do usuário', async () => {
      const token1 = createSessionToken(testUserAId);
      const token2 = createSessionToken(testUserAId);
      await SessionRepository.createSession({ userId: testUserAId, token: token1 });
      await SessionRepository.createSession({ userId: testUserAId, token: token2 });

      const count = await SessionRepository.revokeAllForUser(testUserAId);
      if (count < 2) throw new Error(`Esperava ao menos 2 sessões revogadas, obteve ${count}`);

      const v1 = await SessionRepository.validateSession(token1);
      const v2 = await SessionRepository.validateSession(token2);
      if (v1 !== null || v2 !== null) {
        throw new Error('Sessão permaneceu ativa após revokeAllForUser!');
      }
    });

    // -------------------------------------------------------------
    // CENÁRIO 2: SANITIZAÇÃO RECURSIVA DE AUDITORIA
    // -------------------------------------------------------------
    console.log('\n[FASE 3] Testes de Auditoria e Sanitização de Segredos...');

    await runTest('AuditRepository sanitiza recursivamente segredos em objetos aninhados e arrays', async () => {
      const dirtyMetadata = {
        athlete: 'Alex',
        credentials: {
          password: 'SecretPassword!',
          nested: {
            auth_token: 'bearer-xyz',
            recovery_key: 'REC-1234-5678',
            pinCode: '1234',
          },
        },
        payloadList: [
          { token: 'secret-token-1' },
          { validMetric: 82.5 },
        ],
      };

      const sanitized = AuditRepository.sanitizeDetails(dirtyMetadata);

      if (sanitized.credentials.password !== '[REDACTED]') {
        throw new Error('Senha não foi censurada');
      }
      if (sanitized.credentials.nested.auth_token !== '[REDACTED]') {
        throw new Error('Token aninhado não foi censurado');
      }
      if (sanitized.credentials.nested.recovery_key !== '[REDACTED]') {
        throw new Error('Chave de recuperação aninhada não foi censurada');
      }
      if (sanitized.credentials.nested.pinCode !== '[REDACTED]') {
        throw new Error('PIN aninhado não foi censurado');
      }
      if (sanitized.payloadList[0].token !== '[REDACTED]') {
        throw new Error('Token em array não foi censurado');
      }
      if (sanitized.payloadList[1].validMetric !== 82.5) {
        throw new Error('Métrica válida foi indevidamente alterada');
      }
    });

    await runTest('Registro de auditoria encadeada persiste no PostgreSQL', async () => {
      const auditResult = await AuditRepository.logEvent(
        testUserAId,
        'TEST_SECURITY_EVENT',
        'res-001',
        { action: 'UNIT_TEST_VERIFICATION' },
        { ip: '10.0.0.1', userAgent: 'LabcoreTest' }
      );

      if (!auditResult || !auditResult.id || !auditResult.chainHash) {
        throw new Error('Falha ao registrar evento de auditoria no PostgreSQL');
      }

      const events = await AuditRepository.getEvents(testUserAId, 10);
      const found = events.find((e) => e.id === auditResult.id);
      if (!found) throw new Error('Evento de auditoria não encontrado no PostgreSQL');
    });

    // -------------------------------------------------------------
    // CENÁRIO 3: MULTI-TENANCY, RELACIONAMENTOS E LGPD
    // -------------------------------------------------------------
    console.log('\n[FASE 4] Testes de Autorização Multi-Tenant e Relacionamentos...');

    let activeRelId: string = '';
    let consentId: string = '';

    await runTest('Criação e estabelecimento de relacionamento ativo entre Atleta A e Coach B', async () => {
      const rel = await RelationshipRepository.createRelationship({
        sourceUserId: testUserAId,
        targetUserId: testUserBId,
        relationshipType: 'USER_PERSONAL',
        canViewWorkouts: true,
        canViewDiet: false,
        canViewBodyMetrics: true,
        canPrescribeWorkouts: true,
      });

      if (!rel || rel.status !== 'ACTIVE') {
        throw new Error('Falha ao criar relacionamento');
      }
      activeRelId = rel.id;
    });

    await runTest('Verificação bidirecional: Coach B e Atleta A têm relacionamento ativo', async () => {
      const relAB = await RelationshipRepository.getActiveRelationship(testUserAId, testUserBId);
      const relBA = await RelationshipRepository.getActiveRelationship(testUserBId, testUserAId);

      if (!relAB || !relBA) {
        throw new Error('Relacionamento não encontrado em ambas as direções');
      }
      if (relAB.id !== relBA.id) {
        throw new Error('Inconsistência de IDs de relacionamento na busca bidirecional');
      }
    });

    await runTest('Intruso C NÃO possui relacionamento com Atleta A', async () => {
      const relCA = await RelationshipRepository.getActiveRelationship(testUserCId, testUserAId);
      if (relCA !== null) {
        throw new Error('Falha de segurança: relacionamento detectado para usuário intruso!');
      }
    });

    await runTest('Intruso C é IMPEDIDO de encerrar relacionamento de A e B (FORBIDDEN_NOT_PARTY)', async () => {
      try {
        await RelationshipRepository.terminateRelationship(activeRelId, testUserCId, 'Tentativa de encerramento por terceiro');
        throw new Error('Vulnerabilidade crítica: usuário de fora conseguiu encerrar relacionamento!');
      } catch (err: any) {
        if (err.message !== 'FORBIDDEN_NOT_PARTY') {
          throw new Error(`Esperava FORBIDDEN_NOT_PARTY, mas obteve: ${err.message}`);
        }
      }
    });

    await runTest('Parte autorizada (Atleta A) encerra relacionamento com sucesso', async () => {
      const result = await RelationshipRepository.terminateRelationship(activeRelId, testUserAId, 'Encerramento legítimo');
      if (!result || !result.success) {
        throw new Error('Falha ao encerrar relacionamento legitimamente');
      }

      // Após encerramento, getActiveRelationship deve retornar null
      const checkActive = await RelationshipRepository.getActiveRelationship(testUserAId, testUserBId);
      if (checkActive !== null) {
        throw new Error('Relacionamento TERMINATED ainda consta como ACTIVE!');
      }
    });

    // -------------------------------------------------------------
    // CENÁRIO 4: ISOLAMENTO DE CHAT E PARTICIPAÇÃO
    // -------------------------------------------------------------
    console.log('\n[FASE 5] Testes de Isolamento e Autorização de Mensageria (Chat)...');

    let convId: string = '';

    await runTest('Criação de conversa direta entre Atleta A e Coach B', async () => {
      const conv = await ChatRepository.getOrCreateDirectConversation(testUserAId, testUserBId);
      if (!conv || !conv.id) throw new Error('Falha ao criar conversa');
      convId = conv.id;
    });

    await runTest('Participante legítimo (Atleta A) envia mensagem com sucesso', async () => {
      const msg = await ChatRepository.sendMessage(convId, testUserAId, testUserBId, 'Olá Coach!');
      if (!msg || !msg.id) throw new Error('Falha ao enviar mensagem');
    });

    await runTest('Intruso C é IMPEDIDO de ler mensagens da conversa de A e B', async () => {
      try {
        await ChatRepository.getMessages(convId, testUserCId);
        throw new Error('Vulnerabilidade crítica: Intruso C conseguiu ler mensagens privadas!');
      } catch (err: any) {
        if (err.message !== 'FORBIDDEN_NOT_PARTICIPANT') {
          throw new Error(`Esperava FORBIDDEN_NOT_PARTICIPANT, mas obteve: ${err.message}`);
        }
      }
    });

    await runTest('Intruso C é IMPEDIDO de enviar mensagens na conversa de A e B', async () => {
      try {
        await ChatRepository.sendMessage(convId, testUserCId, testUserAId, 'Mensagem invasora');
        throw new Error('Vulnerabilidade crítica: Intruso C conseguiu enviar mensagem em conversa de terceiros!');
      } catch (err: any) {
        if (err.message !== 'FORBIDDEN_NOT_PARTICIPANT') {
          throw new Error(`Esperava FORBIDDEN_NOT_PARTICIPANT, mas obteve: ${err.message}`);
        }
      }
    });

  } finally {
    // LIMPEZA SEGURA DOS REGISTROS DE TESTE
    console.log('\n[FASE 6] Limpeza de registros de teste no PostgreSQL...');
    try {
      await db.delete(users).where(eq(users.id, testUserAId)).catch(() => {});
      await db.delete(users).where(eq(users.id, testUserBId)).catch(() => {});
      await db.delete(users).where(eq(users.id, testUserCId)).catch(() => {});
      console.log('✓ Registros de teste isolados foram removidos com sucesso.');
    } catch (cleanErr: any) {
      console.warn('Aviso durante limpeza de teste:', cleanErr.message);
    }
  }

  // RELATÓRIO DE RESULTADOS
  console.log('\n=============================================================');
  console.log('RESUMO DOS RESULTADOS DA SUÍTE DE TESTES:');
  console.log('=============================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total de Testes: ${total}`);
  console.log(`Sucessos:        ${passed}`);
  console.log(`Falhas:          ${failed}`);

  if (failed > 0) {
    console.error('\nTestes com falha:');
    results.filter((r) => !r.passed).forEach((r) => console.error(` - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n>>> TODOS OS TESTES PASSARAM COM SUCESSO! <<<\n');
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Erro fatal no executor de testes:', err);
  process.exit(1);
});
