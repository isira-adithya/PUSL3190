import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAuth(req, res, next) {

  // Give access to /api/users/login
  if (req.path.toLowerCase() === '/users/login') {
    return next();
  }

  // Check if req.path starts with /api/cli/
  if (req.path.toLowerCase().startsWith('/cli/')) {

    // Check if Authorization header is present
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];

      // Check if token is valid
      const count = await prisma.user.count({
        where: {
          apiToken: token
        }
      });

      if (count > 0) {
        return next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
    } else {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
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