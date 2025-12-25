const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Den Token aus dem Header "Authorization" holen
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Die Nutzer-ID an die Anfrage hängen
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next(); // Erlaubnis erteilt, weiter zur nächsten Funktion
  } catch (error) {
    res.status(401).json({ error: "Nicht autorisiert! Bitte logge dich ein." });
  }
};