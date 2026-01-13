const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

/**
 * POST: Ein Tier liken & auf Match prüfen
 * Implementiert die Bewertung (SU-04) und die Match-Logik (SU-05).
 * Nutzt das Pet-to-Pet Prinzip (Tier A mag Tier B).
 */
router.post('/like', authMiddleware, async (req, res) => {
  try {
    const { fromPetId, toPetId } = req.body;
    const userId = req.userData.userId;

    // 1. SICHERHEIT: Gehört das 'fromPet' (mein Tier) wirklich mir? (NFA-SI-05)
    const myPet = await prisma.pet.findUnique({
      where: { id: fromPetId }
    });

    if (!myPet || myPet.ownerId !== userId) {
      return res.status(403).json({ error: "Keine Berechtigung: Das ist nicht dein Haustier!" });
    }

    // 2. LIKE SPEICHERN
    // Nutzt das 'Like'-Model aus deinem Schema.
    await prisma.like.create({
      data: {
        fromPetId: fromPetId,
        toPetId: toPetId
      }
    });

    // 3. MATCH-PRÜFUNG: Hat das andere Tier mein Tier auch schon geliked?
    // Wir suchen in der Tabelle nach der umgekehrten Kombination.
    const mutualLike = await prisma.like.findUnique({
      where: {
        fromPetId_toPetId: {
          fromPetId: toPetId,
          toPetId: fromPetId
        }
      }
    });

    // 4. ERGEBNIS SENDEN
    if (mutualLike) {
      // Wenn beide sich mögen: Erfolg mit Match-Flag (SU-05)
      return res.json({ 
        message: "Ein Match! 🐾", 
        isMatch: true 
      });
    }

    // Wenn nur ein einseitiger Like vorliegt
    res.json({ message: "Interesse gespeichert", isMatch: false });

  } catch (error) {
    // Fehlerbehandlung für doppelte Likes (Unique Constraint P2002)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Du hast dieses Tier bereits bewertet." });
    }
    console.error("Like-Fehler:", error);
    res.status(500).json({ error: "Serverfehler beim Speichern der Interaktion" });
  }
});

/**
 * GET: Alle Matches des Nutzers abrufen
 * Liefert eine Liste aller Tiere, mit denen ein gegenseitiges Like besteht (SU-05).
 */
router.get('/my-matches', authMiddleware, async (req, res) => {
  try {
    const userId = req.userData.userId;

    // 1. Alle IDs meiner eigenen Haustiere holen
    const myPets = await prisma.pet.findMany({
      where: { ownerId: userId },
      select: { id: true }
    });
    const myPetIds = myPets.map(p => p.id);

    // 2. Alle Likes finden, bei denen ein Match besteht
    // Wir suchen Likes, die AN meine Tiere gingen (toPetId)...
    const matches = await prisma.like.findMany({
      where: {
        toPetId: { in: myPetIds },
        // ...UND wo es einen entsprechenden Gegen-Like VON meinen Tieren gibt.
        fromPet: {
          likesReceived: {
            some: { fromPetId: { in: myPetIds } }
          }
        }
      },
      include: {
        fromPet: true // Die Profildaten des anderen Tieres direkt mitladen
      }
    });

    // Nur die Tier-Objekte extrahieren und zurückgeben
    const matchProfiles = matches.map(m => m.fromPet);
    res.json(matchProfiles);

  } catch (error) {
    console.error("Match-Listen-Fehler:", error);
    res.status(500).json({ error: "Fehler beim Laden der Matches" });
  }
});

module.exports = router;