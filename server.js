require("dotenv").config();
const express = require("express");
const path = require("path");
const connection = require("./src/scripts/horseDB");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    if (req.url.startsWith("/scripts/")) {
        return res.status(403).send("Acesso proibido.");
    }
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "pages", "index.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "pages", "cadastro_proprietario.html"));
})
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
