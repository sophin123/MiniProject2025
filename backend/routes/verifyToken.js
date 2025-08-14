const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided. Access Denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();

    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({ message: "Invalid token. Access Denied" });
    }
}

module.exports = verifyToken;