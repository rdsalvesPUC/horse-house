const {autenticar} = require("../utils/autenticar");
const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const jwt = require("jsonwebtoken");
const {verificarOuCadastrarEndereco} = require("../utils/enderecoUtils");

router.post("/", autenticar, async (req, res) => {
    const { nome, rua, numero, complemento, cnpj, bairro, cep } = req.body;

    if (!nome || !rua || !numero || !complemento || !cnpj || !bairro || !cep) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }
    try{
    // Verificar ou cadastrar CEP, cidade e estado
    await verificarOuCadastrarEndereco(cep);

    const query = `
        INSERT INTO haras (Nome, Rua, Numero, Complemento, CNPJ, Bairro, fk_Proprietario_ID, fk_CEP_CEP) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, [nome, rua, numero,complemento, cnpj, bairro, req.proprietarioId, cep], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao inserir dados no banco de dados." });
        }
        res.status(201).json({ message: "Haras cadastrado com sucesso!", id: results.insertId });
    });
    }catch (err){
        console.error(err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;