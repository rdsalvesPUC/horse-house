const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario, requireGerenteouProprietario} = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCavaloRequest:
 *       type: object
 *       required:
 *         - nome
 *         - data_nascimento
 *         - peso
 *         - sexo
 *         - pelagem
 *         - sangue
 *         - situacao
 *         - status
 *         - registro
 *         - cert
 *         - imp
 *         - haras_id
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do cavalo
 *         data_nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do cavalo
 *         peso:
 *           type: number
 *           description: Peso do cavalo em kg
 *         sexo:
 *           type: string
 *           description: Sexo do cavalo (Macho/Fêmea)
 *         pelagem:
 *           type: string
 *           description: Pelagem do cavalo
 *         sangue:
 *           type: string
 *           description: Tipo sanguíneo do cavalo
 *         situacao:
 *           type: string
 *           description: Situação atual do cavalo
 *         status:
 *           type: string
 *           description: Status do cavalo
 *         registro:
 *           type: string
 *           description: Número de registro do cavalo
 *         cert:
 *           type: string
 *           description: Certificado do cavalo
 *         imp:
 *           type: string
 *           description: IMP do cavalo
 *         foto:
 *           type: blob
 *           description: foto do cavalo
 *         haras_id:
 *           type: integer
 *           description: ID do haras ao qual o cavalo pertence
 *       example:
 *         nome: "Pé de Pano"
 *         data_nascimento: "2020-05-15"
 *         peso: 450
 *         sexo: "Macho"
 *         pelagem: "Alazão"
 *         sangue: "Puro Sangue"
 *         situacao: "Ativo"
 *         status: "Em treinamento"
 *         registro: "12345"
 *         cert: "CERT123"
 *         imp: "IMP456"
 *         foto: "foto do cavalo"
 *         haras_id: 1
 */

/**
 * @swagger
 * /api/cavalos/criar:
 *   post:
 *     summary: Cria um novo cavalo
 *     tags: [Cavalos]
 *     description: Cadastra um novo cavalo no sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCavaloRequest'
 *     responses:
 *       201:
 *         description: Cavalo cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *               example:
 *                 message: Cavalo cadastrado com sucesso!
 *                 id: 1
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
 *       409:
 *         description: Conflito de dados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalo já cadastrado.
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
 *                 error: Erro ao criar o cavalo.
 */
router.post("/cavalos/criar", [extractUserID, requireProprietario], async (req, res) => {
    const {nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, foto, haras_id} = req.body;

    if (!nome || !data_nascimento || !peso || !sexo || !pelagem || !sangue || !registro || !cert || !imp || !haras_id || !situacao || !status) {
        return res.status(400).json({error: "Todos os campos são obrigatórios."});
    }
    if (foto) {
        try {
            const query = `INSERT INTO cavalo (Nome, Data_Nascimento, Peso, Sexo, Pelagem, Sangue, Situacao, Status, Registro, CERT, IMP, Foto, fk_Proprietario_ID, fk_Haras_ID)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [results] = await connection.promise().query(query, [nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, foto, req.user.id, haras_id])
            return res.status(201).json({message: "Cavalo cadastrado com sucesso!", id: results.insertId});
        } catch (err) {
            console.error("Erro ao inserir o cavalo:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({error: "Cavalo já cadastrado."});
            }
            return res.status(500).json({error: "Erro ao criar o cavalo."});
        }
    }
    try {
        const query = `INSERT INTO cavalo (Nome, Data_Nascimento, Peso, Sexo, Pelagem, Sangue, Situacao, Status, Registro, CERT, IMP, fk_Proprietario_ID, fk_Haras_ID)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [results] = await connection.promise().query(query, [nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, req.user.id, haras_id])
        return res.status(201).json({message: "Cavalo cadastrado com sucesso!", id: results.insertId});
    } catch (err) {
        console.log("Erro ao inserir o cavalo:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Cavalo já cadastrado."});
        }
        return res.status(500).json({error: "Erro ao criar o cavalo."});
    }
})

/**
 * @swagger
 * /api/cavalos/haras/{harasID}:
 *   get:
 *     summary: Lista cavalos de um haras específico
 *     tags: [Cavalos]
 *     description: Retorna todos os cavalos associados a um haras específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: harasID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do haras
 *     responses:
 *       200:
 *         description: Lista de cavalos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cavalo'
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
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Acesso não autorizado.
 *       404:
 *         description: Cavalos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalos não encontrados.
 */
router.get("/cavalos/haras/:harasID", [extractUserID], async (req, res) => {
    const {harasID} = req.params;
    if (req.user.user === "proprietario") {
        const query = `SELECT *
                       FROM cavalo
                       WHERE fk_Proprietario_ID = ?
                         AND fk_Haras_ID = ?`;
        const [results] = await connection.promise().query(query, [req.user.id, harasID]);
        if (results.length === 0) {
            return res.status(404).json({error: "Cavalos não encontrados."});
        }
        return res.status(200).json(results);
    }
    // Se o usuário não for proprietário, verifica o fk_Haras_ID
    if (req.user.harasId == harasID) {
        const query = `SELECT *
                       FROM cavalo
                       WHERE fk_Haras_ID = ?`;
        const [results] = await connection.promise().query(query, [harasID]);
        if (results.length === 0) {
            return res.status(404).json({error: "Cavalos não encontrados."});
        }
        return res.status(200).json(results);
    }
    return res.status(403).json({error: "Acesso não autorizado."});
})

/**
 * @swagger
 * /api/cavalos/id/{id}:
 *   get:
 *     summary: Obtém detalhes de um cavalo específico
 *     tags: [Cavalos]
 *     description: Retorna os detalhes de um cavalo pelo seu ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cavalo
 *     responses:
 *       200:
 *         description: Detalhes do cavalo retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cavalo'
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
 *         description: Cavalo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalo não encontrado.
 */
router.get("/cavalos/id/:id", extractUserID, async (req, res) => {
    const {id} = req.params;
    if (req.user.user === "proprietario") {
        const query = `SELECT *
                       FROM cavalo
                       WHERE ID = ?
                         AND fk_Proprietario_ID = ?`;
        const [results] = await connection.promise().query(query, [id, req.user.id]);
        if (results.length === 0) {
            return res.status(404).json({error: "Cavalo não encontrado."});
        }
        return res.status(200).json(results[0]);
    } else{
        const query = `SELECT *
                       FROM cavalo
                       WHERE ID = ?
                         AND fk_Haras_ID = ?`;
        const [results] = await connection.promise().query(query, [id, req.user.harasId]);
        if (results.length === 0) {
            return res.status(404).json({error: "Cavalo não encontrado."});
        }
        return res.status(200).json(results[0]);
    }
})

/**
 * @swagger
 * /api/cavalos/dono:
 *   get:
 *     summary: Lista cavalos do proprietário
 *     tags: [Cavalos]
 *     description: Retorna todos os cavalos pertencentes ao proprietário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cavalos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cavalo'
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
 *         description: Cavalos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalos não encontrados.
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
 *                 error: Erro ao buscar cavalos.
 */
router.get("/cavalos/dono", [extractUserID, requireProprietario], async (req, res) => {
    try{
        const query = `SELECT *
                       FROM cavalo
                       WHERE fk_Proprietario_ID = ?`;
        const [results] = await connection.promise().query(query, [req.user.id]);
        if (results.length === 0) {
            return res.status(404).json({error: "Cavalos não encontrados."});
        }
        return res.status(200).json(results);
    } catch (err) {
        console.error("Erro ao buscar cavalos:", err);
        return res.status(500).json({error: "Erro ao buscar cavalos."});
    }
});

/**
 * @swagger
 * /api/deleteCavalos/{id}:
 *   delete:
 *     summary: Exclui um cavalo
 *     tags: [Cavalos]
 *     description: Remove um cavalo do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cavalo
 *     responses:
 *       200:
 *         description: Cavalo excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Cavalo deletado com sucesso.
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
 *         description: Cavalo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalo não encontrado.
 */
router.delete("/deleteCavalos/:id", extractUserID, requireGerenteouProprietario, async (req, res) => {
    const {id} = req.params;
    if (req.user.user === "proprietario") {
        const query = `DELETE
                       FROM cavalo
                       WHERE ID = ?
                         AND fk_Proprietario_ID = ?`;
        const [results] = await connection.promise().query(query, [id, req.user.id]);
        if (results.affectedRows === 0) {
            return res.status(404).json({error: "Cavalo não encontrado."});
        }
        return res.status(200).json({message: "Cavalo deletado com sucesso."});
    }
    // Se o usuário for gerente, verifica o fk_Haras_ID
    const query = `DELETE
                   FROM cavalo
                   WHERE ID = ?
                     AND fk_Haras_ID = ?`;
    const [results] = await connection.promise().query(query, [id, req.user.harasId]);
    if (results.affectedRows === 0) {
        return res.status(404).json({error: "Cavalo não encontrado."});
    }
    return res.status(200).json({message: "Cavalo deletado com sucesso."});
})

/**
 * @swagger
 * /api/Cavalos/editar/{id}:
 *   put:
 *     summary: Atualiza dados de um cavalo
 *     tags: [Cavalos]
 *     description: Atualiza as informações de um cavalo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cavalo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do cavalo
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento do cavalo
 *               peso:
 *                 type: number
 *                 description: Peso do cavalo em kg
 *               sexo:
 *                 type: string
 *                 description: Sexo do cavalo
 *               pelagem:
 *                 type: string
 *                 description: Pelagem do cavalo
 *               sangue:
 *                 type: string
 *                 description: Tipo sanguíneo do cavalo
 *               situacao:
 *                 type: string
 *                 description: Situação atual do cavalo
 *               status:
 *                 type: string
 *                 description: Status do cavalo
 *               registro:
 *                 type: string
 *                 description: Número de registro do cavalo
 *               cert:
 *                 type: string
 *                 description: Certificado do cavalo
 *               imp:
 *                 type: string
 *                 description: IMP do cavalo
 *               foto:
 *                 type: blob
 *                 description: foto do cavalo
 *     responses:
 *       200:
 *         description: Cavalo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Cavalo atualizado com sucesso.
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
 *                 error: Pelo menos um campo deve ser fornecido para atualização.
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
 *         description: Cavalo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalo não encontrado.
 *       409:
 *         description: Conflito de dados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: Cavalo já cadastrado.
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
 *                 error: Erro ao atualizar o cavalo.
 */
router.put("/Cavalos/editar/:id", extractUserID, requireGerenteouProprietario, async (req, res) => {
    const {id} = req.params;
    const {nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, foto} = req.body;
    if (!nome && !data_nascimento && !peso && !sexo && !pelagem && !sangue && !situacao && !status && !registro && !cert && !imp) {
        return res.status(400).json({error: "Pelo menos um campo deve ser fornecido para atualização."});
    }
    let queryFields = [];
    let queryParams = [];

    if (nome) {
        queryFields.push("Nome = ?");
        queryParams.push(nome);
    }
    if (data_nascimento) {
        queryFields.push("Data_Nascimento = ?");
        queryParams.push(data_nascimento);
    }
    if (peso) {
        queryFields.push("Peso = ?");
        queryParams.push(peso);
    }
    if (sexo) {
        queryFields.push("Sexo = ?");
        queryParams.push(sexo);
    }
    if (pelagem) {
        queryFields.push("Pelagem = ?");
        queryParams.push(pelagem);
    }
    if (sangue) {
        queryFields.push("Sangue = ?");
        queryParams.push(sangue);
    }
    if (situacao) {
        queryFields.push("Situacao = ?");
        queryParams.push(situacao);
    }
    if (status) {
        queryFields.push("Status = ?");
        queryParams.push(status);
    }
    if (registro) {
        queryFields.push("Registro = ?");
        queryParams.push(registro);
    }
    if (cert) {
        queryFields.push("CERT = ?");
        queryParams.push(cert);
    }
    if (imp) {
        queryFields.push("IMP = ?");
        queryParams.push(imp);
    }
    if (foto) {
        queryFields.push("Foto = ?");
        queryParams.push(foto);
    }
    queryParams.push(id);
    let query;
    if (req.user.user === "proprietario") {
        queryParams.push(req.user.id);
        query = `UPDATE cavalo
                       SET ${queryFields.join(", ")}
                       WHERE ID = ?
                         AND fk_Proprietario_ID = ?`;
    } else {
        queryParams.push(req.user.harasId);
        query = `UPDATE cavalo
                       SET ${queryFields.join(", ")}
                       WHERE ID = ?
                         AND fk_Haras_ID = ?`;
    }
    try {
        const [results] = await connection.promise().query(query, queryParams);
        if (results.affectedRows === 0) {
            return res.status(404).json({error: "Cavalo não encontrado."});
        }
        return res.status(200).json({message: "Cavalo atualizado com sucesso."});
    } catch (err){
        console.error("Erro ao atualizar o cavalo:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Cavalo já cadastrado."});
        }
        else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({error: "Cavalo não encontrado."});
        }
        return res.status(500).json({error: "Erro ao atualizar o cavalo."});
    }

})
module.exports = router;