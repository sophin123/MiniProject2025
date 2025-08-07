const mysql = require("mysql2/promise");

const dbName = "authentication"

require("dotenv").config();

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: "root",
    password: process.env.MYSQL_ROOT_PASSWORD
}

let authDb;
let dbReadyPromise;

async function InitializeAuthDb() {
    try {
        const initialConnection = await mysql.createConnection(dbConfig)

        await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database ${dbName} is ready`);
        await initialConnection.end();

        authDb = mysql.createPool({ ...dbConfig, database: dbName, waitForConnections: true, connectionLimit: 2, queueLimit: 0 })

        // Create users table if not exists
        const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phonenumber VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL DEFAULT NULL
    )`;

        await authDb.query(createUsersTableQuery);
        console.log("Users table is ready");
    } catch (err) {
        console.error("Failed to initialize auth database:", err);
        process.exit(1); // Optional: Exit if setup fails
    }
}

dbReadyPromise = InitializeAuthDb();

module.exports = {
    getDb: async () => {
        await dbReadyPromise;  // Ensure DB is initialized
        return authDb;
    }
};

