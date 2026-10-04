const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: duration,
      }),
    );
  });
  next();
});

const db = mysql.createPool({
  host: process.env.DB_HOST || "mysql-service",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "appdb",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get("/readyz", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({ status: "not ready", error: err.message });
    }
    res.status(200).json({ status: "ready" });
  });
});

const handleWeather = async (req, res) => {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=65.0124&longitude=25.4682&daily=sunrise,sunset,daylight_duration&hourly=temperature_2m,precipitation&timezone=auto",
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get("/api/weather", handleWeather);
app.get("/weather", handleWeather);

app.post("/api/visit", (req, res) => {
  db.query("INSERT INTO visits (visited_at) VALUES (DEFAULT)", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "visit logged!" });
  });
});

app.get("/api/data", (req, res) => {
  db.query(
    "SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS serverTime, COUNT(*) AS totalVisits FROM visits",
    (err, results) => {
      if (err || !results || results.length === 0) {
        return res.json({
          serverTime: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          totalVisits: 0,
        });
      }
      res.json({
        serverTime:
          results[0].serverTime ||
          new Date().toISOString().replace("T", " ").substring(0, 19),
        totalVisits: Number(results[0].totalVisits) || 0,
      });
    },
  );
});

app.listen(5000, () => console.log("backend running on port 5000"));
