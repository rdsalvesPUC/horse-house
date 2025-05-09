const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario} = require("../middleware/auth");

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
router.get("/", [extractUserID, requireProprietario], async (req, res) => {
    try {
        const query = "SELECT Nome, id FROM haras WHERE fk_Proprietario_ID = ?";
        const [results] = await connection.promise().query(query, [req.user.id]);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao buscar haras no banco de dados."});
    }
});

module.exports = router;
