function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.errorMessage = 'Silakan masuk terlebih dahulu untuk mengakses halaman ini.';
  res.redirect('/login');
}

function hasRole(roles) {
  return (req, res, next) => {
    if (req.session && req.session.user && roles.includes(req.session.user.role)) {
      return next();
    }
    req.session.errorMessage = 'Anda tidak memiliki hak akses untuk halaman ini.';
    res.redirect(req.session.user ? (req.session.user.role === 'admin' ? '/admin/dashboard' : '/waiter/orders') : '/login');
  };
}

module.exports = {
  isAuthenticated,
  hasRole
};
