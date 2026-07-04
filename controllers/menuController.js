const fs = require('fs');
const path = require('path');
const { Menu, Setting } = require('../models');

const MenuController = {
  // Admin: View all menus
  index: async (req, res) => {
    try {
      const menus = await Menu.findAll({ order: [['id', 'DESC']] });
      
      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      const successMessage = req.session.successMessage || null;
      const errorMessage = req.session.errorMessage || null;
      req.session.successMessage = null;
      req.session.errorMessage = null;

      res.render('admin/menus/index', {
        menus,
        settings,
        user: req.session.user,
        successMessage,
        errorMessage
      });
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal memuat daftar menu.';
      res.redirect('/admin/dashboard');
    }
  },

  // Admin: Show create menu form
  showCreateForm: async (req, res) => {
    try {
      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      res.render('admin/menus/form', {
        menu: null,
        settings,
        user: req.session.user,
        errorMessage: null
      });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/menus');
    }
  },

  // Admin: Store new menu
  store: async (req, res) => {
    try {
      const { name, description, price, priceType, category, isAvailable } = req.body;

      if (!name || !price || !priceType || !category) {
        req.session.errorMessage = 'Semua field wajib diisi kecuali deskripsi dan foto!';
        return res.redirect('/admin/menus/create');
      }

      let imagePath = '/images/default-logo.png'; // default fallback logo
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }

      await Menu.create({
        name,
        description,
        price: parseFloat(price),
        priceType,
        image: imagePath,
        category,
        isAvailable: isAvailable === 'true' || isAvailable === '1'
      });

      req.session.successMessage = 'Menu baru berhasil ditambahkan!';
      res.redirect('/admin/menus');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal menambahkan menu baru.';
      res.redirect('/admin/menus/create');
    }
  },

  // Admin: Show edit menu form
  showEditForm: async (req, res) => {
    try {
      const menu = await Menu.findByPk(req.params.id);
      if (!menu) {
        req.session.errorMessage = 'Menu tidak ditemukan!';
        return res.redirect('/admin/menus');
      }

      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      res.render('admin/menus/form', {
        menu,
        settings,
        user: req.session.user,
        errorMessage: null
      });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/menus');
    }
  },

  // Admin: Update menu details
  update: async (req, res) => {
    try {
      const menu = await Menu.findByPk(req.params.id);
      if (!menu) {
        req.session.errorMessage = 'Menu tidak ditemukan!';
        return res.redirect('/admin/menus');
      }

      const { name, description, price, priceType, category, isAvailable } = req.body;

      if (!name || !price || !priceType || !category) {
        req.session.errorMessage = 'Semua field wajib diisi kecuali deskripsi!';
        return res.redirect(`/admin/menus/${menu.id}/edit`);
      }

      let imagePath = menu.image;
      if (req.file) {
        // If there was an old image upload, delete it from public/uploads to save disk space
        if (menu.image && menu.image.startsWith('/uploads/')) {
          const oldFilePath = path.join(__dirname, '../public', menu.image);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.error('Failed to delete old image file:', err);
            }
          }
        }
        imagePath = `/uploads/${req.file.filename}`;
      }

      await menu.update({
        name,
        description,
        price: parseFloat(price),
        priceType,
        image: imagePath,
        category,
        isAvailable: isAvailable === 'true' || isAvailable === '1'
      });

      req.session.successMessage = 'Menu berhasil diperbarui!';
      res.redirect('/admin/menus');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal memperbarui menu.';
      res.redirect(`/admin/menus/${req.params.id}/edit`);
    }
  },

  // Admin: Delete menu
  delete: async (req, res) => {
    try {
      const menu = await Menu.findByPk(req.params.id);
      if (!menu) {
        req.session.errorMessage = 'Menu tidak ditemukan!';
        return res.redirect('/admin/menus');
      }

      // Delete image file if it exists and is an uploaded file
      if (menu.image && menu.image.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '../public', menu.image);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Failed to delete image file during menu deletion:', err);
          }
        }
      }

      await menu.destroy();
      req.session.successMessage = 'Menu berhasil dihapus!';
      res.redirect('/admin/menus');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal menghapus menu.';
      res.redirect('/admin/menus');
    }
  }
};

module.exports = MenuController;
