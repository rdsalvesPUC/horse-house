const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const connection = require("../horseDB");
const { verificarOuCadastrarEndereco } = require("../utils/enderecoUtils");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateProprietarioRequest:
 *       type: object
 *       required:
 *         - nome
 *         - sobrenome
 *         - senha
 *         - cpf
 *         - dataNascimento
 *         - telefone
 *         - email
 *         - cep
 *         - rua
 *         - numero
 *         - bairro
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do proprietário
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do proprietário
 *         senha:
 *           type: string
 *           description: Senha do proprietário
 *         cpf:
 *           type: string
 *           description: CPF do proprietário (11 dígitos)
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do proprietário
 *         telefone:
 *           type: string
 *           description: Telefone do proprietário
 *         email:
 *           type: string
 *           description: Email do proprietário
 *         cep:
 *           type: string
 *           description: CEP do endereço (8 dígitos)
 *         rua:
 *           type: string
 *           description: Rua do endereço
 *         numero:
 *           type: integer
 *           description: Número do endereço
 *         bairro:
 *           type: string
 *           description: Bairro do endereço
 *         complemento:
 *           type: string
 *           description: Complemento do endereço (opcional)
 *       example:
 *         nome: Carlos
 *         sobrenome: Oliveira
 *         senha: senha123
 *         cpf: "12345678901"
 *         dataNascimento: "1985-05-15"
 *         telefone: "11987654321"
 *         email: carlos.oliveira@exemplo.com
 *         cep: "01234567"
 *         rua: Avenida Paulista
 *         numero: 1000
 *         bairro: Bela Vista
 *         complemento: Apto 123
 *     
 *     CreateProprietarioResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *         id:
 *           type: integer
 *           description: ID do proprietário cadastrado
 *       example:
 *         message: Proprietário cadastrado com sucesso!
 *         id: 1
 */

/**
 * @swagger
 * /api/criarProprietario:
 *   post:
 *     summary: Cria um novo proprietário
 *     tags: [Proprietários]
 *     description: Cadastra um novo proprietário no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProprietarioRequest'
 *     responses:
 *       201:
 *         description: Proprietário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateProprietarioResponse'
 *       400:
 *         description: Dados de requisição inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Todos os campos são obrigatórios.
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Erro ao processar a solicitação.
 */
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
