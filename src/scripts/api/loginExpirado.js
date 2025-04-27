const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenValidResponse:
 *       type: object
 *       properties:
 *         expired:
 *           type: boolean
 *           description: Indica se o token expirou
 *         message:
 *           type: string
 *           description: Mensagem informativa
 *       example:
 *         expired: false
 *         message: Token válido.
 *     
 *     TokenExpiredResponse:
 *       type: object
 *       properties:
 *         expired:
 *           type: boolean
 *           description: Indica se o token expirou
 *         message:
 *           type: string
 *           description: Mensagem informativa
 *       example:
 *         expired: true
 *         message: Token expirado.
 *     
 *     TokenErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *         expired:
 *           type: boolean
 *           description: Indica se o token expirou
 *       example:
 *         error: Token inválido.
 *         expired: false
 */

/**
 * @swagger
 * /api/loginExpirado:
 *   post:
 *     summary: Verifica se o token JWT expirou
 *     tags: [Autenticação]
 *     description: Verifica se um token JWT ainda é válido ou se expirou
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/TokenValidResponse'
 *                 - $ref: '#/components/schemas/TokenExpiredResponse'
 *       401:
 *         description: Token não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenErrorResponse'
 *       403:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenErrorResponse'
 */
router.post("/", async (req, res) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ 
            error: "Token não fornecido.",
            expired: false
        });
    }

    try {
        const tokenValue = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

        jwt.verify(tokenValue, process.env.JWT_SECRET);

        return res.json({ 
            expired: false,
            message: "Token válido."
        });
    } catch (err) {
        console.error("Erro ao verificar o token:", err);

        if (err.name === "TokenExpiredError") {
            return res.json({ 
                expired: true,
                message: "Token expirado."
            });
        }

        return res.status(403).json({ 
            error: "Token inválido.",
            expired: false
        });
    }
});

module.exports = router;
