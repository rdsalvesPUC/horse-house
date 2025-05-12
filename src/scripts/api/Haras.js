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
router.post("/criarHaras", [extractUserID, requireProprietario], async (req, res) => {
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

/**
 * @swagger
 * components:
 *   schemas:
 *     HarasListItem:
 *       type: object
 *       properties:
 *         Nome:
 *           type: string
 *           description: Nome do haras
 *         id:
 *           type: integer
 *           description: ID do haras
 *       example:
 *         Nome: Haras Bela Vista
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
 * /api/getAllHaras:
 *   get:
 *     summary: Lista todos os haras do proprietário
 *     tags: [Haras]
 *     description: Retorna uma lista de todos os haras pertencentes ao proprietário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de haras retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HarasListItem'
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
 *                 error: Erro ao buscar haras no banco de dados.
 */
router.get("/getAllHaras", [extractUserID, requireProprietario], async (req, res) => {
    try {
        const query = "SELECT Nome, id FROM haras WHERE fk_Proprietario_ID = ?";
        const [results] = await connection.promise().query(query, [req.user.id]);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao buscar haras no banco de dados."});
    }
});

/**
 * @swagger
 * /api/haras/{id}:
 *   get:
 *     summary: Obtém informações de um haras específico
 *     tags: [Haras]
 *     description: Retorna os detalhes de um haras pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do haras
 *     responses:
 *       200:
 *         description: Detalhes do haras retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Nome:
 *                   type: string
 *                   description: Nome do haras
 *                 id:
 *                   type: integer
 *                   description: ID do haras
 *               example:
 *                 Nome: Haras Bela Vista
 *                 id: 1
 *       404:
 *         description: Haras não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Haras não encontrada.
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
 *                 error: Erro ao buscar haras no banco de dados.
 */
router.get("/haras/:id", async (req, res) => {
    try {
        const query = "SELECT Nome, id FROM haras WHERE id = ?";
        const [results] = await connection.promise().query(query, [req.params.id]);
        res.json(results);
        if (results.length === 0) {
            return res.status(404).json({error: "Haras não encontrada."});
        }
        res.json(results[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao buscar haras no banco de dados."});
    }
});

/**
 * @swagger
 * /api/haras/{id}:
 *   put:
 *     summary: Atualiza informações de um haras
 *     tags: [Haras]
 *     description: Atualiza os dados de um haras existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do haras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do haras
 *               rua:
 *                 type: string
 *                 description: Rua do endereço
 *               numero:
 *                 type: integer
 *                 description: Número do endereço
 *               complemento:
 *                 type: string
 *                 description: Complemento do endereço
 *               cnpj:
 *                 type: string
 *                 description: CNPJ do haras
 *               bairro:
 *                 type: string
 *                 description: Bairro do endereço
 *               cep:
 *                 type: string
 *                 description: CEP do endereço
 *             example:
 *               nome: Haras Atualizado
 *               rua: Estrada Nova
 *               numero: 2000
 *               complemento: Km 10
 *               cnpj: "98765432109876"
 *               bairro: Centro
 *               cep: "76543210"
 *     responses:
 *       200:
 *         description: Haras atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Haras atualizado com sucesso!
 *       400:
 *         description: Dados de requisição inválidos ou validações falharam
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               examples:
 *                 camposObrigatorios:
 *                   value:
 *                     error: Todos os campos são obrigatórios.
 *                 cnpjInvalido:
 *                   value:
 *                     error: CNPJ inválido.
 *                 cepInvalido:
 *                   value:
 *                     error: CEP inválido.
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
 *         description: Haras não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Haras não encontrada.
 *       409:
 *         description: Conflito de dados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               examples:
 *                 cnpjDuplicado:
 *                   value:
 *                     error: Este CNPJ já está cadastrado no sistema.
 *                 dominioDuplicado:
 *                   value:
 *                     error: Este domínio já está cadastrado no sistema.
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
router.put("/haras/:id",[requireProprietario,extractUserID], async (req, res) => {

    const { nome, rua, numero, complemento, cnpj, bairro, cep } = req.body;

    if (!nome || !rua || !numero || !complemento || !cnpj || !bairro || !cep) {
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
            UPDATE haras 
            SET Nome = ?, Rua = ?, Numero = ?, Complemento = ?, CNPJ = ?, Bairro = ?, fk_CEP_CEP = ? 
            WHERE id = ?
        `;

        await connection.promise().query(query, [nome, rua, numero, complemento, cnpj, bairro, cep, req.params.id]);
        res.status(200).json({ message: "Haras atualizado com sucesso!" });
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
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: "Haras não encontrada." });
        }
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

/**
 * @swagger
 * /api/haras/{id}:
 *   delete:
 *     summary: Exclui um haras
 *     tags: [Haras]
 *     description: Remove um haras do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do haras
 *     responses:
 *       200:
 *         description: Haras excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Haras excluída com sucesso!
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
 *         description: Haras não encontrada ou sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Haras não encontrada ou você não tem permissão para excluí-la.
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
router.delete("/haras/:id", [requireProprietario,extractUserID], async (req, res) => {
    try {
        const query = "DELETE FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";
        const [results] = await connection.promise().query(query, [req.params.id, req.user.id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Haras não encontrada ou você não tem permissão para excluí-la." });
        }

        res.status(200).json({ message: "Haras excluída com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;

