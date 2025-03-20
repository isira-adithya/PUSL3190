function checkAuth(req, res, next) {

  // Give access to /api/users/login
  if (req.path.toLowerCase() === '/users/login') {
    return next();
  }

  // check if logged in
  if (req.session.isLoggedIn) {
    return next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
}

export default checkAuth;