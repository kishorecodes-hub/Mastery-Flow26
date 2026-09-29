import React from 'react';
import { useApp } from '../context/AppContext.js';
import {
  LayoutDashboard,
  GitFork,
  ClipboardCheck,
  BookOpen,
  Users,
  GitCompare,
  FlaskConical,
  Sliders,
  AlertTriangle,
  Award,
  Database,
  FileCheck,
} from 'lucide-react';
import { AppView } from '../types.js';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  metaText?: string;
  category: 'student' | 'teacher' | 'system';
}

export const Sidebar: React.FC = () => {
  const { currentRole, activeView, setActiveView, currentLearner } = useApp();

  const navItems: NavItem[] = [
    // Student links
    { id: 'student_dashboard', label: 'Learner Dashboard', icon: LayoutDashboard, category: 'student' },
    { id: 'student_concepts', label: 'Concept Graph (DAG)', icon: GitFork, category: 'student' },
    { id: 'student_learn', label: 'Practice & Feedback', icon: BookOpen, category: 'student' },
    {
      id: 'student_diagnostic',
      label: 'Diagnostic Test',
      icon: ClipboardCheck,
      metaText: currentLearner?.diagnosticCompleted ? 'Passed' : 'Pending',
      category: 'student',
    },

    // Teacher links
    { id: 'teacher_dashboard', label: 'Cohort Overview', icon: Users, category: 'teacher' },
    { id: 'teacher_student_detail', label: 'Student Inspection', icon: Award, category: 'teacher' },
    {
      id: 'teacher_approval',
      label: 'Approval & QA Lab',
      icon: FileCheck,
      metaText: 'AI Pre-QA',
      category: 'teacher',
    },

    // Database & System links
    {
      id: 'database_explorer',
      label: 'Database Explorer',
      icon: Database,
      metaText: '9 Entities',
      category: 'system',
    },
    { id: 'simulation', label: 'Two-Learner Sim', icon: GitCompare, metaText: 'Divergent', category: 'system' },
    { id: 'evaluation', label: 'Stress-Test Center', icon: FlaskConical, metaText: '6 Tests', category: 'system' },
    { id: 'settings', label: 'Engine Calibration', icon: Sliders, category: 'system' },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.category === 'system') return true;
    if (currentRole === 'STUDENT' && item.category === 'student') return true;
    if (currentRole === 'TEACHER' && item.category === 'teacher') return true;
    return false;
  });

  return (
    <aside className="w-60 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-3.75rem)]">
      <div className="space-y-6">
        {/* Active Workspace / Persona Card */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Workspace</span>
            <span className="font-semibold text-slate-700">
              {currentRole === 'STUDENT' ? 'Student' : 'Faculty'}
            </span>
          </div>
          {currentRole === 'STUDENT' && currentLearner && (
            <div className="flex items-center space-x-2.5 mt-2 pt-2 border-t border-slate-200/60">
              <img
                src={currentLearner.avatar}
                alt={currentLearner.name}
                className="w-7 h-7 rounded-md object-cover border border-slate-200"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 truncate">{currentLearner.name}</div>
                <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                  Mastery: {(currentLearner.overallMastery * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Role Navigation */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 pb-1.5">
            {currentRole === 'STUDENT' ? 'Curriculum Track' : 'Classroom Management'}
          </div>
          {visibleItems
            .filter((item) => item.category !== 'system')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.metaText && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-indigo-100/80 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.metaText}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* System & Architecture Navigation */}
        <div className="space-y-0.5 pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 pb-1.5">
            Database & Innovations
          </div>
          {visibleItems
            .filter((item) => item.category === 'system')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.metaText && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-indigo-100/80 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.metaText}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Track 4 Prototype</span>
          <span className="font-mono text-emerald-600 font-semibold">Live v2.1</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Evidence-Driven Multi-Signal Mastery & Intervention Engine.
        </p>
      </div>
    </aside>
  );
};
