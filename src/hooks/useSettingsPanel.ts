import { useState, useCallback } from "react";

interface UseSettingsPanelReturn {
  isVisible: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export function useSettingsPanel(): UseSettingsPanelReturn {
  const [isVisible, setIsVisible] = useState(false);

  const openPanel = useCallback(() => {
    setIsVisible(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return {
    isVisible,
    openPanel,
    closePanel,
    togglePanel,
  };
}
