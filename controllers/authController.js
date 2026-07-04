const bcrypt = require('bcryptjs');
const { User } = require('../models');

const AuthController = {
  // Show Login Page
  showLogin: (req, res) => {
    if (req.session && req.session.user) {
      return res.redirect(req.session.user.role === 'admin' ? '/admin/dashboard' : '/waiter/orders');
    }
    
    // Get flash messages if any
    const errorMessage = req.session.errorMessage || null;
    const successMessage = req.session.successMessage || null;
    
    // Clear flash messages
    req.session.errorMessage = null;
    req.session.successMessage = null;

    res.render('login', { errorMessage, successMessage });
  },

  // Process Login
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        req.session.errorMessage = 'Username dan password wajib diisi!';
        return res.redirect('/login');
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        req.session.errorMessage = 'Username atau password salah!';
        return res.redirect('/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.session.errorMessage = 'Username atau password salah!';
        return res.redirect('/login');
      }

      // Save user info to session
      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };

      req.session.successMessage = `Selamat datang kembali, ${user.name}!`;

      // Redirect based on role
      if (user.role === 'admin') {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/waiter/orders');
      }
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Terjadi kesalahan sistem, silakan coba lagi.';
      res.redirect('/login');
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/login');
    });
  }
};

module.exports = AuthController;
