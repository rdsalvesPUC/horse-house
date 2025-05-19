const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario, requireGerente, requireTratador} = require("../middleware/auth");
const bcrypt = require("bcrypt");

router.post("/tratamento", [extractUserID, requireTratador], async (req, res) => {
    const { id_cavalo, dieta } = req.body;

    if (!id_cavalo || !dieta) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }
    const id_tratador = req.user.id;
    const data_tratamento = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    try {
        const query = "INSERT INTO trata (fk_Cavalo_ID, fk_Tratador_ID, Dieta, Data) VALUES (?, ?, ?, ?)";
        const values = [id_cavalo, id_tratador, dieta, data_tratamento];

        const [results] = await connection.promise().query(query, values);
        if (results.affectedRows > 0) {
            return res.status(201).json({ message: "Tratamento registrado com sucesso." });
        } else {
            return res.status(500).json({ error: "Erro ao registrar o tratamento." });
        }
    } catch (error) {
        console.error("Erro ao registrar o tratamento:", error);
        return res.status(500).json({ error: "Erro ao registrar o tratamento." });
    }
});

router.get("/tratamento/cavalo/:id", [extractUserID], async (req, res) => {
    const id_cavalo = req.params.id;

    if (!id_cavalo) {
        return res.status(400).json({ error: "ID do cavalo é obrigatório." });
    }

    try {
        const query = "SELECT * FROM trata WHERE fk_Cavalo_ID = ?";
        const [results] = await connection.promise().query(query, [id_cavalo]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Nenhum tratamento encontrado para este cavalo." });
        }
        if (req.user.user === "proprietario") {
            const query2 = "SELECT * FROM cavalo WHERE ID = ?";
            const [cavalo] = await connection.promise().query(query2, [id_cavalo]);
            if (cavalo.length === 0) {
                return res.status(404).json({ message: "Cavalo não encontrado." });
            }
            if (cavalo[0].fk_Proprietario_ID !== req.user.id) {
                return res.status(403).json({ error: "Acesso negado. Você não é o proprietário deste cavalo." });
            }
        }
        else {
            const query2 = "SELECT * FROM cavalo WHERE ID = ?";
            const [cavalo] = await connection.promise().query(query2, [id_cavalo]);
            if (cavalo.length === 0) {
                return res.status(404).json({ message: "Cavalo não encontrado." });
            }
            if (cavalo[0].fk_Haras_ID !== req.user.harasId) {
                return res.status(403).json({ error: "Acesso negado. Você não é o tratador deste cavalo." });
            }
        }
    } catch (error) {
        console.error("Erro ao buscar tratamentos:", error);
        return res.status(500).json({ error: "Erro ao buscar tratamentos." });
    }
});

module.exports = router;