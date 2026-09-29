import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Newspaper,
  CheckCircle2,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const SystemNotificationPopup: React.FC = () => {
  const {
    activePopupNotification,
    dismissPopupNotification,
    markNotificationAsRead,
    setIsQuickVerifyModalOpen,
    setCurrentTab,
    setIsNotificationCenterOpen,
    identity,
  } = useGymLabs();

  if (!activePopupNotification || activePopupNotification.dismissedPopup) {
    return null;
  }

  const notif = activePopupNotification;

  const handlePrimaryAction = () => {
    markNotificationAsRead(notif.id);
    dismissPopupNotification(notif.id);

    if (notif.actionType === 'OPEN_VERIFY_MODAL') {
      setIsQuickVerifyModalOpen(true);
    } else if (notif.actionType === 'NAVIGATE_TAB' && notif.actionTargetTab) {
      setCurrentTab(notif.actionTargetTab as any);
    } else if (notif.actionType === 'NAVIGATE_SETTINGS') {
      setCurrentTab('settings');
    }
  };

  const handleDismiss = () => {
    dismissPopupNotification(notif.id);
  };

  const handleOpenNotificationCenter = () => {
    dismissPopupNotification(notif.id);
    setIsNotificationCenterOpen(true);
  };

  // Determine styling based on type and severity
  const getBadgeStyle = () => {
    if (notif.type === 'MANDATORY_DATA') {
      return {
        label: 'DADOS OBRIGATÓRIOS DO SISTEMA',
        bg: 'bg-red-950/80 border-red-700 text-red-400',
        icon: <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />,
      };
    }
    if (notif.type === 'PERIODIC_CHECK') {
      return {
        label: 'VERIFICAÇÃO PERIÓDICA DE COMPATIBILIDADE',
        bg: 'bg-amber-950/80 border-amber-600 text-amber-300',
        icon: <Clock className="w-4 h-4 text-amber-300 animate-pulse" />,
      };
    }
    if (notif.type === 'NEWS') {
      return {
        label: 'NOVIDADES GYM LABS',
        bg: 'bg-blue-950/80 border-blue-600 text-blue-300',
        icon: <Sparkles className="w-4 h-4 text-blue-300" />,
      };
    }
    return {
      label: 'AVISO DO SISTEMA',
      bg: 'bg-zinc-900 border-zinc-700 text-zinc-300',
      icon: <Bell className="w-4 h-4 text-zinc-300" />,
    };
  };

  const badge = getBadgeStyle();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-zinc-950 border-2 border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-lg w-full p-5 sm:p-6 text-zinc-100 font-mono relative animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 border text-[10px] font-bold tracking-wider ${badge.bg}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>
            <span className="text-[9px] text-zinc-500 uppercase">
              Notificação do Sistema Operacional Gym Labs
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
            title="Dispensar pop-up (permanece guardado no sino)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 mb-5">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
            {notif.title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {notif.message}
          </p>

          {/* Conditional Context Card */}
          {notif.type === 'PERIODIC_CHECK' && (
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 text-[11px] space-y-1.5">
              <div className="flex justify-between items-center text-zinc-400">
                <span>ÚLTIMA CONFIRMAÇÃO CADASTRAL:</span>
                <span className="text-white font-bold">
                  {notif.metadata?.daysSinceLastCheck !== undefined
                    ? `HÁ ${notif.metadata.daysSinceLastCheck} DIAS`
                    : 'PENDENTE'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>PESO ATUAL REGISTRADO:</span>
                <span className="text-white font-bold">{identity.weightKg ? `${identity.weightKg} kg` : 'Não definido'}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>ALTURA REGISTRADA:</span>
                <span className="text-white font-bold">{identity.heightCm ? `${identity.heightCm} cm` : 'Não definida'}</span>
              </div>
              <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                O corpo humano oscila naturalmente. Manter os dados compatíveis garante a precisão de TDEE, BMR e ingestão de água.
              </p>
            </div>
          )}

          {notif.type === 'MANDATORY_DATA' && notif.metadata?.missingFields && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 text-[11px] space-y-1.5">
              <span className="text-red-300 font-bold block text-[10px] uppercase">
                Campos fisiológicos obrigatórios pendentes:
              </span>
              <ul className="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px]">
                {notif.metadata.missingFields.map((field, idx) => (
                  <li key={idx} className="text-red-200">
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Persistence Notice to User */}
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 border border-zinc-800/80 text-[10px] text-zinc-400">
            <Bell className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <span>
              Ao fechar este pop-up, este alerta <strong className="text-zinc-200">continuará salvo no sino 🔔</strong> na barra de cima (ao lado de Sair).
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Dispensar Pop-up
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full sm:w-auto px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{notif.actionLabel || 'Verificar Agora'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
