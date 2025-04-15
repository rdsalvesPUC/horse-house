const https = require("https");
const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
router.post("/", async (req, res) => {
    const { nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento } = req.body;

    if (!nome || !sobrenome || !senha || !cpf || !dataNascimento || !telefone || !email || !cep || !rua || !numero || !bairro) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        // Verificar se o CEP já está cadastrado
        const cepQuery = "SELECT * FROM CEP WHERE CEP = ?";
        const [cepResults] = await connection.promise().query(cepQuery, [cep]);

        if (cepResults.length === 0) {
            // Consultar a API dos Correios
            const correiosUrl = `https://viacep.com.br/ws/${cep}/json/`;
            const correiosResponse = await new Promise((resolve, reject) => {
                https.get(correiosUrl, (response) => {
                    let data = "";
                    response.on("data", (chunk) => {
                        data += chunk;
                    });
                    response.on("end", () => {
                        resolve(JSON.parse(data));
                    });
                }).on("error", (err) => {
                    reject(err);
                });
            });

            const { logradouro, localidade, estado, bairro: bairroApi } = correiosResponse;

            if (!localidade || !estado) {
                return res.status(400).json({ error: "CEP inválido ou não encontrado na API dos Correios." });
            }

            // Verificar e cadastrar estado
            const estadoQuery = "SELECT * FROM Estado WHERE Nome = ?";
            const [estadoResults] = await connection.promise().query(estadoQuery, [estado]);

            let estadoId;
            if (estadoResults.length === 0) {
                const insertEstadoQuery = "INSERT INTO Estado (Nome, fk_Pais_ID) VALUES (?, 1)";
                const [estadoInsertResult] = await connection.promise().query(insertEstadoQuery, [estado]);
                estadoId = estadoInsertResult.insertId;
            } else {
                estadoId = estadoResults[0].ID;
            }

            // Verificar e cadastrar cidade
            const cidadeQuery = "SELECT * FROM Cidade WHERE Nome = ? AND fk_Estado_ID = ?";
            const [cidadeResults] = await connection.promise().query(cidadeQuery, [localidade, estadoId]);

            let cidadeId;
            if (cidadeResults.length === 0) {
                const insertCidadeQuery = "INSERT INTO Cidade (Nome, fk_Estado_ID) VALUES (?, ?)";
                const [cidadeInsertResult] = await connection.promise().query(insertCidadeQuery, [localidade, estadoId]);
                cidadeId = cidadeInsertResult.insertId;
            } else {
                cidadeId = cidadeResults[0].ID;
            }

            // Cadastrar o CEP
            const insertCepQuery = "INSERT INTO CEP (CEP, FK_Cidade_ID) VALUES (?, ?)";
            await connection.promise().query(insertCepQuery, [cep, cidadeId]);
        }

        // Inserir o proprietário
        const query = `
            INSERT INTO Proprietario (nome, sobrenome, senha, cpf, data_nascimento, telefone, email, fk_CEP_CEP, rua, numero, bairro, Complemento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [results] = await connection.promise().query(query, [nome, sobrenome, senha, cpf, dataNascimento, telefone, email, cep, rua, numero, bairro, complemento]);

        res.status(201).json({ message: "Proprietário cadastrado com sucesso!", id: results.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});
module.exports = router;