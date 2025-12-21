const express = require('express'); // Wir holen uns das Express-Werkzeug
const app = express();              // Wir erstellen eine App-Instanz
const port = 3000;                  // Der Server soll auf Port 3000 hören

// Wenn jemand die Startseite aufruft, schicke eine Antwort
app.get('/', (req, res) => {
  res.send('Hallo PetFriends! Das Backend lebt.');
});

// Starte den Server
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});