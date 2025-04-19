const https = require("https");
const connection = require("../horseDB");

async function verificarOuCadastrarEndereco(cep) {
    // Verificar se o CEP já está cadastrado
    const cepQuery = "SELECT * FROM CEP WHERE CEP = ?";
    const [cepResults] = await connection.promise().query(cepQuery, [cep]);

    if (cepResults.length > 0) {
        return cepResults[0]; // Retorna o CEP já cadastrado
    }

    // Consultar a API dos Correios
    const correiosUrl = `https://viacep.com.br/ws/${cep}/json/`;
    const correiosResponse = await new Promise((resolve, reject) => {
        https.get(correiosUrl, (response) => {
            let data = "";

            // Verificar se o Content-Type é JSON
            const contentType = response.headers["content-type"];
            if (!contentType || !contentType.includes("application/json")) {
                return reject(new Error("Resposta inválida da API dos Correios (não é JSON)."));
            }

            response.on("data", (chunk) => {
                data += chunk;
            });

            response.on("end", () => {
                try {
                    const jsonResponse = JSON.parse(data);

                    // Verifica se a resposta contém um erro
                    if (jsonResponse.erro) {
                         reject(new Error("CEP inválido ou não encontrado na API dos Correios."));
                    } else {
                        resolve(jsonResponse);
                    }
                } catch (err) {
                    reject(new Error("Erro ao processar a resposta da API dos Correios."));
                }
            });
        }).on("error", (err) => {
            reject(err);
        });
    });


    const { localidade, uf, estado } = correiosResponse;

    if (!localidade || !uf || !estado) {
        throw new Error("CEP inválido ou não encontrado na API dos Correios.");
    }

    // Verificar e cadastrar estado
    const estadoQuery = "SELECT * FROM Estado WHERE Nome = ? OR UF = ?";
    const [estadoResults] = await connection.promise().query(estadoQuery, [estado, uf]);

    let estadoId;
    if (estadoResults.length === 0) {
        const insertEstadoQuery = "INSERT INTO Estado (Nome, fk_Pais_ID, UF) VALUES (?, 1, ?)";
        const [estadoInsertResult] = await connection.promise().query(insertEstadoQuery, [estado,uf]);
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

    return { CEP: cep, FK_Cidade_ID: cidadeId };
}

module.exports = { verificarOuCadastrarEndereco };