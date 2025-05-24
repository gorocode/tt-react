# Multi-Theme System Documentation

## Overview

This document outlines the implementation of the multi-theme system in the tt-react application. The system replaces the previous dark/light mode toggle with a comprehensive theming solution that supports nine built-in visual themes and allows users to create custom themes.

## Theme Options

### Built-in Themes

The application now supports the following built-in themes:

1. **Light Theme (Default Light Mode)**
   - Background: `#ffffff`
   - Text: `#1a1a1a`
   - Primary: `#1a1a1a`
   - Secondary: `#4a4a4a`
   - Accent: `#005f73`

2. **Dark Theme (Default Dark Mode)**
   - Background: `#121212`
   - Text: `#e0e0e0`
   - Primary: `#e0e0e0`
   - Secondary: `#a0a0a0`
   - Accent: `#03dac6`

3. **Classic Elegant**
   - Background: `#f4f1ee`
   - Text: `#3e3e3e`
   - Primary: `#3e3e3e`
   - Secondary: `#a67b5b`
   - Accent: `#e27d60`

4. **Fresh Tropical**
   - Background: `#e0f7fa`
   - Text: `#00796b`
   - Primary: `#00796b`
   - Secondary: `#004d40`
   - Accent: `#80cbc4`

5. **Urban Industrial**
   - Background: `#2e2e2e`
   - Text: `#e0e0e0`
   - Primary: `#4a4a4a`
   - Secondary: `#d9bf77`
   - Accent: `#c44536`

6. **Natural Green**
   - Background: `#f1f8e9`
   - Text: `#33691e`
   - Primary: `#558b2f`
   - Secondary: `#7cb342`
   - Accent: `#c0ca33`

7. **Warm Sunset**
   - Background: `#fff8e1`
   - Text: `#bf360c`
   - Primary: `#e64a19`
   - Secondary: `#ff7043`
   - Accent: `#ffab00`

8. **Midnight Blue**
   - Background: `#0a0a1a`
   - Text: `#c5cae9`
   - Primary: `#7986cb`
   - Secondary: `#5c6bc0`
   - Accent: `#8e24aa`

9. **Soft Pastel**
   - Background: `#f8f9fa`
   - Text: `#546e7a`
   - Primary: `#78909c`
   - Secondary: `#90a4ae`
   - Accent: `#ffb74d`

### Custom Themes

Users can now create, edit, and delete their own custom themes through the theme selector interface. Custom themes are saved in the browser's localStorage and persist between sessions.

## Implementation Details

### Core Files

1. **ThemeContext.tsx**
   - Located at: `src/context/ThemeContext.tsx`
   - Manages theme state and provides theme values to the application
   - Exports `useTheme()` hook for consuming theme values in components
   - Provides functions for managing custom themes (`addCustomTheme`, `updateCustomTheme`, `deleteCustomTheme`)

2. **index.css**
   - Contains CSS variables for all themes
   - Provides backward compatibility with previous theme approach

3. **ThemeSelector.tsx**
   - Component that allows users to switch between themes
   - Located in the NavBar for easy access

4. **ThemeModal.tsx**
   - Modal component that provides a more detailed theme selection interface
   - Shows theme colors and descriptions
   - Includes interface for creating and editing custom themes with real-time preview

### Using the Theme System

#### Applying Themes to Components

To apply theming to a component:

```tsx
import { useTheme } from '../../context/ThemeContext';

const YourComponent = () => {
  const { themeColors, currentTheme } = useTheme();
  
  return (
    <div 
      style={{ 
        backgroundColor: themeColors.background,
        color: themeColors.text,
        borderColor: themeColors.secondary
      }}
    >
      {/* Your component content */}
    </div>
  );
};
```

### Adding New Built-in Themes

To add a new built-in theme:

1. Add the theme definition to the `builtInThemes` object in `ThemeContext.tsx`
2. Add CSS variables for the theme in `index.css` (if needed)
3. Add the theme to the options in `builtInThemeOptions` array in `ThemeModal.tsx`

### Using Custom Themes

#### Creating a Custom Theme

Users can create custom themes through the ThemeModal interface:

1. Click the theme selector button in the navbar
2. In the theme modal, click "Create Custom Theme"
3. Use the color pickers to select colors for each theme property
4. Provide a name and description for the theme
5. Click "Save Theme"

#### Editing or Deleting Custom Themes

Users can manage their custom themes through the ThemeModal interface:

1. For custom themes, edit and delete buttons appear next to the theme name
2. Click the edit button to modify the theme colors and properties
3. Click the delete button to remove the theme

#### Custom Theme Storage

Custom themes are stored in the browser's localStorage under the key `customThemes` as a JSON string. The data structure is:

```json
{
  "custom_theme_id": {
    "name": "custom_theme_id",
    "label": "My Custom Theme",
    "description": "A personalized theme with my favorite colors",
    "background": "#ffffff",
    "text": "#000000",
    "primary": "#333333",
    "secondary": "#666666",
    "accent": "#0088cc"
  }
}
```

## Best Practices

1. Always use the `themeColors` object from the `useTheme()` hook for styling
2. For consistent UI elements, use inline styles with theme colors
3. For complex components, consider using CSS variables from `index.css`
4. When creating new components, ensure they respond to theme changes
5. For referencing custom themes, use the `customThemes` object from the `useTheme()` hook
6. For operations on custom themes, use the appropriate functions from `useTheme()`: `addCustomTheme`, `updateCustomTheme`, or `deleteCustomTheme`
