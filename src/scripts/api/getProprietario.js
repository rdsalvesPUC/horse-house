const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const connection = require("../horseDB");

const autenticar = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Exemplo: "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.proprietarioId = decoded.id; // Armazena o ID do proprietário no request
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido." });
    }
};

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