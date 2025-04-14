const express = require("express");
const router = express.Router();
const connection = require("../horseDB");

// Rota para listar todos os cavalos
router.get("/", (req, res) => {
    const query = "SELECT * FROM cavalo";
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao buscar dados do banco de dados." });
        }
        res.json(results);
    });
});

module.exports = router;