import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Link } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './components/Home';
import PlayerSelection from './components/PlayerSelection';
import UserInput from './components/UserInput';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Create a theme that updates based on the dark mode value
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box
          display="flex"
          flexDirection="column"
          minHeight="100vh"
          sx={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)', // Add padding for safe areas and navigation bar
            minHeight: '100vh', // Ensure the app takes up at least the full height of the viewport
            '@media (max-height: 800px)': {
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)', // More padding for shorter screens
            },
          }}
        >
          {/* Header */}
          <AppBar position="static" sx={{ background: darkMode ? '#333' : '#FFFFFF' }}>
            <Toolbar>
              {/* Logo Image */}
              <Box sx={{ flexGrow: 1 }}>
                <img
                  src={`${process.env.PUBLIC_URL}/ProPenalty_Logo.png`}
                  alt="ProPenalty Logo"
                  style={{ height: '40px', cursor: 'pointer' }}
                  onClick={() => window.location.href = '/'} // Optional: click to go home
                />
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main content area */}
          <Box flex="1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/player-selection" element={<PlayerSelection />} />
              <Route path="/user-input" element={<UserInput />} />
            </Routes>
          </Box>

          {/* Footer anchored to the bottom */}
          <Box
            component="footer"
            sx={{
              py: 3,
              textAlign: 'center',
              backgroundColor: darkMode ? '#333' : '#f4f4f4',
              color: darkMode ? '#fff' : '#333',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)', // Ensure safe area for the footer
              minHeight: 'auto',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Developed by Sean McMullen
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <Link
                href="https://www.buymeacoffee.com/seanmcmullen"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: darkMode ? '#FFDD00' : '#333', textDecoration: 'none' }}
              >
                Buy me a candy bar 🍫
              </Link>
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;