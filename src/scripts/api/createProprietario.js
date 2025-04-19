const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const connection = require("../horseDB");
const { verificarOuCadastrarEndereco } = require("../utils/enderecoUtils");

router.post("/", async (req, res) => {
    const { nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento } = req.body;

    if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !telefone || !email || !cep || !rua || !numero || !bairro) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        // Gerar o hash da senha
        const saltRounds = parseInt(process.env.SALT); // Define o custo do hash
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Verificar ou cadastrar CEP, cidade e estado
        await verificarOuCadastrarEndereco(cep);

        // Inserir o proprietário
        const query = `
            INSERT INTO Proprietario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_CEP_CEP, rua, numero, bairro, Complemento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [results] = await connection.promise().query(query, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento]);

        res.status(201).json({ message: "Proprietário cadastrado com sucesso!", id: results.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;