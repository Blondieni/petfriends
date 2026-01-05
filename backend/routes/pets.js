const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware'); // Der Türsteher

const prisma = new PrismaClient();

// ROUTE: Ein neues Haustier anlegen
// Wir fügen 'authMiddleware' hinzu -> Nur mit gültigem Token erreichbar!
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, species, breed, age } = req.body;
    
    // Die userId kommt automatisch aus dem Token (via Middleware)
    const userId = req.userData.userId;

    const newPet = await prisma.pet.create({
      data: {
        name: name,
        species: species,
        breed: breed,
        age: parseInt(age), // Sicherstellen, dass es eine Zahl ist
        ownerId: userId    // Hier wird die Verknüpfung gespeichert
      }
    });

    res.status(201).json({
      message: "Haustier erfolgreich angelegt",
      pet: newPet
    });
  } catch (error) {
    console.error("FEHLER BEIM HAUSTIER ANLEGEN:", error);
    res.status(500).json({ error: "Server-Fehler beim Speichern des Haustiers" });
  }
});

// ROUTE: Alle Haustiere des eingeloggten Nutzers abrufen
router.get('/my-pets', authMiddleware, async (req, res) => {
  try {
    // Der Türsteher (Middleware) hat uns die ID schon in req.userData gegeben
    const userId = req.userData.userId;

    // In der Datenbank nach allen Tieren suchen, die diesem User gehören
    const myPets = await prisma.pet.findMany({
      where: {
        ownerId: userId
      },
      orderBy: {
        createdAt: 'desc' // Die neuesten zuerst anzeigen
      }
    });

    res.json(myPets);
  } catch (error) {
    console.error("FEHLER BEIM LADEN DER TIERE:", error);
    res.status(500).json({ error: "Server-Fehler beim Abrufen der Haustiere" });
  }
});

// ROUTE: Ein bestimmtes Haustier löschen
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;

    // 1. Erst prüfen: Gehört das Tier wirklich dem Nutzer?
    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet || pet.ownerId !== userId) {
      return res.status(403).json({ error: "Nicht erlaubt oder Tier nicht gefunden." });
    }

    // 2. Wenn ja: Löschen
    await prisma.pet.delete({
      where: { id: petId }
    });

    res.json({ message: "Haustier erfolgreich gelöscht" });
  } catch (error) {
    console.error("LÖSCH-FEHLER:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Haustiers" });
  }
});

// ROUTE: Ein Haustier aktualisieren
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.userData.userId;
    const { name, species, breed, age } = req.body;

    // 1. Sicherheit: Gehört das Tier dem Nutzer?
    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet || pet.ownerId !== userId) {
      return res.status(403).json({ error: "Nicht erlaubt oder Tier nicht gefunden." });
    }

    // 2. Daten aktualisieren
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