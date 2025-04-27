const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extrairUserID} = require("../utils/extrairUserID");

router.get("/", extrairUserID, (req, res) => {
    const userType = req.user.user;
    if (userType !== "proprietario") {
        return res.status(403).json({error: "Acesso negado. Somente proprietários podem visualizar seus haras."});
    }

    const query = "SELECT Nome, id FROM haras WHERE fk_Proprietario_ID = ?";
    connection.query(query, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({error: "Erro ao buscar haras no banco de dados."});
        }
        res.json(results);
    });
});

module.exports = router;
