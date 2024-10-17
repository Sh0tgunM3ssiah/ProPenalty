import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, MenuItem, Select, FormControl, InputLabel, Button, TextField, Box, 
  Card, CardContent, Grid
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

function PlayerSelection() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fine, setFine] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [fineChartData, setFineChartData] = useState(null);
  const [showCharts, setShowCharts] = useState(false); // State for toggling charts visibility
  const navigate = useNavigate();

  const teamNameMapping = {
    'ATL': 'Atlanta Hawks',
    'BOS': 'Boston Celtics',
    'BRK': 'Brooklyn Nets',
    'CHO': 'Charlotte Hornets',
    'CHI': 'Chicago Bulls',
    'CLE': 'Cleveland Cavaliers',
    'DAL': 'Dallas Mavericks',
    'DEN': 'Denver Nuggets',
    'DET': 'Detroit Pistons',
    'GSW': 'Golden State Warriors',
    'HOU': 'Houston Rockets',
    'IND': 'Indiana Pacers',
    'LAC': 'Los Angeles Clippers',
    'LAL': 'Los Angeles Lakers',
    'MEM': 'Memphis Grizzlies',
    'MIA': 'Miami Heat',
    'MIL': 'Milwaukee Bucks',
    'MIN': 'Minnesota Timberwolves',
    'NOP': 'New Orleans Pelicans',
    'NYK': 'New York Knicks',
    'OKC': 'Oklahoma City Thunder',
    'ORL': 'Orlando Magic',
    'PHI': 'Philadelphia 76ers',
    'PHO': 'Phoenix Suns',
    'POR': 'Portland Trail Blazers',
    'SAC': 'Sacramento Kings',
    'SAS': 'San Antonio Spurs',
    'TOR': 'Toronto Raptors',
    'UTA': 'Utah Jazz',
    'WAS': 'Washington Wizards'
  };

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios.get(`${API_URL}/api/teams`).then((response) => {
      setTeams(response.data);
    });
  }, [API_URL]);

  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
    axios.get(`${API_URL}/api/players/${event.target.value}`).then((response) => {
      setPlayers(response.data);
    });
  };

  const handlePlayerChange = (event) => {
    const player = players.find((p) => p.name === event.target.value);
    setSelectedPlayer(player);
  };

  const handleFineChange = (event) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9.]/g, '');  // Allow only digits and periods
    setFine(inputValue);
  };

  const handleFineBlur = () => {
    if (fine) {
      const formattedValue = formatCurrency(parseFloat(fine.replace(/[^0-9.]/g, '')));
      setFine(formattedValue);
    }
  };

  const handleCalculate = () => {
    const cleanedFine = fine.replace(/[^0-9.]/g, '');  // Clean fine value
    axios.post(`${API_URL}/api/calculate`, {
      grossSalary: selectedPlayer.grossSalary,
      fine: parseFloat(cleanedFine),
      team: selectedPlayer.team,
    }).then((response) => {
      const { deductions, finePercentage } = response.data;

      // Set breakdown details
      setBreakdown({
        grossSalary: selectedPlayer.grossSalary,
        deductions,
        finePercentage,
      });

      // Salary breakdown chart data
      setChartData({
        labels: [
          'Net Income', 
          'Federal Tax', 
          'State Tax', 
          'NBA Escrow', 
          'Agent Fee', 
          'Jock Tax', 
          'FICA Medicare'
        ],
        datasets: [{
          label: 'Salary Breakdown',
          data: [
            deductions['Net Income'] - cleanedFine,
            deductions['Federal'],
            deductions['State'],
            deductions['NBAEscrow'],
            deductions['AgentFee'],
            deductions['JockTax'],
            deductions['FICAMedicare'],
          ],
          backgroundColor: ['#28a745', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#7E57C2', '#36A2EB'],
          hoverBackgroundColor: ['#28a745', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#7E57C2', '#36A2EB'],
        }],
      });

      // Fine percentage chart data
      setFineChartData({
        labels: ['Fine', 'Remaining Net Income'],
        datasets: [{
          label: 'Fine as Percentage of Net Income',
          data: [parseFloat(cleanedFine), deductions['Net Income'] - parseFloat(cleanedFine)],
          backgroundColor: ['#FF0000', '#28a745'],  // Fine is deep red, net income is money green
          hoverBackgroundColor: ['#FF0000', '#28a745'],
        }],
      });
    });
  };

  const handleCompare = () => {
    navigate('/user-input', {
      state: {
        selectedPlayer,
        finePercentage: breakdown.finePercentage,
        fine: fine,  // Passing fine to UserInput
      },
    });
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Select NBA Player
        </Typography>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Select Team</InputLabel>
          <Select value={selectedTeam} onChange={handleTeamChange}>
            {teams.map((teamAbbr) => (
              <MenuItem key={teamAbbr} value={teamAbbr}>
                {teamNameMapping[teamAbbr] || teamAbbr}  {/* Display full name or fallback to the abbreviation */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedTeam && (
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select Player</InputLabel>
            <Select value={selectedPlayer?.name || ''} onChange={handlePlayerChange}>
              {players.map((player) => (
                <MenuItem key={player.name} value={player.name}>
                  {player.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedPlayer && (
          <>
            <Typography variant="h6" gutterBottom>
              Gross Salary: {formatCurrency(selectedPlayer.grossSalary)}
            </Typography>

            <TextField
              fullWidth
              label="Enter Fine Amount"
              value={fine}
              onChange={handleFineChange}
              onBlur={handleFineBlur}
              type="text"
              sx={{ mb: 4 }}
            />

            <Box textAlign="center" sx={{ mb: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mr: 2 }} 
                onClick={handleCalculate} 
                disabled={!fine || fine === '$0.00' || isNaN(parseFloat(fine.replace(/[^0-9.]/g, '')))}
              >
                Calculate
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleCompare} 
                disabled={!fine || fine === '$0.00' || isNaN(parseFloat(fine.replace(/[^0-9.]/g, '')))}
              >
                Compare
              </Button>
            </Box>
          </>
        )}

        {breakdown && (
          <Box mt={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Breakdown</Typography>
                <Box textAlign="center" mt={3}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong style={{ color: '#28a745' }}>Gross Salary:</strong> {formatCurrency(breakdown.grossSalary)}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>Federal Tax:</strong> {formatCurrency(breakdown.deductions.Federal)}
                    </Typography>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>State Tax:</strong> {formatCurrency(breakdown.deductions.State)}
                    </Typography>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>NBA Escrow:</strong> {formatCurrency(breakdown.deductions.NBAEscrow)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>Agent Fee:</strong> {formatCurrency(breakdown.deductions.AgentFee)}
                    </Typography>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>Jock Tax:</strong> {formatCurrency(breakdown.deductions.JockTax)}
                    </Typography>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>FICA Medicare:</strong> {formatCurrency(breakdown.deductions.FICAMedicare)}
                    </Typography>
                  </Grid>
                </Grid>

                <Box textAlign="center" mt={3}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong style={{ color: '#28a745' }}>Net Income:</strong> {formatCurrency(breakdown.deductions['Net Income'])}
                  </Typography>
                  <Typography variant="body1">
                    <strong style={{ color: '#FF0000' }}>Fine Percentage:</strong> {breakdown.finePercentage.toFixed(2)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Container>
      {breakdown && (
        <Box textAlign="center" mt={4} sx={{mb: 4}}>
          <Button variant="contained" color="success" onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? 'HIDE THE CHARTS!' : 'SHOW THE CHARTS!'}
          </Button>
        </Box>
      )}

      {/* Display charts outside of the container and side by side */}
      {showCharts && (
        <Box sx={{ maxWidth: '1080px', width: '100%', margin: 'auto', mt: 4, mb: 4 }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom textAlign="center">Salary Breakdown Chart</Typography>
              <Pie data={chartData} height={200} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom textAlign="center">Fine vs Net Income Chart</Typography>
              <Pie data={fineChartData} height={200} />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
}

export default PlayerSelection;
