require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { sequelize, User } = require('./models');
const seed = require('./seed');
const webRoutes = require('./routes/web');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup directories
const uploadsDir = path.join(__dirname, 'public/uploads');
const imagesDir = path.join(__dirname, 'public/images');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Copy default logo if it doesn't exist
const defaultLogoSrc = path.join(__dirname, 'public/images/default-logo.png');
if (!fs.existsSync(defaultLogoSrc)) {
  // We can write a simple text/svg placeholder or just let it create a dummy
  fs.writeFileSync(defaultLogoSrc, ''); // will overwrite with generated logo later
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dermaga_seafood_secret_key_123!@#',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Folders
app.use(express.static(path.join(__dirname, 'public')));

// Global local variables for EJS templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Register Web Routes
app.use('/', webRoutes);

// Database Sync & Auto-Seeding
console.log('Connecting to database...');
sequelize.sync()
  .then(async () => {
    console.log('Database connection established & tables synchronized.');
    
    // Check if seeding is required (if no admin user exists)
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('Admin account not found. Seeding initial restaurant data...');
      await seed();
    } else {
      console.log('Database already populated.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  Resto Seafood app is running on port ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`  Default Admin: admin / admin123`);
      console.log(`  Default Waiter: pelayan / pelayan123`);
      console.log(`=================================================`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
