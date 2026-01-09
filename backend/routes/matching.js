const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

/**
 * POST: Ein Tier liken & auf Match prüfen
 * Implementiert die Bewertung (SU-04) und die Match-Anzeige (SU-05)
 * gemäß Sequenzdiagramm in Kapitel 3.5.2.
 */
router.post('/like', authMiddleware, async (req, res) => {
  try {
    const { fromPetId, toPetId } = req.body;
    const userId = req.userData.userId;

    // 1. Sicherheit: Gehört das 'fromPet' wirklich dem eingeloggten User? (NFA-SI-05)
    const myPet = await prisma.pet.findUnique({
      where: { id: fromPetId }
    });

    if (!myPet || myPet.ownerId !== userId) {
      return res.status(403).json({ error: "Das ist nicht dein Haustier!" });
    }

    // 2. Den Like speichern (Erstellt Eintrag in 'likes'-Tabelle)
    await prisma.like.create({
      data: {
        fromPetId: fromPetId,
        toPetId: toPetId
      }
    });

    // 3. Gegen-Like Prüfung (Kernlogik für Matching)
    const mutualLike = await prisma.like.findUnique({
      where: {
        fromPetId_toPetId: {
          fromPetId: toPetId,
          toPetId: fromPetId
        }
      }
    });

    if (mutualLike) {
      // Wenn beide sich mögen: Erfolg mit Match-Info senden (SU-05)
      return res.json({ 
        message: "Ein Match! 🐾", 
        isMatch: true 
      });
    }

    res.json({ message: "Like gesendet", isMatch: false });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Du hast dieses Tier bereits geliked." });
    }
    res.status(500).json({ error: "Serverfehler beim Liken" });
  }
});

/**
 * GET: Alle Matches des Nutzers abrufen
 * Listet alle erfolgreichen Matches für das Dashboard auf (SU-05).
 */
router.get('/my-matches', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.userId;

    // 1. Alle IDs von eigenen Haustieren holen
    const myPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });
    const myPetIds = myPets.map(p => p.id);

    // 2. Alle Likes finden, die eigene Tiere GEGEBEN haben
    const mySentLikes = await prisma.like.findMany({
      where: { fromPetId: { in: myPetIds } }
    });

    // 3. Für jeden gegebenen Like prüfen, ob ein Gegen-Like existiert
    const matches = [];

    for (const like of mySentLikes) {
      const mutual = await prisma.like.findUnique({
        where: {
          fromPetId_toPetId: {
            fromPetId: like.toPetId,
            toPetId: like.fromPetId
          }
        },
        include: {
          fromPet: true // Die Profildaten des Partner-Tiers (FD-03) direkt mitladen
        }
      });

      if (mutual) {
        matches.push(mutual.fromPet); // Gefundenes Tier zur Liste hinzufügen
      }
    }

    res.json(matches);
  } catch (error) {
    console.error("Match-Listen-Fehler:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Matches" });
  }
});

module.exports = router;