const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {validarCEP} = require("../utils/validations");

/**
 * @swagger
 * components:
 *   schemas:
 *     CepResponse:
 *       type: object
 *       properties:
 *         CEP:
 *           type: string
 *           description: CEP (código postal)
 *         Cidade:
 *           type: string
 *           description: Nome da cidade
 *         Estado:
 *           type: string
 *           description: Nome do estado
 *         UF:
 *           type: string
 *           description: Sigla do estado (UF)
 *       example:
 *         CEP: "01234567"
 *         Cidade: "São Paulo"
 *         Estado: "São Paulo"
 *         UF: "SP"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *       example:
 *         error: Erro ao processar a solicitação
 */

/**
 * @swagger
 * /api/getCep/{cep}:
 *   get:
 *     summary: Consulta informações de um CEP
 *     tags: [Utilitários]
 *     description: Retorna informações sobre um CEP, incluindo cidade, estado e UF
 *     parameters:
 *       - in: path
 *         name: cep
 *         required: true
 *         schema:
 *           type: string
 *         description: CEP a ser consultado (8 dígitos numéricos)
 *     responses:
 *       200:
 *         description: Informações do CEP retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CepResponse'
 *       400:
 *         description: CEP inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: CEP não encontrado
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
router.get("/:cep", async (req, res) => {
    const { cep } = req.params;
    
    // Validação do CEP
    if (!validarCEP(cep)) {
        return res.status(400).json({ error: "CEP inválido. Deve conter 8 dígitos numéricos." });
    }

    try {
        // Consulta no banco de dados
        const query = `
            SELECT cep.CEP, cidade.Nome AS Cidade, estado.Nome AS Estado, estado.UF 
            FROM cep
            JOIN cidade ON cep.FK_Cidade_ID = cidade.ID
            JOIN estado ON cidade.FK_Estado_ID = estado.ID
            WHERE cep.CEP = ?
        `;
        const [results] = await connection.promise().query(query, [cep]);

        if (results.length === 0) {
            return res.status(404).json({ error: "CEP não encontrado no banco de dados." });
        }

        res.json(results[0]);
    } catch (err) {
        console.error("Erro ao consultar o banco de dados:", err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;
