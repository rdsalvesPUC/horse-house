const express = require("express");
const router = express.Router();
const connection = require("../horseDB");

/**
 * @swagger
 * components:
 *   schemas:
 *     Cavalo:
 *       type: object
 *       properties:
 *         ID:
 *           type: integer
 *           description: ID do cavalo
 *         Nome:
 *           type: string
 *           description: Nome do cavalo
 *         Data_Nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do cavalo
 *         Peso:
 *           type: number
 *           format: float
 *           description: Peso do cavalo em kg
 *         Sexo:
 *           type: string
 *           description: Sexo do cavalo (M ou F)
 *         Pelagem:
 *           type: string
 *           description: Tipo de pelagem do cavalo
 *         Sangue:
 *           type: string
 *           description: Tipo de sangue do cavalo
 *         Situacao:
 *           type: string
 *           description: Situação atual do cavalo
 *         Status:
 *           type: string
 *           description: Status atual do cavalo
 *         Registro:
 *           type: string
 *           description: Número de registro do cavalo
 *         CERT:
 *           type: string
 *           description: Número do certificado do cavalo
 *         IMP:
 *           type: string
 *           description: Informação de importação do cavalo
 *         fk_Proprietario_ID:
 *           type: integer
 *           description: ID do proprietário do cavalo
 *       example:
 *         ID: 1
 *         Nome: Trovão
 *         Data_Nascimento: "2018-03-15"
 *         Peso: 450.75
 *         Sexo: "M"
 *         Pelagem: "Tordilho"
 *         Sangue: "PSI"
 *         Situacao: "Ativo"
 *         Status: "Treinamento"
 *         Registro: "ABC123"
 *         CERT: "CERT456"
 *         IMP: "IMP789"
 *         fk_Proprietario_ID: 1
 */

/**
 * @swagger
 * /api/exemplo:
 *   get:
 *     summary: Lista todos os cavalos
 *     tags: [Cavalos]
 *     description: Retorna uma lista de todos os cavalos cadastrados no sistema
 *     responses:
 *       200:
 *         description: Lista de cavalos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cavalo'
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
 *                 error: Erro ao buscar dados do banco de dados.
 */
// Rota para listar todos os cavalos
router.get("/", (req, res) => {
    const query = "SELECT * FROM cavalo";
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao buscar dados do banco de dados." });
        }
        res.json(results);
    });
});

module.exports = router;
