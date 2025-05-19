const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario, requireGerente, requireGerenteouProprietario, requireTratador} = require("../middleware/auth");
const bcrypt = require("bcrypt");
const {validarCPF, validarEmail, validarTelefone} = require("../utils/validations");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTratadorRequest:
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
 *           description: Nome do tratador
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do tratador
 *         senha:
 *           type: string
 *           description: Senha do tratador
 *         cpf:
 *           type: string
 *           description: CPF do tratador (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do tratador
 *         telefone:
 *           type: string
 *           description: Telefone do tratador (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do tratador (formato válido)
 *           example: "joao.silva@exemplo.com"
 *         haras_id:
 *           type: integer
 *           description: ID do haras ao qual o tratador será vinculado
 *         foto:
 *           type: string
 *           description: URL da foto do tratador (opcional)
 *       example:
 *         nome: João
 *         sobrenome: Silva
 *         senha: senha123
 *         cpf: "12345678901"
 *         dataNascimento: "1990-01-01"
 *         telefone: "11987654321"
 *         email: joao.silva@exemplo.com
 *         haras_id: 1
 *         foto: "https://exemplo.com/foto.jpg"
 *
 *     UpdateTratadorRequest:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do tratador
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do tratador
 *         senha:
 *           type: string
 *           description: Senha do tratador
 *         cpf:
 *           type: string
 *           description: CPF do tratador (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do tratador
 *         telefone:
 *           type: string
 *           description: Telefone do tratador (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do tratador (formato válido)
 *           example: "joao.atualizado@exemplo.com"
 *         foto:
 *           type: string
 *           description: URL da foto do tratador
 *       example:
 *         nome: João Atualizado
 *         sobrenome: Silva Santos
 *         telefone: "11999999999"
 *         email: joao.atualizado@exemplo.com
 *         foto: "https://exemplo.com/nova-foto.jpg"
 *
 *     TratadorResponse:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: ID do tratador
 *         nome:
 *           type: string
 *           description: Nome do tratador
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do tratador
 *         cpf:
 *           type: string
 *           description: CPF do tratador
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do tratador
 *         telefone:
 *           type: string
 *           description: Telefone do tratador
 *         email:
 *           type: string
 *           description: Email do tratador
 *         fk_haras_id:
 *           type: integer
 *           description: ID do haras ao qual o tratador está vinculado
 *         haras_nome:
 *           type: string
 *           description: Nome do haras ao qual o tratador está vinculado
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
 *     CreateTratadorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *         id:
 *           type: integer
 *           description: ID do tratador cadastrado
 *       example:
 *         message: Tratador cadastrado com sucesso!
 *         id: 1
 *
 *     UpdateTratadorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *       example:
 *         message: Tratador atualizado com sucesso!
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
 * /api/tratador:
 *   post:
 *     summary: Cria um novo tratador
 *     tags: [Tratadores]
 *     description: Cadastra um novo tratador no sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTratadorRequest'
 *     responses:
 *       201:
 *         description: Tratador cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTratadorResponse'
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
router.post("/tratador", [extractUserID, requireGerenteouProprietario], async (req, res) => {
    try {
        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, foto} = req.body;
        let {haras_id} = req.body;
        // Verifica se o usuário logado é um gerente e se o haras_id foi fornecido
        if (req.user.user === "gerente") {
            haras_id = req.user.harasId; // Usa o haras_id do gerente logado
        }
        console.log(haras_id);
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
        let verificaHarasResults;
        if (req.user.user === "proprietario") {
            // Verificar se o haras pertence ao proprietário logado
            const queryVerificaHaras = "SELECT COUNT(*) as count FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";

            [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [haras_id, req.user.id]);

            if (verificaHarasResults[0].count === 0) {
                return res.status(403).json({error: "Você não tem permissão para adicionar tratadores a este haras."});
            }
        }

        const saltRounds = parseInt(process.env.SALT);
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        let results;
        if (foto) {
            const queryTratador = `
                INSERT INTO tratador (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id, foto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            [results] = await connection.promise().query(queryTratador, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, crmv, haras_id, foto]);
        } else {
            const queryTratador = `
                INSERT INTO tratador (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_haras_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            [results] = await connection.promise().query(queryTratador, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, haras_id]);
        }

        res.status(201).json({message: "Tratador cadastrado com sucesso!", id: results.insertId});
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
 * /api/tratador/{id}:
 *   put:
 *     summary: Atualiza um tratador existente
 *     tags: [Tratadores]
 *     description: Atualiza os dados de um tratador existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tratador a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTratadorRequest'
 *     responses:
 *       200:
 *         description: Tratador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTratadorResponse'
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
 *         description: Tratador não encontrado
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
router.put("/tratador/:id", [extractUserID, requireGerenteouProprietario], async (req, res) => {
    try {
        const userType = req.user.user;
        const userId = req.user.id; // ID do usuário logado
        const tratadorId = req.params.id;

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

        // Verificar se o Tratador existe
        const queryVerificaTratador = `
            SELECT tratador.*, haras.fk_Proprietario_ID
            FROM tratador
                     JOIN haras ON tratador.fk_haras_id = haras.ID
            WHERE tratador.ID = ?
        `;
        const [tratadorResults] = await connection.promise().query(queryVerificaTratador, [tratadorId]);
        if (tratadorResults.length === 0) {
            return res.status(404).json({error: "Tratador não encontrado."});
        }
        const tratador = tratadorResults[0];
        if (userType === "proprietario") {
            // Proprietário só pode editar tratadores de seus próprios haras
            const harasId = tratador.fk_Haras_ID;
            const queryVerificaHaras = `SELECT COUNT(*) as count
                                    FROM haras
                                    WHERE id = ?
                                      AND fk_Proprietario_ID = ?`;
            const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [harasId, userId]);
            console.log(queryVerificaHaras, harasId, userId);
            if (verificaHarasResults[0].count === 0) {
                return res.status(403).json({error: "Você não tem permissão para editar tratadores deste haras."});
            }
        }
        if (userType === "gerente") {
            if (tratador.fk_Haras_ID !== req.user.haras_id) {
                return res.status(403).json({error: "Você não tem permissão para editar tratadores de outros haras."});
            }
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

        // Adicionar o ID do tratador ao final dos parâmetros
        queryParams.push(tratadorId);

        const queryUpdateTratador = `
            UPDATE tratador
            SET ${updateFields.join(", ")}
            WHERE ID = ?
        `;

        await connection.promise().query(queryUpdateTratador, queryParams);

        res.status(200).json({message: "Tratador atualizado com sucesso!"});
    } catch (err) {
        console.error("Erro ao atualizar tratador:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Dados duplicados."});
        }
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

router.put("/tratador/", [extractUserID, requireTratador], async (req, res) => {
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

        // Verificar se o tratador existe
        const queryVerificaTratador = `
            SELECT tratador.*, haras.fk_Proprietario_ID
            FROM tratador
                     JOIN haras ON tratador.fk_haras_id = haras.ID
            WHERE tratador.ID = ?
        `;
        const [tratadorResults] = await connection.promise().query(queryVerificaTratador, [userId]);
        if (tratadorResults.length === 0) {
            return res.status(404).json({error: "Tratador não encontrado."});
        }

        const tratador = tratadorResults[0];

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

        // Adicionar o ID do tratador ao final dos parâmetros
        queryParams.push(userId);

        const queryUpdateTratador = `
            UPDATE tratador
            SET ${updateFields.join(", ")}
            WHERE ID = ?
        `;

        await connection.promise().query(queryUpdateTratador, queryParams);

        res.status(200).json({message: "Tratador atualizado com sucesso!"});
    } catch (err) {
        console.error("Erro ao atualizar veterinário:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Dados duplicados."});
        }
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/tratadores/haras/{harasId}:
 *   get:
 *     summary: Lista todos os tratadores de um haras
 *     tags: [Tratadores]
 *     description: Retorna uma lista de todos os tratadores de um haras específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: harasId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do haras
 *       - in: query
 *         name: pesquisa
 *         schema:
 *           type: string
 *         description: Termo de pesquisa para filtrar tratadores
 *     responses:
 *       200:
 *         description: Lista de tratadores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TratadorResponse'
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
// Rota para obter todos os tratadores de um haras (com filtros)
router.get("/tratadores/haras/:harasId", [extractUserID, requireProprietario], async (req, res) => {
    try {
        const userType = req.user.user;
        const harasId = req.params.harasId;

        const queryVerificaHaras = "SELECT COUNT(*) as count FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";
        const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [harasId, req.user.id]);

        if (verificaHarasResults[0].count === 0) {
            return res.status(403).json({error: "Você não tem permissão para listar tratadores deste haras."});
        }

        // Filtros de pesquisa
        const {pesquisa} = req.query;
        let whereClauses = [];
        let params = [harasId];

        whereClauses.push("nome LIKE ?");

        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("sobrenome LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("email LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("telefone LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("cpf LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        const queryTratadores = `
            SELECT ID,
                   nome,
                   sobrenome,
                   cpf,
                   data_nascimento,
                   telefone,
                   email,
                   fk_haras_id
            FROM tratador
            WHERE fk_haras_id = ? AND (${whereClauses.join(" OR ")})
        `;


        const [tratadores] = await connection.promise().query(queryTratadores, params);
        console.log(tratadores);
        res.status(200).json(tratadores);
    } catch (err) {
        console.error("Erro ao listar tratadores:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

// Rota para obter todos os tratadores de um haras (com filtros)
router.get("/tratadores/haras/", [extractUserID, requireGerente], async (req, res) => {
    try {
        const harasId = req.user.haras_id
        // Filtros de pesquisa
        const {pesquisa} = req.query;
        let whereClauses = [];
        let params = [harasId];

        whereClauses.push("nome LIKE ?");

        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("sobrenome LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("email LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("telefone LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        whereClauses.push("cpf LIKE ?");
        params.push(`%${pesquisa ? pesquisa : ""}%`);
        const queryTratadores = `
            SELECT ID,
                   nome,
                   sobrenome,
                   cpf,
                   data_nascimento,
                   telefone,
                   email,
                   fk_haras_id
            FROM tratador
            WHERE fk_haras_id = ? AND (${whereClauses.join(" OR ")})
        `;
        const [tratadores] = await connection.promise().query(queryTratadores, params);
        res.status(200).json(tratadores);
    } catch (err) {
        console.error("Erro ao listar tratadores:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/tratador/{id}:
 *   get:
 *     summary: Obtém um tratador pelo ID
 *     tags: [Tratadores]
 *     description: Retorna os dados de um tratador específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tratador
 *     responses:
 *       200:
 *         description: Dados do tratador retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TratadorResponse'
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
 *         description: Tratador não encontrado
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
// Rota para obter um tratador pelo ID
router.get("/tratador/:id", extractUserID, async (req, res) => {
    try {
        const userType = req.user.user;
        const tratadorId = req.params.id;

        // Verificar se o tratador existe
        const queryVerificaTratador = `
            SELECT tratador.ID,
                   tratador.nome,
                   tratador.sobrenome,
                   tratador.cpf,
                   tratador.data_nascimento,
                   tratador.telefone,
                   tratador.email,
                   tratador.fk_haras_id,
                   haras.fk_Proprietario_ID,
                   haras.Nome as haras_nome
            FROM tratador
                     JOIN haras ON tratador.fk_haras_id = haras.ID
            WHERE tratador.ID = ?
        `;
        const [tratadorResults] = await connection.promise().query(queryVerificaTratador, [tratadorId]);

        if (tratadorResults.length === 0) {
            return res.status(404).json({error: "Tratador não encontrado."});
        }
        // Verificar permissões
        if (userType === "proprietario") {
            // Proprietário só pode ver veterinários de seus próprios haras
            if (tratadorResults[0].fk_Proprietario_ID !== req.user.id) {
                return res.status(403).json({error: "Você não tem permissão para visualizar este tratador."});
            }
        } else {
            if (tratadorResults[0].fk_Haras_ID !== req.user.haras_id) {
                return res.status(403).json({error: "Você não tem permissão para visualizar este tratador."});
            }
        }
        // Remover campos sensíveis
        delete tratadorResults[0].fk_Proprietario_ID;

        res.status(200).json(tratadorResults[0]);
    } catch (err) {
        console.error("Erro ao buscar tratador:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

module.exports = router;