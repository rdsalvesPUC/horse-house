const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const { extrairProprietarioID } = require("../utils/extrairProprietarioID");
const bcrypt = require("bcrypt");
router.post("/:dominio", extrairProprietarioID, async (req, res) => {
    const dominio = req.params.dominio;
    console.log("dominio", dominio);
    const { nome, sobrenome, senha, cpf, dataNascimento, telefone, email } = req.body;
    if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !email || !telefone) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }
    const saltRounds = parseInt(process.env.SALT);
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const queryHaras = "SELECT id, fk_Proprietario_ID FROM haras WHERE dominio = ?";
    connection.query(queryHaras, [dominio], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao buscar o haras no banco de dados." });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Haras não encontrado." });
        }

        const haras = results[0];

        if (haras.fk_Proprietario_ID !== req.proprietario.id) {
            return res.status(403).json({ error: "Você não tem permissão para cadastrar um gerente neste haras." });
        }

        const queryGerente = `
            INSERT INTO gerente (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(queryGerente, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, haras.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao inserir dados no banco de dados." });
            }
            res.status(201).json({ message: "Gerente cadastrado com sucesso!", id: results.insertId });
        });
    });
});

module.exports = router;