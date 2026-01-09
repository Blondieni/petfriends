const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

/**
 * 1. REGISTRIERUNG
 */
router.post('/register', async (req, res) => {
  try {
    // Hier extrahieren wir alle Felder aus dem Frontend-Request
    // WICHTIG: zipCode muss hier in der Liste stehen!
    const { email, password, firstName, lastName, zipCode } = req.body;
    
    console.log("DEBUG: Registrierungsversuch für:", email);
    console.log("DEBUG: Empfangene PLZ:", zipCode);

    // Prüfen, ob der User bereits existiert
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Diese E-Mail wird bereits verwendet." });
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);

    // User in der Datenbank erstellen
    const newUser = await prisma.user.create({
      data: { 
        email, 
        passwordHash: hashedPassword, 
        firstName, 
        lastName, 
        zipCode: zipCode || null, // Speichert die PLZ oder null, falls leer
        role: 'PRIVAT',
        isVerified: true 
      }
    });

    console.log("DEBUG: User erfolgreich erstellt mit ID:", newUser.id);
    res.status(201).json({ message: "Registrierung erfolgreich" });

  } catch (error) {
    console.error("KRITISCHER DATENBANK-FEHLER BEI REGISTRIERUNG:", error);
    res.status(500).json({ 
      error: "Datenbank-Fehler", 
      details: error.message 
    });
  }
});

/**
 * 2. LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // User suchen
    const user = await prisma.user.findUnique({ where: { email } });

    // Passwort-Check
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "E-Mail oder Passwort falsch." });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supergeheim', // Fallback falls .env fehlt
      { expiresIn: '24h' }
    );

    console.log("DEBUG: Login erfolgreich für:", user.email);

    // Antwort an das Frontend
    res.json({ 
      message: "Login erfolgreich", 
      token: token, 
      username: user.firstName 
    });

  } catch (error) {
    console.error("DEBUG LOGIN FEHLER:", error); 
    res.status(500).json({ error: "Interner Server-Fehler beim Login" });
  }
});

module.exports = router;