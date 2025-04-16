const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const { autenticar } = require("../utils/autenticar");

// Rota para buscar os dados do proprietário logado
router.get("/", autenticar, async (req, res) => {
    try {
        const query = "SELECT proprietario.nome as nome, sobrenome, email, telefone, estado.Nome as estado, estado.UF as uf, cidade.nome as cidade, cep, Bairro, Rua, Numero, Data_Nascimento, Complemento FROM Proprietario JOIN horse_house.cep cep on cep.CEP = Proprietario.fk_CEP_CEP JOIN horse_house.cidade cidade on cidade.ID = cep.FK_Cidade_ID join estado on cidade.fk_Estado_ID = estado.ID WHERE proprietario.ID = ?";
        const [results] = await connection.promise().query(query, [req.proprietarioId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Proprietário não encontrado." });
        }

        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar os dados do proprietário." });
    }
});

module.exports = router;