const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider'); // 👈 Ye import zaroori hai

const protect = async (req, res, next) => {
    let token;

    // 1. Check karo ki Token header mein hai ya nahi
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token nikalo ("Bearer <token>" se)
            token = req.headers.authorization.split(' ')[1];

            // 2. Token ko Secret Key se verify karo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. STEP A: Pehle USER table mein dhoondo
            let user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;   // User mil gaya
                req.role = 'user'; // System ko batao ye User hai
                return next();     // Aage badho
            }

            // 4. STEP B: Agar User nahi mila, toh PROVIDER table mein dhoondo
            let provider = await Provider.findById(decoded.id).select('-password');
            if (provider) {
                req.provider = provider; // Mistri mil gaya
                req.user = provider;     // (Zaroori: Taaki purana code crash na ho)
                req.role = 'provider';   // System ko batao ye Mistri hai
                return next();           // Aage badho
            }

            // 5. Agar dono mein se kahin nahi mila
            res.status(401).json({ message: 'Not authorized, ID not found' });

        } catch (error) {
            console.error("Token Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };