const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hier legen wir fest, wie das Token aus der Anfrage extrahiert wird
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'petfriends_super_safe_key_2026'
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        // Suche den User in der PostgreSQL-Datenbank anhand der ID im Token
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.userId }
        });

        if (user) {
          return done(null, user); // User gefunden, Zugriff erlaubt
        }
        return done(null, false); // User nicht gefunden
      } catch (error) {
        return done(error, false);
      }
    })
  );
};