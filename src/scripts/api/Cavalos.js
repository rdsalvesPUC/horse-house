const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID, requireProprietario, requireGerenteouProprietario} = require("../middleware/auth");

router.post("/cavalos/criar", [requireProprietario, extractUserID], async (req, res) => {
    const {nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, foto, haras_id} = req.body;

    if (nome && data_nascimento && peso && sexo && pelagem && sangue && situacao && status && registro && cert && imp && haras_id) {
        return res.status(400).json({error: "Todos os campos são obrigatórios."});
    }
    if (foto) {
        try {
            const query = `INSERT INTO cavalo (Nome, Data_Nascimento, Peso, Sexo, Pelagem, Sangue, Situacao, Status, Registro, CERT, IMP, Foto, fk_Proprietario_ID, fk_Haras_ID)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [results] = await connection.promise().query(query, [nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, foto, req.user.id, haras_id])
        } catch (err) {
            console.error("Erro ao inserir o cavalo:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({error: "Cavalo já cadastrado."});
            }
            return res.status(500).json({error: "Erro ao criar o cavalo."});
        }

    }
    try {
        const query = `INSERT INTO cavalo (Nome, Data_Nascimento, Peso, Sexo, Pelagem, Sangue, Situacao, Status, Registro, CERT, IMP, Foto, fk_Proprietario_ID, fk_Haras_ID)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        [results] = await connection.promise.query(query, [nome, data_nascimento, peso, sexo, pelagem, sangue, situacao, status, registro, cert, imp, req.user.id, haras_id])
    } catch (err) {
        console.error("Erro ao inserir o cavalo:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: "Cavalo já cadastrado."});
        }
        return res.status(500).json({error: "Erro ao criar o cavalo."});
    }

})
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
    if (req.user.harasID === harasID) {
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
router.get("/cavalos/:id", extractUserID, async (req, res) => {
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
        const [results] = await connection.promise().query(query, [id, req.user.harasID]);
        if (results.length === 0) {
            return res.status(404).json({error: "Cavalo não encontrado."});
        }
        return res.status(200).json(results[0]);
    }
})

router.get("/cavalos/dono", [requireProprietario, extractUserID], async (req, res) => {
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
    const [results] = await connection.promise().query(query, [id, req.user.harasID]);
    if (results.affectedRows === 0) {
        return res.status(404).json({error: "Cavalo não encontrado."});
    }
    return res.status(200).json({message: "Cavalo deletado com sucesso."});
})
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
        queryParams.push(req.user.harasID);
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