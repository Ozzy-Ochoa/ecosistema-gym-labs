import React from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Bell,
  Trash2,
  CheckCheck,
  X,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const NotificationCenterDrawer: React.FC = () => {
  const {
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
    setIsQuickVerifyModalOpen,
    setCurrentTab,
    triggerPeriodicCheckSimulation,
  } = useGymLabs();

  if (!isNotificationCenterOpen) return null;

  const handleClose = () => {
    setIsNotificationCenterOpen(false);
  };

  const handleAction = (notif: any) => {
    markNotificationAsRead(notif.id);
    setIsNotificationCenterOpen(false);

    if (notif.actionType === 'OPEN_VERIFY_MODAL') {
      setIsQuickVerifyModalOpen(true);
    } else if (notif.actionType === 'NAVIGATE_TAB' && notif.actionTargetTab) {
      setCurrentTab(notif.actionTargetTab);
    } else if (notif.actionType === 'NAVIGATE_SETTINGS') {
      setCurrentTab('settings');
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) return 'Agora há pouco';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      if (diffDays === 1) return 'Ontem';
      return `Há ${diffDays} dias`;
    } catch {
      return 'Recente';
    }
  };

  const getTypeDetails = (type: string, severity: string) => {
    if (type === 'MANDATORY_DATA') {
      return {
        label: 'DADOS OBRIGATÓRIOS',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
        borderColor: 'border-red-900/60 bg-red-950/20',
        badgeColor: 'bg-red-950 text-red-300 border-red-800',
      };
    }
    if (type === 'PERIODIC_CHECK') {
      return {
        label: 'VERIFICAÇÃO PERIÓDICA',
        icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
        borderColor: 'border-amber-900/60 bg-amber-950/20',
        badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      };
    }
    if (type === 'NEWS') {
      return {
        label: 'NOVIDADES',
        icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />,
        borderColor: 'border-blue-900/50 bg-blue-950/15',
        badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
      };
    }
    return {
      label: 'SISTEMA',
      icon: <Bell className="w-3.5 h-3.5 text-zinc-400" />,
      borderColor: 'border-zinc-800 bg-zinc-900/40',
      badgeColor: 'bg-zinc-900 text-zinc-300 border-zinc-700',
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={handleClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col font-mono text-zinc-100 shadow-2xl relative animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-wider text-white uppercase">
                  NOTIFICAÇÕES & AVISOS
                </h2>
                {unreadNotificationsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white font-bold text-[9px]">
                    {unreadNotificationsCount} NOVA{unreadNotificationsCount > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400">
                Caixa de avisos do sistema e checagens
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            title="Fechar painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">
            Total: <strong className="text-zinc-200">{notifications.length}</strong>
          </span>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer font-bold"
                title="Marcar todas as mensagens como lidas"
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden xs:inline">MARCAR</span> LIDAS
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/60 hover:border-red-700 transition-colors cursor-pointer font-bold uppercase"
                title="Limpar todas as notificações da caixa"
              >
                <Trash2 className="w-3 h-3" />
                <span>LIMPAR CAIXA</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase">
                  Caixa de Notificações Limpa
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Não há notificações ou pendências ativas. Todos os dados do atleta e sistemas operam normalmente.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900 w-full">
                <button
                  type="button"
                  onClick={triggerPeriodicCheckSimulation}
                  className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Simular Checagem Periódica de Dados</span>
                </button>
                <span className="text-[9px] text-zinc-500 block mt-1">
                  Dispara a rotina periódica de verificação de compatibilidade para testes.
                </span>
              </div>
            </div>
          ) : (
            <>
              {notifications.map((notif) => {
                const details = getTypeDetails(notif.type, notif.severity);
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 border transition-all ${details.borderColor} ${
                      !notif.read ? 'bg-zinc-900/90 shadow-md' : 'opacity-85'
                    }`}
                  >
                    {/* Top row: badge & timestamp & delete */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[9px] font-bold uppercase ${details.badgeColor}`}
                        >
                          {details.icon}
                          <span>{details.label}</span>
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" title="Não lida" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">
                          {formatTimestamp(notif.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNotification(notif.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
                          title="Excluir esta notificação"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="text-xs font-bold text-white mb-1 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
                      {notif.message}
                    </p>

                    {/* Action button if exists */}
                    {notif.actionLabel && (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleAction(notif)}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>{notif.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="text-[10px] text-zinc-400 hover:text-white cursor-pointer uppercase underline"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Simulation Helper at end of list */}
              <div className="pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={triggerPeriodicCheckSimulation}
                  className="w-full px-3 py-2 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Testar / Disparar Checagem Periódica de Dados</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
          Gym Labs Core · As notificações sincronizam parâmetros fisiológicos e regras do sistema.
        </div>
      </div>
    </div>
  );
};
