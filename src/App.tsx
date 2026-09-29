import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { DemoModal } from './components/DemoModal.js';
import { DyslexiaControls } from './components/DyslexiaControls.js';
import { AudioPlayerBar } from './components/AudioPlayerBar.js';
import { StudentDashboard } from './views/StudentDashboard.js';
import { StudentConcepts } from './views/StudentConcepts.js';
import { StudentDiagnostic } from './views/StudentDiagnostic.js';
import { StudentLearn } from './views/StudentLearn.js';
import { TeacherDashboard } from './views/TeacherDashboard.js';
import { TeacherStudentDetail } from './views/TeacherStudentDetail.js';
import { TeacherApprovalLab } from './views/TeacherApprovalLab.js';
import { DatabaseExplorerView } from './views/DatabaseExplorerView.js';
import { SimulationView } from './views/SimulationView.js';
import { EvaluationView } from './views/EvaluationView.js';
import { SettingsView } from './views/SettingsView.js';

function MainLayout() {
  const { activeView, loading, error, refreshAll } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'student_dashboard':
        return <StudentDashboard />;
      case 'student_concepts':
        return <StudentConcepts />;
      case 'student_diagnostic':
        return <StudentDiagnostic />;
      case 'student_learn':
        return <StudentLearn />;
      case 'teacher_dashboard':
        return <TeacherDashboard />;
      case 'teacher_student_detail':
        return <TeacherStudentDetail />;
      case 'teacher_approval':
        return <TeacherApprovalLab />;
      case 'database_explorer':
        return <DatabaseExplorerView />;
      case 'simulation':
        return <SimulationView />;
      case 'evaluation':
        return <EvaluationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />
      <DyslexiaControls />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loading && !error && (
            <div className="flex items-center justify-center p-12 text-xs font-semibold text-slate-400">
              Connecting to MasteryFlow engine...
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between mb-6">
              <span>Error connecting to engine: {error}</span>
              <button
                onClick={refreshAll}
                className="font-bold underline ml-2 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && renderActiveView()}
        </main>
      </div>

      <AudioPlayerBar />
      <DemoModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
