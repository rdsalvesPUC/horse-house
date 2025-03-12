require("dotenv").config();
const express = require("express");
const connection = require("./src/scripts/horseDB");
const {join} = require("node:path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static('pages'));

app.get("/", (req, res) => {
    // Enviando o arquivo HTML com caminho absoluto
    res.sendFile(join(__dirname, 'src', 'pages', 'index.html'));
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
