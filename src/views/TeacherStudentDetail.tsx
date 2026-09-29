import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { MetricCard } from '../components/MetricCard.js';
import {
  Brain,
  Clock,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { TeacherOverrideModal } from '../components/TeacherOverrideModal.js';
import * as api from '../api/client.js';

export const TeacherStudentDetail: React.FC = () => {
  const {
    allLearners,
    targetTeacherStudentId,
    setTargetTeacherStudentId,
    concepts,
    setActiveView,
  } = useApp();

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const learner = allLearners.find((l) => l.id === targetTeacherStudentId) || allLearners[0];

  if (!learner) {
    return (
      <div className="p-8 text-center text-slate-500">
        No learner selected for faculty inspection.
      </div>
    );
  }

  const handleFetchAiAdvice = async () => {
    try {
      setLoadingAi(true);
      const res = await api.fetchAIExplanation({
        conceptName: learner.currentRecommendation?.conceptName || 'Data Structures',
        promptType: 'teacher_advice',
        context: `Student overall mastery: ${(learner.overallMastery * 100).toFixed(0)}%, uncertainty: ${(learner.overallUncertainty * 100).toFixed(0)}%, recommendation: ${learner.currentRecommendation?.action}`,
      });
      setAiAdvice(res.text);
    } catch (err) {
      console.error('Failed to get teacher advice:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const conceptMap = new Map(concepts.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('teacher_dashboard')}
          className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cohort Overview</span>
        </button>

        {/* Student Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-bold">Inspect Student:</span>
          <select
            value={learner.id}
            onChange={(e) => setTargetTeacherStudentId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            {allLearners.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Student Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={learner.avatar}
            alt={learner.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">{learner.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {learner.cohort}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{learner.email}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFetchAiAdvice}
            disabled={loadingAi}
            className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{loadingAi ? 'Consulting...' : 'AI Pedagogical Strategy'}</span>
          </button>
          <button
            onClick={() => setIsOverrideModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Override System Recommendation</span>
          </button>
        </div>
      </div>

      {/* AI Pedagogical Advisor Note if loaded */}
      {aiAdvice && (
        <div className="p-4 bg-white rounded-2xl border border-blue-200 text-xs text-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center space-x-2 font-bold text-blue-700 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Clinical Intervention Advisory (Gemini)</span>
          </div>
          <p className="leading-relaxed">{aiAdvice}</p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Overall Multi-Signal Mastery"
          value={`${(learner.overallMastery * 100).toFixed(0)}%`}
          subtitle="Weighted across all concept evidence"
          icon={Brain}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Memory Retention Score"
          value={`${(learner.overallRetention * 100).toFixed(0)}%`}
          subtitle="Exponential forgetting decay tracking"
          icon={Clock}
          iconColor="text-amber-500"
        />
        <MetricCard
          title="Engine Uncertainty Metric"
          value={`${(learner.overallUncertainty * 100).toFixed(0)}%`}
          subtitle="Model epistemic confidence"
          icon={HelpCircle}
          iconColor="text-indigo-600"
        />
      </div>

      {/* Concept Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Per-Concept Mastery & Signal Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-2.5 font-bold">Concept</th>
                <th className="pb-2.5 font-bold">Mastery</th>
                <th className="pb-2.5 font-bold">Retention</th>
                <th className="pb-2.5 font-bold">Uncertainty</th>
                <th className="pb-2.5 font-bold">Attempts</th>
                <th className="pb-2.5 font-bold">Hints / Retries</th>
                <th className="pb-2.5 font-bold">Transfer Acc</th>
                <th className="pb-2.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {concepts.map((c) => {
                const cm = learner.conceptMasteries[c.id];
                const score = cm ? cm.mastery : 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">
                      {c.name}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900">
                      {(score * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {cm ? `${(cm.retention * 100).toFixed(0)}%` : '0%'}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {cm ? `${(cm.uncertainty * 100).toFixed(0)}%` : '85%'}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {cm?.attemptsCount || 0}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {cm?.totalHintsUsed || 0} hints / {cm?.totalRetries || 0} retries
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {cm ? `${(cm.transferAccuracy * 100).toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          score >= 0.75
                            ? 'bg-emerald-50 text-emerald-700'
                            : score >= 0.50
                            ? 'bg-blue-50 text-blue-700'
                            : cm?.attemptsCount
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {score >= 0.75 ? 'Mastered' : score >= 0.5 ? 'Developing' : cm?.attemptsCount ? 'Struggling' : 'Unattempted'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Overrides Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Faculty Overrides Audit Log</h3>
            <p className="text-xs text-slate-500">
              Immutable log of educator decisions overriding autonomous engine choices
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {learner.overrides.length} Recorded Overrides
          </span>
        </div>

        {learner.overrides.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            No faculty overrides logged for this student. System is operating purely on autonomous evidence logic.
          </div>
        ) : (
          <div className="space-y-3">
            {learner.overrides.map((ov) => {
              const targetConcept = conceptMap.get(ov.newConceptId);
              return (
                <div
                  key={ov.id}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-amber-900">
                    <span className="font-bold flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      <span>{ov.teacherName}</span>
                    </span>
                    <span className="text-[11px] text-amber-700">
                      {new Date(ov.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-800">
                    Overrode <span className="font-semibold text-slate-600">{ov.previousAction}</span> with{' '}
                    <span className="font-bold text-amber-900 uppercase">{ov.newAction}</span> on{' '}
                    <span className="font-bold text-slate-900">{targetConcept?.name || ov.newConceptId}</span>.
                  </div>
                  <p className="text-[11px] text-slate-600 italic">
                    Reason: "{ov.reason}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chronological Learning Attempts Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Learning Event Timeline</h3>
        <div className="space-y-3">
          {learner.recentAttempts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No attempts logged yet.</div>
          ) : (
            learner.recentAttempts.map((att, idx) => {
              const concept = conceptMap.get(att.conceptId);
              return (
                <div
                  key={att.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        att.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        {concept?.name || att.conceptId} • {att.questionType} ({att.difficulty})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Confidence: {(att.confidence * 100).toFixed(0)}% • Duration: {att.responseTimeSeconds}s • Hints: {att.hintsUsed} • Retries: {att.retries}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-blue-600">
                      Evidence Score: {(att.evidenceScore * 100).toFixed(1)}%
                    </span>
                    {att.antiGuessingTriggered && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Damped
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Override Modal */}
      {isOverrideModalOpen && (
        <TeacherOverrideModal
          learner={learner}
          concepts={concepts}
          isOpen={true}
          onClose={() => setIsOverrideModalOpen(false)}
          onSuccess={() => setIsOverrideModalOpen(false)}
        />
      )}

    </div>
  );
};
