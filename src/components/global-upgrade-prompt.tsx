"use client";

import { usePlan } from "@/contexts/plan-context";
import { UpgradePromptDialog } from "./ui/plan-ui";

/**
 * Global upgrade prompt component
 * Listens to plan context and shows upgrade dialog when triggered
 */
export function GlobalUpgradePrompt() {
  const { upgradePromptFeature, closeUpgradePrompt } = usePlan();

  return (
    <UpgradePromptDialog
      open={upgradePromptFeature !== null}
      onClose={closeUpgradePrompt}
      feature={upgradePromptFeature || undefined}
    />
  );
}
