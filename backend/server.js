const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const playersFilePath = path.join(__dirname, 'players.json');

// Function to read player data from the JSON file
function readPlayersFromFile() {
  if (fs.existsSync(playersFilePath)) {
    const data = fs.readFileSync(playersFilePath);
    return JSON.parse(data);
  }
  return [];
}

// Endpoint to get all teams
app.get('/api/teams', (req, res) => {
  const players = readPlayersFromFile();
  if (players.length === 0) {
    return res.status(503).json({ error: "Data not ready. Please try again later." });
  }
  const teams = Array.from(new Set(players.map(player => player.team)));
  teams.sort();
  res.json(teams);
});

// Endpoint to get players by team
app.get('/api/players/:team', (req, res) => {
  const players = readPlayersFromFile();
  if (players.length === 0) {
    return res.status(503).json({ error: "Data not ready. Please try again later." });
  }
  const teamName = req.params.team;
  const filteredPlayers = players.filter(player => player.team === teamName);
  res.json(filteredPlayers);
});

// Endpoint to calculate deductions and fine percentage
app.post('/api/calculate', (req, res) => {
  const { grossSalary, fine, team } = req.body;
  const taxRates = getTaxRates(team);
  const deductions = calculateDeductions(grossSalary, taxRates);
  const finePercentage = calculateFinePercentage(fine, deductions['Net Income']);
  res.json({ deductions, finePercentage });
});

// List of state tax rates by state abbreviation
const stateTaxRates = {
  'GA': 0.0575,
  'MA': 0.05,
  'NY': 0.0685,
  'NC': 0.05499,
  'IL': 0.0495,
  'OH': 0.04997,
  'TX': 0.0,
  'CO': 0.0463,
  'MI': 0.0425,
  'CA': 0.13,
  'IN': 0.0323,
  'TN': 0.0,
  'FL': 0.0,
  'WI': 0.0765,
  'MN': 0.0985,
  'LA': 0.06,
  'OK': 0.05,
  'PA': 0.0307,
  'AZ': 0.0454,
  'OR': 0.099,
  'UT': 0.0495,
  'DC': 0.085,
};

// Function to map team to state abbreviation
function getStateAbbreviation(team) {
  const teamToStateMap = {
    'Atlanta Hawks': 'GA',
    'Boston Celtics': 'MA',
    'Brooklyn Nets': 'NY',
    'Charlotte Hornets': 'NC',
    'Chicago Bulls': 'IL',
    'Cleveland Cavaliers': 'OH',
    'Dallas Mavericks': 'TX',
    'Denver Nuggets': 'CO',
    'Detroit Pistons': 'MI',
    'Golden State Warriors': 'CA',
    'Houston Rockets': 'TX',
    'Indiana Pacers': 'IN',
    'Los Angeles Clippers': 'CA',
    'Los Angeles Lakers': 'CA',
    'Memphis Grizzlies': 'TN',
    'Miami Heat': 'FL',
    'Milwaukee Bucks': 'WI',
    'Minnesota Timberwolves': 'MN',
    'New Orleans Pelicans': 'LA',
    'New York Knicks': 'NY',
    'Oklahoma City Thunder': 'OK',
    'Orlando Magic': 'FL',
    'Philadelphia 76ers': 'PA',
    'Phoenix Suns': 'AZ',
    'Portland Trail Blazers': 'OR',
    'Sacramento Kings': 'CA',
    'San Antonio Spurs': 'TX',
    'Toronto Raptors': 'ON', // Canada
    'Utah Jazz': 'UT',
    'Washington Wizards': 'DC'
  };

  return teamToStateMap[team];
}

// Function to get tax rates by team
function getTaxRates(team) {
  const taxRates = {
    Federal: 0.37,
    NBAEscrow: 0.10,
    AgentFee: 0.03,
    JockTax: 0.02,
    FICAMedicare: 0.0145,
  };

  const stateAbbreviation = getStateAbbreviation(team);

  // Special handling for the Toronto Raptors (Canadian tax)
  if (stateAbbreviation === 'ON') {
    taxRates['CanadaFederal'] = 0.15; // Canadian federal tax
    taxRates['OntarioProvincial'] = 0.13; // Ontario provincial tax
  } else {
    // Apply the state tax rate based on the state abbreviation
    taxRates['State'] = stateTaxRates[stateAbbreviation] || 0.05; // Default to 5% if state not found
  }

  return taxRates;
}

// Function to calculate deductions
function calculateDeductions(grossSalary, taxRates) {
  const deductions = {};
  let totalDeductions = 0.0;

  for (const [key, value] of Object.entries(taxRates)) {
    const deduction = grossSalary * value;
    deductions[key] = deduction;
    totalDeductions += deduction;
  }

  deductions['Net Income'] = grossSalary - totalDeductions;
  return deductions;
}

// Function to calculate fine percentage
function calculateFinePercentage(fine, netIncome) {
  if (netIncome === 0) return 0;
  return (fine / netIncome) * 100;
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});