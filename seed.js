const bcrypt = require('bcryptjs');
const { sequelize, User, Menu, Setting } = require('./models');

async function seed() {
  try {
    console.log('Synchronizing database...');
    // Sync models
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // 1. Seed Users
    console.log('Seeding users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const waiterPassword = await bcrypt.hash('pelayan123', 10);

    await User.bulkCreate([
      {
        username: 'admin',
        password: adminPassword,
        name: 'Administrator Resto',
        role: 'admin'
      },
      {
        username: 'pelayan',
        password: waiterPassword,
        name: 'Budi (Pelayan/Kasir)',
        role: 'waiter'
      }
    ]);
    console.log('Users seeded.');

    // 2. Seed Settings
    console.log('Seeding settings...');
    await Setting.bulkCreate([
      { key: 'resto_name', value: 'Dermaga Seafood' },
      { key: 'resto_logo', value: '/images/default-logo.png' },
      { key: 'resto_whatsapp', value: '6281234567890' },
      { key: 'resto_address', value: 'Kawasan Pantai Indah Kapuk, Pantai Indah No. 88, Jakarta Utara' },
      { key: 'allow_ordering', value: 'true' },
      { key: 'hero_title', value: 'Kelezatan Seafood Segar Terbaik di Pesisir Jakarta' },
      { key: 'hero_subtitle', value: 'Tangkap langsung dari laut dan dimasak dengan resep rahasia legendaris. Nikmati sajian kepiting, ikan bakar, udang bakar madu, dan cumi krispi berselera.' },
      { key: 'about_text', value: 'Menyajikan kelezatan hidangan laut segar tangkapan nelayan lokal setiap hari dengan bumbu rempah pilihan khas nusantara.' },
      { key: 'hours_weekday', value: '11.00 - 22.00 WIB' },
      { key: 'hours_weekend', value: '10.05 - 23.00 WIB' },
      { key: 'qris_active', value: 'true' },
      { key: 'qris_payload', value: '00020101021238510014ID1020211181282010303GPN0204GPN00303GPN0402015204541153033605802ID5915Dermaga Seafood6007Jakarta61051446062070703A016304D1A2' },
      { key: 'menu_title', value: 'Koleksi Menu Hidangan Laut' },
      { key: 'menu_subtitle', value: 'Pilih kategori seafood favorit Anda dan temukan hidangan lezat.' },
      { key: 'search_placeholder', value: 'Cari masakan seafood...' },
      { key: 'resto_categories', value: 'Ikan:ikan, Kepiting:kepiting, Udang:udang, Cumi-Cumi:cumi, Kerang:kerang, Minuman:minuman, Lainnya:lainnya' }
    ]);
    console.log('Settings seeded.');

    // 3. Seed Menus
    console.log('Seeding menus...');
    await Menu.bulkCreate([
      {
        name: 'Kepiting Saus Padang',
        description: 'Kepiting bakau segar ukuran besar dimasak dengan bumbu saus Padang pedas, gurih, dan kental khas Dermaga.',
        price: 185000,
        priceType: 'kg',
        image: '/uploads/kepiting_padang.jpg',
        category: 'kepiting',
        isAvailable: true
      },
      {
        name: 'Ikan Kakap Bakar Jimbaran',
        description: 'Ikan kakap merah segar hasil tangkapan harian dibakar dengan racikan bumbu rempah tradisional khas Jimbaran, Bali.',
        price: 110000,
        priceType: 'kg',
        image: '/uploads/kakap_bakar.jpg',
        category: 'ikan',
        isAvailable: true
      },
      {
        name: 'Udang Pancet Bakar Madu',
        description: 'Udang pancet ukuran besar dibakar dengan olesan madu murni dan mentega bawang. Manis, gurih, dan lezat.',
        price: 85000,
        priceType: 'pcs',
        image: '/uploads/udang_madu.jpg',
        category: 'udang',
        isAvailable: true
      },
      {
        name: 'Cumi Goreng Tepung Crispy',
        description: 'Cumi segar dipotong cincin dilapisi adonan tepung bumbu rahasia yang digoreng hingga renyah keemasan. Disajikan dengan saus tartar.',
        price: 65000,
        priceType: 'pcs',
        image: '/uploads/cumi_crispy.jpg',
        category: 'cumi',
        isAvailable: true
      },
      {
        name: 'Kerang Dara Saus Tiram',
        description: 'Kerang dara rebus pilihan ditumis dengan bawang bombay dan saus tiram pekat yang gurih meresap.',
        price: 45000,
        priceType: 'pcs',
        image: '/uploads/kerang_dara.jpg',
        category: 'kerang',
        isAvailable: true
      },
      {
        name: 'Cah Kangkung Belacan',
        description: 'Kangkung hidroponik ditumis cepat dengan api besar bersama terasi udang premium (belacan) dan irisan cabai merah.',
        price: 25000,
        priceType: 'pcs',
        image: '/uploads/kangkung_belacan.jpg',
        category: 'lainnya',
        isAvailable: true
      },
      {
        name: 'Es Kelapa Muda Jeruk',
        description: 'Air kelapa muda segar disajikan dengan serutan kelapa, es batu, dan kucuran jeruk peras murni.',
        price: 22000,
        priceType: 'pcs',
        image: '/uploads/kelapa_jeruk.jpg',
        category: 'minuman',
        isAvailable: true
      }
    ]);
    console.log('Menus seeded.');
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

// Run if called directly
if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
