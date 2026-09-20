const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || "mysql-service",
  user: process.env.MYSQL_USER || "appuser",
  password: process.env.MYSQL_PASSWORD || "userpassword",
  database: process.env.MYSQL_DATABASE || "appdb",
  waitForConnections: true,
  connectionLimit: 10,
});

app.post("/api/visit", (req, res) => {
  db.query("INSERT INTO page_views (visited_at) VALUES (DEFAULT)", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "visit logged!" });
  });
});

app.get("/api/data", (req, res) => {
  db.query(
    "SELECT NOW() AS serverTime, COUNT(*) AS totalVisits FROM page_views",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    },
  );
});

app.listen(5000, () => console.log("backend running on port 5000"));
