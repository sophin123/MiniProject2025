const mysql = require("mysql2/promise");
const queries = require("./files/queries.js");
const { getDb } = require("./authdb.js");

const dbName = "fileshare"

require("dotenv").config();

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD
}

let fileshareDb;
let dbReadyPromise;

async function InitializeAuthDb() {
    try {
        // Ensure authentication DB and users table exist before creating FKs
        await getDb();

        // const initialConnection = await mysql.createConnection(dbConfig)

        // await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        // console.log(`Database ${dbName} is ready`);
        // await initialConnection.end();

        fileshareDb = mysql.createPool({ ...dbConfig, database: dbName, waitForConnections: true, connectionLimit: 2, queueLimit: 0 })

        await fileshareDb.query(queries.CREATE_FILES_TABLE);
        await fileshareDb.query(queries.CREATE_SNIPPETS_TABLE);
        console.log("Files table is ready");
        console.log("Snippets table is ready");
    } catch (err) {
        console.error("Failed to initialize fileshare database:", err);
        process.exit(1); // Optional: Exit if setup fails
    }
}

dbReadyPromise = InitializeAuthDb();

module.exports = {
    getFileshareDb: async () => {
        await dbReadyPromise;  // Ensure DB is initialized
        return fileshareDb;
    }
};

