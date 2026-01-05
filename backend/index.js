require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets'); // 1. Importieren

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes); // 2. Registrieren unter /api/pets

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 PetFriends-Server läuft auf http://localhost:${PORT}`);
});