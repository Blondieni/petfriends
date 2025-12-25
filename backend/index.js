require('dotenv').config(); // 1. Umgebungsvariablen laden (ganz oben!)

const express = require('express');
const authRoutes = require('./routes/auth'); // 2. Routen importieren

const app = express();
app.use(express.json()); // 3. JSON-Sortierer aktivieren

// 4. Die Routen unter dem Pfad /api/auth registrieren
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 PetFriends-Server läuft auf http://localhost:${PORT}`);
});