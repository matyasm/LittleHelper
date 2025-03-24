import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ theme, toggleTheme }) => {
  const isDarkMode = theme.mode === 'dark';
  
  return (
    <button
      onClick={toggleTheme}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: theme.text,
        padding: '6px',
        borderRadius: '4px',
      }}
    >
      {isDarkMode ? (
        <FiSun size={18} style={{ color: theme.primary }} />
      ) : (
        <FiMoon size={18} style={{ color: theme.primary }} />
      )}
    </button>
  );
};

export default ThemeToggle; 