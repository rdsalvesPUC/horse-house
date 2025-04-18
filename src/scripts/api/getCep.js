const express = require("express");
const router = express.Router();
const connection = require("../horseDB");

router.get("/:cep", async (req, res) => {
    const { cep } = req.params;
    // Validação básica do CEP
    if (!/^\d{8}$/.test(cep)) {
        return res.status(400).json({ error: "CEP inválido. Deve conter 8 dígitos numéricos." });
    }

    try {
        // Consulta no banco de dados
        const query = `
            SELECT cep.CEP, cidade.Nome AS Cidade, estado.Nome AS Estado, estado.UF 
            FROM cep
            JOIN cidade ON cep.FK_Cidade_ID = cidade.ID
            JOIN estado ON cidade.FK_Estado_ID = estado.ID
            WHERE cep.CEP = ?
        `;
        const [results] = await connection.promise().query(query, [cep]);

        if (results.length === 0) {
            return res.status(404).json({ error: "CEP não encontrado no banco de dados." });
        }

        res.json(results[0]);
    } catch (err) {
        console.error("Erro ao consultar o banco de dados:", err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;