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
  const [leagues] = useState([
    { value: 'NBA', label: 'NBA' }, 
    { value: 'NFL', label: 'NFL' }, 
    { value: 'MLB', label: 'MLB' }, 
    { value: 'NHL', label: 'NHL' },
    { value: 'WNBA', label: 'WNBA' } // Add WNBA as an option
  ]);
  const [selectedLeague, setSelectedLeague] = useState('');
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

  // Team name mappings for NBA, NFL, MLB, and NHL teams
  const nbaTeams = {
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

  const nflTeams = {
    'ARI': 'Arizona Cardinals',
    'ATL': 'Atlanta Falcons',
    'BAL': 'Baltimore Ravens',
    'BUF': 'Buffalo Bills',
    'CAR': 'Carolina Panthers',
    'CHI': 'Chicago Bears',
    'CIN': 'Cincinnati Bengals',
    'CLE': 'Cleveland Browns',
    'DAL': 'Dallas Cowboys',
    'DEN': 'Denver Broncos',
    'DET': 'Detroit Lions',
    'GB': 'Green Bay Packers',
    'HOU': 'Houston Texans',
    'IND': 'Indianapolis Colts',
    'JAX': 'Jacksonville Jaguars',
    'KC': 'Kansas City Chiefs',
    'LV': 'Las Vegas Raiders',
    'LAC': 'Los Angeles Chargers',
    'LAR': 'Los Angeles Rams',
    'MIA': 'Miami Dolphins',
    'MIN': 'Minnesota Vikings',
    'NE': 'New England Patriots',
    'NO': 'New Orleans Saints',
    'NYG': 'New York Giants',
    'NYJ': 'New York Jets',
    'PHI': 'Philadelphia Eagles',
    'PIT': 'Pittsburgh Steelers',
    'SEA': 'Seattle Seahawks',
    'SF': 'San Francisco 49ers',
    'TB': 'Tampa Bay Buccaneers',
    'TEN': 'Tennessee Titans',
    'WAS': 'Washington Commanders'
  };

  const mlbTeams = {
    'ARI': 'Arizona Diamondbacks',
    'ATL': 'Atlanta Braves',
    'BAL': 'Baltimore Orioles',
    'BOS': 'Boston Red Sox',
    'CHC': 'Chicago Cubs',
    'CHW': 'Chicago White Sox',
    'CIN': 'Cincinnati Reds',
    'CLE': 'Cleveland Guardians',
    'COL': 'Colorado Rockies',
    'DET': 'Detroit Tigers',
    'HOU': 'Houston Astros',
    'KC': 'Kansas City Royals',
    'LAA': 'Los Angeles Angels',
    'LAD': 'Los Angeles Dodgers',
    'MIA': 'Miami Marlins',
    'MIL': 'Milwaukee Brewers',
    'MIN': 'Minnesota Twins',
    'NYM': 'New York Mets',
    'NYY': 'New York Yankees',
    'OAK': 'Oakland Athletics',
    'PHI': 'Philadelphia Phillies',
    'PIT': 'Pittsburgh Pirates',
    'SD': 'San Diego Padres',
    'SF': 'San Francisco Giants',
    'SEA': 'Seattle Mariners',
    'STL': 'St. Louis Cardinals',
    'TB': 'Tampa Bay Rays',
    'TEX': 'Texas Rangers',
    'TOR': 'Toronto Blue Jays',
    'WSH': 'Washington Nationals'
  };

  const nhlTeams = {
    'ANA': 'Anaheim Ducks',
    'ARI': 'Arizona Coyotes',
    'BOS': 'Boston Bruins',
    'BUF': 'Buffalo Sabres',
    'CGY': 'Calgary Flames',
    'CAR': 'Carolina Hurricanes',
    'CHI': 'Chicago Blackhawks',
    'COL': 'Colorado Avalanche',
    'CBJ': 'Columbus Blue Jackets',
    'DAL': 'Dallas Stars',
    'DET': 'Detroit Red Wings',
    'EDM': 'Edmonton Oilers',
    'FLA': 'Florida Panthers',
    'LAK': 'Los Angeles Kings',
    'MIN': 'Minnesota Wild',
    'MTL': 'Montreal Canadiens',
    'NSH': 'Nashville Predators',
    'NJD': 'New Jersey Devils',
    'NYI': 'New York Islanders',
    'NYR': 'New York Rangers',
    'OTT': 'Ottawa Senators',
    'PHI': 'Philadelphia Flyers',
    'PIT': 'Pittsburgh Penguins',
    'SJS': 'San Jose Sharks',
    'SEA': 'Seattle Kraken',
    'STL': 'St. Louis Blues',
    'TBL': 'Tampa Bay Lightning',
    'TOR': 'Toronto Maple Leafs',
    'VAN': 'Vancouver Canucks',
    'VGK': 'Vegas Golden Knights',
    'WSH': 'Washington Capitals',
    'WPG': 'Winnipeg Jets'
  };

  const wnbaTeams = {
    'ATL': 'Atlanta Dream',
    'CHI': 'Chicago Sky',
    'CON': 'Connecticut Sun',
    'DAL': 'Dallas Wings',
    'IND': 'Indiana Fever',
    'LAS': 'Las Vegas Aces',
    'LVA': 'Los Angeles Sparks',
    'MIN': 'Minnesota Lynx',
    'NYL': 'New York Liberty',
    'PHX': 'Phoenix Mercury',
    'SEA': 'Seattle Storm',
    'WAS': 'Washington Mystics'
  };

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch teams based on selected league
  useEffect(() => {
    if (selectedLeague) {
      axios.get(`${API_URL}/api/teams?league=${selectedLeague}`).then((response) => {
        setTeams(response.data);
        setSelectedTeam(''); // Reset team when league changes
        setPlayers([]); // Reset players when league changes
      });
    }
  }, [selectedLeague, API_URL]);

  // Fetch players based on selected team
  const handleTeamChange = (event) => {
    setSelectedTeam(event.target.value);
    axios.get(`${API_URL}/api/players/${event.target.value}`).then((response) => {
      const filteredPlayers = response.data.filter(player => player.league === selectedLeague);
      setPlayers(filteredPlayers); // Only show players from the selected league
    });
  };

  const handlePlayerChange = (event) => {
    const player = players.find((p) => p.name === event.target.value);
    setSelectedPlayer(player || null); // If no player selected, set to null
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

  const handleCalculate = async () => {
    const cleanedFine = fine.replace(/[^0-9.]/g, '');  // Clean fine value
    const response = await axios.post(`${API_URL}/api/calculate`, {
      grossSalary: selectedPlayer.grossSalary,
      fine: parseFloat(cleanedFine),
      team: selectedPlayer.team,
    });

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
        'Escrow', 
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
          deductions['Escrow'],
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

    // Return the deductions and finePercentage for further use
    return { deductions, finePercentage };
};

const handleCompare = async () => {
  // If breakdown doesn't exist, calculate it first
  if (!breakdown) {
    const { deductions, finePercentage } = await handleCalculate(); // Ensure calculations happen before navigation
    navigate('/user-input', {
      state: {
        selectedPlayer,
        finePercentage,
        fine,  // Passing fine to UserInput
      },
    });
  } else {
    // If already calculated, navigate immediately
    navigate('/user-input', {
      state: {
        selectedPlayer,
        finePercentage: breakdown.finePercentage,
        fine,  // Passing fine to UserInput
      },
    });
  }
};

  // Filter teams based on selected league
  const filteredTeams = (() => {
    switch (selectedLeague) {
      case 'NBA':
        return Object.keys(nbaTeams);
      case 'NFL':
        return Object.keys(nflTeams);
      case 'MLB':
        return Object.keys(mlbTeams);
      case 'NHL':
        return Object.keys(nhlTeams);
      case 'WNBA':
        return Object.keys(wnbaTeams);
      default:
        return [];
    }
  })();

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Select Player
        </Typography>

        {/* League Selection */}
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Select League</InputLabel>
          <Select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
            {leagues.map((league) => (
              <MenuItem key={league.value} value={league.value}>
                {league.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Team Selection */}
        {selectedLeague && (
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select Team</InputLabel>
            <Select value={selectedTeam} onChange={handleTeamChange}>
              {filteredTeams.map((teamAbbr) => (
                <MenuItem key={teamAbbr} value={teamAbbr}>
                  {selectedLeague === 'NBA' ? nbaTeams[teamAbbr]
                  : selectedLeague === 'NFL' ? nflTeams[teamAbbr]
                  : selectedLeague === 'MLB' ? mlbTeams[teamAbbr]
                  : selectedLeague === 'NHL' ? nhlTeams[teamAbbr]
                  : wnbaTeams[teamAbbr]} {/* Show correct teams based on league */}
              </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Player Selection */}
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

        {/* Fine Input */}
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
                disabled={!fine || fine === '$0.00' || isNaN(parseFloat(fine.replace(/[^0-9.]/g, ''))) || !selectedPlayer}
              >
                Compare
              </Button>
            </Box>
          </>
        )}

        {/* Breakdown Card */}
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
                      <strong style={{ color: '#FF0000' }}>Escrow:</strong> {formatCurrency(breakdown.deductions.Escrow)}
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

      {/* Charts toggle button */}
      {breakdown && (
        <Box textAlign="center" mt={4} sx={{mb: 4}}>
          <Button variant="contained" color="success" onClick={() => setShowCharts(!showCharts)}>
            {showCharts ? 'HIDE THE CHARTS!' : 'SHOW THE CHARTS!'}
          </Button>
        </Box>
      )}

      {/* Display charts */}
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
