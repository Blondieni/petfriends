const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// 1. Nachricht senden
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.userData.userId;

    const newMessage = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: senderId,
        receiverId: parseInt(receiverId)
      }
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Senden" });
  }
});

// 2. Anzahl ungelesener Nachrichten (FD-02)
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { receiverId: req.userData.userId, isRead: false }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Zählen" });
  }
});

// 3. Inbox-Liste (IK-02)
router.get('/inbox', authMiddleware, async (req, res) => {
  try {
    const myId = req.userData.userId;
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: myId }, { receiverId: myId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: true, receiver: true }
    });

    const chats = [];
    const seenUsers = new Set();
    for (const msg of messages) {
      const otherUser = msg.senderId === myId ? msg.receiver : msg.sender;
      if (!seenUsers.has(otherUser.id)) {
        seenUsers.add(otherUser.id);
        const unreadCount = await prisma.message.count({
          where: { senderId: otherUser.id, receiverId: myId, isRead: false }
        });
        chats.push({ id: msg.id, otherUser, lastMessage: msg.content, timestamp: msg.createdAt, unreadCount });
      }
    }
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden der Inbox" });
  }
});

// 4. NEU: Nachrichten explizit als gelesen markieren (Behebt den 404 Fehler)
router.put('/read/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const myId = req.userData.userId;
    const otherId = parseInt(req.params.otherUserId);

    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: myId, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: "Status aktualisiert" });
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Update" });
  }
});

// 5. Nachrichtenverlauf laden (IK-02)
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const myId = req.userData.userId;
    const otherId = parseInt(req.params.otherUserId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Auch hier sicherheitshalber markieren
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: myId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

module.exports = router;