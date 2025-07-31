import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface FontSizeConfig {
  name: string;
  label: string;
  scale: string;
  description: string;
}

export const fontSizeConfigs: Record<FontSize, FontSizeConfig> = {
  small: {
    name: 'small',
    label: 'Small',
    scale: 'text-sm',
    description: 'Compact text for more content'
  },
  medium: {
    name: 'medium',
    label: 'Medium',
    scale: 'text-base',
    description: 'Default comfortable reading size'
  },
  large: {
    name: 'large',
    label: 'Large',
    scale: 'text-lg',
    description: 'Larger text for better readability'
  },
  'extra-large': {
    name: 'extra-large',
    label: 'Extra Large',
    scale: 'text-xl',
    description: 'Maximum size for accessibility'
  }
};

export function useFontSize() {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('expense-tracker-font-size');
      // Validate that the saved value is a valid FontSize
      if (saved && saved in fontSizeConfigs) {
        return saved as FontSize;
      }
      return 'medium';
    } catch {
      return 'medium';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('expense-tracker-font-size', fontSize);
      
      // Apply font size to document root
      const root = document.documentElement;
      
      // Remove existing font size classes
      Object.values(fontSizeConfigs).forEach(config => {
        root.classList.remove(`font-size-${config.name}`);
      });
      
      // Add current font size class
      root.classList.add(`font-size-${fontSize}`);
      
      // Set CSS custom properties for dynamic scaling
      const scaleMap = {
        small: '0.875',
        medium: '1',
        large: '1.125',
        'extra-large': '1.25'
      };
      
      root.style.setProperty('--font-scale', scaleMap[fontSize]);
      
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  }, [fontSize]);

  const updateFontSize = (newSize: FontSize) => {
    // Validate the new size before setting it
    if (newSize in fontSizeConfigs) {
      setFontSize(newSize);
    } else {
      console.warn(`Invalid font size: ${newSize}, falling back to medium`);
      setFontSize('medium');
    }
  };

  const getFontSizeClasses = (baseClasses: string = '') => {
    // Ensure fontSize is valid and config exists
    const config = fontSizeConfigs[fontSize];
    if (!config) {
      console.warn(`Font size config not found for: ${fontSize}, using medium`);
      const fallbackConfig = fontSizeConfigs.medium;
      return `${baseClasses} ${fallbackConfig.scale}`.trim();
    }
    return `${baseClasses} ${config.scale}`.trim();
  };

  return {
    fontSize,
    updateFontSize,
    getFontSizeClasses,
    fontSizeConfig: fontSizeConfigs[fontSize] || fontSizeConfigs.medium
  };
}