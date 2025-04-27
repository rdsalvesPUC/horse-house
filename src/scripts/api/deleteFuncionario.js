const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extrairUserID} = require("../utils/extrairUserID");

router.delete("/:tipo/:id", extrairUserID, async (req, res) => {
    const {tipo, id} = req.params;
    const userType = req.user.user;

    if (userType !== "proprietario") {
        return res.status(403).json({error: "Acesso negado. Somente proprietários podem excluir funcionários."});
    }

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