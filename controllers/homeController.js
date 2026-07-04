const { Menu, Order, OrderItem, Setting, sequelize } = require('../models');
const { convertStaticQrisToDynamic } = require('../utils/qris');

const HomeController = {
  // Landing Page & Menu List
  index: async (req, res) => {
    try {
      // Get all menus that are available
      const menus = await Menu.findAll({ where: { isAvailable: true } });
      
      // Get all settings
      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      // Pass success or error messages from session if any
      const successMessage = req.session.successMessage || null;
      const errorMessage = req.session.errorMessage || null;
      req.session.successMessage = null;
      req.session.errorMessage = null;

      res.render('landing', {
        menus,
        settings,
        successMessage,
        errorMessage,
        user: req.session.user || null
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan pada server.');
    }
  },

  // Submit Order from Customer Cart
  submitOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { customerName, type, tableNumber, address, items } = req.body;

      if (!customerName || !type || !items || !Array.isArray(items) || items.length === 0) {
        req.session.errorMessage = 'Data pesanan tidak lengkap!';
        await t.rollback();
        return res.redirect('/');
      }

      // Check if ordering is allowed by admin settings (bypassed for logged-in staff/waiters)
      const allowOrderingSetting = await Setting.findOne({ where: { key: 'allow_ordering' } });
      if (!req.session.user && allowOrderingSetting && allowOrderingSetting.value !== 'true') {
        req.session.errorMessage = 'Maaf, layanan pemesanan online sedang dinonaktifkan sementara. Silakan lihat katalog kami.';
        await t.rollback();
        return res.redirect('/');
      }

      let calculatedTotalPrice = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const menu = await Menu.findByPk(item.menuId);
        if (!menu || !menu.isAvailable) {
          req.session.errorMessage = `Menu '${item.name || 'Tidak Dikenal'}' sedang tidak tersedia.`;
          await t.rollback();
          return res.redirect('/');
        }

        // Validate quantity based on priceType
        let qty = parseFloat(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          req.session.errorMessage = `Jumlah pesanan untuk ${menu.name} tidak valid.`;
          await t.rollback();
          return res.redirect('/');
        }

        if (menu.priceType === 'pcs') {
          qty = Math.round(qty); // must be integer
        }

        const priceSnap = parseFloat(menu.price);
        const subtotal = priceSnap * qty;
        calculatedTotalPrice += subtotal;

        orderItemsToCreate.push({
          menuId: menu.id,
          quantity: qty,
          price: priceSnap,
          notes: item.notes || ''
        });
      }

      // Create Order (can be initialized as paid if placed by staff)
      const initialStatus = (req.session.user && req.body.status === 'paid') ? 'paid' : 'pending';
      const newOrder = await Order.create({
        customerName,
        type,
        tableNumber: type === 'dine-in' ? tableNumber : null,
        address: type === 'delivery' ? address : null,
        totalPrice: calculatedTotalPrice,
        status: initialStatus
      }, { transaction: t });

      // Create Order Items
      for (const orderItem of orderItemsToCreate) {
        await OrderItem.create({
          orderId: newOrder.id,
          menuId: orderItem.menuId,
          quantity: orderItem.quantity,
          price: orderItem.price,
          notes: orderItem.notes
        }, { transaction: t });
      }

      await t.commit();

      // Store order ID in session to show confirmation page
      req.session.lastOrderId = newOrder.id;
      res.redirect(`/order-success/${newOrder.id}`);
    } catch (err) {
      await t.rollback();
      console.error(err);
      req.session.errorMessage = 'Gagal memproses pesanan Anda. Silakan coba kembali.';
      res.redirect('/');
    }
  },

  // Order Success Page
  orderSuccess: async (req, res) => {
    try {
      const orderId = req.params.id;
      // Safety check: ensure user can only access the order they just made (or we can let them see it if it's theirs)
      if (req.session.lastOrderId != orderId) {
        // We can still allow it, or redirect
      }

      const order = await Order.findByPk(orderId, {
        include: [
          { model: OrderItem, as: 'items', include: ['menu'] }
        ]
      });

      if (!order) {
        req.session.errorMessage = 'Pesanan tidak ditemukan!';
        return res.redirect('/');
      }

      const settingsList = await Setting.findAll();
      const settings = {};
      settingsList.forEach(s => {
        settings[s.key] = s.value;
      });

      // Prepare WhatsApp text message
      let waMessage = `*Pesan Baru dari ${settings.resto_name || 'Resto Seafood'}*\n`;
      waMessage += `=========================\n`;
      waMessage += `*ID Pesanan:* #${order.id}\n`;
      waMessage += `*Nama:* ${order.customerName}\n`;
      waMessage += `*Tipe:* ${order.type === 'dine-in' ? 'Dine-In (Makan di Tempat)' : 'Delivery (Kirim)'}\n`;
      if (order.type === 'dine-in') {
        waMessage += `*No. Meja:* ${order.tableNumber}\n`;
      } else {
        waMessage += `*Alamat:* ${order.address}\n`;
      }
      waMessage += `-------------------------\n`;
      
      order.items.forEach((item, idx) => {
        const unit = item.menu.priceType === 'kg' ? 'Kg' : 'Pcs';
        waMessage += `${idx + 1}. *${item.menu.name}* (${item.quantity} ${unit})\n`;
        if (item.notes) {
          waMessage += `   _Catatan: ${item.notes}_\n`;
        }
      });
      
      waMessage += `-------------------------\n`;
      waMessage += `*Total Pembayaran:* Rp ${parseFloat(order.totalPrice).toLocaleString('id-ID')}\n`;
      waMessage += `=========================\n`;
      waMessage += `Mohon segera diproses ya. Terima kasih!`;

      const encodedWaMessage = encodeURIComponent(waMessage);
      const waNumber = settings.resto_whatsapp || '6281234567890';
      const waLink = `https://wa.me/${waNumber}?text=${encodedWaMessage}`;

      // Generate dynamic QRIS string if configured
      let qrisData = '';
      if (settings.qris_active === 'true' && settings.qris_payload) {
        qrisData = convertStaticQrisToDynamic(settings.qris_payload, order.totalPrice);
      }

      res.render('order_success', {
        order,
        settings,
        waLink,
        qrisData,
        user: req.session.user || null
      });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  }
};

module.exports = HomeController;
