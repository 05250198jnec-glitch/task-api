require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connection successful.");
    app.listen(PORT, () => {
      console.log(`Task API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();
