'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export type OnboardingStep =
  | 'welcome'           // Escolha do caminho
  | 'requirements'      // Passo 1 - requisitos
  | 'create-app'        // Passo 2 - criar app Meta
  | 'add-whatsapp'      // Passo 3 - adicionar WhatsApp
  | 'credentials'       // Passo 4 - copiar credenciais
  | 'test-connection'   // Passo 5 - testar
  | 'configure-webhook' // Passo 6 - configurar webhook
  | 'create-permanent-token' // Passo 7 - token permanente (opcional)
  | 'direct-credentials' // Caminho B - input direto
  | 'complete';         // Concluído

export type OnboardingPath = 'guided' | 'direct' | null;

export interface OnboardingProgress {
  // Estado do wizard
  currentStep: OnboardingStep;
  path: OnboardingPath;
  completedSteps: OnboardingStep[];

  // Checklist pós-setup
  checklistItems: {
    credentials: boolean;      // Credenciais conectadas
    testMessage: boolean;      // Mensagem de teste enviada
    webhook: boolean;          // Webhook configurado
    permanentToken: boolean;   // Token permanente criado
  };

  // UI state
  isChecklistMinimized: boolean;
  isChecklistDismissed: boolean;

  // Timestamps
  startedAt: string | null;
  completedAt: string | null;
}

const STORAGE_KEY = 'smartzap_onboarding_progress';

const DEFAULT_PROGRESS: OnboardingProgress = {
  currentStep: 'welcome',
  path: null,
  completedSteps: [],
  checklistItems: {
    credentials: false,
    testMessage: false,
    webhook: false,
    permanentToken: false,
  },
  isChecklistMinimized: false,
  isChecklistDismissed: false,
  startedAt: null,
  completedAt: null,
};

// ============================================================================
// Hook
// ============================================================================

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress>(DEFAULT_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingProgress;
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save onboarding progress:', error);
      }
    }
  }, [progress, isLoaded]);

  // ============================================================================
  // Actions
  // ============================================================================

  const startOnboarding = useCallback((path: OnboardingPath) => {
    setProgress(prev => ({
      ...prev,
      path,
      currentStep: path === 'guided' ? 'requirements' : 'direct-credentials',
      startedAt: prev.startedAt || new Date().toISOString(),
    }));
  }, []);

  const goToStep = useCallback((step: OnboardingStep) => {
    setProgress(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const completeStep = useCallback((step: OnboardingStep) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step],
    }));
  }, []);

  const nextStep = useCallback(() => {
    setProgress(prev => {
      const guidedSteps: OnboardingStep[] = [
        'requirements',
        'create-app',
        'add-whatsapp',
        'credentials',
        'test-connection',
        'configure-webhook',
        'create-permanent-token',
        'complete',
      ];

      // Marcar step atual como completo
      const updatedCompleted = prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStep];

      if (prev.path === 'guided') {
        const currentIndex = guidedSteps.indexOf(prev.currentStep);
        const nextStepValue = guidedSteps[currentIndex + 1] || 'complete';

        return {
          ...prev,
          currentStep: nextStepValue,
          completedSteps: updatedCompleted,
          completedAt: nextStepValue === 'complete' ? new Date().toISOString() : prev.completedAt,
        };
      }

      // Path direto vai direto para complete
      return {
        ...prev,
        currentStep: 'complete',
        completedSteps: updatedCompleted,
        completedAt: new Date().toISOString(),
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setProgress(prev => {
      const guidedSteps: OnboardingStep[] = [
        'welcome',
        'requirements',
        'create-app',
        'add-whatsapp',
        'credentials',
        'test-connection',
        'configure-webhook',
        'create-permanent-token',
      ];

      if (prev.path === 'guided') {
        const currentIndex = guidedSteps.indexOf(prev.currentStep);
        const prevStep = guidedSteps[Math.max(0, currentIndex - 1)];
        return { ...prev, currentStep: prevStep };
      }

      // Path direto volta para welcome
      return { ...prev, currentStep: 'welcome', path: null };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentStep: 'complete',
      completedAt: new Date().toISOString(),
      checklistItems: {
        ...prev.checklistItems,
        credentials: true,
      },
    }));
  }, []);

  // ============================================================================
  // Checklist Actions
  // ============================================================================

  const updateChecklistItem = useCallback((
    item: keyof OnboardingProgress['checklistItems'],
    value: boolean
  ) => {
    setProgress(prev => ({
      ...prev,
      checklistItems: {
        ...prev.checklistItems,
        [item]: value,
      },
    }));
  }, []);

  const minimizeChecklist = useCallback((minimized: boolean) => {
    setProgress(prev => ({
      ...prev,
      isChecklistMinimized: minimized,
    }));
  }, []);

  const dismissChecklist = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isChecklistDismissed: true,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const isOnboardingComplete = useMemo(() => {
    return progress.currentStep === 'complete' || progress.completedAt !== null;
  }, [progress.currentStep, progress.completedAt]);

  const checklistProgress = useMemo(() => {
    const items = progress.checklistItems;
    const total = Object.keys(items).length;
    const completed = Object.values(items).filter(Boolean).length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }, [progress.checklistItems]);

  const shouldShowOnboardingModal = useMemo(() => {
    // Mostra modal se não completou onboarding
    return !isOnboardingComplete && isLoaded;
  }, [isOnboardingComplete, isLoaded]);

  const shouldShowChecklist = useMemo(() => {
    // Mostra checklist se completou onboarding mas não terminou tudo
    // e não foi dismissado
    return (
      isOnboardingComplete &&
      !progress.isChecklistDismissed &&
      checklistProgress.percentage < 100
    );
  }, [isOnboardingComplete, progress.isChecklistDismissed, checklistProgress.percentage]);

  const currentStepNumber = useMemo(() => {
    const guidedSteps: OnboardingStep[] = [
      'requirements',
      'create-app',
      'add-whatsapp',
      'credentials',
      'test-connection',
      'configure-webhook',
      'create-permanent-token',
    ];
    const index = guidedSteps.indexOf(progress.currentStep);
    return index >= 0 ? index + 1 : 0;
  }, [progress.currentStep]);

  const totalSteps = 7;

  return {
    // State
    progress,
    isLoaded,

    // Computed
    isOnboardingComplete,
    checklistProgress,
    shouldShowOnboardingModal,
    shouldShowChecklist,
    currentStepNumber,
    totalSteps,

    // Actions
    startOnboarding,
    goToStep,
    completeStep,
    nextStep,
    previousStep,
    completeOnboarding,

    // Checklist
    updateChecklistItem,
    minimizeChecklist,
    dismissChecklist,

    // Reset
    resetOnboarding,
  };
}
