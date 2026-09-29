import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { BloomLevel, Question, QuestionFormat } from '../types.js';
import * as api from '../api/client.js';
import {
  Brain,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  Globe,
  Sliders,
  Code,
  Bug,
  HelpCircle,
  FileCode,
  Tag,
  Building2,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentLearn: React.FC = () => {
  const {
    currentLearner,
    concepts,
    targetConceptId,
    setTargetConceptId,
    refreshLearner,
    setActiveView,
    readingLevel,
    setReadingLevel,
    language,
    setLanguage,
    dyslexiaMode,
    bionicReading,
    speakText,
    isAudioPlaying,
    stopAudio,
    institutions,
    activeInstitutionId,
  } = useApp();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0.80);
  const [hintShown, setHintShown] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [retries, setRetries] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);

  // Transformed Pedagogical Content (Multilingual + Reading Level)
  const [transformedContent, setTransformedContent] = useState<any>(null);
  const [loadingTransform, setLoadingTransform] = useState<boolean>(false);

  const activeConcept = concepts.find((c) => c.id === targetConceptId) || concepts[0];
  const activeMastery = currentLearner?.conceptMasteries[activeConcept?.id || ''];

  // Load questions for concept
  useEffect(() => {
    async function loadConceptQuestions() {
      if (!activeConcept) return;
      try {
        const qList = await api.fetchQuestionsByConcept(activeConcept.id);
        setQuestions(qList);
        setCurrentQuestionIndex(0);
        resetQuestionState();
      } catch (err) {
        console.error('Failed to load concept questions:', err);
      }
    }
    loadConceptQuestions();
  }, [activeConcept?.id]);

  // Load transformed concept content (reading level + multilingual)
  useEffect(() => {
    async function loadTransformation() {
      if (!activeConcept) return;
      try {
        setLoadingTransform(true);
        const data = await api.transformContent({
          conceptId: activeConcept.id,
          language,
          readingLevel,
          institutionId: activeInstitutionId,
        });
        setTransformedContent(data);
      } catch (err) {
        console.error('Failed to transform content:', err);
      } finally {
        setLoadingTransform(false);
      }
    }
    loadTransformation();
  }, [activeConcept?.id, language, readingLevel, activeInstitutionId]);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setConfidence(0.80);
    setHintShown(false);
    setHintsUsed(0);
    setRetries(0);
    setStartTime(Date.now());
    setAttemptResult(null);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmitAttempt = async () => {
    if (selectedOption === null || !currentQuestion || !currentLearner) return;

    const responseTimeSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    try {
      setSubmitting(true);
      const res = await api.submitAttempt({
        learnerId: currentLearner.id,
        questionId: currentQuestion.id,
        selectedOptionIndex: selectedOption,
        confidence,
        responseTimeSeconds,
        hintsUsed,
        retries,
      });

      setAttemptResult(res);
      await refreshLearner();

      if (res.attempt.isCorrect) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      console.error('Failed to submit attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      setActiveView('student_dashboard');
    }
  };

  const handleRetry = () => {
    setRetries((prev) => prev + 1);
    setSelectedOption(null);
    setAttemptResult(null);
  };

  // Helper for Bionic Reading formatting
  const renderBionic = (text: string) => {
    if (!bionicReading || !text) return text;
    return text.split(' ').map((word, idx) => {
      const mid = Math.ceil(word.length / 2);
      const first = word.slice(0, mid);
      const rest = word.slice(mid);
      return (
        <span key={idx} className="inline-block mr-1">
          <strong className="font-extrabold text-slate-950">{first}</strong>
          <span>{rest}</span>
        </span>
      );
    });
  };

  const activeInstitution = institutions.find((i) => i.id === activeInstitutionId) || institutions[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Concept Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-xs">
            {activeConcept.code}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {transformedContent?.name || activeConcept.name}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {activeConcept.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Bloom Target: {activeConcept.bloomTarget}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${activeInstitution?.badgeColor}`}>
                {activeInstitution?.shortCode} Style
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Current Mastery: <strong className="text-indigo-600 font-semibold">{((activeMastery?.mastery || 0) * 100).toFixed(0)}%</strong> • Retention: <strong className="text-slate-700">{((activeMastery?.retention || 0) * 100).toFixed(0)}%</strong> • Status: <span className="capitalize font-medium">{activeMastery?.status || 'developing'}</span>
            </p>
          </div>
        </div>

        {/* Quick Concept Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Switch Topic:</span>
          <select
            value={targetConceptId}
            onChange={(e) => setTargetConceptId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({((currentLearner?.conceptMasteries[c.id]?.mastery || 0) * 100).toFixed(0)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Adapted Pedagogical Material (Multilingual + Reading Level + Audio) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {/* Header + Audio-Ready Narration Action */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Concept Intuition & Analogy
                </span>
              </div>

              {/* Audio Listen Button */}
              <button
                onClick={() => {
                  if (isAudioPlaying) {
                    stopAudio();
                  } else {
                    const textToSpeak = transformedContent?.audioScript || activeConcept.audioScript || activeConcept.description;
                    speakText(textToSpeak, language);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isAudioPlaying
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isAudioPlaying ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Audio</span>
                  </>
                )}
              </button>
            </div>

            {/* Reading Level Analogy Card */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/40 p-4 rounded-xl border border-indigo-100/80 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-indigo-900 uppercase">
                  {readingLevel === 'middle_school' && 'Middle School Analogy'}
                  {readingLevel === 'high_school' && 'High School Visual Bridge'}
                  {readingLevel === 'undergraduate' && 'Undergraduate Formal Definition'}
                  {readingLevel === 'executive' && 'Systems Architecture Context'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {renderBionic(transformedContent?.analogy || activeConcept.description)}
              </p>
            </div>

            {/* Core Explanation */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                How It Works:
              </h3>
              <p>{renderBionic(transformedContent?.coreExplanation || activeConcept.description)}</p>
            </div>

            {/* Real World Production Example */}
            {transformedContent?.realWorldExample && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-semibold text-slate-900">Real-World Application:</span>
                <p className="text-slate-600">{renderBionic(transformedContent.realWorldExample)}</p>
              </div>
            )}

            {/* Key Takeaways */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Core Invariants & Big-O:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(transformedContent?.keyPoints || activeConcept.keyTakeaways).map((k: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Question Practice with Format Diversity & Bloom Tagging */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Question Header & Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                
                {/* Question Format Badge (Diversity) */}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  {currentQuestion?.questionFormat === 'CODE_OUTPUT' && <Code className="w-3 h-3" />}
                  {currentQuestion?.questionFormat === 'DEBUG_BUG' && <Bug className="w-3 h-3" />}
                  {currentQuestion?.questionFormat === 'FILL_BLANK' && <FileCode className="w-3 h-3" />}
                  {currentQuestion?.questionFormat || 'MCQ'}
                </span>

                {/* Bloom's Taxonomy Badge */}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-500" />
                  Bloom: {currentQuestion?.bloomLevel || 'Understand'}
                </span>

                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {currentQuestion?.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Est: {currentQuestion?.expectedTimeSeconds || 25}s</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {renderBionic(currentQuestion?.questionText || '')}
              </h2>

              {/* Code Snippet for CODE_OUTPUT / DEBUG_BUG */}
              {currentQuestion?.codeSnippet && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 shadow-inner">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-2 pb-1 border-b border-slate-800 font-sans">
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      {currentQuestion.questionFormat === 'DEBUG_BUG' ? 'Source with Potential Bug' : 'Execution Trace'}
                    </span>
                    <span>TypeScript</span>
                  </div>
                  <pre className="overflow-x-auto leading-relaxed">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Options List with Dynamic Interactive Styles */}
            <div className="space-y-3">
              {currentQuestion?.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isRevealed = attemptResult !== null;
                const isCorrect = idx === currentQuestion.correctOptionIndex;

                let cardStyle = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 bg-white text-slate-800';
                if (isSelected && !isRevealed) {
                  cardStyle = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20';
                } else if (isRevealed) {
                  if (isCorrect) {
                    cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20';
                  } else {
                    cardStyle = 'border-slate-200 opacity-60 bg-slate-50 text-slate-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isRevealed || submitting}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 cursor-pointer ${cardStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 mt-0.5 leading-relaxed">{opt}</span>
                    {isRevealed && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Confidence Slider before submitting */}
            {!attemptResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    Self-Reported Confidence Calibration:
                  </span>
                  <span className="font-mono font-bold text-indigo-600">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Tentative Guess (10%)</span>
                  <span>Moderate (50%)</span>
                  <span>Absolute Certainty (100%)</span>
                </div>
              </div>
            )}

            {/* Hint Box */}
            {hintShown && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Pedagogical Hint:
                </span>
                <p className="text-amber-800">{currentQuestion?.hint}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div>
                {!hintShown && !attemptResult && (
                  <button
                    onClick={() => {
                      setHintShown(true);
                      setHintsUsed((prev) => prev + 1);
                    }}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Need a Hint?</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!attemptResult ? (
                  <button
                    disabled={selectedOption === null || submitting}
                    onClick={handleSubmitAttempt}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? 'Evaluating Evidence...' : 'Submit Attempt'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {!attemptResult.attempt.isCorrect && (
                      <button
                        onClick={handleRetry}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post-Attempt Detailed Feedback & Engine Signals */}
            {attemptResult && (
              <div
                className={`p-5 rounded-xl border space-y-3 ${
                  attemptResult.attempt.isCorrect
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {attemptResult.attempt.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm text-slate-900">
                      {attemptResult.attempt.isCorrect
                        ? 'Mastery Evidence Confirmed!'
                        : 'Conceptual Misconception Detected'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Evidence: {attemptResult.evidence?.evidenceScore.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentQuestion?.explanation}
                </p>

                {/* Evidence Engine Signals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                  <div className="bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-slate-400 block text-[10px]">Mastery Delta</span>
                    <span className="font-bold text-indigo-700">
                      {(attemptResult.masteryBefore * 100).toFixed(0)}% ➔ {(attemptResult.masteryAfter * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-slate-400 block text-[10px]">Uncertainty</span>
                    <span className="font-bold text-slate-700">
                      {(attemptResult.uncertaintyAfter * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-slate-400 block text-[10px]">Next Recommendation</span>
                    <span className="font-bold text-purple-700">
                      {attemptResult.newRecommendation?.action}
                    </span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    <span className="text-slate-400 block text-[10px]">Anti-Guessing</span>
                    <span className={attemptResult.evidence?.antiGuessingTriggered ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {attemptResult.evidence?.antiGuessingTriggered ? 'Flagged (Damped)' : 'Calibrated'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
