import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppView,
  Concept,
  CurriculumDomain,
  DomainId,
  InstitutionStyleGuide,
  LanguageCode,
  LearnerProfile,
  ReadingLevel,
  Role,
  SystemConfig,
} from '../types.js';
import * as api from '../api/client.js';

interface AppContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  targetConceptId: string;
  setTargetConceptId: (id: string) => void;
  targetTeacherStudentId: string;
  setTargetTeacherStudentId: (id: string) => void;
  currentLearner: LearnerProfile | null;
  allLearners: LearnerProfile[];
  concepts: Concept[];
  systemConfig: SystemConfig | null;
  institutions: InstitutionStyleGuide[];
  activeInstitutionId: string;
  setActiveInstitutionId: (id: string) => Promise<void>;

  // Multi-Domain Syllabi (GATE, UPSC, School STEM, College Degree, CS)
  domains: CurriculumDomain[];
  activeDomainId: DomainId;
  setActiveDomainId: (domainId: DomainId) => Promise<void>;
  
  // Accessibility & Innovations
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  readingLevel: ReadingLevel;
  setReadingLevel: (level: ReadingLevel) => void;
  dyslexiaMode: boolean;
  setDyslexiaMode: (enabled: boolean) => void;
  bionicReading: boolean;
  setBionicReading: (enabled: boolean) => void;

  // Audio Text-To-Speech Reader
  isAudioPlaying: boolean;
  activeSpokenText: string | null;
  speakText: (text: string, lang?: string) => void;
  stopAudio: () => void;

  loading: boolean;
  error: string | null;
  refreshLearner: () => Promise<void>;
  refreshAll: () => Promise<void>;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('STUDENT');
  const [activeStudentId, setActiveStudentId] = useState<string>('student_a');
  const [activeView, setActiveView] = useState<AppView>('student_dashboard');
  const [targetConceptId, setTargetConceptId] = useState<string>('gate_toc');
  const [targetTeacherStudentId, setTargetTeacherStudentId] = useState<string>('student_b');

  const [currentLearner, setCurrentLearner] = useState<LearnerProfile | null>(null);
  const [allLearners, setAllLearners] = useState<LearnerProfile[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [allSystemConcepts, setAllSystemConcepts] = useState<Concept[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionStyleGuide[]>([]);
  const [activeInstitutionId, setActiveInstIdState] = useState<string>('iit_madras');

  // Domains state
  const [domains, setDomains] = useState<CurriculumDomain[]>([]);
  const [activeDomainId, setActiveDomainIdState] = useState<DomainId>('gate_cs');

  // Accessibility & Innovation Preferences
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [readingLevel, setReadingLevelState] = useState<ReadingLevel>('undergraduate');
  const [dyslexiaMode, setDyslexiaModeState] = useState<boolean>(false);
  const [bionicReading, setBionicReadingState] = useState<boolean>(false);

  // Audio Speech Reader State
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activeSpokenText, setActiveSpokenText] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  const refreshAll = async () => {
    try {
      setLoading(true);
      const [fetchedConcepts, fetchedLearners, fetchedConfig, instData, domainsData] = await Promise.all([
        api.fetchConcepts(),
        api.fetchLearners(),
        api.fetchSystemConfig(),
        api.fetchInstitutions().catch(() => ({ institutions: [], activeInstitutionId: 'iit_madras' })),
        api.fetchDomains().catch(() => ({ domains: [], activeDomainId: 'gate_cs' as DomainId })),
      ]);

      setAllSystemConcepts(fetchedConcepts);
      setAllLearners(fetchedLearners);
      setSystemConfig(fetchedConfig);
      setInstitutions(instData.institutions);
      setActiveInstIdState(instData.activeInstitutionId || 'iit_madras');
      setDomains(domainsData.domains);

      const active = fetchedLearners.find((l: LearnerProfile) => l.id === activeStudentId) || fetchedLearners[0];
      const targetDomain = active?.activeDomainId || domainsData.activeDomainId || 'gate_cs';
      setActiveDomainIdState(targetDomain);

      // Filter concepts by active domain
      const filtered = fetchedConcepts.filter((c) => c.domainId === targetDomain);
      setConcepts(filtered.length > 0 ? filtered : fetchedConcepts);

      if (filtered.length > 0) {
        setTargetConceptId(filtered[0].id);
      }

      if (active) {
        setCurrentLearner(active);
        setLanguageState(active.preferredLanguage || 'en');
        setReadingLevelState(active.preferredReadingLevel || 'undergraduate');
        setDyslexiaModeState(active.dyslexiaModeEnabled || false);
        setBionicReadingState(active.bionicReadingEnabled || false);
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setError(err.message || 'Error connecting to MasteryFlow engine');
    } finally {
      setLoading(false);
    }
  };

  const refreshLearner = async () => {
    try {
      const learner = await api.fetchLearner(activeStudentId);
      setCurrentLearner(learner);
      setAllLearners((prev) => prev.map((l) => (l.id === learner.id ? learner : l)));
    } catch (err: any) {
      console.error(`Failed to refresh learner ${activeStudentId}:`, err);
    }
  };

  const setActiveDomainId = async (domainId: DomainId) => {
    try {
      setActiveDomainIdState(domainId);
      const updatedLearner = await api.switchLearnerDomain(activeStudentId, domainId);
      setCurrentLearner(updatedLearner);
      setAllLearners((prev) => prev.map((l) => (l.id === updatedLearner.id ? updatedLearner : l)));

      // Update filtered concepts
      const filtered = allSystemConcepts.filter((c) => c.domainId === domainId);
      setConcepts(filtered.length > 0 ? filtered : allSystemConcepts);
      if (filtered.length > 0) {
        setTargetConceptId(filtered[0].id);
      }

      // Automatically pair recommended style guide for domain
      if (domainId === 'gate_cs') {
        setActiveInstitutionId('iit_madras');
      } else if (domainId === 'upsc_civil') {
        setActiveInstitutionId('upsc_commission');
      } else if (domainId === 'school_stem') {
        setActiveInstitutionId('cbse_board');
      } else {
        setActiveInstitutionId('mit_eecs');
      }
    } catch (err) {
      console.error('Error switching domain:', err);
    }
  };

  const setActiveInstitutionId = async (id: string) => {
    try {
      await api.setActiveInstitution(id);
      setActiveInstIdState(id);
      if (currentLearner) {
        await api.updateUserPreferences(currentLearner.id, { institutionId: id });
        setCurrentLearner((prev) => (prev ? { ...prev, institutionId: id } : null));
      }
    } catch (err) {
      console.error('Error setting active institution:', err);
    }
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (currentLearner) {
      api.updateUserPreferences(currentLearner.id, { preferredLanguage: lang });
    }
  };

  const setReadingLevel = (level: ReadingLevel) => {
    setReadingLevelState(level);
    if (currentLearner) {
      api.updateUserPreferences(currentLearner.id, { preferredReadingLevel: level });
    }
  };

  const setDyslexiaMode = (enabled: boolean) => {
    setDyslexiaModeState(enabled);
    if (currentLearner) {
      api.updateUserPreferences(currentLearner.id, { dyslexiaModeEnabled: enabled });
    }
  };

  const setBionicReading = (enabled: boolean) => {
    setBionicReadingState(enabled);
    if (currentLearner) {
      api.updateUserPreferences(currentLearner.id, { bionicReadingEnabled: enabled });
    }
  };

  const speakText = (text: string, lang = 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const langMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
    };
    utterance.lang = langMap[lang] || 'en-US';

    utterance.onstart = () => {
      setIsAudioPlaying(true);
      setActiveSpokenText(text);
    };

    utterance.onend = () => {
      setIsAudioPlaying(false);
      setActiveSpokenText(null);
    };

    utterance.onerror = () => {
      setIsAudioPlaying(false);
      setActiveSpokenText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setActiveSpokenText(null);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (allLearners.length > 0) {
      const active = allLearners.find((l) => l.id === activeStudentId);
      if (active) {
        setCurrentLearner(active);
        setLanguageState(active.preferredLanguage || 'en');
        setReadingLevelState(active.preferredReadingLevel || 'undergraduate');
        setDyslexiaModeState(active.dyslexiaModeEnabled || false);
        setBionicReadingState(active.bionicReadingEnabled || false);
        if (active.activeDomainId) {
          setActiveDomainIdState(active.activeDomainId);
          const filtered = allSystemConcepts.filter((c) => c.domainId === active.activeDomainId);
          setConcepts(filtered.length > 0 ? filtered : allSystemConcepts);
          if (filtered.length > 0) setTargetConceptId(filtered[0].id);
        }
      }
    }
  }, [activeStudentId, allSystemConcepts]);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeStudentId,
        setActiveStudentId,
        activeView,
        setActiveView,
        targetConceptId,
        setTargetConceptId,
        targetTeacherStudentId,
        setTargetTeacherStudentId,
        currentLearner,
        allLearners,
        concepts,
        systemConfig,
        institutions,
        activeInstitutionId,
        setActiveInstitutionId,
        domains,
        activeDomainId,
        setActiveDomainId,
        language,
        setLanguage,
        readingLevel,
        setReadingLevel,
        dyslexiaMode,
        setDyslexiaMode,
        bionicReading,
        setBionicReading,
        isAudioPlaying,
        activeSpokenText,
        speakText,
        stopAudio,
        loading,
        error,
        refreshLearner,
        refreshAll,
        isDemoModalOpen,
        setIsDemoModalOpen,
        demoStep,
        setDemoStep,
      }}
    >
      <div className={dyslexiaMode ? 'dyslexia-mode-active font-dyslexic bg-[#FAF8F5] text-slate-900' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
