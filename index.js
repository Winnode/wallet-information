const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Baca data dari dashboard_data.json
let jsonData;
try {
  jsonData = fs.readFileSync('dashboard_data.json', 'utf-8');
} catch (error) {
  console.error(`Error reading dashboard_data.json: ${error.message}`);
  process.exit(1);
}

let dashboardData;
try {
  dashboardData = JSON.parse(jsonData);
} catch (error) {
  console.error(`Error parsing dashboard_data.json: ${error.message}`);
  process.exit(1);
}

// Fungsi untuk mencari informasi wallet berdasarkan alamat
function findWalletInfo(walletAddress) {
  return dashboardData[walletAddress] || null;
}

// Handle permintaan dari formulir di frontend untuk banyak wallet
app.post('/check-wallets', (req, res) => {
  const walletAddresses = req.body.walletAddresses;

  try {
    const results = walletAddresses.map(walletAddress => {
      const walletInfo = findWalletInfo(walletAddress);
      if (walletInfo) {
        const nodeRunningCoins = parseFloat(walletInfo.node_running_coins) || 0;
        const ambassadorCoins = parseFloat(walletInfo.ambassador_coins) || 0;
        const questCoins = parseFloat(walletInfo.quest_coins) || 0;

        const totalCoins = nodeRunningCoins + ambassadorCoins + questCoins;

        return `Total Coins for ${walletAddress}: ${totalCoins} coins`;
      } else {
        return `No information found for wallet address: ${walletAddress}`;
      }
    });

    res.status(200).json({ message: results.join('\n') });
  } catch (error) {
    res.status(500).json({ message: `Error processing wallets: ${error.message}` });
  }
});

// Menangani rute untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
