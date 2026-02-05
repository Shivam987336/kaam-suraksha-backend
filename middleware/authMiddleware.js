const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Token nikalo
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify karo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. User dhoondo (Ab Provider bhi User table mein hi hai)
            // Password hata ke data laao
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, User not found' });
            }

            // 4. Request object mein User attach karo
            req.user = user;
            
            // Optional: Role bhi alag se set kar sakte ho easy checking ke liye
            req.role = user.role; // 'user' or 'provider'

            next(); // Aage badho

        } catch (error) {
            console.error("Token Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect }; // ✅ Sahi export