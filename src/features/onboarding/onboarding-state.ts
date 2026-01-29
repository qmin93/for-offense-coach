// ============================================
// Onboarding State Manager
// localStorage 기반 온보딩 상태 관리
// ============================================

const ONBOARDING_KEY = "foroffense_onboarding_v1";

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  completedSteps: string[];
  startedAt: string | null;
  completedAt: string | null;
  dismissedAt: string | null;
}

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  currentStep: 0,
  completedSteps: [],
  startedAt: null,
  completedAt: null,
  dismissedAt: null,
};

// ============================================
// Local Storage Operations
// ============================================

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    }
  } catch {
    console.warn("Failed to read onboarding state");
  }
  return DEFAULT_STATE;
}

export function saveOnboardingState(state: Partial<OnboardingState>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getOnboardingState();
    const updated = { ...current, ...state };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
  } catch {
    console.warn("Failed to save onboarding state");
  }
}

// ============================================
// Onboarding Actions
// ============================================

export function startOnboarding(): void {
  saveOnboardingState({
    completed: false,
    currentStep: 0,
    completedSteps: [],
    startedAt: new Date().toISOString(),
    dismissedAt: null,
  });
}

export function advanceOnboarding(stepId: string): void {
  const state = getOnboardingState();
  if (!state.completedSteps.includes(stepId)) {
    saveOnboardingState({
      completedSteps: [...state.completedSteps, stepId],
      currentStep: state.currentStep + 1,
    });
  }
}

export function completeOnboarding(): void {
  saveOnboardingState({
    completed: true,
    completedAt: new Date().toISOString(),
  });
}

export function dismissOnboarding(): void {
  saveOnboardingState({
    completed: true,
    dismissedAt: new Date().toISOString(),
  });
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_KEY);
}

// ============================================
// Check Functions
// ============================================

export function isFirstTimeUser(): boolean {
  const state = getOnboardingState();
  return !state.completed && !state.dismissedAt;
}

export function shouldShowOnboarding(): boolean {
  const state = getOnboardingState();
  // Show if not completed and not dismissed
  return !state.completed && !state.dismissedAt;
}

export function getCurrentOnboardingStep(): number {
  const state = getOnboardingState();
  return state.currentStep;
}
