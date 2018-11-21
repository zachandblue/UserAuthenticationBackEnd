const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    //const token = req.headers.authorization.split(' ')[1];
    const cookie = req.headers.cookie;
    const token = cookie.split('=');
    //console.log(token);

    const decoded = jwt.verify(token[1], process.env.JWT_KEY);

    if (decoded.csrfToken !== req.headers.csrf) {
      throw new Error('hack attempt busted');
    }
    req.userData = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: 'Something went wrong, try logging in again'
    });
  }
};
