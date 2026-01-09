const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();

/**
 * MULTER KONFIGURATION
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, 'uploads/pets/'); 
  },
  filename: (req, file, cb) => { 
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } 
});

/**
 * HILFSFUNKTION: VALIDIERUNG
 */
const validatePetData = (name, age) => {
  if (!name || name.trim().length === 0) return "Name ist erforderlich.";
  if (age !== undefined && age !== null && age !== "") {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) return "Alter muss eine positive Zahl sein.";
  }
  return null; 
};

/**
 * POST: HAUSTIER ANLEGEN (Anforderung FD-03)
 */
router.post('/add', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // 1. Eingabedaten extrahieren (type statt species laut neuem Schema)
    const { name, type, breed, age, description } = req.body;
    
    const error = validatePetData(name, age);
    if (error) return res.status(400).json({ error });

    const userId = req.userData.userId;
    // Pfad für imageUrl (statt image)
    const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : null;

    // 2. In Datenbank speichern
    const newPet = await prisma.pet.create({
      data: { 
        name, 
        type, // NEU laut Schema
        breed, 
        age: age ? parseInt(age) : null, 
        description, // NEU: Beschreibung hinzugefügt
        imageUrl: imagePath, // NEU laut Schema
        ownerId: userId 
      }
    });
    res.status(201).json(newPet);
  } catch (error) {
    console.error("Fehler beim Erstellen:", error);
    res.status(500).json({ error: "Fehler beim Erstellen des Haustiers" });
  }
});

/**
 * PUT: HAUSTIER BEARBEITEN (Anforderung FD-04)
 */
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;
    const { name, type, breed, age, description } = req.body;

    const error = validatePetData(name, age);
    if (error) return res.status(400).json({ error });

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || Number(pet.ownerId) !== Number(userId)) {
      return res.status(403).json({ error: "Keine Berechtigung." });
    }

    const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : pet.imageUrl;

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: { 
        name, 
        type, 
        breed, 
        age: age ? parseInt(age) : null, 
        description, // NEU: Beschreibung auch beim Update
        imageUrl: imagePath 
      }
    });
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Aktualisieren" });
  }
});

/**
 * GET: ALLE HAUSTIERE DES NUTZERS
 */
router.get('/my-pets', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.userId;
    const myPets = await prisma.pet.findMany({ 
      where: { ownerId: userId }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(myPets);
  } catch (error) { 
    res.status(500).json({ error: "Fehler beim Abrufen" }); 
  }
});

/**
 * GET: EXPLORE LISTE (Anforderung SU-03)
 */
router.get('/explore', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.userId;

    const otherPets = await prisma.pet.findMany({
      where: { ownerId: { not: userId } },
      include: {
        owner: { 
          select: { 
            firstName: true, 
            zipCode: true // WICHTIG: PLZ für den Frontend-Filter mitladen
          } 
        } 
      }
    });
    res.json(otherPets);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

/**
 * DELETE: HAUSTIER LÖSCHEN
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || Number(pet.ownerId) !== Number(userId)) {
      return res.status(403).json({ error: "Nicht erlaubt." });
    }

    await prisma.pet.delete({ where: { id: petId } });
    res.json({ message: "Gelöscht" });
  } catch (error) { 
    res.status(500).json({ error: "Fehler beim Löschen" }); 
  }
});

module.exports = router;