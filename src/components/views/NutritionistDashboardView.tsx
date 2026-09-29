import React, { useState } from 'react';
import { useGymLabs } from '../../context/GymLabsContext';
import {
  Users,
  Calendar,
  Utensils,
  Activity,
  BookOpen,
  DollarSign,
  Clock,
  MessageSquare,
  LogOut,
  Bell,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { NutriDashboardTab } from './nutri/NutriDashboardTab';
import { NutriPatientsTab } from './nutri/NutriPatientsTab';
import { NutriConsultationsTab } from './nutri/NutriConsultationsTab';
import { NutriAssessmentsTab } from './nutri/NutriAssessmentsTab';
import { NutriDietBuilderTab } from './nutri/NutriDietBuilderTab';
import { NutriLibraryTab } from './nutri/NutriLibraryTab';
import { NutriScheduleTab } from './nutri/NutriScheduleTab';
import { NutriFinancesTab } from './nutri/NutriFinancesTab';
import { ChatMessengerModal } from '../chat/ChatMessengerModal';
import { NutriPatient } from '../../types/nutri';

export type NutriTabType =
  | 'dashboard'
  | 'patients'
  | 'consultations'
  | 'assessments'
  | 'dietBuilder'
  | 'library'
  | 'schedule'
  | 'finances';

export const NutritionistDashboardView: React.FC = () => {
  const {
    identity,
    savedAccounts,
    openAccountModal,
    logout,
    notifications,
    unreadNotificationsCount,
    setIsNotificationCenterOpen,
  } = useGymLabs();

  const [currentTab, setCurrentTab] = useState<NutriTabType>('dashboard');
  const [selectedPatientForDiet, setSelectedPatientForDiet] = useState<NutriPatient | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContactId, setChatContactId] = useState<string>('pat_alex_vance');

  const handlePrescribeDiet = (patient: NutriPatient) => {
    setSelectedPatientForDiet(patient);
    setCurrentTab('dietBuilder');
  };

  const handleNewConsultation = (patient: NutriPatient) => {
    setCurrentTab('consultations');
  };

  const handleOpenChatWithContact = (contactId?: string) => {
    if (contactId) setChatContactId(contactId);
    setIsChatOpen(true);
  };

  const navItems: { id: NutriTabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'consultations', label: 'Consultas', icon: Calendar },
    { id: 'assessments', label: 'Avaliação Antropo', icon: Activity },
    { id: 'dietBuilder', label: 'Criador de Dietas', icon: Utensils },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'schedule', label: 'Agenda', icon: Clock },
    { id: 'finances', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="border-b border-zinc-900 bg-black/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center text-xs">
              NUT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  GYM LABS NUTRI
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold uppercase">
                  CRN-3 48192
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-sans hidden sm:block">
                PORTAL CLÍNICO DO NUTRICIONISTA ESPORTIVO // DETERMINISMO METABÓLICO
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
            {savedAccounts.length > 1 && (
              <button
                type="button"
                onClick={openAccountModal}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-2 py-1"
                title="Alternar entre contas do ecossistema"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TROCAR CONTA</span>
              </button>
            )}

            {/* Chat Trigger Button */}
            <button
              type="button"
              onClick={() => handleOpenChatWithContact()}
              className="text-zinc-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-bold">CHAT</span>
            </button>

            {/* Bell Notifications Button next to SAIR */}
            <button
              type="button"
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600"
              title="Caixa de Notificações e Avisos do Sistema"
            >
              <Bell className={`w-3.5 h-3.5 ${unreadNotificationsCount > 0 ? 'text-amber-400' : 'text-zinc-300'}`} />
              <span className="hidden sm:inline font-bold">AVISOS</span>
              {unreadNotificationsCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] min-w-[16px] text-center leading-none">
                  {unreadNotificationsCount}
                </span>
              ) : null}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer px-2 py-1 border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="Sair da sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SAIR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-header / Tabs */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 px-3 sm:px-6 overflow-x-auto scrollbar-none sticky top-[49px] z-30">
        <div className="max-w-7xl mx-auto flex items-stretch gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-white text-white bg-zinc-900/60'
                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto w-full p-3 sm:p-6 space-y-6 flex-1 pb-28">
        {currentTab === 'dashboard' && (
          <NutriDashboardTab
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenChat={() => handleOpenChatWithContact()}
          />
        )}

        {currentTab === 'patients' && (
          <NutriPatientsTab
            onPrescribeDiet={handlePrescribeDiet}
            onNewConsultation={handleNewConsultation}
            onOpenChat={(pId) => handleOpenChatWithContact(pId)}
          />
        )}

        {currentTab === 'consultations' && <NutriConsultationsTab />}

        {currentTab === 'assessments' && <NutriAssessmentsTab />}

        {currentTab === 'dietBuilder' && (
          <NutriDietBuilderTab initialPatient={selectedPatientForDiet} />
        )}

        {currentTab === 'library' && <NutriLibraryTab />}

        {currentTab === 'schedule' && <NutriScheduleTab />}

        {currentTab === 'finances' && <NutriFinancesTab />}
      </main>

      {/* Floating Chat Modal */}
      <ChatMessengerModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        defaultContactId={chatContactId}
      />
    </div>
  );
};
