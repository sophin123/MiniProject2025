const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const verifyToken = require('../files/verifyToken.js')

const bcrypt = require("bcrypt");
const { getDb } = require("../authdb.js")

// Rate limiting middleware
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 signup requests per windowMs
    message: {
        error: "Too many signup attempts from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login requests per windowMs
    message: {
        error: "Too many login attempts from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input validation functions
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
};

const validateUsername = (username) => {
    // 3-30 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
};

const generateToken = (userId, email) => {
    const payload = { userId, email };
    const secret = process.env.JWT_SECRET

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.sign(payload, secret, { expiresIn: '24h' });
};

router.get("/", (req, res) => {
    res.send({ message: "Auth API is working" });
})

router.post("/signup", signupLimiter, async (req, res) => {
    const { username, email, phonenumber, password } = req.body;
    try {


        // Validate required fields
        if (!username || !email || !phonenumber || !password) {
            return res.status(400).json({
                message: "All fields are required",
                required: ["username", "email", "phonenumber", "password"]
            });
        }

        let validateErrors = [];

        // Validate input formats
        if (!validateUsername(username)) {
            validateErrors.push("Username must be 3-30 characters long and can only contain alphanumeric characters and underscores.");
        }

        if (!validateEmail(email)) {
            validateErrors.push("Invalid email format.");
        }

        if (!validatePhoneNumber(phonenumber)) {
            validateErrors.push("Invalid phone number format. It should be 10-15 digits long");
        }

        if (validateErrors.length > 0) {
            return res.status(400).json({ message: "Validation errors", errors: validateErrors });
        }

        const authDb = await getDb();
        const connection = await authDb.getConnection();

        try {

            await connection.beginTransaction();

            const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR phonenumber = ?';
            const [existingUsers] = await connection.query(checkUserQuery, [email, phonenumber]);


            // Check if user already exists
            if (existingUsers.length > 0) {
                const existingUser = existingUsers[0];
                let conflictedError = '';

                if (existingUser.email === email) conflictedError = "Email already exists";
                else if (existingUser.phonenumber === phonenumber) conflictedError = "Phone number already exists";
                else if (existingUser.username === username) conflictedError = "Username already exists";

                await connection.release();
                return res.status(409).json({ message: "User already exists with this " + conflictedError });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const insertUserQuery = 'INSERT INTO users (username, email, phonenumber, password) VALUES (?, ?, ?, ?)';
            const [result] = await connection.query(insertUserQuery, [username, email, phonenumber, hashedPassword]);

            let token;

            try {
                token = generateToken(result.insertId, email);
            } catch (err) {
                await connection.rollback();
                await connection.release();
                console.log("Error generating token:", err);
                return res.status(500).json({ message: "Error generating token" });
            }

            await connection.commit();
            await connection.release();

            res.status(201).json({
                message: "User created successfully",
                userId: result.insertId,
                token: token,
                user: {
                    id: result.insertId,
                    username,
                    email,
                    phonenumber
                }
            });

        } catch (err) { }
    } catch (err) {
        console.error("Signup error:", err);
        await connection.rollback();
        await connection.release();

        // Handle specific database errors
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: "User already exists with this email or phone number"
            });
        }

        res.status(500).json({ message: "Internal server error. Please try again later." });

    }
})


router.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const authDb = await getDb();
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        const findUserQuery = 'SELECT * FROM users WHERE email = ?';
        const [users] = await authDb.query(findUserQuery, [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        console.log("Username", user.username);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = generateToken(user.id, user.email);

        const updateLastLoginQuery = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        await authDb.query(updateLastLoginQuery, [user.id]);

        // Here you would typically create a session or JWT token
        res.status(200).json({ message: "Login successful", userId: user.id, token: token, user: { id: user.id, username: user.username, email: user.email } });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Database error occurred" });

    }
})

// Logout route (client-side token removal, at the same time you could also maintain a blacklist)
router.post("/logout", verifyToken, (req, res) => {
    res.json({ message: "Logout successful" });
});

router.get("/user", verifyToken, async (req, res) => {
    try {
        const authDb = await getDb();
        const [users] = await authDb.query('SELECT * FROM users WHERE id = ?',
            [req.user.userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ username: users[0] });
    } catch (err) {
        console.error("Username fetch error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Protected route example - get user profile
// router.get("/profile", verifyToken, async (req, res) => {
//     try {
//         const authDb = await getDb();
//         const [users] = await authDb.query(
//             'SELECT id, username, email, phonenumber, created_at, last_login FROM users WHERE id = ?',
//             [req.user.userId]
//         );

//         if (users.length === 0) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.json({
//             message: "Profile retrieved successfully",
//             user: users[0]
//         });
//     } catch (err) {
//         console.error("Profile error:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });



// Password reset request route
// router.post("/forgot-password", rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 3,
//     message: { error: "Too many password reset requests, please try again later" }
// }), async (req, res) => {
//     const { email } = req.body;

//     try {
//         if (!email || !validateEmail(email)) {
//             return res.status(400).json({ message: "Valid email is required" });
//         }

//         const authDb = await getDb();
//         const [users] = await authDb.query('SELECT * FROM users WHERE email = ?', [email]);

//         // Always return success to prevent email enumeration
//         res.json({
//             message: "If an account with that email exists, a password reset link has been sent."
//         });

//         // Only send email if user exists (implement email sending logic here)
//         if (users.length > 0) {
//             // TODO: Generate password reset token and send email
//             console.log(`Password reset requested for: ${email}`);
//         }

//     } catch (err) {
//         console.error("Forgot password error:", err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


module.exports = router;