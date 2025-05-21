// src/components/TriggerOnMount.tsx
import { useEffect } from "react";

export const TriggerOnMount = ({ onReady }: { onReady: () => void }) => {
  useEffect(() => {
    // Use a small timeout to ensure all routing components are fully loaded
    // before triggering the deep link
    const timeoutId = setTimeout(() => {
      console.log("Triggering onReady callback");
      onReady();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [onReady]);
  
  return null;
};