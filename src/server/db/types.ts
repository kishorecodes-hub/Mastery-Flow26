export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'Recall' | 'Understanding' | 'Application' | 'Transfer';

export type BloomLevel = 
  | 'Remember' 
  | 'Understand' 
  | 'Apply' 
  | 'Analyze' 
  | 'Evaluate' 
  | 'Create';

export type QuestionFormat = 
  | 'MCQ' 
  | 'CODE_OUTPUT' 
  | 'DEBUG_BUG' 
  | 'FILL_BLANK' 
  | 'COMPLEXITY_TRADE_OFF'
  | 'ASSERTION_REASON'     // High-utility for UPSC & GATE competitive exams
  | 'NUMERICAL_ANALYSIS';  // High-utility for GATE & College STEM

export type ReadingLevel = 
  | 'middle_school'   // Intuitive analogies (train cars, cafeterias, airport queues)
  | 'high_school'     // Clear academic definition & visual step-by-step
  | 'undergraduate'   // Rigorous formal definitions & Big-O / mathematical invariants
  | 'executive';      // Systems engineering, policy trade-offs, and governance

export type LanguageCode = 
  | 'en' // English
  | 'es' // Spanish
  | 'hi' // Hindi
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'fr' // French
  | 'de' // German
  | 'zh'; // Mandarin

export type RecommendationAction = 
  | 'ADVANCE'
  | 'PRACTICE'
  | 'REVIEW'
  | 'REMEDIATE_PREREQUISITE'
  | 'CHALLENGE'
  | 'TEACHER_INTERVENTION';

// ==========================================
// CURRICULUM DOMAINS (Multi-Domain Architecture)
// ==========================================
export type DomainId = 
  | 'cs_foundations'  // Computer Science & Data Structures (CS-101 to CS-110)
  | 'gate_cs'         // Graduate Aptitude Test in Engineering (Algorithms, OS, TOC, DBMS)
  | 'upsc_civil'      // UPSC Civil Services Exam (Polity, Economy, Geography, History)
  | 'school_stem'     // General School Exam Syllabus (Physics, Chemistry, Math, Biology)
  | 'college_eng';    // College Degree Syllabus (Linear Algebra, ML, Distributed Systems)

export interface CurriculumDomain {
  id: DomainId;
  name: string;
  shortLabel: string;
  category: 'Competitive National Exams' | 'University Degree' | 'Secondary School' | 'Core Engineering';
  targetExam: string;
  description: string;
  badgeColor: string;
  accentColor: string;
  conceptIds: string[];
}

// ==========================================
// 1. DATABASE ENTITY: User
// ==========================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  cohort: string;
  institutionId: string;
  activeDomainId: DomainId; // Target syllabus domain
  preferredLanguage: LanguageCode;
  preferredReadingLevel: ReadingLevel;
  dyslexiaModeEnabled: boolean;
  bionicReadingEnabled: boolean;
  createdAt: string;
  lastActiveAt: string;
}

// ==========================================
// 2. DATABASE ENTITY: Concept
// ==========================================
export interface Concept {
  id: string;
  domainId: DomainId; // Which curriculum domain this concept belongs to
  name: string;
  code: string;
  description: string;
  prerequisites: string[]; // array of concept IDs
  order: number;
  category: string;
  keyTakeaways: string[];
  bloomTarget: BloomLevel;
  audioScript?: string;
  readingLevelVariants?: Record<ReadingLevel, {
    analogy: string;
    coreExplanation: string;
    realWorldExample: string;
    keyPoints: string[];
  }>;
  multilingualVariants?: Partial<Record<LanguageCode, {
    name: string;
    description: string;
    audioScript: string;
  }>>;
}

// ==========================================
// 3. DATABASE ENTITY: Prerequisite
// ==========================================
export interface Prerequisite {
  id: string;
  domainId: DomainId;
  conceptId: string;
  prerequisiteConceptId: string;
  requiredThreshold: number; // e.g. 0.70
  dependencyStrength: 'CRITICAL' | 'RECOMMENDED' | 'HELPFUL';
  rationale: string;
  createdAt: string;
}

// ==========================================
// 4. DATABASE ENTITY: Question
// ==========================================
export interface AIEvaluationReport {
  overallScore: number; // 0 - 100
  recommendation: 'AUTO_APPROVE' | 'NEEDS_TEACHER_REVIEW' | 'FLAGGED_REJECT';
  factualAccuracy: { score: number; rationale: string };
  bloomAlignment: { score: number; taggedLevel: BloomLevel; detectedLevel: BloomLevel; rationale: string };
  pedagogicalClarity: { score: number; rationale: string };
  distractorQuality: { score: number; rationale: string };
  styleGuideCompliance: { score: number; institutionName: string; rationale: string };
  evaluatedAt: string;
  autoApproved: boolean;
}

export interface Question {
  id: string;
  domainId: DomainId; // Tracks domain (gate, upsc, school, cs, etc.)
  conceptId: string;
  questionText: string;
  questionType: QuestionType; // legacy compatibility
  questionFormat: QuestionFormat; // Innovation: Question Diversity
  difficulty: QuestionDifficulty;
  bloomLevel: BloomLevel; // Innovation: Bloom's Taxonomy Tagging
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint: string;
  expectedTimeSeconds: number;
  isDiagnostic?: boolean;
  
  // Format-specific interactive fields
  codeSnippet?: string;
  expectedOutput?: string;
  bugLineNumber?: number;
  fillBlankTemplate?: string;
  fillBlankOptions?: string[];
  fillBlankSolution?: string;
  complexityPairs?: Array<{ scenario: string; complexity: string }>;
  assertionStatement?: string;
  reasonStatement?: string;

  // Innovation: Reading-level variants
  readingLevelVariants?: Record<ReadingLevel, {
    questionText: string;
    explanation: string;
  }>;

  // Innovation: Multilingual variants
  multilingualVariants?: Partial<Record<LanguageCode, {
    questionText: string;
    options: string[];
    explanation: string;
    hint: string;
  }>>;

  // Innovation: Institution-Specific Style Guides
  institutionStyleId?: string;

  // Innovation: Automatic Evaluation Before Teacher Approval
  evaluationStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  aiEvaluation?: AIEvaluationReport;
  reviewedByTeacherId?: string;
  reviewedAt?: string;
}

// ==========================================
// 5. DATABASE ENTITY: Attempt
// ==========================================
export interface Attempt {
  id: string;
  learnerId: string;
  domainId?: DomainId;
  questionId: string;
  conceptId: string;
  selectedOptionIndex: number;
  userCodeAnswer?: string;
  isCorrect: boolean;
  confidence: number; // 0.0 to 1.0 (e.g. 0.2, 0.5, 0.8, 1.0)
  responseTimeSeconds: number;
  hintsUsed: number;
  retries: number;
  timestamp: string;
  evidenceScore: number;
  questionType: QuestionType;
  questionFormat?: QuestionFormat;
  difficulty: QuestionDifficulty;
  bloomLevel?: BloomLevel;
  readingLevelUsed?: ReadingLevel;
  languageUsed?: LanguageCode;
  antiGuessingTriggered?: boolean;
  antiGuessingReason?: string;
}

// ==========================================
// 6. DATABASE ENTITY: MasteryState (ConceptMastery)
// ==========================================
export interface MasteryState {
  id: string;
  learnerId: string;
  domainId?: DomainId;
  conceptId: string;
  conceptName: string;
  mastery: number; // 0.0 to 1.0
  uncertainty: number; // 0.0 to 1.0
  retention: number; // 0.0 to 1.0
  attemptsCount: number;
  correctCount: number;
  incorrectCount: number;
  averageConfidence: number;
  averageResponseTime: number;
  totalHintsUsed: number;
  totalRetries: number;
  easyAccuracy: number;
  mediumAccuracy: number;
  hardAccuracy: number;
  transferAccuracy: number;
  bloomAccuracy: Record<BloomLevel, number>; // Accuracy broken down by Bloom cognitive level
  lastAttemptAt: string;
  lastReviewedAt: string;
  daysSinceLastReview: number;
  prerequisiteSatisfied: boolean;
  blockedByPrerequisites: string[]; // concept names
  status: 'mastered' | 'developing' | 'struggling' | 'prereq_blocked' | 'review_needed' | 'unattempted';
}

export type ConceptMastery = MasteryState;

// ==========================================
// 7. DATABASE ENTITY: LearningSession
// ==========================================
export interface LearningSession {
  id: string;
  learnerId: string;
  domainId: DomainId;
  sessionType: 'DIAGNOSTIC' | 'PRACTICE' | 'REVIEW' | 'CHALLENGE' | 'ASSESSMENT';
  activeConceptId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  attemptsCount: number;
  correctCount: number;
  initialMastery: number;
  finalMastery: number;
  readingLevelUsed: ReadingLevel;
  languageUsed: LanguageCode;
  dyslexiaModeActive: boolean;
  audioInteractionsCount: number;
  institutionStyleId: string;
}

// ==========================================
// 8. DATABASE ENTITY: Recommendation
// ==========================================
export interface Recommendation {
  id: string;
  learnerId: string;
  domainId?: DomainId;
  action: RecommendationAction;
  conceptId: string;
  conceptName: string;
  reason: string;
  stepFired?: string;
  evidenceSummary: {
    mastery: number;
    uncertainty: number;
    retention: number;
    recentAccuracy: string;
    hintsUsed: number;
    daysSinceReview: number;
    prerequisiteStatus: string;
    transferPerformance: string;
    guessingRisk: string;
  };
  timestamp: string;
  isOverridden?: boolean;
  overrideDetails?: TeacherOverride;
}

// ==========================================
// 9. DATABASE ENTITY: TeacherOverride
// ==========================================
export interface TeacherOverride {
  id: string;
  learnerId: string;
  teacherId: string;
  teacherName: string;
  previousAction: RecommendationAction;
  previousConceptId: string;
  newAction: RecommendationAction;
  newConceptId: string;
  reason: string;
  timestamp: string;
}

// ==========================================
// Institution-Specific Style Guides
// ==========================================
export interface InstitutionStyleGuide {
  id: string;
  name: string;
  shortCode: string;
  badgeColor: string;
  description: string;
  academicTone: 'RIGOROUS_FORMAL' | 'PRACTICAL_SYSTEMS' | 'INTUITIVE_SOCRATIC' | 'EXAM_OPTIMIZED';
  mathNotation: 'FORMAL_ASYMPTOTIC' | 'INFORMAL_BIG_O' | 'EMPIRICAL_PROFILING';
  codeStyle: 'MODERN_TYPESCRIPT' | 'STANDARD_C_CPP' | 'PYTHONIC_CLEAN';
  emphasis: string;
  guidelines: string[];
}

// Full Learner Profile
export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  cohort: string;
  institutionId: string;
  activeDomainId: DomainId;
  preferredLanguage: LanguageCode;
  preferredReadingLevel: ReadingLevel;
  dyslexiaModeEnabled: boolean;
  bionicReadingEnabled: boolean;
  overallMastery: number;
  overallUncertainty: number;
  overallRetention: number;
  diagnosticCompleted: boolean;
  diagnosticResult?: {
    completedAt: string;
    initialMastery: number;
    weakPrerequisites: string[];
    strongConcepts: string[];
    firstRecommendationAction: RecommendationAction;
  };
  needsAttention: boolean;
  attentionReason?: string;
  currentRecommendation?: Recommendation;
  conceptMasteries: Record<string, ConceptMastery>;
  recentAttempts: Attempt[];
  overrides: TeacherOverride[];
  recommendationHistory: Recommendation[];
}

export interface SystemConfig {
  masteryThreshold: number; // e.g. 0.75
  challengeThreshold: number; // e.g. 0.88
  prerequisiteThreshold: number; // e.g. 0.70
  forgettingDecayRate: number; // e.g. 0.05 per day
  uncertaintyThreshold: number; // e.g. 0.40
  interventionThresholdFailures: number; // e.g. 3
  learningRateAlpha: number; // e.g. 0.35
  activeDomainId: DomainId;
  activeInstitutionId: string;
  autoApproveScoreThreshold: number; // e.g. 85
  weights: {
    correctness: number; // 0.45
    confidence: number; // 0.20
    difficulty: number; // 0.15
    responseTime: number; // 0.10
    independence: number; // 0.10
  };
}

export interface StressTestResult {
  id: string;
  title: string;
  scenario: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
  evidence: Record<string, any>;
  explanation: string;
}
