const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Function to scrape NBA player data
async function scrapeNBAPlayers() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for environments like Render
  });
  const page = await browser.newPage();
  await page.goto('https://www.basketball-reference.com/contracts/players.html', { waitUntil: 'networkidle2', timeout: 60000 });

  const players = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table#player-contracts tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return null;
      const name = cells[0].innerText.trim();
      const team = cells[1].innerText.trim();
      const salary2024 = cells[2].innerText.trim().replace(/\$|,/g, '');
      return {
        name: name,
        team: team,
        grossSalary: parseFloat(salary2024),
        league: 'NBA' // Adding league attribute and setting it to "NBA"
      };
    }).filter(player => player !== null);
  });

  await browser.close();
  return players;
}

// Function to scrape NFL player data
async function scrapeNFLPlayers() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for environments like Render
  });
  const page = await browser.newPage();
  await page.goto('https://www.spotrac.com/nfl/rankings/player/_/year/2024/sort/cap_base', { waitUntil: 'networkidle2', timeout: 60000 });

  const players = await page.evaluate(() => {
    const playerItems = Array.from(document.querySelectorAll('.list-group-item')); // Selecting all the player list items
    return playerItems.map(item => {
      const name = item.querySelector('a .link')?.innerText.trim(); // Extract player name
      const teamPosition = item.querySelector('small')?.innerText.trim(); // Extract team and position
      const salary = item.querySelector('.medium')?.innerText.trim().replace(/\$|,/g, ''); // Extract salary and remove $ and commas

      let team = 'N/A';
      let position = 'N/A';

      if (teamPosition) {
        const splitTeamPosition = teamPosition.split(',');
        team = splitTeamPosition[0]?.trim() || 'N/A'; // Extract team
        position = splitTeamPosition[1]?.trim() || 'N/A'; // Extract position
      }

      return {
        name: name || 'N/A',
        team: team,
        position: position,
        grossSalary: parseFloat(salary) || 0,
        league: 'NFL' // Adding league attribute and setting it to "NFL"
      };
    }).filter(player => player.name !== 'N/A'); // Filter out any invalid entries
  });

  await browser.close();
  return players;
}

// Function to scrape MLB player data
async function scrapeMLBPlayers() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for environments like Render
  });
  const page = await browser.newPage();
  await page.goto('https://www.spotrac.com/mlb/rankings/player/_/year/2024/sort/cap_total', { waitUntil: 'networkidle2', timeout: 60000 });

  const players = await page.evaluate(() => {
    const playerItems = Array.from(document.querySelectorAll('.list-group-item')); // Selecting all the player list items
    return playerItems.map(item => {
      const name = item.querySelector('a .link')?.innerText.trim(); // Extract player name
      const teamPosition = item.querySelector('small')?.innerText.trim(); // Extract team and position
      const salary = item.querySelector('.medium')?.innerText.trim().replace(/\$|,/g, ''); // Extract salary and remove $ and commas

      let team = 'N/A';
      let position = 'N/A';

      if (teamPosition) {
        const splitTeamPosition = teamPosition.split(',');
        team = splitTeamPosition[0]?.trim() || 'N/A'; // Extract team
        position = splitTeamPosition[1]?.trim() || 'N/A'; // Extract position
      }

      return {
        name: name || 'N/A',
        team: team,
        position: position,
        grossSalary: parseFloat(salary) || 0,
        league: 'MLB' // Adding league attribute and setting it to "MLB"
      };
    }).filter(player => player.name !== 'N/A'); // Filter out any invalid entries
  });

  await browser.close();
  return players;
}

// Function to scrape NHL player data
async function scrapeNHLPlayers() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for environments like Render
  });
  const page = await browser.newPage();
  await page.goto('https://www.spotrac.com/nhl/rankings/player/_/year/2024/sort/cap_base', { waitUntil: 'networkidle2', timeout: 60000 });

  const players = await page.evaluate(() => {
    const playerItems = Array.from(document.querySelectorAll('.list-group-item')); // Selecting all the player list items
    return playerItems.map(item => {
      const name = item.querySelector('a .link')?.innerText.trim(); // Extract player name
      const teamPosition = item.querySelector('small')?.innerText.trim(); // Extract team and position
      const salary = item.querySelector('.medium')?.innerText.trim().replace(/\$|,/g, ''); // Extract salary and remove $ and commas

      let team = 'N/A';
      let position = 'N/A';

      if (teamPosition) {
        const splitTeamPosition = teamPosition.split(',');
        team = splitTeamPosition[0]?.trim() || 'N/A'; // Extract team
        position = splitTeamPosition[1]?.trim() || 'N/A'; // Extract position
      }

      return {
        name: name || 'N/A',
        team: team,
        position: position,
        grossSalary: parseFloat(salary) || 0,
        league: 'NHL' // Adding league attribute and setting it to "NHL"
      };
    }).filter(player => player.name !== 'N/A'); // Filter out any invalid entries
  });

  await browser.close();
  return players;
}

// Save scraped players to the JSON file in the backend folder
function savePlayersToFile(players) {
  const filePath = path.join(__dirname, '../backend/players.json'); // Path to backend folder
  fs.writeFileSync(filePath, JSON.stringify(players, null, 2));
  console.log('Player data saved to backend/players.json');
}

async function scrapeWNBAPlayers() {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for environments like Render
    });
    const page = await browser.newPage();
    await page.goto('https://www.spotrac.com/wnba/rankings/player/_/year/2024/sort/cap_base', { waitUntil: 'networkidle2', timeout: 60000 });
  
    // Ensure that all `li` elements are captured by using proper selectors
    const players = await page.evaluate(() => {
      const playerItems = Array.from(document.querySelectorAll('ul.list-group li')); // Make sure to target the correct `ul` container and its `li` elements
  
      return playerItems.map(item => {
        const name = item.querySelector('a .link')?.innerText?.trim() || 'N/A'; // Extract player name
        const teamPosition = item.querySelector('small')?.innerText?.trim() || 'N/A'; // Extract team and position
        const salaryText = item.querySelector('.medium')?.innerText?.trim().replace(/\$|,/g, '') || '0'; // Extract salary, remove $ and commas, fallback to 0
  
        const salary = parseFloat(salaryText) || 0; // Parse salary into a number, defaulting to 0 if invalid
  
        let team = 'N/A';
        let position = 'N/A';
  
        // Ensure teamPosition is parsed correctly
        if (teamPosition && teamPosition.includes(',')) {
          const [parsedTeam, parsedPosition] = teamPosition.split(',').map(text => text.trim());
          team = parsedTeam || 'N/A';
          position = parsedPosition || 'N/A';
        }
  
        return {
          name,
          team,
          position,
          grossSalary: salary,
          league: 'WNBA' // Adding league attribute and setting it to "WNBA"
        };
      }).filter(player => player.name !== 'N/A'); // Filter out invalid entries
    });
  
    await browser.close();
    return players;
  }  

// Main function to scrape NBA, NFL, MLB, and NHL players and combine the data
(async () => {
  try {
    const nbaPlayers = await scrapeNBAPlayers();
    const nflPlayers = await scrapeNFLPlayers();
    const mlbPlayers = await scrapeMLBPlayers();
    const nhlPlayers = await scrapeNHLPlayers();
    const wnbaPlayers = await scrapeWNBAPlayers();
    const combinedPlayers = [...nbaPlayers, ...nflPlayers, ...mlbPlayers, ...nhlPlayers, ...wnbaPlayers];

    savePlayersToFile(combinedPlayers); // Save combined data to JSON file
  } catch (error) {
    console.error('Error during scraping:', error);
  }
})();