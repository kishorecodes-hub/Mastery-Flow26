import React from 'react';
import { useApp } from '../context/AppContext.js';
import { WhyNextCard } from '../components/WhyNextCard.js';
import { MetricCard } from '../components/MetricCard.js';
import { ConceptCard } from '../components/ConceptCard.js';
import {
  Brain,
  Clock,
  HelpCircle,
  Award,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { RecommendationAction } from '../types.js';

export const StudentDashboard: React.FC = () => {
  const { currentLearner, concepts, setActiveView, setTargetConceptId } = useApp();

  if (!currentLearner) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading learner profile...
      </div>
    );
  }

  const handleExecuteAction = (conceptId: string, _action: RecommendationAction) => {
    setTargetConceptId(conceptId);
    setActiveView('student_learn');
  };

  const masteriesList = Object.values(currentLearner.conceptMasteries);
  const masteredCount = masteriesList.filter((m) => m.mastery >= 0.75).length;
  const reviewDueCount = masteriesList.filter(
    (m) => m.status === 'review_needed' || (m.mastery >= 0.75 && m.retention < 0.65)
  ).length;

  const conceptMap = new Map(concepts.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      
      {/* Welcome & Student Hero Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentLearner.avatar}
            alt={currentLearner.name}
            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {currentLearner.name}
              </h1>
              <span className="text-xs text-slate-400 font-medium">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {currentLearner.cohort}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Course: <span className="font-semibold text-slate-800">Data Structures Fundamentals</span> — Continuous Evidence-Driven Tracking
            </p>
          </div>
        </div>

        {/* Cold-Start Diagnostic Banner if not completed */}
        {!currentLearner.diagnosticCompleted && (
          <button
            onClick={() => setActiveView('student_diagnostic')}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Start Cold-Start Diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Primary Evidence Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Mastery"
          value={`${(currentLearner.overallMastery * 100).toFixed(0)}%`}
          subtitle={`${masteredCount} of ${concepts.length} concepts certified`}
          icon={Brain}
          iconColor="text-blue-600"
          trend={{ value: 'Multi-Signal', isPositive: true }}
        />
        <MetricCard
          title="Cognitive Retention"
          value={`${(currentLearner.overallRetention * 100).toFixed(0)}%`}
          subtitle="Ebbinghaus memory decay tracking"
          icon={Clock}
          iconColor="text-amber-500"
        />
        <MetricCard
          title="Model Uncertainty"
          value={`${(currentLearner.overallUncertainty * 100).toFixed(0)}%`}
          subtitle={currentLearner.overallUncertainty < 0.25 ? 'Calibrated learner profile' : 'Exploratory evidence stage'}
          icon={HelpCircle}
          iconColor="text-indigo-600"
        />
        <MetricCard
          title="Review Due"
          value={reviewDueCount}
          subtitle={reviewDueCount > 0 ? 'Requires spaced retrieval' : 'Retention healthy'}
          icon={Calendar}
          iconColor="text-emerald-600"
        />
      </div>

      {/* WHY THIS NEXT? Section */}
      <section>
        <WhyNextCard
          recommendation={currentLearner.currentRecommendation}
          onExecuteAction={handleExecuteAction}
        />
      </section>

      {/* Concepts Overview & Quick Action */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Curriculum Mastery Track</h3>
            <p className="text-xs text-slate-500">
              Individual concept progress and prerequisite readiness
            </p>
          </div>
          <button
            onClick={() => setActiveView('student_concepts')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full Dependency Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {concepts.slice(0, 6).map((c) => {
            const mastery = currentLearner.conceptMasteries[c.id];
            const prereqsMet = c.prerequisites.every((pId) => {
              const pMastery = currentLearner.conceptMasteries[pId];
              return pMastery && pMastery.mastery >= 0.70;
            });

            return (
              <ConceptCard
                key={c.id}
                concept={c}
                mastery={mastery}
                prerequisitesMet={prereqsMet}
                onPractice={(id) => {
                  setTargetConceptId(id);
                  setActiveView('student_learn');
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Recent Attempts and Evidence Log */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Learning Evidence</h3>
            <p className="text-xs text-slate-500">
              Multi-signal evidence vectors recorded per interactive problem submission
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {currentLearner.recentAttempts.length} Total Events
          </span>
        </div>

        {currentLearner.recentAttempts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No learning attempts logged yet. Complete the diagnostic or practice a concept!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                  <th className="pb-2.5 font-medium">Concept</th>
                  <th className="pb-2.5 font-medium">Type</th>
                  <th className="pb-2.5 font-medium">Result</th>
                  <th className="pb-2.5 font-medium">Confidence</th>
                  <th className="pb-2.5 font-medium">Speed</th>
                  <th className="pb-2.5 font-medium">Assistance</th>
                  <th className="pb-2.5 font-medium">Evidence (E)</th>
                  <th className="pb-2.5 font-medium">Anti-Guessing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLearner.recentAttempts.slice(-6).reverse().map((att) => {
                  const concept = conceptMap.get(att.conceptId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">
                        {concept?.name || att.conceptId}
                      </td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">
                        {att.questionType}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold text-xs flex items-center space-x-1 ${
                            att.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full fill-current" />
                          <span>{att.isCorrect ? 'Correct' : 'Incorrect'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-slate-700 font-mono tabular-nums">
                        {(att.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 text-slate-700 font-mono tabular-nums">
                        {att.responseTimeSeconds}s
                      </td>
                      <td className="py-3 text-slate-600 font-mono tabular-nums">
                        {att.hintsUsed}h · {att.retries}r
                      </td>
                      <td className="py-3 font-bold font-mono tabular-nums text-slate-900">
                        {(att.evidenceScore * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 font-mono text-[11px]">
                        {att.antiGuessingTriggered ? (
                          <span className="text-amber-700 font-medium" title={att.antiGuessingReason}>
                            Damped (50%)
                          </span>
                        ) : (
                          <span className="text-slate-400">Calibrated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};
