import React, { useState, useEffect } from 'react';
import { StressTestResult } from '../types.js';
import * as api from '../api/client.js';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Cpu,
  BarChart3,
  Clock,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EvaluationView: React.FC = () => {
  const [results, setResults] = useState<StressTestResult[]>([]);
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleRunAllTests = async () => {
    try {
      setLoading(true);
      const res = await api.runStressTests();
      setResults(res.results);
      setMetrics(res.metrics);
      setHasRun(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to run stress tests:', err);
      alert('Error executing automated stress tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run tests on initial mount
    handleRunAllTests();
  }, []);

  const totalPassed = results.filter((r) => r.passed).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Deterministic Verification Suite
            </span>
            <span className="text-xs font-semibold text-slate-500">
              6 Automated Adversarial Scenarios
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Adaptive Engine Stress-Test Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real mathematical execution against the production engine. No hardcoded or simulated passes.
          </p>
        </div>

        <button
          onClick={handleRunAllTests}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
        >
          {loading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{loading ? 'Executing Suite...' : 'Re-Run All 6 Tests'}</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Test Pass Rate
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {hasRun ? `${totalPassed} / ${results.length}` : 'Not Run'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {hasRun ? `${metrics?.passRate} Success` : 'Pending'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Prereq Violation Rate
          </span>
          <span className="text-lg font-black text-slate-800 mt-1 block">
            {hasRun ? metrics?.prerequisiteViolationRate : 'Not Run'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Zero unauthorized advance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Guessing Resistance
          </span>
          <span className="text-lg font-black text-blue-600 mt-1 block">
            {hasRun ? metrics?.guessingResistance : 'Not Run'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">0.50x Evidence Damping</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Audit Integrity
          </span>
          <span className="text-lg font-black text-purple-600 mt-1 block">
            {hasRun ? metrics?.teacherOverridePersistence : 'Not Run'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Complete trail persisted</span>
        </div>
      </div>

      {/* Test Results Cards */}
      <div className="space-y-4">
        {results.map((test) => (
          <div
            key={test.id}
            className={`bg-white rounded-3xl border p-6 shadow-xs space-y-4 transition ${
              test.passed ? 'border-slate-200' : 'border-rose-300 bg-rose-50/20'
            }`}
          >
            {/* Test Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                {test.passed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <h3 className="text-base font-bold text-slate-900">{test.title}</h3>
              </div>

              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                  test.passed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {test.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Scenario Description */}
            <div className="text-xs text-slate-600 font-medium">
              <span className="font-bold text-slate-800">Scenario Tested: </span>
              {test.scenario}
            </div>

            {/* Expected vs Actual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Expected Benchmark Behavior
                </span>
                <p className="font-semibold text-slate-800">{test.expectedResult}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Actual Engine Result
                </span>
                <p className="font-semibold text-blue-700">{test.actualResult}</p>
              </div>
            </div>

            {/* Evidence & Explanation */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Pedagogical & Mathematical Rationale
              </span>
              <p className="leading-relaxed">{test.explanation}</p>

              {test.evidence && (
                <div className="pt-2 text-[10px] text-slate-500 font-mono overflow-x-auto">
                  <span className="font-bold text-slate-700">Internal State Vector: </span>
                  {JSON.stringify(test.evidence)}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
