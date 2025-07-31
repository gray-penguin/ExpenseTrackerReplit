import React, { createContext, useContext } from 'react';
import { useFontSize, FontSize, fontSizeConfigs } from '../hooks/useFontSize';

interface FontSizeContextType {
  fontSize: FontSize;
  updateFontSize: (size: FontSize) => void;
  getFontSizeClasses: (baseClasses?: string) => string;
  fontSizeConfig: typeof fontSizeConfigs[FontSize];
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always use small font size
  const fontSizeHook = {
    fontSize: 'small' as FontSize,
    updateFontSize: () => {}, // No-op since we always use small
    getFontSizeClasses: (baseClasses?: string) => baseClasses || '',
    fontSizeConfig: fontSizeConfigs.small
  };

  return (
    <FontSizeContext.Provider value={fontSizeHook}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSizeContext = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSizeContext must be used within a FontSizeProvider');
  }
  return context;
};