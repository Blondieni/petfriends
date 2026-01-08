const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// REGISTRIERUNG
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { 
        email, 
        passwordHash: hashedPassword, 
        firstName, 
        lastName, 
        role: 'PRIVAT' 
      }
    });

    res.status(201).json({ message: "Registrierung erfolgreich" });
  } catch (error) {
    res.status(400).json({ error: "E-Mail bereits vergeben." });
  }
});

// LOGIN (Jetzt mit Namen in der Antwort!)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Zugangsdaten falsch." });
    }

    // Token erstellen (Der Stempel)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // HIER GEÄNDERT: Wir schicken jetzt auch den firstName als "username" mit
    res.json({ 
      message: "Login erfolgreich", 
      token: token, 
      username: user.firstName 
    });

  } catch (error) {
    console.error("DEBUG LOGIN FEHLER:", error); 
    res.status(500).json({ error: "Fehler beim Login" });
  }
});

module.exports = router;