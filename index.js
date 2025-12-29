const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const sessionConfig = require("./configs/session.config");
const router = require("./routes");

app.use(express.static(path.resolve("public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("public/views"));

app.use(expressLayouts);
app.set("layout", "main");

// Middleware untuk menangani request body dalam berbagai format
app.use(express.json()); // Mengizinkan Express memproses request dalam format JSON
app.use(express.urlencoded({ extended: true })); // Mengizinkan parsing data dalam format URL-encoded

// Menggunakan body-parser untuk mengatur batas ukuran request body agar tidak terlalu besar
app.use(bodyParser.json({ limit: "1mb" })); // Membatasi ukuran request body JSON maksimal 50MB

app.use(sessionConfig);

app.use("/", router);

app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}/`);
});