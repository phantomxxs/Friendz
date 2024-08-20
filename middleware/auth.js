import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token) {
      return res.status(403).send('Access Denied');
    }

    if (token.startsWith('Bearer')) {
      token = token.slice(7, token.length).trimLeft();
    }

    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            auth: false,
            message: 'Token is expired!',
            expired: true,
          });
        }
        return sendError(res, 401, null, {
          auth: false,
          message: 'Failed to authenticate token.',
        });
      }

      req.user = {
        id: decoded.id,
        loggedInUser: decoded.loggedInUser,
        verified: decoded.verified,
      };
      return next();
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
