const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const connection = require("../horseDB");
const {verificarOuCadastrarEndereco} = require("../utils/enderecoUtils");
const {extractUserID} = require("../middleware/auth");
const {validarCPF, validarEmail, validarCEP, validarTelefone} = require("../utils/validations");

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
 *           description: CPF do proprietário (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do proprietário
 *         telefone:
 *           type: string
 *           description: Telefone do proprietário (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do proprietário (formato válido)
 *           example: "carlos.oliveira@exemplo.com"
 *         cep:
 *           type: string
 *           description: CEP do endereço (8 dígitos numéricos)
 *           pattern: '^\d{8}$'
 *           example: "01234567"
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
 *
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro de autenticação
 *       example:
 *         error: Token de autenticação inválido ou expirado
 *
 *     ForbiddenError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro de autorização
 *       example:
 *         error: Acesso negado. Você não tem permissão para realizar esta ação
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
router.post("/criarProprietario", async (req, res) => {
    const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento} = req.body;

    if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !telefone || !email || !cep || !rua || !numero || !bairro) {
        return res.status(400).json({error: "Todos os campos são obrigatórios."});
    }

    // Validações adicionais
    if (!validarCPF(cpf)) {
        return res.status(400).json({error: "CPF inválido."});
    }

    if (!validarEmail(email)) {
        return res.status(400).json({error: "Email inválido."});
    }

    if (!validarCEP(cep)) {
        return res.status(400).json({error: "CEP inválido."});
    }

    if (!validarTelefone(telefone)) {
        return res.status(400).json({error: "Telefone inválido."});
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

        res.status(201).json({message: "Proprietário cadastrado com sucesso!", id: results.insertId});
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            if (err.message.includes('CPF')) {
                return res.status(409).json({ error: "Este CPF já está cadastrado no sistema." });
            } else if (err.message.includes('Email')) {
                return res.status(409).json({ error: "Este email já está cadastrado no sistema." });
            } else {
                return res.status(409).json({ error: "Dados duplicados. Verifique se o CPF ou email já não estão cadastrados." });
            }
        }
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

/**
 * @swagger
 * /api/proprietario/{id}:
 *   get:
 *     summary: Obtém dados de um proprietário específico
 *     tags: [Proprietários]
 *     description: Retorna os dados completos de um proprietário pelo seu ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do proprietário
 *     responses:
 *       200:
 *         description: Dados do proprietário encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome:
 *                   type: string
 *                   description: Nome do proprietário
 *                 sobrenome:
 *                   type: string
 *                   description: Sobrenome do proprietário
 *                 email:
 *                   type: string
 *                   description: Email do proprietário
 *                 telefone:
 *                   type: string
 *                   description: Telefone do proprietário
 *                 estado:
 *                   type: string
 *                   description: Nome do estado
 *                 uf:
 *                   type: string
 *                   description: UF do estado
 *                 cidade:
 *                   type: string
 *                   description: Nome da cidade
 *                 cep:
 *                   type: string
 *                   description: CEP do endereço
 *                 Bairro:
 *                   type: string
 *                   description: Bairro do endereço
 *                 Rua:
 *                   type: string
 *                   description: Rua do endereço
 *                 Numero:
 *                   type: string
 *                   description: Número do endereço
 *                 Data_Nascimento:
 *                   type: string
 *                   format: date
 *                   description: Data de nascimento
 *                 Complemento:
 *                   type: string
 *                   description: Complemento do endereço
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Proprietário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Proprietário não encontrado.
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
router.get("/proprietario/:id", extractUserID, async (req, res) => {
    const proprietarioId = req.params.id;
    const query = `
        SELECT Cpf,
               p.Nome,
               Sobrenome,
               Telefone,
               Data_Nascimento,
               Email,
               Rua,
               Numero,
               Complemento,
               Bairro,
               CEP,
               c.nome,
               UF
        FROM Proprietario p
                 JOIN CEP c ON p.fk_CEP_CEP = c.CEP
                 JOIN Cidade c ON c.FK_Cidade_ID = c.ID
                 JOIN Estado e ON c.fk_Estado_ID = e.ID
        WHERE p.ID = ?
    `;

    try {
        const [results] = await connection.promise().query(query, [proprietarioId]);

        if (results.length === 0) {
            return res.status(404).json({error: "Proprietário não encontrado."});
        }

        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

module.exports = router;