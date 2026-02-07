require("dotenv").config();

const express = require("express");
const path = require("path");
const { initDb } = require("./db/db");

const authRouter = require("./routes/auth");
const notesRouter = require("./routes/notes");

const app = express();
app.use(express.json());

initDb();

// statikus frontend (opcionális)
app.use(express.static(path.join(process.cwd(), "src", "client")));

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = 3000;
app.listen(PORT, () => console.log(`Szerver fut: http://localhost:3000`));
