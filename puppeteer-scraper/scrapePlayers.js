const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Function to scrape player data
async function scrapePlayers() {
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
      };
    }).filter(player => player !== null);
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

// Main function to run the scraper and save the data
(async () => {
  const players = await scrapePlayers();
  savePlayersToFile(players);  // Save data to JSON file in backend folder
})();
