const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const { extrairUserID } = require("../utils/extrairUserID");

// Rota para buscar os dados do usuário logado (todos os tipos de usuário)
router.get("/", extrairUserID, async (req, res) => {
    try {
        const userType = req.user.user; // Obtém o tipo de usuário do token
        let query, userId;

        // Determina a consulta com base no tipo de usuário
        if (userType === "proprietario") {
            query = "SELECT proprietario.nome as nome, sobrenome, email, telefone, estado.Nome as estado, estado.UF as uf, cidade.nome as cidade, cep, Bairro, Rua, Numero, Data_Nascimento, Complemento FROM Proprietario JOIN horse_house.cep cep on cep.CEP = Proprietario.fk_CEP_CEP JOIN horse_house.cidade cidade on cidade.ID = cep.FK_Cidade_ID join estado on cidade.fk_Estado_ID = estado.ID WHERE proprietario.ID = ?";
            userId = req.user.id;
        } else if (userType === "gerente") {
            query = "SELECT Nome, Sobrenome, CPF, Data_Nascimento, Telefone, Email from gerente WHERE gerente.ID = ?";
            userId = req.user.id;
        } else if (userType === "treinador") {
            query = "SELECT Nome, Sobrenome, CPF, Telefone, Email, Senha, Data_Nascimento from treinador where treinador.ID = ?";
            userId = req.user.id;
        } else if (userType === "veterinario") {
            query = "SELECT Nome, Email, Telefone, Data_Nascimento, CPF, Sobrenome, CRMV from veterinario WHERE veterinario.ID = ?";
            userId = req.user.id;
        } else if (userType === "tratador") {
            query = "SELECT Nome, Sobrenome, CPF, Data_Nascimento, Telefone, Email from tratador WHERE tratador.ID = ?";
            userId = req.user.id;
        } else {
            return res.status(403).json({ error: "Tipo de usuário não suportado." });
        }

        const [results] = await connection.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ error: `${userType.charAt(0).toUpperCase() + userType.slice(1)} não encontrado.` });
        }

        // Adiciona o tipo de usuário à resposta
        const userData = {
            ...results[0],
            userType
        };

        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar os dados do usuário." });
    }
});

module.exports = router;
