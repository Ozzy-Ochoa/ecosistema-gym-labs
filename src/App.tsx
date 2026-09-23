/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GymLabsProvider, useGymLabs } from './context/GymLabsContext';
import { AthleteTopNav } from './components/layout/AthleteTopNav';
import { CalculationModal } from './components/common/CalculationModal';
import { EnclaveLockScreen } from './components/common/EnclaveLockScreen';
import { AccountSwitcherModal } from './components/common/AccountSwitcherModal';

// Presentation & Auth Views
import { LandingView } from './components/views/LandingView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';

// Role Dashboards (Each isolated as a distinct ecosystem)
import { CoachDashboardView } from './components/views/CoachDashboardView';
import { NutritionistDashboardView } from './components/views/NutritionistDashboardView';
import { GymDashboardView } from './components/views/GymDashboardView';
import { AdminDashboardView } from './components/views/AdminDashboardView';

// Athlete Views (Usuário Convencional - Matched strictly to image.png & gl-gym-labs.ai.studio)
import { TodayView } from './components/views/TodayView';
import { TrainingView } from './components/views/TrainingView';
import { HealthView } from './components/views/HealthView';
import { DataLabView } from './components/views/DataLabView';
import { IntelligenceView } from './components/views/IntelligenceView';
import { SettingsView } from './components/views/SettingsView';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    authView,
    identity,
    currentTab,
    inspectionModal,
    closeCalculationInspector,
  } = useGymLabs();

  // 1. Unauthenticated Presentation & Auth Flow
  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginView />;
    }
    if (authView === 'register') {
      return <RegisterView />;
    }
    return <LandingView />;
  }

  // 2. Role-Based Routing for Authenticated Sessions (Each role isolated)
  if (identity.role === 'COACH') {
    return (
      <div id="gymlabs-coach-portal" className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <CoachDashboardView />
        <AccountSwitcherModal />
        <EnclaveLockScreen />
      </div>
    );
  }

  if (identity.role === 'NUTRITIONIST') {
    return (
      <div id="gymlabs-nutritionist-portal" className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <NutritionistDashboardView />
        <AccountSwitcherModal />
        <EnclaveLockScreen />
      </div>
    );
  }

  if (identity.role === 'GYM') {
    return (
      <div id="gymlabs-gym-portal" className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <GymDashboardView />
        <AccountSwitcherModal />
        <EnclaveLockScreen />
      </div>
    );
  }

  if (identity.role === 'ADMIN') {
    return (
      <div id="gymlabs-admin-portal" className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
        <AdminDashboardView />
        <AccountSwitcherModal />
        <EnclaveLockScreen />
      </div>
    );
  }

  // 3. Usuário Convencional (Aluno / Atleta / Praticante)
  const renderAthleteView = () => {
    switch (currentTab) {
      case 'today':
        return <TodayView />;
      case 'training':
        return <TrainingView />;
      case 'health':
      case 'body':
      case 'nutrition':
      case 'recovery':
        return <HealthView />;
      case 'datalab':
        return <DataLabView />;
      case 'intelligence':
        return <IntelligenceView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div id="gymlabs-athlete-root" className="min-h-screen bg-black text-white flex flex-col font-mono selection:bg-white selection:text-black">
      {/* Top Cyber HUD Nav matching image.png */}
      <AthleteTopNav />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
        {renderAthleteView()}
      </main>

      {/* Transparent Calculation Inspector Modal */}
      <CalculationModal
        calculation={inspectionModal}
        onClose={closeCalculationInspector}
      />

      {/* Screen Visor Cryptographic Lock */}
      <EnclaveLockScreen />

      {/* Multi-Account & Profile Switcher Modal */}
      <AccountSwitcherModal />
    </div>
  );
};

export default function App() {
  return (
    <GymLabsProvider>
      <AppContent />
    </GymLabsProvider>
  );
}
