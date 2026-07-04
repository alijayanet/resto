const express = require('express');
const router = express.Router();

// Controllers
const HomeController = require('../controllers/homeController');
const AuthController = require('../controllers/authController');
const MenuController = require('../controllers/menuController');
const OrderController = require('../controllers/orderController');
const SettingController = require('../controllers/settingController');

// Middlewares
const { isAuthenticated, hasRole } = require('../middleware/auth');
const upload = require('../config/upload');

// ==========================================
// CUSTOMER / PUBLIC ROUTES
// ==========================================
router.get('/', HomeController.index);
router.post('/order', HomeController.submitOrder);
router.get('/order-success/:id', HomeController.orderSuccess);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.get('/login', AuthController.showLogin);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

// ==========================================
// AUTHENTICATED STAFF ROUTES (Shared)
// ==========================================
router.post('/orders/:id/status', isAuthenticated, OrderController.updateStatus);
router.get('/api/orders', isAuthenticated, OrderController.getOrdersJson);
router.get('/api/qris/generate/:id', isAuthenticated, OrderController.generateQrisApi);
router.get('/orders/:id/print', isAuthenticated, OrderController.printReceipt);

// ==========================================
// WAITER ONLY ROUTES
// ==========================================
router.get('/waiter/orders', isAuthenticated, hasRole(['waiter']), OrderController.waiterDashboard);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================
router.get('/admin/dashboard', isAuthenticated, hasRole(['admin']), OrderController.adminDashboard);
router.post('/orders/:id/delete', isAuthenticated, hasRole(['admin']), OrderController.delete);

// Admin: Menus CRUD
router.get('/admin/menus', isAuthenticated, hasRole(['admin']), MenuController.index);
router.get('/admin/menus/create', isAuthenticated, hasRole(['admin']), MenuController.showCreateForm);
router.post('/admin/menus', isAuthenticated, hasRole(['admin']), upload.single('image'), MenuController.store);
router.get('/admin/menus/:id/edit', isAuthenticated, hasRole(['admin']), MenuController.showEditForm);
router.post('/admin/menus/:id', isAuthenticated, hasRole(['admin']), upload.single('image'), MenuController.update);
router.post('/admin/menus/:id/delete', isAuthenticated, hasRole(['admin']), MenuController.delete);

// Admin: Settings & Users
router.get('/admin/settings', isAuthenticated, hasRole(['admin']), SettingController.showSettings);
router.post('/admin/settings', isAuthenticated, hasRole(['admin']), upload.single('logo'), SettingController.updateSettings);
router.post('/admin/qris/decode', isAuthenticated, hasRole(['admin']), upload.single('qris_image'), SettingController.decodeQrisApi);

router.get('/admin/users', isAuthenticated, hasRole(['admin']), SettingController.showUsers);
router.post('/admin/users', isAuthenticated, hasRole(['admin']), SettingController.addUser);
router.post('/admin/users/:id/delete', isAuthenticated, hasRole(['admin']), SettingController.deleteUser);

module.exports = router;
