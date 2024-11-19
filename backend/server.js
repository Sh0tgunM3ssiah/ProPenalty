const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// Define tax brackets for single filers
const federalTaxBrackets = [
  { rate: 0.10, limit: 11600 },
  { rate: 0.12, limit: 47150 },
  { rate: 0.22, limit: 100525 },
  { rate: 0.24, limit: 191950 },
  { rate: 0.32, limit: 243725 },
  { rate: 0.35, limit: 609350 },
  { rate: 0.37, limit: Infinity },
];

// State tax rates by state abbreviation
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

// Map NBA teams to their state abbreviations
function getStateAbbreviation(team) {
  const abbreviationToStateMap = {
    // NBA Abbreviations
    'ATL': 'GA', 'BOS': 'MA', 'BRK': 'NY', 'CHO': 'NC', 'CHI': 'IL',
    'CLE': 'OH', 'DAL': 'TX', 'DEN': 'CO', 'DET': 'MI', 'GSW': 'CA',
    'HOU': 'TX', 'IND': 'IN', 'LAC': 'CA', 'LAL': 'CA', 'MEM': 'TN',
    'MIA': 'FL', 'MIL': 'WI', 'MIN': 'MN', 'NOP': 'LA', 'NYK': 'NY',
    'OKC': 'OK', 'ORL': 'FL', 'PHI': 'PA', 'PHO': 'AZ', 'POR': 'OR',
    'SAC': 'CA', 'SAS': 'TX', 'TOR': 'ON', 'UTA': 'UT', 'WAS': 'DC',

    // NFL Abbreviations
    'ARI': 'AZ', 'ATL': 'GA', 'BAL': 'MD', 'BUF': 'NY', 'CAR': 'NC',
    'CHI': 'IL', 'CIN': 'OH', 'CLE': 'OH', 'DAL': 'TX', 'DEN': 'CO',
    'DET': 'MI', 'GB': 'WI', 'HOU': 'TX', 'IND': 'IN', 'JAX': 'FL',
    'KC': 'MO', 'LV': 'NV', 'LAC': 'CA', 'LAR': 'CA', 'MIA': 'FL',
    'MIN': 'MN', 'NE': 'MA', 'NO': 'LA', 'NYG': 'NJ', 'NYJ': 'NJ',
    'PHI': 'PA', 'PIT': 'PA', 'SEA': 'WA', 'SF': 'CA', 'TB': 'FL',
    'TEN': 'TN', 'WAS': 'DC',

    // MLB Abbreviations
    'ARI': 'AZ', 'ATL': 'GA', 'BAL': 'MD', 'BOS': 'MA', 'CHC': 'IL',
    'CHW': 'IL', 'CIN': 'OH', 'CLE': 'OH', 'COL': 'CO', 'DET': 'MI',
    'HOU': 'TX', 'KC': 'MO', 'LAA': 'CA', 'LAD': 'CA', 'MIA': 'FL',
    'MIL': 'WI', 'MIN': 'MN', 'NYM': 'NY', 'NYY': 'NY', 'OAK': 'CA',
    'PHI': 'PA', 'PIT': 'PA', 'SD': 'CA', 'SF': 'CA', 'SEA': 'WA',
    'STL': 'MO', 'TB': 'FL', 'TEX': 'TX', 'TOR': 'ON', 'WSH': 'DC',

    // NHL Abbreviations
    'ANA': 'CA', 'ARI': 'AZ', 'BOS': 'MA', 'BUF': 'NY', 'CGY': 'AB',
    'CAR': 'NC', 'CHI': 'IL', 'COL': 'CO', 'CBJ': 'OH', 'DAL': 'TX',
    'DET': 'MI', 'EDM': 'AB', 'FLA': 'FL', 'LAK': 'CA', 'MIN': 'MN',
    'MTL': 'QC', 'NSH': 'TN', 'NJD': 'NJ', 'NYI': 'NY', 'NYR': 'NY',
    'OTT': 'ON', 'PHI': 'PA', 'PIT': 'PA', 'SJS': 'CA', 'SEA': 'WA',
    'STL': 'MO', 'TBL': 'FL', 'TOR': 'ON', 'VAN': 'BC', 'VGK': 'NV',
    'WSH': 'DC', 'WPG': 'MB',

    // WNBA Abbreviations
    'ATL': 'GA', 'CHI': 'IL', 'CON': 'CT', 'DAL': 'TX', 'IND': 'IN',
    'LAS': 'NV', 'LVA': 'CA', 'MIN': 'MN', 'NYL': 'NY', 'PHX': 'AZ',
    'SEA': 'WA', 'WAS': 'DC',
  };

  const teamToStateMap = {
    // NBA Full Names
    'Atlanta Hawks': 'GA', 'Boston Celtics': 'MA', 'Brooklyn Nets': 'NY',
    'Charlotte Hornets': 'NC', 'Chicago Bulls': 'IL', 'Cleveland Cavaliers': 'OH',
    'Dallas Mavericks': 'TX', 'Denver Nuggets': 'CO', 'Detroit Pistons': 'MI',
    'Golden State Warriors': 'CA', 'Houston Rockets': 'TX', 'Indiana Pacers': 'IN',
    'Los Angeles Clippers': 'CA', 'Los Angeles Lakers': 'CA', 'Memphis Grizzlies': 'TN',
    'Miami Heat': 'FL', 'Milwaukee Bucks': 'WI', 'Minnesota Timberwolves': 'MN',
    'New Orleans Pelicans': 'LA', 'New York Knicks': 'NY', 'Oklahoma City Thunder': 'OK',
    'Orlando Magic': 'FL', 'Philadelphia 76ers': 'PA', 'Phoenix Suns': 'AZ',
    'Portland Trail Blazers': 'OR', 'Sacramento Kings': 'CA', 'San Antonio Spurs': 'TX',
    'Toronto Raptors': 'ON', 'Utah Jazz': 'UT', 'Washington Wizards': 'DC',

    // NFL Full Names
    'Arizona Cardinals': 'AZ', 'Atlanta Falcons': 'GA', 'Baltimore Ravens': 'MD',
    'Buffalo Bills': 'NY', 'Carolina Panthers': 'NC', 'Chicago Bears': 'IL',
    'Cincinnati Bengals': 'OH', 'Cleveland Browns': 'OH', 'Dallas Cowboys': 'TX',
    'Denver Broncos': 'CO', 'Detroit Lions': 'MI', 'Green Bay Packers': 'WI',
    'Houston Texans': 'TX', 'Indianapolis Colts': 'IN', 'Jacksonville Jaguars': 'FL',
    'Kansas City Chiefs': 'MO', 'Las Vegas Raiders': 'NV', 'Los Angeles Chargers': 'CA',
    'Los Angeles Rams': 'CA', 'Miami Dolphins': 'FL', 'Minnesota Vikings': 'MN',
    'New England Patriots': 'MA', 'New Orleans Saints': 'LA', 'New York Giants': 'NJ',
    'New York Jets': 'NJ', 'Philadelphia Eagles': 'PA', 'Pittsburgh Steelers': 'PA',
    'San Francisco 49ers': 'CA', 'Seattle Seahawks': 'WA', 'Tampa Bay Buccaneers': 'FL',
    'Tennessee Titans': 'TN', 'Washington Commanders': 'DC',

    // MLB Full Names
    'Arizona Diamondbacks': 'AZ', 'Atlanta Braves': 'GA', 'Baltimore Orioles': 'MD',
    'Boston Red Sox': 'MA', 'Chicago Cubs': 'IL', 'Chicago White Sox': 'IL',
    'Cincinnati Reds': 'OH', 'Cleveland Guardians': 'OH', 'Colorado Rockies': 'CO',
    'Detroit Tigers': 'MI', 'Houston Astros': 'TX', 'Kansas City Royals': 'MO',
    'Los Angeles Angels': 'CA', 'Los Angeles Dodgers': 'CA', 'Miami Marlins': 'FL',
    'Milwaukee Brewers': 'WI', 'Minnesota Twins': 'MN', 'New York Mets': 'NY',
    'New York Yankees': 'NY', 'Oakland Athletics': 'CA', 'Philadelphia Phillies': 'PA',
    'Pittsburgh Pirates': 'PA', 'San Diego Padres': 'CA', 'San Francisco Giants': 'CA',
    'Seattle Mariners': 'WA', 'St. Louis Cardinals': 'MO', 'Tampa Bay Rays': 'FL',
    'Texas Rangers': 'TX', 'Toronto Blue Jays': 'ON', 'Washington Nationals': 'DC',

    // NHL Full Names
    'Anaheim Ducks': 'CA', 'Arizona Coyotes': 'AZ', 'Boston Bruins': 'MA',
    'Buffalo Sabres': 'NY', 'Calgary Flames': 'AB', 'Carolina Hurricanes': 'NC',
    'Chicago Blackhawks': 'IL', 'Colorado Avalanche': 'CO', 'Columbus Blue Jackets': 'OH',
    'Dallas Stars': 'TX', 'Detroit Red Wings': 'MI', 'Edmonton Oilers': 'AB',
    'Florida Panthers': 'FL', 'Los Angeles Kings': 'CA', 'Minnesota Wild': 'MN',
    'Montreal Canadiens': 'QC', 'Nashville Predators': 'TN', 'New Jersey Devils': 'NJ',
    'New York Islanders': 'NY', 'New York Rangers': 'NY', 'Ottawa Senators': 'ON',
    'Philadelphia Flyers': 'PA', 'Pittsburgh Penguins': 'PA', 'San Jose Sharks': 'CA',
    'Seattle Kraken': 'WA', 'St. Louis Blues': 'MO', 'Tampa Bay Lightning': 'FL',
    'Toronto Maple Leafs': 'ON', 'Vancouver Canucks': 'BC', 'Vegas Golden Knights': 'NV',
    'Washington Capitals': 'DC', 'Winnipeg Jets': 'MB',

    // WNBA Full Names
    'Atlanta Dream': 'GA', 'Chicago Sky': 'IL', 'Connecticut Sun': 'CT',
    'Dallas Wings': 'TX', 'Indiana Fever': 'IN', 'Las Vegas Aces': 'NV',
    'Los Angeles Sparks': 'CA', 'Minnesota Lynx': 'MN', 'New York Liberty': 'NY',
    'Phoenix Mercury': 'AZ', 'Seattle Storm': 'WA', 'Washington Mystics': 'DC',
  };

  return abbreviationToStateMap[team] || teamToStateMap[team] || null;
}

// Calculate federal tax
function calculateFederalTax(grossSalary) {
  let remainingSalary = grossSalary;
  let federalTax = 0;

  for (let i = 0; i < federalTaxBrackets.length; i++) {
    const bracket = federalTaxBrackets[i];
    const taxableAmount = Math.min(remainingSalary, bracket.limit - (federalTaxBrackets[i - 1]?.limit || 0));
    if (taxableAmount <= 0) break;

    federalTax += taxableAmount * bracket.rate;
    remainingSalary -= taxableAmount;

    if (remainingSalary <= 0) break;
  }

  return federalTax;
}

// Calculate deductions
function calculateDeductions(grossSalary, taxRates) {
  const deductions = {};
  let totalDeductions = 0.0;

  // Calculate federal tax
  const federalTax = calculateFederalTax(grossSalary);
  deductions['Federal'] = federalTax;
  totalDeductions += federalTax;

  // Other deductions
  for (const [key, value] of Object.entries(taxRates)) {
    if (key !== 'Federal') { // Skip federal tax, already calculated
      const deduction = grossSalary * value;
      deductions[key] = deduction;
      totalDeductions += deduction;
    }
  }

  deductions['Net Income'] = grossSalary - totalDeductions;
  return deductions;
}

// Calculate fine percentage
function calculateFinePercentage(fine, netIncome) {
  if (netIncome === 0) return 0;
  return (fine / netIncome) * 100;
}

// Get tax rates for a team
function getTaxRates(team, league) {
  const taxRates = {
    Federal: 0.0, // Federal tax is calculated separately
    State: 0.0,   // State tax will be set dynamically
  };

  const stateAbbreviation = getStateAbbreviation(team);

  // Validate and apply state tax based on the `stateTaxRates` object
  if (stateAbbreviation && stateTaxRates[stateAbbreviation] !== undefined) {
    taxRates['State'] = stateTaxRates[stateAbbreviation];
  }

  // Apply league-specific deductions
  if (league === 'NBA' || league === 'NFL') {
    taxRates['Escrow'] = 0.10;       // Only for NBA and NFL
    taxRates['JockTax'] = 0.02;     // Only for NBA and NFL
    taxRates['FICAMedicare'] = 0.0145; // Only for NBA and NFL
  } 

  // Apply Agent Fee for all leagues
  taxRates['AgentFee'] = 0.03;

  return taxRates;
}


// API Endpoints
app.get('/api/teams', (req, res) => {
  const players = readPlayersFromFile();
  if (players.length === 0) {
    return res.status(503).json({ error: "Data not ready. Please try again later." });
  }
  const teams = Array.from(new Set(players.map(player => player.team)));
  teams.sort();
  res.json(teams);
});

app.get('/api/players/:team', (req, res) => {
  const players = readPlayersFromFile();
  if (players.length === 0) {
    return res.status(503).json({ error: "Data not ready. Please try again later." });
  }
  const teamName = req.params.team;
  const filteredPlayers = players.filter(player => player.team === teamName);
  res.json(filteredPlayers);
});

app.post('/api/calculate', (req, res) => {
  const { grossSalary, fine, team, league } = req.body; // Include league in request body
  const taxRates = getTaxRates(team, league); // Pass league to getTaxRates

  const deductions = calculateDeductions(grossSalary, taxRates);
  const finePercentage = calculateFinePercentage(fine, deductions['Net Income']);
  res.json({ deductions, finePercentage });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
