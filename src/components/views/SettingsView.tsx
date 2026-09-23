import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import { JURISDICTIONS } from '../../data/seedData';
import {
  Settings,
  Globe,
  User,
  ShieldCheck,
  Check,
  Save,
  Users,
  UserCheck,
  UserPlus,
  ArrowRight,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserIdentity, UserProfile } from '../../types/user';

export const SettingsView: React.FC = () => {
  const {
    identity,
    updateIdentity,
    profile,
    updateProfile,
    activeJurisdiction,
    savedAccounts,
    activeAccountId,
    switchAccount,
    openAccountModal,
    removeSavedAccount,
  } = useGymLabs();

  const [name, setName] = useState(identity.name);
  const [preferredName, setPreferredName] = useState(identity.preferredName || '');
  const [dateOfBirth, setDateOfBirth] = useState(identity.dateOfBirth || '1996-05-14');
  const [biologicalSex, setBiologicalSex] = useState<UserIdentity['biologicalSex']>(identity.biologicalSex);
  const [jurisdiction, setJurisdiction] = useState(identity.jurisdiction);
  const [language, setLanguage] = useState<UserIdentity['language']>(identity.language);
  const [unitSystem, setUnitSystem] = useState<UserIdentity['unitSystem']>(identity.unitSystem);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(profile.activityLevel);
  const [primaryGoal, setPrimaryGoal] = useState<UserProfile['primaryGoal']>(profile.primaryGoal);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateIdentity({
      name,
      preferredName,
      dateOfBirth,
      biologicalSex,
      jurisdiction,
      language,
      unitSystem,
    });

    updateProfile({
      activityLevel,
      primaryGoal,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="gymlabs-settings-view" className="space-y-6 max-w-5xl mx-auto font-mono">
      {/* HUD Header Banner */}
      <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F0FF]">
              // CONFIGURAÇÕES DO ENCLAVE & PERFIL
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
              USUÁRIO FINAL
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Parâmetros do Atleta & Multi-Login
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Gerencie múltiplos logins de usuários neste dispositivo, configure sua soberania de dados conforme a LGPD e ajuste as constantes biológicas para cálculo de BMR e TDEE.
          </p>
        </div>

        <button
          type="button"
          onClick={openAccountModal}
          className="px-4 py-2 neo-box bg-[#00F0FF] text-black font-bold text-xs flex items-center gap-2 hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)] shrink-0"
        >
          <Users className="w-4 h-4" />
          <span>SELETOR DE CONTAS</span>
        </button>
      </div>

      {/* Scope Clarification Card */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 neo-box flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 font-sans space-y-1">
          <p className="font-bold text-white font-mono uppercase text-xs">
            Portal do Usuário Final (Pessoa Física / Aluno)
          </p>
          <p className="text-zinc-400 text-xs">
            Este aplicativo é o terminal operacional do praticante de musculação e atleta. Personais Trainers, Nutricionistas e Administradores possuem painéis e interfaces dedicadas no ecossistema Gym Labs para prescrição de dietas, periodização e gestão clínica.
          </p>
        </div>
      </div>

      {/* MULTI-LOGIN / SAVED ACCOUNTS SECTION */}
      <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Logins Salvos neste Dispositivo ({savedAccounts.length})
              </h3>
              <p className="text-[11px] text-zinc-400">
                Alterne instantaneamente entre atletas cadastrados ou adicione uma nova conta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAccountModal}
            className="px-3 py-1.5 neo-box text-xs font-bold text-[#00F0FF] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>NOVO LOGIN</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {savedAccounts.map((acc) => {
            const isCurrent = acc.id === activeAccountId;
            return (
              <div
                key={acc.id}
                onClick={() => !isCurrent && switchAccount(acc.id)}
                className={`p-4 border-2 transition-all relative cursor-pointer ${
                  isCurrent
                    ? 'border-[#00F0FF] bg-[#00F0FF]/5 shadow-[2px_2px_0px_0px_rgba(0,240,255,0.3)]'
                    : 'border-zinc-800 bg-black hover:border-zinc-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 neo-box flex items-center justify-center font-bold text-xs uppercase ${
                        isCurrent
                          ? 'bg-black text-[#00F0FF] border-2 border-[#00F0FF]'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {acc.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase truncate max-w-[130px]">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#39FF14] text-black font-black uppercase">
                      ATIVO
                    </span>
                  ) : (
                    savedAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remover perfil de ${acc.name}?`)) {
                            removeSavedAccount(acc.id);
                          }
                        }}
                        className="p-1 text-zinc-600 hover:text-[#FF0055]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>PIN: {acc.pin || '2026'}</span>
                  <span>{acc.primaryGoal || 'TREINO'}</span>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => switchAccount(acc.id)}
                    className="mt-3 w-full py-1 text-center neo-box text-[11px] font-bold text-zinc-300 hover:text-[#00F0FF] hover:border-[#00F0FF] flex items-center justify-center gap-1"
                  >
                    <span>USAR ESTE LOGIN</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Jurisdictional & Compliance Settings */}
        <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Globe className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Jurisdição Legal & Soberania de Dados
              </h3>
              <p className="text-[11px] text-zinc-400">
                Regulamentação aplicável aos dados biométricos e registros de saúde.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Jurisdição Soberana
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.code} value={j.code}>
                    {j.name} ({j.privacyRegime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Sistema de Unidades
              </label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value as any)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              >
                <option value="METRIC">Métrico (Quilos, Centímetros, Litros)</option>
                <option value="IMPERIAL">Imperial (Libras, Polegadas, Oz)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Idioma da Interface
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              >
                <option value="pt">Português (Brasil)</option>
                <option value="en">English (US)</option>
                <option value="es">Español (Latinoamérica)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Biological Parameters & Performance Identity */}
        <div className="p-6 bg-[#050505] border-2 border-zinc-800 neo-box-thick space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <User className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Constantes Biológicas & Fisiologia do Operador
              </h3>
              <p className="text-[11px] text-zinc-400">
                Variáveis utilizadas nas equações determinísticas de BMR (Mifflin-St Jeor) e TDEE.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Nome do Atleta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Apelido / Chamada
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Sexo Biológico (Fator Mifflin-St Jeor)
              </label>
              <select
                value={biologicalSex}
                onChange={(e) => setBiologicalSex(e.target.value as any)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              >
                <option value="MALE">Masculino (+5 cal)</option>
                <option value="FEMALE">Feminino (-161 cal)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Nível de Atividade Física (PAL)
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              >
                <option value="SEDENTARY">Sedentário (1.20 - Pouco exercício)</option>
                <option value="LIGHTLY_ACTIVE">Levemente Ativo (1.375 - 1 a 3 dias/sem)</option>
                <option value="MODERATELY_ACTIVE">Moderadamente Ativo (1.55 - 3 a 5 dias/sem)</option>
                <option value="VERY_ACTIVE">Muito Ativo (1.725 - 6 a 7 dias/sem)</option>
                <option value="EXTRA_ACTIVE">Extremamente Ativo (1.90 - Treino 2x ao dia)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1.5 font-bold uppercase text-[10px]">
                Objetivo Fisiológico Primário
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as any)}
                className="w-full px-3 py-2 bg-black border border-zinc-700 text-white focus:border-[#00F0FF] focus:outline-none font-mono"
              >
                <option value="HYPERTROPHY">Hipertrofia Muscular</option>
                <option value="FAT_LOSS">Composição Corporal / Queima de Gordura</option>
                <option value="STRENGTH">Força Máxima (1RM)</option>
                <option value="ENDURANCE">Resistência Cardiorrespiratória</option>
                <option value="LONGEVITY">Saúde & Longevidade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-black border-2 border-zinc-800 neo-box">
          {savedSuccess ? (
            <span className="flex items-center gap-1.5 text-xs text-[#39FF14] font-bold">
              <Check className="w-4 h-4" />
              <span>Constantes biológicas e parâmetros salvos com sucesso!</span>
            </span>
          ) : (
            <span className="text-xs text-zinc-500">
              Alterações são sincronizadas imediatamente na partição local.
            </span>
          )}

          <button
            id="save-settings-btn"
            type="submit"
            className="px-6 py-2.5 neo-box bg-[#00F0FF] text-black font-mono font-black text-xs uppercase hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(0,240,255,0.4)] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>SALVAR PARÂMETROS</span>
          </button>
        </div>
      </form>
    </div>
  );
};
