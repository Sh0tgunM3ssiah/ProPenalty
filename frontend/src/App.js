import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { AppBar, Toolbar, Typography} from '@mui/material';
import Home from './components/Home';
import PlayerSelection from './components/PlayerSelection';
import UserInput from './components/UserInput';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Modern, sleek header using AppBar and Toolbar */}
        <AppBar position="static" sx={{ background: '#FFFFFF' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ProPenalty.com
            </Typography>
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
  );
}

export default App;
