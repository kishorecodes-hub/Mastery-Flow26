import { Router } from 'express';
import { store } from '../db/store.js';
import { runAllStressTests } from '../engine/stressTests.js';
import { GoogleGenAI } from '@google/genai';
import { LanguageCode, Question, ReadingLevel } from '../db/types.js';

export const apiRouter = Router();

// ==========================================
// 1. DATABASE EXPLORER: All 9 Entities
// ==========================================
apiRouter.get('/database', (_req, res) => {
  try {
    const snapshot = store.getDatabaseSnapshot();
    res.json({
      success: true,
      ...snapshot,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching database snapshot' });
  }
});

// ==========================================
// 2. CURRICULUM DOMAINS & CONCEPTS
// ==========================================
apiRouter.get('/domains', (_req, res) => {
  res.json({
    success: true,
    domains: store.domains,
    activeDomainId: store.config.activeDomainId,
  });
});

apiRouter.post('/domains/switch', (req, res) => {
  try {
    const { learnerId, domainId } = req.body;
    if (!learnerId || !domainId) {
      return res.status(400).json({ error: 'learnerId and domainId are required' });
    }
    const updatedLearner = store.switchLearnerDomain(learnerId, domainId);
    res.json({
      success: true,
      learner: updatedLearner,
      activeDomainId: domainId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error switching domain' });
  }
});

apiRouter.get('/concepts', (req, res) => {
  const domainId = req.query.domain as any;
  const filteredConcepts = domainId ? store.getConceptsByDomain(domainId) : store.concepts;
  res.json({
    success: true,
    concepts: filteredConcepts,
    activeDomainId: store.config.activeDomainId,
  });
});

apiRouter.get('/concepts/:conceptId/questions', (req, res) => {
  const { conceptId } = req.params;
  const questions = store.questions.filter((q) => q.conceptId === conceptId);
  res.json({
    success: true,
    questions,
  });
});

// ==========================================
// 3. INNOVATION: Multilingual & Reading-Level Transformation
// ==========================================
apiRouter.post('/content/transform', async (req, res) => {
  try {
    const { conceptId, language, readingLevel, institutionId } = req.body;
    if (!conceptId) {
      return res.status(400).json({ error: 'conceptId is required' });
    }

    const transformed = await store.transformContent(
      conceptId,
      (language as LanguageCode) || 'en',
      (readingLevel as ReadingLevel) || 'undergraduate',
      institutionId
    );

    res.json({
      success: true,
      content: transformed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error transforming content' });
  }
});

// ==========================================
// 4. INNOVATION: Automatic Evaluation Before Teacher Approval
// ==========================================
apiRouter.post('/content/evaluate-question', async (req, res) => {
  try {
    const { questionId, customQuestion } = req.body;
    const report = await store.evaluateQuestionAutomatic(questionId, customQuestion);
    res.json({
      success: true,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error evaluating question' });
  }
});

apiRouter.post('/content/approve-question', (req, res) => {
  try {
    const { questionId, teacherId, isApproved } = req.body;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId is required' });
    }

    const updated = store.approveQuestion(questionId, teacherId || 'teacher_vance', !!isApproved);
    res.json({
      success: true,
      question: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error approving question' });
  }
});

// Create new question for teacher approval lab
apiRouter.post('/content/create-question', async (req, res) => {
  try {
    const questionData = req.body as Partial<Question>;
    if (!questionData.conceptId || !questionData.questionText) {
      return res.status(400).json({ error: 'conceptId and questionText are required' });
    }

    const newQuestion: Question = {
      id: `q_gen_${Date.now()}`,
      conceptId: questionData.conceptId,
      questionText: questionData.questionText,
      questionType: questionData.questionType || 'Application',
      questionFormat: questionData.questionFormat || 'MCQ',
      difficulty: questionData.difficulty || 'medium',
      bloomLevel: questionData.bloomLevel || 'Apply',
      options: questionData.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: questionData.correctOptionIndex ?? 0,
      explanation: questionData.explanation || 'Detailed explanation will be evaluated.',
      hint: questionData.hint || 'Carefully verify invariants.',
      expectedTimeSeconds: questionData.expectedTimeSeconds || 30,
      codeSnippet: questionData.codeSnippet,
      expectedOutput: questionData.expectedOutput,
      bugLineNumber: questionData.bugLineNumber,
      fillBlankTemplate: questionData.fillBlankTemplate,
      fillBlankSolution: questionData.fillBlankSolution,
      evaluationStatus: 'PENDING_APPROVAL',
      institutionStyleId: questionData.institutionStyleId || store.config.activeInstitutionId,
    };

    store.questions.push(newQuestion);

    // Run automatic evaluation
    const evaluation = await store.evaluateQuestionAutomatic(newQuestion.id, newQuestion);
    newQuestion.aiEvaluation = evaluation;

    res.json({
      success: true,
      question: newQuestion,
      evaluation,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating question' });
  }
});

// ==========================================
// 5. INNOVATION: Institution-Specific Style Guides
// ==========================================
apiRouter.get('/content/institutions', (_req, res) => {
  res.json({
    success: true,
    institutions: store.institutions,
    activeInstitutionId: store.config.activeInstitutionId,
  });
});

apiRouter.post('/content/institutions/active', (req, res) => {
  const { institutionId } = req.body;
  if (institutionId) {
    store.config.activeInstitutionId = institutionId;
  }
  res.json({
    success: true,
    activeInstitutionId: store.config.activeInstitutionId,
  });
});

// ==========================================
// 6. LEARNING SESSIONS
// ==========================================
apiRouter.post('/sessions/start', (req, res) => {
  try {
    const { learnerId, sessionType, conceptId } = req.body;
    const session = store.startSession(
      learnerId || 'student_a',
      sessionType || 'PRACTICE',
      conceptId || 'arrays'
    );
    res.json({
      success: true,
      session,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error starting session' });
  }
});

apiRouter.post('/sessions/:id/end', (req, res) => {
  try {
    const { id } = req.params;
    const { finalMastery } = req.body;
    store.endSession(id, Number(finalMastery) || 0.8);
    res.json({
      success: true,
      sessionId: id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error ending session' });
  }
});

// ==========================================
// 7. USER PREFERENCES (Dyslexia, Reading Level, Language)
// ==========================================
apiRouter.patch('/users/:id/preferences', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = store.users.get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.assign(user, updates);
    const learner = store.learners.get(id);
    if (learner) {
      if (updates.preferredReadingLevel) learner.preferredReadingLevel = updates.preferredReadingLevel;
      if (updates.preferredLanguage) learner.preferredLanguage = updates.preferredLanguage;
      if (updates.dyslexiaModeEnabled !== undefined) learner.dyslexiaModeEnabled = updates.dyslexiaModeEnabled;
      if (updates.bionicReadingEnabled !== undefined) learner.bionicReadingEnabled = updates.bionicReadingEnabled;
      if (updates.institutionId) learner.institutionId = updates.institutionId;
    }

    res.json({
      success: true,
      user,
      learner,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating user preferences' });
  }
});

// ==========================================
// 8. DIAGNOSTIC ASSESSMENT
// ==========================================
apiRouter.get('/diagnostic/questions', (_req, res) => {
  const diagQuestions = store.questions.filter((q) => q.isDiagnostic || q.difficulty === 'easy').slice(0, 8);
  res.json({
    success: true,
    questions: diagQuestions,
  });
});

apiRouter.post('/diagnostic/submit', (req, res) => {
  try {
    const { learnerId, responses } = req.body;
    if (!learnerId || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'learnerId and responses array are required' });
    }

    const learner = store.learners.get(learnerId);
    if (!learner) return res.status(404).json({ error: 'Learner not found' });

    let correctCount = 0;
    for (const r of responses) {
      const q = store.questions.find((item) => item.id === r.questionId);
      if (q && q.correctOptionIndex === r.selectedOptionIndex) {
        correctCount++;
      }
    }

    const calculatedScore = responses.length > 0 ? correctCount / responses.length : 0.5;
    learner.diagnosticCompleted = true;
    learner.diagnosticResult = {
      completedAt: new Date().toISOString(),
      initialMastery: Math.round(calculatedScore * 100) / 100,
      weakPrerequisites: calculatedScore < 0.6 ? ['Arrays'] : [],
      strongConcepts: calculatedScore >= 0.7 ? ['Arrays', 'Linked Lists'] : [],
      firstRecommendationAction: calculatedScore >= 0.7 ? 'ADVANCE' : 'PRACTICE',
    };

    res.json({
      success: true,
      learner,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing diagnostic' });
  }
});

// ==========================================
// 9. LEARNERS & ATTEMPTS
// ==========================================
apiRouter.get('/learners', (_req, res) => {
  res.json({
    success: true,
    learners: Array.from(store.learners.values()),
  });
});

apiRouter.get('/learners/:id', (req, res) => {
  const learner = store.learners.get(req.params.id);
  if (!learner) {
    return res.status(404).json({ error: 'Learner not found' });
  }
  res.json({
    success: true,
    learner,
  });
});

apiRouter.post('/attempts', (req, res) => {
  try {
    const {
      learnerId,
      questionId,
      selectedOptionIndex,
      confidence,
      responseTimeSeconds,
      hintsUsed,
      retries,
      userCodeAnswer,
    } = req.body;

    if (!learnerId || !questionId || selectedOptionIndex === undefined) {
      return res.status(400).json({ error: 'Missing required attempt fields' });
    }

    const result = store.recordAttempt(learnerId, questionId, {
      selectedOptionIndex,
      confidence: confidence ?? 0.5,
      responseTimeSeconds: responseTimeSeconds ?? 15,
      hintsUsed: hintsUsed ?? 0,
      retries: retries ?? 0,
      userCodeAnswer,
    });

    const updatedLearner = store.learners.get(learnerId);

    res.json({
      success: true,
      ...result,
      learner: updatedLearner,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error recording attempt' });
  }
});

// ==========================================
// 10. TEACHER OVERRIDE
// ==========================================
apiRouter.post('/override', (req, res) => {
  try {
    const { learnerId, teacherId, teacherName, newAction, newConceptId, reason } = req.body;
    if (!learnerId || !newAction || !reason) {
      return res.status(400).json({ error: 'Missing required override fields' });
    }

    const override = store.applyTeacherOverride(
      learnerId,
      teacherId || 'teacher_vance',
      teacherName || 'Prof. Alistair Vance',
      newAction,
      newConceptId,
      reason
    );

    const updatedLearner = store.learners.get(learnerId);

    res.json({
      success: true,
      override,
      learner: updatedLearner,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error applying override' });
  }
});

// ==========================================
// 11. TIME SIMULATION & DEMO MANAGEMENT
// ==========================================
apiRouter.post('/simulate-time', (req, res) => {
  try {
    const { learnerId, days } = req.body;
    const daysNum = Number(days) || 14;

    const learner = store.learners.get(learnerId || 'student_a');
    if (!learner) return res.status(404).json({ error: 'Learner not found' });

    for (const conceptId of Object.keys(learner.conceptMasteries)) {
      const state = learner.conceptMasteries[conceptId];
      if (state.attemptsCount > 0) {
        state.daysSinceLastReview += daysNum;
        state.retention = Math.max(
          0.1,
          state.mastery * Math.exp(-store.config.forgettingDecayRate * state.daysSinceLastReview)
        );
      }
    }

    res.json({
      success: true,
      daysSimulated: daysNum,
      learner,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error simulating time' });
  }
});

apiRouter.post('/reset-demo', (_req, res) => {
  store.seedDatabase();
  res.json({
    success: true,
    message: 'Demo database reset to clean seeded state.',
  });
});

apiRouter.get('/stress-tests', (_req, res) => {
  const result = runAllStressTests();
  res.json({
    success: true,
    ...result,
  });
});

apiRouter.get('/config', (_req, res) => {
  res.json({
    success: true,
    config: store.config,
  });
});

apiRouter.post('/config', (req, res) => {
  try {
    const newConfig = req.body;
    store.config = {
      ...store.config,
      ...newConfig,
      weights: {
        ...store.config.weights,
        ...(newConfig.weights || {}),
      },
    };
    res.json({
      success: true,
      config: store.config,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating config' });
  }
});

// Server-side Gemini AI Intuition endpoint compliant with SDK guidelines
apiRouter.post('/ai-explain', async (req, res) => {
  const { conceptName, context, promptType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      success: true,
      text: getDeterministicExplanation(conceptName, promptType, context),
      isAIGenerated: false,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let prompt = '';
    if (promptType === 'concept_intuition') {
      prompt = `You are a world-class computer science educator. Explain the core intuition behind "${conceptName}" in 2 concise, highly memorable paragraphs. Focus on memory layout, computational trade-offs, and practical engineering use cases.`;
    } else if (promptType === 'teacher_advice') {
      prompt = `You are an educational psychologist advising a computer science professor. A student is struggling with ${conceptName}. Context: "${context}". Recommend 2 specific diagnostic interventions or cognitive bridging strategies to help this student break through the bottleneck.`;
    } else {
      prompt = `Provide a short, targeted study hint for the concept "${conceptName}".`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      text: response.text || getDeterministicExplanation(conceptName, promptType, context),
      isAIGenerated: true,
    });
  } catch (err: any) {
    res.json({
      success: true,
      text: getDeterministicExplanation(conceptName, promptType, context),
      isAIGenerated: false,
    });
  }
});

function getDeterministicExplanation(conceptName: string, promptType: string, context?: string): string {
  if (promptType === 'concept_intuition') {
    return `${conceptName} is fundamental to efficient algorithm design. In high-performance software, choosing the appropriate structure directly dictates CPU cache behavior, memory footprint, and asymptotic runtime bounds. Always weigh the trade-offs between O(1) random access vs dynamic pointer manipulation based on read-heavy or write-heavy workload characteristics.`;
  }
  return `Targeted Educator Guidance for ${conceptName}: Focus on multi-modal representation. Have the learner draw physical pointer diagrams or walk through recursive frame unwinding step-by-step before implementing code. Context observed: ${context || 'Student demonstrates localized misconception around edge-case termination.'}`;
}
