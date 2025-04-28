const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../horseDB");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *       example:
 *         email: usuario@exemplo.com
 *         senha: senha123
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *         token:
 *           type: string
 *           description: Token JWT para autenticação
 *         userType:
 *           type: string
 *           description: Tipo de usuário (proprietario, gerente, treinador, veterinario, tratador)
 *       example:
 *         message: Login realizado com sucesso!
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         userType: proprietario
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Realiza login no sistema
 *     tags: [Autenticação]
 *     description: Autentica um usuário no sistema e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
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
 *                 error: E-mail e senha são obrigatórios.
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: E-mail ou senha inválidos.
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

async function tryAuthenticate(email, senha, tabela) {
    try {
        const query = `SELECT * FROM ${tabela} WHERE Email = ?`;
        const [results] = await connection.promise().query(query, [email]);

        if (results.length === 0) {
            return { success: false };
        }

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.Senha);

        if (!senhaValida) {
            return { success: false };
        }

        return { 
            success: true, 
            usuario: usuario,
            tipo: tabela.toLowerCase()
        };
    } catch (error) {
        console.error(`Erro ao autenticar em ${tabela}:`, error);
        return { success: false };
    }
}


router.post("/", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {
        const tiposUsuarios = ["Proprietario", "Treinador", "Veterinario", "Tratador", "Gerente"];

        let usuarioAutenticado = null;


        for (const tipo of tiposUsuarios) {
            const resultado = await tryAuthenticate(email, senha, tipo);
            if (resultado.success) {
                usuarioAutenticado = resultado;
                break;
            }
        }

        if (!usuarioAutenticado) {
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        console.log(usuarioAutenticado.tipo)
        const token = jwt.sign(
            { 
                id: usuarioAutenticado.usuario.ID, 
                email: usuarioAutenticado.usuario.Email, 
                user: usuarioAutenticado.tipo 
            },
            process.env.JWT_SECRET,
            { expiresIn: "15d" }
        );

        res.json({ 
            message: "Login realizado com sucesso!", 
            token,
            userType: usuarioAutenticado.tipo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;
