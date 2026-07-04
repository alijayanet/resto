const bcrypt = require('bcryptjs');
const { Setting, User } = require('../models');

const SettingController = {
  // GET: Admin Resto Settings
  showSettings: async (req, res) => {
    try {
      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      const successMessage = req.session.successMessage || null;
      const errorMessage = req.session.errorMessage || null;
      req.session.successMessage = null;
      req.session.errorMessage = null;

      res.render('admin/settings', {
        settings,
        user: req.session.user,
        successMessage,
        errorMessage
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Gagal memuat halaman pengaturan.');
    }
  },

  // POST: Update Resto Settings
  updateSettings: async (req, res) => {
    try {
      const { 
        resto_name, 
        resto_whatsapp, 
        resto_address, 
        allow_ordering,
        hero_title,
        hero_subtitle,
        about_text,
        hours_weekday,
        hours_weekend,
        qris_active,
        qris_payload,
        menu_title,
        menu_subtitle,
        search_placeholder,
        resto_categories
      } = req.body;

      if (!resto_name || !resto_whatsapp || !resto_address) {
        req.session.errorMessage = 'Nama, nomor WhatsApp, dan alamat wajib diisi!';
        return res.redirect('/admin/settings');
      }

      // Update basic and content settings
      await Setting.upsert({ key: 'resto_name', value: resto_name });
      await Setting.upsert({ key: 'resto_whatsapp', value: resto_whatsapp });
      await Setting.upsert({ key: 'resto_address', value: resto_address });
      await Setting.upsert({ key: 'allow_ordering', value: allow_ordering === 'true' ? 'true' : 'false' });
      await Setting.upsert({ key: 'hero_title', value: hero_title || '' });
      await Setting.upsert({ key: 'hero_subtitle', value: hero_subtitle || '' });
      await Setting.upsert({ key: 'about_text', value: about_text || '' });
      await Setting.upsert({ key: 'hours_weekday', value: hours_weekday || '' });
      await Setting.upsert({ key: 'hours_weekend', value: hours_weekend || '' });
      await Setting.upsert({ key: 'qris_active', value: qris_active === 'true' ? 'true' : 'false' });
      await Setting.upsert({ key: 'qris_payload', value: qris_payload || '' });
      await Setting.upsert({ key: 'menu_title', value: menu_title || '' });
      await Setting.upsert({ key: 'menu_subtitle', value: menu_subtitle || '' });
      await Setting.upsert({ key: 'search_placeholder', value: search_placeholder || '' });
      await Setting.upsert({ key: 'resto_categories', value: resto_categories || '' });

      // Handle logo upload if present
      if (req.file) {
        const logoPath = `/uploads/${req.file.filename}`;
        await Setting.upsert({ key: 'resto_logo', value: logoPath });
      }

      req.session.successMessage = 'Pengaturan restoran berhasil disimpan!';
      res.redirect('/admin/settings');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal menyimpan pengaturan restoran.';
      res.redirect('/admin/settings');
    }
  },

  // POST: Decode QRIS image via API (AJAX)
  decodeQrisApi: async (req, res) => {
    try {
      if (!req.file) {
        return res.json({ success: false, error: 'Tidak ada file gambar QRIS yang diunggah!' });
      }

      const { decodeQrisImage } = require('../utils/qris');
      const decodedText = await decodeQrisImage(req.file.path);

      // Clean up temp file immediately
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete temp QRIS file:', err);
      }

      if (decodedText) {
        return res.json({ success: true, payload: decodedText });
      } else {
        return res.json({ success: false, error: 'Gagal membaca QR Code dari gambar! Pastikan gambar QR Code terbaca jelas dan bertipe QRIS.' });
      }
    } catch (err) {
      console.error('QRIS API decoding error:', err);
      return res.json({ success: false, error: 'Terjadi kesalahan sistem saat mendecode gambar.' });
    }
  },

  // GET: List users (Staff management)
  showUsers: async (req, res) => {
    try {
      const users = await User.findAll({ order: [['id', 'ASC']] });
      
      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      const successMessage = req.session.successMessage || null;
      const errorMessage = req.session.errorMessage || null;
      req.session.successMessage = null;
      req.session.errorMessage = null;

      res.render('admin/users/index', {
        users,
        settings,
        user: req.session.user,
        successMessage,
        errorMessage
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Gagal memuat halaman manajemen staff.');
    }
  },

  // POST: Add new staff user
  addUser: async (req, res) => {
    try {
      const { name, username, password, role } = req.body;

      if (!name || !username || !password || !role) {
        req.session.errorMessage = 'Semua field wajib diisi!';
        return res.redirect('/admin/users');
      }

      // Check if username already exists
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        req.session.errorMessage = 'Username sudah terdaftar! Pilih username lain.';
        return res.redirect('/admin/users');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name,
        username,
        password: hashedPassword,
        role
      });

      req.session.successMessage = `Staff baru (${name}) berhasil didaftarkan!`;
      res.redirect('/admin/users');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal mendaftarkan staff baru.';
      res.redirect('/admin/users');
    }
  },

  // POST: Delete staff user
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      // Prevent self-deletion
      if (userId == req.session.user.id) {
        req.session.errorMessage = 'Anda tidak dapat menghapus akun Anda sendiri!';
        return res.redirect('/admin/users');
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        req.session.errorMessage = 'Akun tidak ditemukan!';
        return res.redirect('/admin/users');
      }

      await targetUser.destroy();
      req.session.successMessage = `Akun staff (${targetUser.name}) berhasil dihapus!`;
      res.redirect('/admin/users');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal menghapus akun staff.';
      res.redirect('/admin/users');
    }
  }
};

module.exports = SettingController;
