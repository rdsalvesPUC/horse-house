const express = require("express");
const router = express.Router();
const connection = require("../horseDB");

router.post("/", (req, res) => {
    const { nome, sobrenome, senha, cpf, dataNascimento, telefone, email, harasId } = req.body;

    if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !harasId || !email || !telefone) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const query = `
        INSERT INTO gerente (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, [nome, sobrenome, senha, cpf, dataNascimento, telefone, email, harasId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao inserir dados no banco de dados." });
        }
        res.status(201).json({ message: "Gerente cadastrado com sucesso!", id: results.insertId });
    });
});

module.exports = router;