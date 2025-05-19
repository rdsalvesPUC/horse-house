const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario, requireGerente, requireVeterinario, requireGerenteouProprietario} = require("../middleware/auth");
const bcrypt = require("bcrypt");
const {validarCPF, validarEmail, validarTelefone} = require("../utils/validations");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVeterinarioRequest:
 *       type: object
 *       required:
 *         - nome
 *         - sobrenome
 *         - senha
 *         - cpf
 *         - dataNascimento
 *         - telefone
 *         - email
 *         - crmv
 *         - haras_id
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do veterinário
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do veterinário
 *         senha:
 *           type: string
 *           description: Senha do veterinário
 *         cpf:
 *           type: string
 *           description: CPF do veterinário (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do veterinário
 *         telefone:
 *           type: string
 *           description: Telefone do veterinário (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do veterinário (formato válido)
 *           example: "joao.silva@exemplo.com"
 *         crmv:
 *           type: string
 *           description: CRMV do veterinário
 *         haras_id:
 *           type: integer
 *           description: ID do haras ao qual o veterinário será vinculado
 *         foto:
 *           type: string
 *           description: URL da foto do veterinário (opcional)
 *       example:
 *         nome: João
 *         sobrenome: Silva
 *         senha: senha123
 *         cpf: "12345678901"
 *         dataNascimento: "1990-01-01"
 *         telefone: "11987654321"
 *         email: joao.silva@exemplo.com
 *         crmv: "12345-SP"
 *         haras_id: 1
 *         foto: "https://exemplo.com/foto.jpg"
 *
 *     UpdateVeterinarioRequest:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do veterinário
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do veterinário
 *         senha:
 *           type: string
 *           description: Senha do veterinário
 *         cpf:
 *           type: string
 *           description: CPF do veterinário (11 dígitos numéricos, válido)
 *           pattern: '^\d{11}$'
 *           example: "12345678901"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do veterinário
 *         telefone:
 *           type: string
 *           description: Telefone do veterinário (10 ou 11 dígitos numéricos, com DDD válido)
 *           pattern: '^\d{10,11}$'
 *           example: "11987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do veterinário (formato válido)
 *           example: "joao.atualizado@exemplo.com"
 *         crmv:
 *           type: string
 *           description: CRMV do veterinário
 *         foto:
 *           type: string
 *           description: URL da foto do veterinário
 *       example:
 *         nome: João Atualizado
 *         sobrenome: Silva Santos
 *         telefone: "11999999999"
 *         email: joao.atualizado@exemplo.com
 *         crmv: "54321-SP"
 *         foto: "https://exemplo.com/nova-foto.jpg"
 *
 *     VeterinarioResponse:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: ID do veterinário
 *         nome:
 *           type: string
 *           description: Nome do veterinário
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do veterinário
 *         cpf:
 *           type: string
 *           description: CPF do veterinário
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do veterinário
 *         telefone:
 *           type: string
 *           description: Telefone do veterinário
 *         email:
 *           type: string
 *           description: Email do veterinário
 *         crmv:
 *           type: string
 *           description: CRMV do veterinário
 *         fk_haras_id:
 *           type: integer
 *           description: ID do haras ao qual o veterinário está vinculado
 *         haras_nome:
 *           type: string
 *           description: Nome do haras ao qual o veterinário está vinculado
 *       example:
 *         ID: 1
 *         nome: João
 *         sobrenome: Silva
 *         cpf: "12345678901"
 *         data_nascimento: "1990-01-01"
 *         telefone: "11987654321"
 *         email: joao.silva@exemplo.com
 *         crmv: "12345-SP"
 *         fk_haras_id: 1
 *         haras_nome: Haras Bela Vista
 *
 *     CreateVeterinarioResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *         id:
 *           type: integer
 *           description: ID do veterinário cadastrado
 *       example:
 *         message: Veterinário cadastrado com sucesso!
 *         id: 1
 *
 *     UpdateVeterinarioResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *       example:
 *         message: Veterinário atualizado com sucesso!
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
 * /api/veterinario:
 *   post:
 *     summary: Cria um novo veterinário
 *     tags: [Veterinários]
 *     description: Cadastra um novo veterinário no sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVeterinarioRequest'
 *     responses:
 *       201:
 *         description: Veterinário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateVeterinarioResponse'
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
router.post("/veterinario", [extractUserID, requireGerenteouProprietario], async (req, res) => {
    try {
        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, crmv, foto} = req.body;
        let {haras_id} = req.body;
        // Verifica se o usuário logado é um gerente e se o haras_id foi fornecido
        if (req.user.user === "gerente") {
            haras_id = req.user.harasId; // Usa o haras_id do gerente logado
        }
        console.log(haras_id);
        if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !email || !telefone || !crmv || !haras_id) {
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
                return res.status(403).json({error: "Você não tem permissão para adicionar veterinários a este haras."});
            }
        }

        const saltRounds = parseInt(process.env.SALT);
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        let results;
        if (foto) {
            const queryVeterinario = `
                INSERT INTO veterinario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, crmv, fk_haras_id, foto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            [results] = await connection.promise().query(queryVeterinario, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, crmv, haras_id, foto]);
        } else {
            const queryVeterinario = `
                INSERT INTO veterinario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, crmv, fk_haras_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            [results] = await connection.promise().query(queryVeterinario, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, crmv, haras_id]);
        }

        res.status(201).json({message: "Veterinário cadastrado com sucesso!", id: results.insertId});
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
 * /api/veterinario/{id}:
 *   put:
 *     summary: Atualiza um veterinário existente
 *     tags: [Veterinários]
 *     description: Atualiza os dados de um veterinário existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do veterinário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVeterinarioRequest'
 *     responses:
 *       200:
 *         description: Veterinário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateVeterinarioResponse'
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
 *         description: Veterinário não encontrado
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
router.put("/veterinario/:id", [extractUserID, requireGerenteouProprietario], async (req, res) => {
    try {
        const userType = req.user.user;
        const userId = req.user.id; // ID do usuário logado
        const veterinarioId = req.params.id;

        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, foto, crmv} = req.body;

        // Verificar se pelo menos um campo para atualização foi fornecido
        if (!nome && !sobrenome && !senha && !cpf && !dataNascimento && !telefone && !email && !foto && !crmv) {
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

        // Verificar se o veterinário existe
        const queryVerificaVeterinario = `
            SELECT veterinario.*, haras.fk_Proprietario_ID
            FROM veterinario
                     JOIN haras ON veterinario.fk_haras_id = haras.ID
            WHERE veterinario.ID = ?
        `;
        const [veterinarioResults] = await connection.promise().query(queryVerificaVeterinario, [veterinarioId]);
        if (veterinarioResults.length === 0) {
            return res.status(404).json({error: "Veterinário não encontrado."});
        }
        const veterinario = veterinarioResults[0];
        if (userType === "proprietario") {
            // Proprietário só pode editar veterinários de seus próprios haras
            const harasId = veterinario.fk_Haras_ID;
            const queryVerificaHaras = `SELECT COUNT(*) as count
                                    FROM haras
                                    WHERE id = ?
                                      AND fk_Proprietario_ID = ?`;
            const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [harasId, userId]);
            console.log(queryVerificaHaras, harasId, userId);
            if (verificaHarasResults[0].count === 0) {
                return res.status(403).json({error: "Você não tem permissão para editar veterinários deste haras."});
            }
        }
        if (userType === "gerente") {
            if (veterinario.fk_Haras_ID !== req.user.haras_id) {
                return res.status(403).json({error: "Você não tem permissão para editar veterinários de outros haras."});
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
        if (crmv) {
            updateFields.push("crmv = ?");
            queryParams.push(crmv);
        }

        // Adicionar o ID do veterinário ao final dos parâmetros
        queryParams.push(veterinarioId);

        const queryUpdateVeterinario = `
            UPDATE veterinario
            SET ${updateFields.join(", ")}
            WHERE ID = ?
        `;

        await connection.promise().query(queryUpdateVeterinario, queryParams);

        res.status(200).json({message: "Veterinário atualizado com sucesso!"});
    } catch (err) {
        console.error("Erro ao atualizar veterinário:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Dados duplicados."});
        }
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

router.put("/veterinario/", [extractUserID, requireVeterinario], async (req, res) => {
    try {
        const userType = req.user.user;
        const userId = req.user.id; // ID do usuário logado

        const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, crvm, foto} = req.body;

        // Verificar se pelo menos um campo para atualização foi fornecido
        if (!nome && !sobrenome && !senha && !cpf && !dataNascimento && !telefone && !email && !foto && !crvm) {
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

        // Verificar se o veterinário existe
        const queryVerificaVeterinario = `
            SELECT veterinario.*, haras.fk_Proprietario_ID
            FROM veterinario
                     JOIN haras ON veterinario.fk_haras_id = haras.ID
            WHERE veterinario.ID = ?
        `;
        const [veterinarioResults] = await connection.promise().query(queryVerificaVeterinario, [userId]);
        if (veterinarioResults.length === 0) {
            return res.status(404).json({error: "Veterinário não encontrado."});
        }

        const veterinario = veterinarioResults[0];

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

        if (crvm) {
            updateFields.push("crmv = ?");
            queryParams.push(crvm);
        }

        if (foto) {
            updateFields.push("foto = ?");
            queryParams.push(foto);
        }

        // Adicionar o ID do veterinário ao final dos parâmetros
        queryParams.push(userId);

        const queryUpdateVeterinario = `
            UPDATE veterinario
            SET ${updateFields.join(", ")}
            WHERE ID = ?
        `;

        await connection.promise().query(queryUpdateVeterinario, queryParams);

        res.status(200).json({message: "Veterinário atualizado com sucesso!"});
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
 * /api/veterinarios/haras/{harasId}:
 *   get:
 *     summary: Lista todos os veterinários de um haras
 *     tags: [Veterinários]
 *     description: Retorna uma lista de todos os veterinários de um haras específico
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
 *         description: Termo de pesquisa para filtrar veterinários
 *     responses:
 *       200:
 *         description: Lista de veterinários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VeterinarioResponse'
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
// Rota para obter todos os veterinários de um haras (com filtros)
router.get("/veterinarios/haras/:harasId", [extractUserID, requireProprietario], async (req, res) => {
    try {
        const userType = req.user.user;
        const harasId = req.params.harasId;

        const queryVerificaHaras = "SELECT COUNT(*) as count FROM haras WHERE id = ? AND fk_Proprietario_ID = ?";
        const [verificaHarasResults] = await connection.promise().query(queryVerificaHaras, [harasId, req.user.id]);

        if (verificaHarasResults[0].count === 0) {
            return res.status(403).json({error: "Você não tem permissão para listar veterinários deste haras."});
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
        const queryVeterinarios = `
            SELECT ID,
                   nome,
                   sobrenome,
                   cpf,
                   data_nascimento,
                   telefone,
                   email,
                   fk_haras_id
            FROM veterinario
            WHERE fk_haras_id = ? AND (${whereClauses.join(" OR ")})
        `;


        const [veterinarios] = await connection.promise().query(queryVeterinarios, params);
        console.log(veterinarios);
        res.status(200).json(veterinarios);
    } catch (err) {
        console.error("Erro ao listar veterinários:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

// Rota para obter todos os veterinários de um haras (com filtros)
router.get("/veterinarios/haras/", [extractUserID, requireGerente], async (req, res) => {
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
        const queryVeterinarios = `
            SELECT ID,
                   nome,
                   sobrenome,
                   cpf,
                   data_nascimento,
                   telefone,
                   email,
                   fk_haras_id
            FROM veterinario
            WHERE fk_haras_id = ? AND (${whereClauses.join(" OR ")})
        `;
        const [veterinarios] = await connection.promise().query(queryVeterinarios, params);
        res.status(200).json(veterinarios);
    } catch (err) {
        console.error("Erro ao listar veterinários:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/veterinario/{id}:
 *   get:
 *     summary: Obtém um veterinário pelo ID
 *     tags: [Veterinários]
 *     description: Retorna os dados de um veterinário específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do veterinário
 *     responses:
 *       200:
 *         description: Dados do veterinário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VeterinarioResponse'
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
 *         description: Veterinário não encontrado
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
// Rota para obter um veterinário pelo ID
router.get("/veterinario/:id", extractUserID, async (req, res) => {
    try {
        const userType = req.user.user;
        const veterinarioId = req.params.id;

        // Verificar se o veterinário existe
        const queryVerificaVeterinario = `
            SELECT veterinario.ID,
                   veterinario.nome,
                   veterinario.sobrenome,
                   veterinario.cpf,
                   veterinario.data_nascimento,
                   veterinario.telefone,
                   veterinario.email,
                   veterinario.fk_haras_id,
                   haras.fk_Proprietario_ID,
                   haras.Nome as haras_nome
            FROM veterinario
                     JOIN haras ON veterinario.fk_haras_id = haras.ID
            WHERE veterinario.ID = ?
        `;
        const [veterinarioResults] = await connection.promise().query(queryVerificaVeterinario, [veterinarioId]);

        if (veterinarioResults.length === 0) {
            return res.status(404).json({error: "Veterinário não encontrado."});
        }
        // Verificar permissões
        if (userType === "proprietario") {
            // Proprietário só pode ver veterinários de seus próprios haras
            if (veterinarioResults[0].fk_Proprietario_ID !== req.user.id) {
                return res.status(403).json({error: "Você não tem permissão para visualizar este veterinário."});
            }
        } else {
            if (veterinarioResults[0].fk_Haras_ID !== req.user.haras_id) {
                return res.status(403).json({error: "Você não tem permissão para visualizar este veterinário."});
            }
        }
        // Remover campos sensíveis
        delete veterinarioResults[0].fk_Proprietario_ID;

        res.status(200).json(veterinarioResults[0]);
    } catch (err) {
        console.error("Erro ao buscar veterinário:", err);
        return res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

module.exports = router;

