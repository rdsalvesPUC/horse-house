const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {verificarOuCadastrarEndereco} = require("../utils/enderecoUtils");
const {extractUserID, requireProprietario} = require("../middleware/auth");
const {validarCNPJ, validarCEP} = require("../utils/validations");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateHarasRequest:
 *       type: object
 *       required:
 *         - nome
 *         - rua
 *         - numero
 *         - complemento
 *         - cnpj
 *         - bairro
 *         - cep
 *         - dominio
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do haras
 *         rua:
 *           type: string
 *           description: Rua do endereço
 *         numero:
 *           type: integer
 *           description: Número do endereço
 *         complemento:
 *           type: string
 *           description: Complemento do endereço
 *         cnpj:
 *           type: string
 *           description: CNPJ do haras (14 dígitos numéricos, válido)
 *           pattern: '^\d{14}$'
 *           example: "12345678901234"
 *         bairro:
 *           type: string
 *           description: Bairro do endereço
 *         cep:
 *           type: string
 *           description: CEP do endereço (8 dígitos numéricos)
 *           pattern: '^\d{8}$'
 *           example: "01234567"
 *         dominio:
 *           type: string
 *           description: Domínio único do haras
 *       example:
 *         nome: Haras Bela Vista
 *         rua: Estrada Rural
 *         numero: 1500
 *         complemento: Km 5
 *         cnpj: "12345678901234"
 *         bairro: Zona Rural
 *         cep: "01234567"
 *         dominio: belavista
 *     
 *     CreateHarasResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *         id:
 *           type: integer
 *           description: ID do haras cadastrado
 *       example:
 *         message: Haras cadastrado com sucesso!
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
 * /api/criarHaras:
 *   post:
 *     summary: Cria um novo haras
 *     tags: [Haras]
 *     description: Cadastra um novo haras no sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHarasRequest'
 *     responses:
 *       201:
 *         description: Haras cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateHarasResponse'
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
 *                 error: Erro ao inserir dados no banco de dados.
 */
router.post("/", [extractUserID, requireProprietario], async (req, res) => {
    const { nome, rua, numero, complemento, cnpj, bairro, cep, dominio } = req.body;

    if (!nome || !rua || !numero || !complemento || !cnpj || !bairro || !cep || !dominio) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    // Validações adicionais
    if (!validarCNPJ(cnpj)) {
        return res.status(400).json({ error: "CNPJ inválido." });
    }

    if (!validarCEP(cep)) {
        return res.status(400).json({ error: "CEP inválido." });
    }

    try {
        // Verificar ou cadastrar CEP, cidade e estado
        await verificarOuCadastrarEndereco(cep);

        const query = `
            INSERT INTO haras (Nome, Rua, Numero, Complemento, CNPJ, Bairro, Dominio, fk_Proprietario_ID, fk_CEP_CEP) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [results] = await connection.promise().query(query, [nome, rua, numero, complemento, cnpj, bairro, dominio, req.user.id, cep]);
        res.status(201).json({ message: "Haras cadastrado com sucesso!", id: results.insertId });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            if (err.message.includes('CNPJ')) {
                return res.status(409).json({ error: "Este CNPJ já está cadastrado no sistema." });
            } else if (err.message.includes('Dominio')) {
                return res.status(409).json({ error: "Este domínio já está cadastrado no sistema." });
            } else {
                return res.status(409).json({ error: "Dados duplicados. Verifique se o CNPJ ou domínio já não estão cadastrados." });
            }
        }
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;
