const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extrairUserID} = require("../utils/extrairUserID");

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
 *                 error: Acesso negado. Somente proprietários podem visualizar seus haras.
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
router.get("/", extrairUserID, (req, res) => {
    const userType = req.user.user;
    if (userType !== "proprietario") {
        return res.status(403).json({error: "Acesso negado. Somente proprietários podem visualizar seus haras."});
    }

    const query = "SELECT Nome, id FROM haras WHERE fk_Proprietario_ID = ?";
    connection.query(query, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({error: "Erro ao buscar haras no banco de dados."});
        }
        res.json(results);
    });
});

module.exports = router;
