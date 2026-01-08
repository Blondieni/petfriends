const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client'); // Neu: Prisma einbinden
require('dotenv').config();
const passport = require('passport');

const prisma = new PrismaClient();
const petRoutes = require('./routes/pets');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
require('./config/passport')(passport);
app.use('/api/auth', authRoutes);

// Statische Bilder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routen
app.use('/api/pets', petRoutes);

// --- NEU: Verbindungstest für PostgreSQL/Prisma ---
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Datenbank-Verbindung zu PostgreSQL (Prisma) steht!');
  } catch (error) {
    console.error('❌ Datenbank-Fehler:', error.message);
    console.log('Tipp: Prüfe, ob PostgreSQL installiert ist und deine DATABASE_URL in der .env stimmt.');
  }
}
testDbConnection();
// --------------------------------------------------

app.get('/', (req, res) => {
  res.send('PetFriends Backend läuft!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server aktiv auf Port ${PORT}`);
});