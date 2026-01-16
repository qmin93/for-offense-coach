// ============================================
// Onboarding Feature Exports
// ============================================

export { OnboardingOverlay, OnboardingHint } from "./OnboardingOverlay";
export {
  HardOnboardingModal,
  shouldShowHardOnboarding,
  completeHardOnboarding,
  resetHardOnboarding,
  ONBOARDING_CONCEPTS,
  type OnboardingConcept,
} from "./HardOnboardingModal";
export {
  getOnboardingState,
  saveOnboardingState,
  startOnboarding,
  advanceOnboarding,
  completeOnboarding,
  dismissOnboarding,
  resetOnboarding,
  isFirstTimeUser,
  shouldShowOnboarding,
  getCurrentOnboardingStep,
  type OnboardingState,
} from "./onboarding-state";
