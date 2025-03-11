require("dotenv").config();
const express = require("express");
import connection from "./src/scripts/horseDB"

const app = express();
const port = process.env.PORT || 3000;

// Configuração do banco de dados MySQL


// Middleware para permitir JSON no body
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor Express com MySQL!");
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
