const express = require('express');
const { scrapeCars } = require('./scraper');

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const data = await scrapeCars();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
