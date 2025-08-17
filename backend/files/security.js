// security.js
module.exports = {
    SESSION_TTL_MS: 15 * 60 * 1000,        // 15 minutes
    SESSION_ROTATE_MS: 5 * 60 * 1000,      // rotate ID every 5 minutes
    SLIDING_EXTENSION_MS: 15 * 60 * 1000,  // extend on activity
    COOKIE_NAME: "sid",
    DEVICE_COOKIE: "did",
    CSRF_COOKIE: "csrf",
    COOKIE_OPTS: {
        httpOnly: true,
        secure: true,        // require HTTPS in prod
        sameSite: "Strict",  // blocks most CSRF
        path: "/",
    },
    PUBLIC_ORIGINS: [
        "https://your-frontend.com", // update
        "http://localhost:3000",     // dev
    ],
    IP_LEEWAY: 2, // accept same /24 change or use exact match in strict envs
};
