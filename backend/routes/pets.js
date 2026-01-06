const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();

// 1. Multer Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/pets/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 2. DIE KORRIGIERTE ROUTE (upload.single steht jetzt VOR authMiddleware)
// So stellt Multer sicher, dass req.body befüllt ist, wenn der Code danach greift.
router.post('/add', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    // Jetzt ist req.body nicht mehr undefined, weil Multer es ausgepackt hat
    const { name, species, breed, age } = req.body;
    const userId = req.userData.userId;

    const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : null;

    const newPet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        age: age ? parseInt(age) : null,
        image: imagePath,
        ownerId: userId
      }
    });

    res.status(201).json({ 
      message: "Haustier mit Bild angelegt", 
      pet: newPet 
    });
  } catch (error) {
    console.error("UPLOAD FEHLER:", error);
    res.status(500).json({ error: "Fehler beim Hochladen oder Speichern" });
  }
});

// 3. GET: Alle Haustiere des Nutzers
router.get('/my-pets', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.userId;
    const myPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(myPets);
  } catch (error) {
    console.error("FEHLER BEIM LADEN DER TIERE:", error);
    res.status(500).json({ error: "Server-Fehler beim Abrufen der Haustiere" });
  }
});

// 4. DELETE: Haustier löschen
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;

    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet || pet.ownerId !== userId) {
      return res.status(403).json({ error: "Nicht erlaubt oder Tier nicht gefunden." });
    }

    await prisma.pet.delete({
      where: { id: petId }
    });

    res.json({ message: "Haustier erfolgreich gelöscht" });
  } catch (error) {
    console.error("LÖSCH-FEHLER:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Haustiers" });
  }
});

// 5. PUT: Haustier aktualisieren
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;
    const { name, species, breed, age } = req.body;

    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet || pet.ownerId !== userId) {
      return res.status(403).json({ error: "Nicht erlaubt oder Tier nicht gefunden." });
    }

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name: name || pet.name,
        species: species || pet.species,
        breed: breed || pet.breed,
        age: age ? parseInt(age) : pet.age
      }
    });

    res.json({
      message: "Haustier-Daten erfolgreich aktualisiert",
      pet: updatedPet
    });
  } catch (error) {
    console.error("UPDATE-FEHLER:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Haustiers" });
  }
});

module.exports = router;