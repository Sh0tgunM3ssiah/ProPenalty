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

// Save scraped players to the JSON file in the backend folder
function savePlayersToFile(players) {
  const filePath = path.join(__dirname, '../backend/players.json'); // Path to backend folder
  fs.writeFileSync(filePath, JSON.stringify(players, null, 2));
  console.log('Player data saved to backend/players.json');
}

// Main function to scrape both NBA and NFL players and combine the data
(async () => {
  try {
    const nbaPlayers = await scrapeNBAPlayers();
    const nflPlayers = await scrapeNFLPlayers();
    const combinedPlayers = [...nbaPlayers, ...nflPlayers]; // Combine NBA and NFL players

    savePlayersToFile(combinedPlayers); // Save combined data to JSON file
  } catch (error) {
    console.error('Error during scraping:', error);
  }
})();