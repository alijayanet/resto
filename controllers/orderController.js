const { Order, OrderItem, Menu, Setting } = require('../models');
const { Op } = require('sequelize');

const OrderController = {
  // Admin Dashboard: View all orders & stats
  adminDashboard: async (req, res) => {
    try {
      // Get filters if any
      const { status, type, startDate, endDate, datePreset } = req.query;
      const whereClause = {};
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;

      // Handle Date Filters
      let activeDatePreset = datePreset || 'today';
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      const todayEnd = new Date();
      todayEnd.setHours(23,59,59,999);

      if (activeDatePreset === 'today') {
        whereClause.createdAt = {
          [Op.between]: [todayStart, todayEnd]
        };
      } else if (activeDatePreset === 'month') {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0,0,0,0);
        const monthEnd = new Date();
        monthEnd.setHours(23,59,59,999);
        whereClause.createdAt = {
          [Op.between]: [monthStart, monthEnd]
        };
      } else if (activeDatePreset === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        whereClause.createdAt = {
          [Op.between]: [start, end]
        };
      } else if (activeDatePreset === 'all') {
        // No date constraint
      } else {
        whereClause.createdAt = {
          [Op.between]: [todayStart, todayEnd]
        };
        activeDatePreset = 'today';
      }

      // Fetch orders matching filters
      const orders = await Order.findAll({
        where: whereClause,
        include: [
          { model: OrderItem, as: 'items', include: ['menu'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate Stats based on the filtered set of orders!
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        paid: orders.filter(o => o.status === 'paid').length,
        revenue: orders
          .filter(o => o.status === 'paid')
          .reduce((sum, o) => sum + parseFloat(o.totalPrice), 0)
      };

      // Get settings
      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      const successMessage = req.session.successMessage || null;
      const errorMessage = req.session.errorMessage || null;
      req.session.successMessage = null;
      req.session.errorMessage = null;

      res.render('admin/dashboard', {
        orders,
        stats,
        settings,
        user: req.session.user,
        activeFilters: { 
          status: status || '', 
          type: type || '',
          startDate: startDate || '',
          endDate: endDate || '',
          datePreset: activeDatePreset
        },
        successMessage,
        errorMessage
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Gagal memuat dashboard admin.');
    }
  },

  // Waiter Dashboard: Focus on kitchen / active tables
  waiterDashboard: async (req, res) => {
    try {
      // Waiters usually only care about active orders: pending, processing, completed
      // Orders that are paid/lunas are handled/archived.
      // We will show non-paid orders, or all. Let's show active status (pending, processing, completed)
      const { status } = req.query;
      const whereClause = {
        status: status ? status : { [Op.in]: ['pending', 'processing', 'completed'] }
      };

      const orders = await Order.findAll({
        where: whereClause,
        include: [
          { model: OrderItem, as: 'items', include: ['menu'] }
        ],
        order: [['createdAt', 'ASC']] // ASC order so oldest active order is handled first
      });

      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      const successMessage = req.session.successMessage || null;
      const errorMessage = req.session.errorMessage || null;
      req.session.successMessage = null;
      req.session.errorMessage = null;

      res.render('waiter/dashboard', {
        orders,
        settings,
        user: req.session.user,
        activeFilter: status || 'active',
        successMessage,
        errorMessage
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Gagal memuat dashboard pelayan.');
    }
  },

  // API or POST endpoint to get orders in JSON format (for dynamic polling / AJAX reload)
  getOrdersJson: async (req, res) => {
    try {
      const { role } = req.query;
      let whereClause = {};
      let orderSort = [['createdAt', 'DESC']];

      if (role === 'waiter') {
        whereClause.status = { [Op.in]: ['pending', 'processing', 'completed'] };
        orderSort = [['createdAt', 'ASC']];
      }

      const orders = await Order.findAll({
        where: whereClause,
        include: [
          { model: OrderItem, as: 'items', include: ['menu'] }
        ],
        order: orderSort
      });

      res.json({ success: true, orders });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Update order status (Pending -> Processing -> Completed -> Paid)
  updateStatus: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        req.session.errorMessage = 'Pesanan tidak ditemukan!';
        return res.redirect('back');
      }

      const { status } = req.body;
      const validStatuses = ['pending', 'processing', 'completed', 'paid'];
      if (!validStatuses.includes(status)) {
        req.session.errorMessage = 'Status pesanan tidak valid!';
        return res.redirect('back');
      }

      // Restrict waiter from updating to paid
      if (req.session.user.role === 'waiter' && status === 'paid') {
        req.session.errorMessage = 'Hanya Admin yang dapat memproses pembayaran (Lunas)!';
        return res.redirect('back');
      }

      await order.update({ status });
      req.session.successMessage = `Status pesanan #${order.id} berhasil diubah menjadi ${status.toUpperCase()}!`;
      res.redirect('back');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal memperbarui status pesanan.';
      res.redirect('back');
    }
  },

  // Admin only: Delete order
  delete: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        req.session.errorMessage = 'Pesanan tidak ditemukan!';
        return res.redirect('/admin/dashboard');
      }

      await order.destroy();
      req.session.successMessage = `Pesanan #${order.id} berhasil dihapus dari sistem!`;
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error(err);
      req.session.errorMessage = 'Gagal menghapus pesanan.';
      res.redirect('/admin/dashboard');
    }
  },

  // API: Generate Dynamic QRIS for Staff dashboard
  generateQrisApi: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
      }

      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      if (settings.qris_active !== 'true' || !settings.qris_payload) {
        return res.json({ success: false, error: 'Metode pembayaran QRIS dinamis belum aktif atau belum diatur.' });
      }

      const { convertStaticQrisToDynamic } = require('../utils/qris');
      const qrisData = convertStaticQrisToDynamic(settings.qris_payload, order.totalPrice);
      const qrisQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrisData)}`;

      return res.json({
        success: true,
        order: {
          id: order.id,
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          type: order.type,
          tableNumber: order.tableNumber
        },
        qrisData,
        qrisQrUrl
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET: Print Receipt (Thermal Printer Layout)
  printReceipt: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [{ model: OrderItem, as: 'items', include: ['menu'] }]
      });
      if (!order) {
        return res.status(404).send('Pesanan tidak ditemukan.');
      }

      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      res.render('staff/print_receipt', { order, settings });
    } catch (err) {
      console.error(err);
      res.status(500).send('Gagal memproses cetak struk.');
    }
  }
};

module.exports = OrderController;
