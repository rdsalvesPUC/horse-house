const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario, requireGerente} = require("../middleware/auth");
const bcrypt = require("bcrypt");
const {validarCPF, validarEmail, validarTelefone} = require("../utils/validations");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateGerenteRequest:
 *       type: object
 *       required:
 *         - nome
 *         - sobrenome
 *         - senha
 *         - cpf
 *         - dataNascimento
 *         - telefone
 *         - email
 *         - haras_id
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do gerente
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do gerente
 *         senha:
 *           type: string
 *           description: Senha do gerente
 *         cpf:
 *           type: string
 *           description: CPF do gerente (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do gerente
 *         telefone:
 *           type: string
 *           description: Telefone do gerente (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do gerente (formato válido)
 *           example: "joao.silva@exemplo.com"
 *         haras_id:
 *           type: integer
 *           description: ID do haras ao qual o gerente será vinculado
 *       example:
 *         nome: João
 *         sobrenome: Silva
 *         senha: senha123
 *         cpf: "12345678901"
 *         dataNascimento: "1990-01-01"
 *         telefone: "11987654321"
 *         email: joao.silva@exemplo.com
 *         haras_id: 1
 *
 *     UpdateGerenteRequest:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do gerente
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do gerente
 *         senha:
 *           type: string
 *           description: Senha do gerente
 *         cpf:
 *           type: string
 *           description: CPF do gerente (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do gerente
 *         telefone:
 *           type: string
 *           description: Telefone do gerente (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do gerente (formato válido)
 *           example: "joao.atualizado@exemplo.com"
 *       example:
 *         nome: João Atualizado
 *         sobrenome: Silva Santos
 *         telefone: "11999999999"
 *         email: joao.atualizado@exemplo.com
 *
 *     GerenteResponse:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: ID do gerente
 *         nome:
 *           type: string
 *           description: Nome do gerente
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do gerente
 *         cpf:
 *           type: string
 *           description: CPF do gerente
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do gerente
 *         telefone:
 *           type: string
 *           description: Telefone do gerente
 *         email:
 *           type: string
 *           description: Email do gerente
 *         fk_haras_id:
 *           type: integer
 *           description: ID do haras ao qual o gerente está vinculado
 *         haras_nome:
 *           type: string
 *           description: Nome do haras ao qual o gerente está vinculado
 *       example:
 *         ID: 1
 *         nome: João
 *         sobrenome: Silva
 *         cpf: "12345678901"
 *         data_nascimento: "1990-01-01"
 *         telefone: "11987654321"
 *         email: joao.silva@exemplo.com
 *         fk_haras_id: 1
 *         haras_nome: Haras Bela Vista
 *
 *     CreateGerenteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *         id:
 *           type: integer
 *           description: ID do gerente cadastrado
 *       example:
 *         message: Gerente cadastrado com sucesso!
 *         id: 1
 *
 *     UpdateGerenteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *       example:
 *         message: Gerente atualizado com sucesso!
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *       example:
 *         error: Erro ao processar a solicitação.
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
 * /api/criarGerente:
 *   post:
 *     summary: Cria um novo gerente
 *     tags: [Gerentes]
 *     description: Cadastra um novo gerente no sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGerenteRequest'
 *     responses:
 *       201:
 *         description: Gerente cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateGerenteResponse'
 *       400:
 *         description: Dados de requisição inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *       409:
 *         description: Dados duplicados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/criarGerente", [extractUserID, requireProprietario], async (req, res) => {
    try {
        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, haras_id, foto} = req.body;

        if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !email || !telefone || !haras_id) {
            return res.status(400).json({error: "Todos os campos são obrigatórios."});
        }

        // Validações adicionais
        if (!validarCPF(cpf)) {
            return res.status(400).json({error: "CPF inválido."});
        }

        if (!validarEmail(email)) {
            return res.status(400).json({error: "Email inválido."});
        }

        if (!validarTelefone(telefone)) {
            return res.status(400).json({error: "Telefone inválido."});
        }

        // Verificar se o haras pertence ao proprietário logado
        const queryVerificaHaras = "SELECT COUNT(*) as count FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";
        const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [haras_id, req.user.id]);

        if (verificaHarasResults[0].count === 0) {
            return res.status(403).json({error: "Você não tem permissão para adicionar gerentes a este haras."});
        }

        const saltRounds = parseInt(process.env.SALT);
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        let results;
        if (foto) {
            const queryGerente = `
                INSERT INTO gerente (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id, foto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            [results] = await connection.promise().query(queryGerente, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, haras_id, foto]);
        } else {
            const queryGerente = `
                INSERT INTO gerente (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            [results] = await connection.promise().query(queryGerente, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, haras_id]);
        }

        res.status(201).json({message: "Gerente cadastrado com sucesso!", id: results.insertId});
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            if (err.message.includes('CPF')) {
                return res.status(409).json({error: "Este CPF já está cadastrado no sistema."});
            } else if (err.message.includes('Email')) {
                return res.status(409).json({error: "Este email já está cadastrado no sistema."});
            } else {
                return res.status(409).json({error: "Dados duplicados. Verifique se o CPF ou email já não estão cadastrados."});
            }
        }
        res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/editarGerente/{id}:
 *   put:
 *     summary: Atualiza um gerente existente
 *     tags: [Gerentes]
 *     description: Atualiza os dados de um gerente existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do gerente a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGerenteRequest'
 *     responses:
 *       200:
 *         description: Gerente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateGerenteResponse'
 *       400:
 *         description: Dados de requisição inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Gerente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dados duplicados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/editarGerente:
 *   put:
 *     summary: Atualiza os dados do gerente logado
 *     tags: [Gerentes]
 *     description: Permite que um gerente atualize seus próprios dados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGerenteRequest'
 *     responses:
 *       200:
 *         description: Gerente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateGerenteResponse'
 *       400:
 *         description: Dados de requisição inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Gerente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Dados duplicados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/editarGerente/:id", [extractUserID, requireProprietario], async (req, res) => {
    try {
        const userType = req.user.user;
        const userId = req.user.id; // ID do usuário logado
        const gerenteId = req.params.id;

        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, foto} = req.body;

        // Verificar se pelo menos um campo para atualização foi fornecido
        if (!nome && !sobrenome && !senha && !cpf && !dataNascimento && !telefone && !email && !foto) {
            return res.status(400).json({error: "Pelo menos um campo deve ser fornecido para atualização."});
        }

        // Validações adicionais para campos fornecidos
        if (cpf && !validarCPF(cpf)) {
            return res.status(400).json({error: "CPF inválido."});
        }

        if (email && !validarEmail(email)) {
            return res.status(400).json({error: "Email inválido."});
        }

        if (telefone && !validarTelefone(telefone)) {
            return res.status(400).json({error: "Telefone inválido."});
        }

        // Verificar se o gerente existe
        const queryVerificaGerente = `
            SELECT gerente.*, haras.fk_Proprietario_ID
            FROM gerente
                     JOIN haras ON gerente.fk_haras_id = haras.ID
            WHERE gerente.ID = ?
        `;
        const [gerenteResults] = await connection.promise().query(queryVerificaGerente, [gerenteId]);
        if (gerenteResults.length === 0) {
            return res.status(404).json({error: "Gerente não encontrado."});
        }

        const gerente = gerenteResults[0];
        // Proprietário só pode editar gerentes de seus próprios haras
        const harasId = gerente.fk_Haras_ID;
        const queryVerificaHaras = `SELECT COUNT(*) as count
                                    FROM haras
                                    WHERE id = ?
                                      AND fk_Proprietario_ID = ?`;
        const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [harasId, userId]);
        console.log(queryVerificaHaras, harasId, userId);
        if (verificaHarasResults[0].count === 0) {
            return res.status(403).json({error: "Você não tem permissão para editar gerentes deste haras."});
        }

        // Construir a query de atualização
        let updateFields = [];
        let queryParams = [];

        if (nome) {
            updateFields.push("nome = ?");
            queryParams.push(nome);
        }

        if (sobrenome) {
            updateFields.push("sobrenome = ?");
            queryParams.push(sobrenome);
        }

        if (senha) {
            const saltRounds = parseInt(process.env.SALT);
            const senhaHash = await bcrypt.hash(senha, saltRounds);
            updateFields.push("senha = ?");
            queryParams.push(senhaHash);
        }

        if (cpf) {
            updateFields.push("cpf = ?");
            queryParams.push(cpf);
        }

        if (dataNascimento) {
            updateFields.push("data_nascimento = ?");
            queryParams.push(dataNascimento);
        }

        if (telefone) {
            updateFields.push("telefone = ?");
            queryParams.push(telefone);
        }

        if (email) {
            updateFields.push("email = ?");
            queryParams.push(email);
        }

        if (foto) {
            updateFields.push("foto = ?");
            queryParams.push(foto);
        }

        // Adicionar o ID do gerente ao final dos parâmetros
        queryParams.push(gerenteId);

        const queryUpdateGerente = `
            UPDATE gerente
            SET ${updateFields.join(", ")}
            WHERE ID = ?
        `;

        await connection.promise().query(queryUpdateGerente, queryParams);

        res.status(200).json({message: "Gerente atualizado com sucesso!"});
    } catch (err) {
        console.error("Erro ao atualizar gerente:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Dados duplicados."});
        }
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

router.put("/editarGerente/", [extractUserID, requireGerente], async (req, res) => {
    try {
        const userType = req.user.user;
        const userId = req.user.id; // ID do usuário logado

        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, foto} = req.body;

        // Verificar se pelo menos um campo para atualização foi fornecido
        if (!nome && !sobrenome && !senha && !cpf && !dataNascimento && !telefone && !email && !foto) {
            return res.status(400).json({error: "Pelo menos um campo deve ser fornecido para atualização."});
        }

        // Validações adicionais para campos fornecidos
        if (cpf && !validarCPF(cpf)) {
            return res.status(400).json({error: "CPF inválido."});
        }

        if (email && !validarEmail(email)) {
            return res.status(400).json({error: "Email inválido."});
        }

        if (telefone && !validarTelefone(telefone)) {
            return res.status(400).json({error: "Telefone inválido."});
        }

        // Verificar se o gerente existe
        const queryVerificaGerente = `
            SELECT gerente.*, haras.fk_Proprietario_ID
            FROM gerente
                     JOIN haras ON gerente.fk_haras_id = haras.ID
            WHERE gerente.ID = ?
        `;
        const [gerenteResults] = await connection.promise().query(queryVerificaGerente, [userId]);
        if (gerenteResults.length === 0) {
            return res.status(404).json({error: "Gerente não encontrado."});
        }

        const gerente = gerenteResults[0];

        // Construir a query de atualização
        let updateFields = [];
        let queryParams = [];

        if (nome) {
            updateFields.push("nome = ?");
            queryParams.push(nome);
        }

        if (sobrenome) {
            updateFields.push("sobrenome = ?");
            queryParams.push(sobrenome);
        }

        if (senha) {
            const saltRounds = parseInt(process.env.SALT);
            const senhaHash = await bcrypt.hash(senha, saltRounds);
            updateFields.push("senha = ?");
            queryParams.push(senhaHash);
        }

        if (cpf) {
            updateFields.push("cpf = ?");
            queryParams.push(cpf);
        }

        if (dataNascimento) {
            updateFields.push("data_nascimento = ?");
            queryParams.push(dataNascimento);
        }

        if (telefone) {
            updateFields.push("telefone = ?");
            queryParams.push(telefone);
        }

        if (email) {
            updateFields.push("email = ?");
            queryParams.push(email);
        }

        if (foto) {
            updateFields.push("foto = ?");
            queryParams.push(foto);
        }

        // Adicionar o ID do gerente ao final dos parâmetros
        queryParams.push(userId);

        const queryUpdateGerente = `
            UPDATE gerente
            SET ${updateFields.join(", ")}
            WHERE ID = ?
        `;

        await connection.promise().query(queryUpdateGerente, queryParams);

        res.status(200).json({message: "Gerente atualizado com sucesso!"});
    } catch (err) {
        console.error("Erro ao atualizar gerente:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Dados duplicados."});
        }
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/gerentes/haras/{harasId}:
 *   get:
 *     summary: Lista todos os gerentes de um haras
 *     tags: [Gerentes]
 *     description: Retorna uma lista de todos os gerentes de um haras específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: harasId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do haras
 *     responses:
 *       200:
 *         description: Lista de gerentes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GerenteResponse'
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
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rota para obter todos os gerentes de um haras
router.get("/gerentes/haras/:harasId", extractUserID, async (req, res) => {
    try {
        const userType = req.user.user;
        const harasId = req.params.harasId;

        // Verificar se o usuário é um proprietário
        if (userType !== "proprietario") {
            return res.status(403).json({error: "Acesso negado. Somente proprietários podem listar gerentes."});
        }

        // Verificar se o haras pertence ao proprietário logado
        const queryVerificaHaras = "SELECT COUNT(*) as count FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";
        const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [harasId, req.user.id]);

        if (verificaHarasResults[0].count === 0) {
            return res.status(403).json({error: "Você não tem permissão para listar gerentes deste haras."});
        }

        // Buscar todos os gerentes do haras
        const queryGerentes = `
            SELECT ID,
                   nome,
                   sobrenome,
                   cpf,
                   data_nascimento,
                   telefone,
                   email,
                   fk_haras_id
            FROM gerente
            WHERE fk_haras_id = ?
        `;
        const [gerentes] = await connection.promise().query(queryGerentes, [harasId]);

        res.status(200).json(gerentes);
    } catch (err) {
        console.error("Erro ao listar gerentes:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/gerente/{id}:
 *   get:
 *     summary: Obtém um gerente pelo ID
 *     tags: [Gerentes]
 *     description: Retorna os dados de um gerente específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do gerente
 *     responses:
 *       200:
 *         description: Dados do gerente retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GerenteResponse'
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
 *         description: Gerente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Rota para obter um gerente pelo ID
router.get("/gerente/:id", extractUserID, async (req, res) => {
    try {
        const userType = req.user.user;
        const gerenteId = req.params.id;

        // Verificar se o gerente existe
        const queryVerificaGerente = `
            SELECT gerente.ID,
                   gerente.nome,
                   gerente.sobrenome,
                   gerente.cpf,
                   gerente.data_nascimento,
                   gerente.telefone,
                   gerente.email,
                   gerente.fk_haras_id,
                   haras.fk_Proprietario_ID,
                   haras.Nome as haras_nome
            FROM gerente
                     JOIN haras ON gerente.fk_haras_id = haras.ID
            WHERE gerente.ID = ?
        `;
        const [gerenteResults] = await connection.promise().query(queryVerificaGerente, [gerenteId]);

        if (gerenteResults.length === 0) {
            return res.status(404).json({error: "Gerente não encontrado."});
        }

        // Verificar permissões
        if (userType === "proprietario") {
            // Proprietário só pode ver gerentes de seus próprios haras
            if (gerenteResults[0].fk_Proprietario_ID !== req.user.id) {
                return res.status(403).json({error: "Você não tem permissão para visualizar este gerente."});
            }
        } else if (userType === "gerente") {
            // Gerente só pode ver a si mesmo
            if (parseInt(gerenteId) !== req.user.id) {
                return res.status(403).json({error: "Você não tem permissão para visualizar este gerente."});
            }
        } else {
            return res.status(403).json({error: "Acesso negado. Somente proprietários e gerentes podem visualizar gerentes."});
        }

        // Remover campos sensíveis
        delete gerenteResults[0].fk_Proprietario_ID;

        res.status(200).json(gerenteResults[0]);
    } catch (err) {
        console.error("Erro ao buscar gerente:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

module.exports = router;

