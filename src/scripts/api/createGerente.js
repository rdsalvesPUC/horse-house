const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extrairUserID} = require("../utils/extrairUserID");
const bcrypt = require("bcrypt");

router.post("/", extrairUserID, async (req, res) => {
    try {
        const userType = req.user.user;
        if (userType !== "proprietario") {
            return res.status(403).json({error: "Acesso negado. Somente proprietários podem cadastrar gerentes."});
        }

        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, haras_id} = req.body;

        if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !email || !telefone || !haras_id) {
            return res.status(400).json({error: "Todos os campos são obrigatórios."});
        }

        // Verificar se o haras pertence ao proprietário logado
        const queryVerificaHaras = "SELECT COUNT(*) as count FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";
        const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [haras_id, req.user.id]);

        if (verificaHarasResults[0].count === 0) {
            return res.status(403).json({error: "Você não tem permissão para adicionar gerentes a este haras."});
        }

        const saltRounds = parseInt(process.env.SALT);
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        const queryGerente = `
            INSERT INTO gerente (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [results] = await connection.promise().query(queryGerente, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, haras_id]);

        res.status(201).json({message: "Gerente cadastrado com sucesso!", id: results.insertId});
    } catch (err) {
        console.error("Erro ao cadastrar gerente:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "dados duplicados."});
        }
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

module.exports = router;