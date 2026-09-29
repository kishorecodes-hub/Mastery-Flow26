import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  Sparkles,
  User,
  GraduationCap,
  Clock,
  RotateCcw,
  ChevronDown,
  Layers,
  Database,
  FileCheck,
  Eye,
} from 'lucide-react';
import * as api from '../api/client.js';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeStudentId,
    setActiveStudentId,
    currentLearner,
    allLearners,
    activeView,
    setActiveView,
    setIsDemoModalOpen,
    refreshAll,
    refreshLearner,
    dyslexiaMode,
    setDyslexiaMode,
  } = useApp();

  const [simulating, setSimulating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSimulateGap = async () => {
    try {
      setSimulating(true);
      await api.simulateTimeElapsed(activeStudentId, 18);
      await refreshLearner();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await api.resetDemoState();
      await refreshAll();
    } catch (err: any) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Zone 1: Pure Brand Title */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setActiveView(currentRole === 'STUDENT' ? 'student_dashboard' : 'teacher_dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900">MasteryFlow</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">Adaptive Engine & DB</span>
          </div>
        </div>

        {/* Zone 2: Workspace Segmented Switcher & Quick Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setCurrentRole('STUDENT');
                setActiveView('student_dashboard');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                currentRole === 'STUDENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole('TEACHER');
                setActiveView('teacher_dashboard');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                currentRole === 'TEACHER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Faculty Console</span>
            </button>
          </div>

          {/* Quick Access to Database Explorer */}
          <button
            onClick={() => setActiveView('database_explorer')}
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              activeView === 'database_explorer'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Inspect 9 Database Tables"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Database (9)</span>
          </button>

          {/* Quick Access to Teacher Approval Lab */}
          {currentRole === 'TEACHER' && (
            <button
              onClick={() => setActiveView('teacher_approval')}
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                activeView === 'teacher_approval'
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Content QA & Approval Lab"
            >
              <FileCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Approval Lab</span>
            </button>
          )}

          {/* Quick Dyslexia Toggle */}
          <button
            onClick={() => setDyslexiaMode(!dyslexiaMode)}
            className={`hidden xl:flex items-center space-x-1 px-2 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
              dyslexiaMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Dyslexia-Friendly Layout"
          >
            <Eye className="w-3 h-3 text-amber-600" />
            <span>Dyslexia: {dyslexiaMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Engine Simulation Utilities */}
          <div className="hidden lg:flex items-center space-x-1 text-xs">
            <button
              onClick={handleSimulateGap}
              disabled={simulating}
              title="Simulate 18-day gap to test exponential retention decay"
              className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium flex items-center space-x-1"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{simulating ? 'Decaying...' : '18d Gap'}</span>
            </button>

            <button
              onClick={handleResetDemo}
              disabled={resetting}
              title="Reset database to clean seeded benchmark state"
              className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer font-medium flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Zone 3: Persona Selector & Primary Action (Demo Walkthrough) */}
        <div className="flex items-center space-x-3">
          {/* Active Persona Dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer transition-colors"
            >
              {allLearners.map((learner) => (
                <option key={learner.id} value={learner.id}>
                  {learner.name} {learner.id === 'student_a' ? '(High Mastery)' : learner.id === 'student_b' ? '(Prereq Gaps)' : learner.id === 'student_c' ? '(Stuck)' : '(New)'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Primary Action Button: Demo Mode Walkthrough */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Judge Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
