const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware'); // Schützt die Routen
const multer = require('multer'); // Für den Datei-Upload (Bilder)
const path = require('path');

const prisma = new PrismaClient();

/**
 * MULTER KONFIGURATION
 * Bestimmt, wo die Bilder gespeichert werden und wie sie benannt werden.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, 'uploads/pets/'); // Speicherort: backend/uploads/pets/
  },
  filename: (req, file, cb) => { 
    // Erzeugt einen Zeitstempel vor dem Namen, um Duplikate zu vermeiden
    cb(null, Date.now() + '-' + file.originalname); 
  }
});
const upload = multer({ storage: storage });

/**
 * HILFSFUNKTION: VALIDIERUNG
 * Prüft die Eingabedaten, bevor sie in die Datenbank geschrieben werden.
 * (Wichtig für Softwarequalität & Datensicherheit)
 */
const validatePetData = (name, age) => {
  if (!name || name.trim().length === 0) return "Name ist erforderlich.";
  if (age !== undefined && age !== null) {
    const ageNum = parseInt(age);
    // Verhindert negative Zahlen oder Text-Eingaben beim Alter
    if (isNaN(ageNum) || ageNum < 0) return "Alter muss eine positive Zahl sein.";
  }
  return null; // Kein Fehler gefunden
};

/**
 * POST: HAUSTIER ANLEGEN (Anforderung FD-03)
 * Erstellt ein neues Profil inklusive Bild-Upload.
 */
router.post('/add', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    const { name, species, breed, age } = req.body;
    
    // 1. Eingabedaten validieren
    const error = validatePetData(name, age);
    if (error) return res.status(400).json({ error });

    // 2. User-ID aus dem verschlüsselten Token holen (durch authMiddleware)
    const userId = req.userData.userId;
    // 3. Pfad zum Bild speichern, falls eines hochgeladen wurde
    const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : null;

    // 4. In Datenbank speichern
    const newPet = await prisma.pet.create({
      data: { 
        name, 
        species, 
        breed, 
        age: age ? parseInt(age) : null, 
        image: imagePath, 
        ownerId: userId // Verknüpfung zum Besitzer
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
 * Aktualisiert bestehende Daten eines Tieres.
 */
router.put('/:id', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;
    const { name, species, breed, age } = req.body;

    // 1. Validierung
    const error = validatePetData(name, age);
    if (error) return res.status(400).json({ error });

    // 2. Existenz- und Besitzprüfung: Gehört das Tier dem User?
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || Number(pet.ownerId) !== Number(userId)) {
      return res.status(403).json({ error: "Keine Berechtigung zum Bearbeiten." });
    }

    // 3. Bild-Logik: Neues Bild nehmen oder altes behalten
    const imagePath = req.file ? `/uploads/pets/${req.file.filename}` : pet.image;

    // 4. Update ausführen
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: { 
        name, 
        species, 
        breed, 
        age: age ? parseInt(age) : null, 
        image: imagePath 
      }
    });
    res.json(updatedPet);
  } catch (error) {
    console.error("Fehler beim Bearbeiten:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren" });
  }
});

/**
 * GET: ALLE HAUSTIERE DES NUTZERS (Anforderung FD-05)
 * Holt nur die Tiere aus der DB, die dem aktuell eingeloggten User gehören.
 */
router.get('/my-pets', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.userId;
    const myPets = await prisma.pet.findMany({ 
      where: { ownerId: userId }, 
      orderBy: { createdAt: 'desc' } // Neueste zuerst
    });
    res.json(myPets);
  } catch (error) { 
    res.status(500).json({ error: "Fehler beim Abrufen der Haustiere" }); 
  }
});

/**
 * DELETE: HAUSTIER LÖSCHEN (Anforderung FD-04)
 * Entfernt ein Haustier-Profil sicher aus der Datenbank.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;

    // 1. Erst suchen und prüfen, ob der User wirklich der Besitzer ist
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || Number(pet.ownerId) !== Number(userId)) {
      return res.status(403).json({ error: "Nicht erlaubt." });
    }

    // 2. Löschbefehl senden
    await prisma.pet.delete({ where: { id: petId } });
    res.json({ message: "Haustier erfolgreich gelöscht" });
  } catch (error) { 
    res.status(500).json({ error: "Fehler beim Löschen des Tieres" }); 
  }
});

module.exports = router;