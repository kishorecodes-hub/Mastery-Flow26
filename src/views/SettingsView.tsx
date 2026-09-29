import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import * as api from '../api/client.js';
import { Sliders, Save, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { DEFAULT_SYSTEM_CONFIG } from '../server/db/seed.js';

export const SettingsView: React.FC = () => {
  const { systemConfig, refreshAll } = useApp();

  const [config, setConfig] = useState(systemConfig || DEFAULT_SYSTEM_CONFIG);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSystemConfig(config);
      await refreshAll();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update config:', err);
      alert('Error updating engine configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig({ ...DEFAULT_SYSTEM_CONFIG });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Deterministic Hyperparameters
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Admin & Pedagogical Controls
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Engine Calibration & Thresholds
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify the mathematical thresholds governing multi-signal evidence, forgetting curves, and prerequisite gates.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Thresholds Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Cognitive & Gating Thresholds</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Mastery Threshold */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <label className="text-slate-700">Mastery Certification Threshold</label>
                <span className="text-blue-600">{(config.masteryThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={config.masteryThreshold}
                onChange={(e) => setConfig({ ...config, masteryThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Score required before a concept is considered mastered.
              </p>
            </div>

            {/* Prerequisite Threshold */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <label className="text-slate-700">Prerequisite Unlock Threshold</label>
                <span className="text-blue-600">{(config.prerequisiteThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.90"
                step="0.05"
                value={config.prerequisiteThreshold}
                onChange={(e) => setConfig({ ...config, prerequisiteThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minimum prior mastery required to safely unlock successor nodes.
              </p>
            </div>

            {/* Forgetting Decay Rate */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <label className="text-slate-700">Forgetting Decay Rate (per day)</label>
                <span className="text-amber-600">{(config.forgettingDecayRate * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.005"
                value={config.forgettingDecayRate}
                onChange={(e) => setConfig({ ...config, forgettingDecayRate: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Daily memory retention decay: retention = mastery * exp(-decay * days).
              </p>
            </div>

            {/* Alpha smoothing */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <label className="text-slate-700">Mastery Learning Rate (Alpha)</label>
                <span className="text-indigo-600">{config.learningRateAlpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={config.learningRateAlpha}
                onChange={(e) => setConfig({ ...config, learningRateAlpha: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Weight of latest evidence vs historical performance in exponential smoothing.
              </p>
            </div>

            {/* Intervention Failures */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <label className="text-slate-700">Stuck Learner Failure Tolerance</label>
                <span className="text-rose-600">{config.interventionThresholdFailures} failures</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={config.interventionThresholdFailures}
                onChange={(e) => setConfig({ ...config, interventionThresholdFailures: parseInt(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Consecutive failures before pausing autonomous progression for teacher intervention.
              </p>
            </div>

          </div>
        </div>

        {/* Evidence Vector Weights Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Evidence Formula Weights (Sum = 1.0)
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Total Weight: {(
                config.weights.correctness +
                config.weights.confidence +
                config.weights.difficulty +
                config.weights.responseTime +
                config.weights.independence
              ).toFixed(2)}
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Correctness */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Correctness Signal Weight</span>
                <span>{(config.weights.correctness * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.70"
                step="0.05"
                value={config.weights.correctness}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weights: { ...config.weights, correctness: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Confidence */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Self-Assessed Confidence Signal Weight</span>
                <span>{(config.weights.confidence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={config.weights.confidence}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weights: { ...config.weights, confidence: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Difficulty */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Question Difficulty Signal Weight</span>
                <span>{(config.weights.difficulty * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={config.weights.difficulty}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weights: { ...config.weights, difficulty: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Response Time */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Response Time & Cognition Signal Weight</span>
                <span>{(config.weights.responseTime * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.05"
                value={config.weights.responseTime}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weights: { ...config.weights, responseTime: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Independence */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Independence / Hint Signal Weight</span>
                <span>{(config.weights.independence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.05"
                value={config.weights.independence}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weights: { ...config.weights, independence: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Submit Save */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Hyperparameters applied to active runtime!</span>
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Applying...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
