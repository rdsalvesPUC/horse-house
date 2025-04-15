const express = require("express");
const router = express.Router();
const connection = require("../horseDB");

router.post("/", (req, res) => {
    const { nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro } = req.body;

    // Validações
    if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !telefone || !email || !cep || !rua || !numero || !bairro) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const query = `
        INSERT INTO proprietario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_CEP_CEP, rua, numero, bairro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, [nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao inserir dados no banco de dados." });
        }
        res.status(201).json({ message: "Proprietário cadastrado com sucesso!", id: results.insertId });
    });
});

module.exports = router;