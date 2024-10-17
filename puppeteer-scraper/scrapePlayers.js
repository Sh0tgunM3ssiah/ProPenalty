const puppeteer = require('puppeteer');
const axios = require('axios');

// Function to scrape player data
async function scrapePlayers() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.basketball-reference.com/contracts/players.html', { waitUntil: 'networkidle2' });

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

// Function to push data to the Render API
async function pushDataToRender(players) {
  try {
    const response = await axios.post('https://your-render-api.com/api/update-players', {
      players: players,
    });
    console.log('Data pushed successfully:', response.data);
  } catch (error) {
    console.error('Error pushing data to Render:', error);
  }
}

// Main function to run the scraper and push the data
(async () => {
  const players = await scrapePlayers();
  console.log('Scraped players:', players);

  // Push data to Render backend
  await pushDataToRender(players);
})();
