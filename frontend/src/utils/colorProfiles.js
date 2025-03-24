// Color profiles for the application - Exotic subtle themes
const colorProfiles = {
  auroraBreeze: {
    name: 'Aurora Breeze',
    primary: '#4facfe',
    secondary: '#00f2fe',
    accent: '#4158d0',
    background: '#f8faff',
    cardBg: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    border: '#e2e8f0',
    success: '#0bab64',
    error: '#e53e3e',
  },
  amethystDusk: {
    name: 'Amethyst Dusk',
    primary: '#8a2be2',
    secondary: '#a15ee6',
    accent: '#7a43b6',
    background: '#f9f5ff',
    cardBg: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    border: '#e8dffa',
    success: '#38a169',
    error: '#e53e3e',
  },
  saharaSunset: {
    name: 'Sahara Sunset',
    primary: '#f2994a',
    secondary: '#f18345',
    accent: '#dd7230',
    background: '#fffaf7',
    cardBg: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    border: '#f7e8df',
    success: '#38a169',
    error: '#e53e3e',
  },
  jadeForest: {
    name: 'Jade Forest',
    primary: '#36b37e',
    secondary: '#25a069',
    accent: '#086e45',
    background: '#f5fff9',
    cardBg: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    border: '#dff7ec',
    success: '#0bab64',
    error: '#e53e3e',
  },
  coralReef: {
    name: 'Coral Reef',
    primary: '#ff7e67',
    secondary: '#f25f4c',
    accent: '#e14b32',
    background: '#fff8f6',
    cardBg: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    border: '#fce6e1',
    success: '#38a169',
    error: '#e53e3e',
  },
  oceanMist: {
    name: 'Ocean Mist',
    primary: '#00b8d9',
    secondary: '#00a3bf',
    accent: '#0282a5',
    background: '#f5fcff',
    cardBg: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    border: '#d8f1f9',
    success: '#38a169',
    error: '#e53e3e',
  },
  midnightOrchid: {
    name: 'Midnight Orchid',
    primary: '#6c63ff',
    secondary: '#574bd6',
    accent: '#4335b5',
    background: '#171923',
    cardBg: '#232535',
    text: '#f7fafc',
    textLight: '#cbd5e0',
    border: '#303346',
    success: '#68d391',
    error: '#fc8181',
  },
  alpineSnow: {
    name: 'Alpine Snow',
    primary: '#4776e6',
    secondary: '#3a66d4',
    accent: '#2855c5',
    background: '#ffffff',
    cardBg: '#f8fafc',
    text: '#1a202c',
    textLight: '#4a5568',
    border: '#edf2f7',
    success: '#38a169',
    error: '#e53e3e',
  }
};

// Function to get dark mode variant of a theme
const getDarkModeTheme = (theme) => {
  return {
    ...theme,
    background: '#171923',
    cardBg: '#232535',
    text: '#f7fafc',
    textLight: '#cbd5e0',
    border: '#303346',
  };
};

// Generate theme object based on profile and mode
const getTheme = (profileKey, mode = 'light') => {
  const baseTheme = colorProfiles[profileKey] || colorProfiles.auroraBreeze;
  
  if (mode === 'dark' && profileKey !== 'midnightOrchid') {
    return {
      ...getDarkModeTheme(baseTheme),
      primary: baseTheme.primary,
      secondary: baseTheme.secondary,
      accent: baseTheme.accent,
      success: '#68d391',
      error: '#fc8181',
      mode: 'dark'
    };
  }
  
  return {
    ...baseTheme,
    mode: mode
  };
};

// Export both the raw profiles and the theme generator
export { colorProfiles, getTheme }; 