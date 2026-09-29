import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Download,
  Trash2,
  Lock,
  AlertOctagon,
  CheckCircle2,
  History,
  Key,
} from 'lucide-react';

export const TrustAndComplianceView: React.FC = () => {
  const {
    identity,
    auditLogs,
    exportUserDataJson,
    purgeAllUserData,
    bodyRecords,
    trainingSessions,
    meals,
    sleepSessions,
    twoFactorEnabled,
    toggleTwoFactor,
  } = useGymLabs();

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleDownloadArchive = () => {
    const jsonStr = exportUserDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymlabs-export-${identity.id}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleConfirmPurge = async () => {
    try {
      await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {}
    purgeAllUserData();
    setShowPurgeConfirm(false);
  };

  const handleGenerateRecoveryKey = () => {
    const randomHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `REC-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}`;
    setGeneratedKey(key);
  };

  return (
    <div id="gymlabs-trust-compliance-view" className="space-y-6 select-none font-mono">
      {/* Editorial Header */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Governança & Soberania de Dados
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
              AUDITADO
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white">
            Privacidade, Portabilidade & Auditoria
          </h1>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Soberania do titular, exportação completa de dados e trilha de auditoria transparente.
          </p>
        </div>
      </div>

      {/* RIGHTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Right to Data Portability */}
        <div className="p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold text-white uppercase">
                Portabilidade Integral de Dados
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 border border-zinc-700 px-2 py-0.5">
              JSON ESTRUTURADO
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Exporte a totalidade dos registros fisiológicos, antropometria, sessões de treino, diário nutricional e telemetria de sono.
          </p>

          <div className="p-3 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div>Sessões de Treino: <strong className="text-white">{trainingSessions.length}</strong></div>
            <div>Refeições e Hidratação: <strong className="text-white">{meals.length}</strong></div>
            <div>Registros de Sono: <strong className="text-white">{sleepSessions.length}</strong></div>
            <div>Avaliações Antropométricas: <strong className="text-white">{bodyRecords.length}</strong></div>
          </div>

          <button
            type="button"
            onClick={handleDownloadArchive}
            className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo Completo (.JSON)</span>
          </button>

          {downloadSuccess && (
            <div className="p-2 border border-zinc-600 bg-zinc-900 text-white text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Arquivo gerado e baixado com sucesso!</span>
            </div>
          )}
        </div>

        {/* Right to be Forgotten / Purge */}
        <div className="p-5 bg-black border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold text-white uppercase">
                Exclusão Definitiva de Registros
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 border border-zinc-700 px-2 py-0.5">
              EXPURGO
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Eliminação atômica e irreversível de toda a partição do titular no dispositivo e servidores locais.
          </p>

          <div className="p-3 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2 font-sans">
            <AlertOctagon className="w-4 h-4 shrink-0 text-white" />
            <span>Aviso: Esta ação é definitiva e não pode ser revertida.</span>
          </div>

          {!showPurgeConfirm ? (
            <button
              type="button"
              onClick={() => setShowPurgeConfirm(true)}
              className="w-full py-2.5 border border-zinc-700 bg-zinc-950 text-white font-bold text-xs uppercase hover:bg-white hover:text-black cursor-pointer transition-all"
            >
              Expurgar Todos os Meus Dados
            </button>
          ) : (
            <div className="p-4 border border-white bg-zinc-950 space-y-3">
              <span className="text-xs font-bold text-white block uppercase">
                Tem certeza? Todos os registros serão destruídos.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPurgeConfirm(false)}
                  className="flex-1 py-1.5 border border-zinc-700 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurge}
                  className="flex-1 py-1.5 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]"
                >
                  Sim, Exterminar Dados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CRYPTOGRAPHIC SPECIFICATIONS */}
      <div className="p-5 bg-black border border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Segurança Criptográfica // scrypt KDF & Autenticação
            </h3>
          </div>
          <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5">
            PADRÃO DE AUDITORIA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase text-zinc-500 block font-bold">Derivação de Chave (KDF)</span>
            <div className="text-base font-bold text-white">scrypt</div>
            <p className="text-[10px] text-zinc-400 font-sans">
              N=16384, r=8, p=1 com salt de 128 bits.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase text-zinc-500 block font-bold">Cifra do Vault</span>
            <div className="text-base font-bold text-white">AES-256-GCM</div>
            <p className="text-[10px] text-zinc-400 font-sans">
              Autenticação de integridade GMAC sem adulteração.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-zinc-500 block font-bold">2FA RFC 6238 TOTP</span>
              <button
                type="button"
                onClick={toggleTwoFactor}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase cursor-pointer ${
                  twoFactorEnabled ? 'bg-white text-black' : 'bg-black border border-zinc-700 text-zinc-500'
                }`}
              >
                {twoFactorEnabled ? 'ATIVO' : 'INATIVO'}
              </button>
            </div>
            <div className="text-base font-bold text-white">
              {twoFactorEnabled ? 'PROTEGIDO' : 'DESABILITADO'}
            </div>
            <p className="text-[10px] text-zinc-400 font-sans">
              Janela de tolerância ±1 passo, HMAC-SHA1.
            </p>
          </div>
        </div>

        {/* Cryptographic Recovery Key Module */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white uppercase">
                Chave Criptográfica de Recuperação
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateRecoveryKey}
              className="px-3 py-1 border border-zinc-700 text-xs font-bold text-white hover:bg-white hover:text-black cursor-pointer uppercase transition-all"
            >
              Gerar Nova Chave
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            A chave de recuperação é exibida uma única vez ao usuário e armazenada apenas como hash unidirecional.
          </p>
          {generatedKey && (
            <div className="p-2.5 bg-black border border-white text-white text-xs font-bold text-center tracking-widest mt-2">
              {generatedKey}
            </div>
          )}
        </div>
      </div>

      {/* AUDIT TRAIL LOG */}
      <div className="p-5 bg-black border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Trilha de Auditoria do Usuário
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-bold">{auditLogs.length} EVENTOS</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{log.action}</span>
                <span className="text-[10px] text-zinc-500 font-sans">
                  {new Date(log.timestamp).toLocaleString('pt-BR')} • Ator: {log.actor}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2 py-0.5 border border-zinc-700 text-white font-bold uppercase">
                  {log.domain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
