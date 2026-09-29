import {
  AIEvaluationReport,
  Concept,
  InstitutionStyleGuide,
  LanguageCode,
  LearnerProfile,
  Question,
  ReadingLevel,
  RecommendationAction,
  StressTestResult,
  SystemConfig,
  TeacherOverride,
  User,
  CurriculumDomain,
  DomainId,
} from '../types.js';

const API_BASE = '/api';

export async function fetchDomains(): Promise<{ domains: CurriculumDomain[]; activeDomainId: DomainId }> {
  const res = await fetch(`${API_BASE}/domains`);
  if (!res.ok) throw new Error('Failed to fetch curriculum domains');
  return res.json();
}

export async function switchLearnerDomain(learnerId: string, domainId: DomainId): Promise<LearnerProfile> {
  const res = await fetch(`${API_BASE}/domains/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId, domainId }),
  });
  if (!res.ok) throw new Error('Failed to switch domain');
  const data = await res.json();
  return data.learner;
}

export async function fetchConcepts(domainId?: string): Promise<Concept[]> {
  const url = domainId ? `${API_BASE}/concepts?domain=${domainId}` : `${API_BASE}/concepts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch concepts');
  const data = await res.json();
  return data.concepts;
}

export async function fetchQuestionsByConcept(conceptId: string): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/concepts/${conceptId}/questions`);
  if (!res.ok) throw new Error('Failed to fetch concept questions');
  const data = await res.json();
  return data.questions;
}

export async function fetchDiagnosticQuestions(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/diagnostic/questions`);
  if (!res.ok) throw new Error('Failed to fetch diagnostic questions');
  const data = await res.json();
  return data.questions;
}

export async function submitDiagnostic(
  learnerId: string,
  responses: {
    questionId: string;
    selectedOptionIndex: number;
    confidence: number;
    responseTimeSeconds: number;
    hintsUsed: number;
  }[]
): Promise<LearnerProfile> {
  const res = await fetch(`${API_BASE}/diagnostic/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId, responses }),
  });
  if (!res.ok) throw new Error('Failed to submit diagnostic');
  const data = await res.json();
  return data.learner;
}

export async function fetchLearners(): Promise<LearnerProfile[]> {
  const res = await fetch(`${API_BASE}/learners`);
  if (!res.ok) throw new Error('Failed to fetch learners');
  const data = await res.json();
  return data.learners;
}

export async function fetchLearner(id: string): Promise<LearnerProfile> {
  const res = await fetch(`${API_BASE}/learners/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch learner ${id}`);
  const data = await res.json();
  return data.learner;
}

export async function submitAttempt(payload: {
  learnerId: string;
  questionId: string;
  selectedOptionIndex: number;
  confidence: number;
  responseTimeSeconds: number;
  hintsUsed: number;
  retries: number;
  userCodeAnswer?: string;
}): Promise<{
  attempt: any;
  evidence: any;
  masteryBefore: number;
  masteryAfter: number;
  uncertaintyBefore: number;
  uncertaintyAfter: number;
  newRecommendation: any;
  learner: LearnerProfile;
}> {
  const res = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit attempt');
  return res.json();
}

export async function applyTeacherOverride(payload: {
  learnerId: string;
  teacherId?: string;
  teacherName?: string;
  newAction: RecommendationAction;
  newConceptId: string;
  reason: string;
}): Promise<{ override: TeacherOverride; learner: LearnerProfile }> {
  const res = await fetch(`${API_BASE}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to apply teacher override');
  return res.json();
}

export async function simulateTimeElapsed(learnerId: string, days: number): Promise<LearnerProfile> {
  const res = await fetch(`${API_BASE}/simulate-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ learnerId, days }),
  });
  if (!res.ok) throw new Error('Failed to simulate time elapsed');
  const data = await res.json();
  return data.learner;
}

export async function runStressTests(): Promise<{ results: StressTestResult[]; metrics: Record<string, any> }> {
  const res = await fetch(`${API_BASE}/stress-tests`);
  if (!res.ok) throw new Error('Failed to run stress tests');
  return res.json();
}

export async function resetDemoState(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo state');
  return res.json();
}

export async function fetchSystemConfig(): Promise<SystemConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch system config');
  const data = await res.json();
  return data.config;
}

export async function updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update system config');
  const data = await res.json();
  return data.config;
}

export async function fetchAIExplanation(payload: {
  conceptName: string;
  context?: string;
  promptType: 'concept_intuition' | 'teacher_advice' | 'hint';
}): Promise<{ text: string; isAIGenerated: boolean }> {
  const res = await fetch(`${API_BASE}/ai-explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate AI explanation');
  return res.json();
}

// ==========================================
// 1. DATABASE EXPLORER CLIENT
// ==========================================
export async function fetchDatabaseSnapshot(): Promise<{
  success: boolean;
  stats: Record<string, number>;
  tables: Array<{
    name: string;
    count: number;
    description: string;
    records: any[];
  }>;
}> {
  const res = await fetch(`${API_BASE}/database`);
  if (!res.ok) throw new Error('Failed to fetch database snapshot');
  return res.json();
}

// ==========================================
// 2. CONTENT TRANSFORMATION: Multilingual & Reading Level
// ==========================================
export async function transformContent(payload: {
  conceptId: string;
  language: LanguageCode;
  readingLevel: ReadingLevel;
  institutionId?: string;
}): Promise<{
  conceptId: string;
  language: LanguageCode;
  readingLevel: ReadingLevel;
  name: string;
  analogy: string;
  coreExplanation: string;
  realWorldExample: string;
  keyPoints: string[];
  audioScript: string;
  institutionTone: string;
}> {
  const res = await fetch(`${API_BASE}/content/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to transform content');
  const data = await res.json();
  return data.content;
}

// ==========================================
// 3. AUTOMATIC EVALUATION & TEACHER APPROVAL
// ==========================================
export async function evaluateQuestion(payload: {
  questionId: string;
  customQuestion?: Partial<Question>;
}): Promise<AIEvaluationReport> {
  const res = await fetch(`${API_BASE}/content/evaluate-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to evaluate question');
  const data = await res.json();
  return data.report;
}

export async function approveQuestion(payload: {
  questionId: string;
  teacherId?: string;
  isApproved: boolean;
}): Promise<Question> {
  const res = await fetch(`${API_BASE}/content/approve-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to approve question');
  const data = await res.json();
  return data.question;
}

export async function createQuestion(questionData: Partial<Question>): Promise<{
  question: Question;
  evaluation: AIEvaluationReport;
}> {
  const res = await fetch(`${API_BASE}/content/create-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData),
  });
  if (!res.ok) throw new Error('Failed to create question');
  return res.json();
}

// ==========================================
// 4. INSTITUTION-SPECIFIC STYLE GUIDES
// ==========================================
export async function fetchInstitutions(): Promise<{
  institutions: InstitutionStyleGuide[];
  activeInstitutionId: string;
}> {
  const res = await fetch(`${API_BASE}/content/institutions`);
  if (!res.ok) throw new Error('Failed to fetch institutions');
  return res.json();
}

export async function setActiveInstitution(institutionId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/content/institutions/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ institutionId }),
  });
  if (!res.ok) throw new Error('Failed to set active institution');
  const data = await res.json();
  return data.activeInstitutionId;
}

// ==========================================
// 5. USER PREFERENCES
// ==========================================
export async function updateUserPreferences(
  userId: string,
  updates: Partial<User>
): Promise<{ user: User; learner?: LearnerProfile }> {
  const res = await fetch(`${API_BASE}/users/${userId}/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update user preferences');
  return res.json();
}
