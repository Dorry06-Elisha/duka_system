import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "dukauser",
  password: process.env.DB_PASSWORD || "Mwasa@dorry0611",
  database: process.env.DB_NAME || "dukabora",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

export default db;
