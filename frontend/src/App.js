import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Switch } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
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
        <div className="App">
          {/* Modern, sleek header using AppBar and Toolbar */}
          <AppBar position="static" sx={{ background: darkMode ? '#333' : '#FFFFFF' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                ProPenalty.com
              </Typography>

              {/* Dark Mode Toggle */}
              {/* <IconButton sx={{ ml: 1 }} onClick={() => setDarkMode(!darkMode)} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> */}
            </Toolbar>
          </AppBar>

          {/* Routing for pages */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player-selection" element={<PlayerSelection />} />
            <Route path="/user-input" element={<UserInput />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;