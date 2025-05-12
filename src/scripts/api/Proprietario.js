const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const connection = require("../horseDB");
const {verificarOuCadastrarEndereco} = require("../utils/enderecoUtils");
const {extractUserID, requireProprietario} = require("../middleware/auth");
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
    const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento, foto} = req.body;

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
        if(foto){
            const query = `
            INSERT INTO Proprietario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_CEP_CEP, rua, numero, bairro, Complemento, foto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
            const [results] = await connection.promise().query(query, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento, foto]);
        }
        else{
            const query = `
            INSERT INTO Proprietario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_CEP_CEP, rua, numero, bairro, Complemento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
            const [results] = await connection.promise().query(query, [nome, sobrenome, senhaHash, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento]);
        }

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
        if (req.user.user === "Proprietario") {
            const [results] = await connection.promise().query(query, [proprietarioId]);

            if (results.length === 0) {
                return res.status(404).json({error: "Proprietário não encontrado."});
            }

            res.json(results[0]);
        }
        else {
            queryVerificacao = `Select * from haras where fk_Proprietario_ID = ? and ID = ?`;
            const [results] = await connection.promise().query(queryVerificacao, [proprietarioId, req.user.HarasID]);
            if (results.length === 0) {
                return res.status(403).json({error: "Acesso negado. Você não tem permissão para visualizar este proprietário."});
            }
            const [resultsProprietario] = await connection.promise().query(query, [proprietarioId]);
            if (resultsProprietario.length === 0) {
                return res.status(404).json({error: "Proprietário não encontrado."});
            }
            res.json(resultsProprietario[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao processar a solicitação."});
    }
});

/**
 * @swagger
 * /api/proprietario:
 *   delete:
 *     summary: Exclui um proprietário
 *     tags: [Proprietários]
 *     description: Remove o proprietário autenticado do sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proprietário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Proprietário excluído com sucesso!
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
 *                 error: Erro ao processar a solicitação.
 */
router.delete("/proprietario/", [extractUserID, requireProprietario], async (req, res) => {
    const proprietarioId = req.user.id;

    try {
        const query = "DELETE FROM Proprietario WHERE ID = ?";
        await connection.promise().query(query, [proprietarioId]);

        res.status(200).json({message: "Proprietário excluído com sucesso!"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao processar a solicitação."});
    }
})

/**
 * @swagger
 * /api/proprietario/editar:
 *   put:
 *     summary: Atualiza dados do proprietário
 *     tags: [Proprietários]
 *     description: Atualiza os dados do proprietário autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do proprietário
 *               sobrenome:
 *                 type: string
 *                 description: Sobrenome do proprietário
 *               senha:
 *                 type: string
 *                 description: Nova senha do proprietário
 *               cpf:
 *                 type: string
 *                 description: CPF do proprietário
 *                 pattern: '^\d{11}$'
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento
 *               telefone:
 *                 type: string
 *                 description: Telefone do proprietário
 *                 pattern: '^\d{10,11}$'
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do proprietário
 *               cep:
 *                 type: string
 *                 description: CEP do endereço
 *                 pattern: '^\d{8}$'
 *               rua:
 *                 type: string
 *                 description: Rua do endereço
 *               numero:
 *                 type: integer
 *                 description: Número do endereço
 *               bairro:
 *                 type: string
 *                 description: Bairro do endereço
 *               complemento:
 *                 type: string
 *                 description: Complemento do endereço
 *               foto:
 *                 type: string
 *                 description: URL da foto do proprietário
 *     responses:
 *       200:
 *         description: Proprietário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Proprietário atualizado com sucesso!
 *       400:
 *         description: Dados de requisição inválidos
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
 *                     error: Pelo menos um campo deve ser fornecido para atualização.
 *                 cpfInvalido:
 *                   value:
 *                     error: CPF inválido.
 *                 emailInvalido:
 *                   value:
 *                     error: Email inválido.
 *                 telefoneInvalido:
 *                   value:
 *                     error: Telefone inválido.
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
 *                 cpfDuplicado:
 *                   value:
 *                     error: Este CPF já está cadastrado no sistema.
 *                 emailDuplicado:
 *                   value:
 *                     error: Este email já está cadastrado no sistema.
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
router.put("/proprietario/editar", [extractUserID, requireProprietario], async (req, res) => {
    const proprietarioId = req.user.id;
    const {nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento, foto} = req.body;

    if (!nome && !sobrenome && !senha && !cpf && !dataNascimento && !telefone && !email && !cep && !rua && !numero && !bairro) {
        return res.status(400).json({error: "Pelo menos um campo deve ser fornecido para atualização."});
    }
    // Validações adicionais para campos fornecidos
    if (cpf && !validarCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido." });
    }

    if (email && !validarEmail(email)) {
        return res.status(400).json({ error: "Email inválido." });
    }

    if (telefone && !validarTelefone(telefone)) {
        return res.status(400).json({ error: "Telefone inválido." });
    }
    if (cep && !validarCEP(cep)) {
        return res.status(400).json({ error: "CEP inválido." });
    }
    try {
        // Verificar ou cadastrar CEP, cidade e estado
        if (cep) {
            await verificarOuCadastrarEndereco(cep);
        }}
    catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Erro ao processar o CEP." });
    }
    // Construir a query de atualização
    let updateFields = [];
    let queryParams = [];
    if (nome) {
        updateFields.push("Nome = ?");
        queryParams.push(nome);
    }
    if (sobrenome) {
        updateFields.push("Sobrenome = ?");
        queryParams.push(sobrenome);
    }
    if (senha) {
        const saltRounds = parseInt(process.env.SALT); // Define o custo do hash
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        updateFields.push("Senha = ?");
        queryParams.push(senhaHash);
    }
    if (cpf) {
        updateFields.push("CPF = ?");
        queryParams.push(cpf);
    }
    if (dataNascimento) {
        updateFields.push("Data_Nascimento = ?");
        queryParams.push(dataNascimento);
    }
    if (telefone) {
        updateFields.push("Telefone = ?");
        queryParams.push(telefone);
    }
    if (email) {
        updateFields.push("Email = ?");
        queryParams.push(email);
    }
    if (cep) {
        updateFields.push("fk_CEP_CEP = ?");
        queryParams.push(cep);
    }
    if (rua) {
        updateFields.push("Rua = ?");
        queryParams.push(rua);
    }
    if (numero) {
        updateFields.push("Numero = ?");
        queryParams.push(numero);
    }
    if (bairro) {
        updateFields.push("Bairro = ?");
        queryParams.push(bairro);
    }
    if (complemento) {
        updateFields.push("Complemento = ?");
        queryParams.push(complemento);
    }
    if (foto) {
        updateFields.push("Foto = ?");
        queryParams.push(foto);
    }
    queryParams.push(proprietarioId);
    const query = `
        UPDATE Proprietario
        SET ${updateFields.join(", ")}
        WHERE ID = ?
    `;
    try {
        const [results] = await connection.promise().query(query, queryParams);
        if (results.affectedRows === 0) {
            return res.status(404).json({error: "Proprietário não encontrado."});
        }
        res.status(200).json({message: "Proprietário atualizado com sucesso!"});
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
        if (err.message.includes('ER_NO_REFERENCED_ROW')) {
            return res.status(400).json({ error: "Erro ao processar o CEP." });
        }

        console.error(err);
        res.status(500).json({error: "Erro ao processar a solicitação."});
    }
})

module.exports = router;