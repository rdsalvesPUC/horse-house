const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario} = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     DeleteFuncionarioResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *       example:
 *         message: Funcionário excluído com sucesso!
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
 * /api/deletarFuncionario/{tipo}/{id}:
 *   delete:
 *     summary: Exclui um funcionário
 *     tags: [Funcionários]
 *     description: Exclui um funcionário (gerente, treinador, veterinário ou tratador) do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [gerente, treinador, veterinario, tratador]
 *         description: Tipo de funcionário
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do funcionário
 *     responses:
 *       200:
 *         description: Funcionário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteFuncionarioResponse'
 *       400:
 *         description: Tipo de funcionário inválido
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
 *         description: Funcionário não encontrado
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
router.delete("/:tipo/:id", [extractUserID, requireProprietario], async (req, res) => {
    const {tipo, id} = req.params;

    const tiposPermitidos = ["gerente", "treinador", "veterinario", "tratador"];
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({error: "Tipo de funcionário inválido."});
    }
    const queryVerify = `SELECT proprietario.id FROM ${tipo} left join horse_house.haras on haras.ID = ${tipo}.fk_Haras_ID left join proprietario on haras.fk_Proprietario_ID = proprietario.ID WHERE ${tipo}.id  = ?`;
    connection.query(queryVerify, [id], (err, results) => {
        if (err) {
            console.error("Erro ao verificar funcionário:", err);
            return res.status(500).json({error: "Erro ao verificar funcionário."});
        }

        if (results.length === 0) {
            return res.status(404).json({error: "Funcionário não encontrado."});
        }
        const funcionario = results[0];
        if (funcionario.id !== req.user.id) {
            return res.status(403).json({error: "Você não tem permissão para excluir este funcionário."});
        }
    })

    const query = `DELETE FROM ${tipo} WHERE id = ?`;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Erro ao excluir funcionário:", err);
            return res.status(500).json({error: "Erro ao excluir funcionário."});
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({error: "Funcionário não encontrado."});
        }

        res.json({message: "Funcionário excluído com sucesso!"});
    });
});

module.exports = router;
