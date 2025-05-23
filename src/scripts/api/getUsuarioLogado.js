const express = require("express");
const router = express.Router();
const connection = require("../horseDB");
const {extractUserID} = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     ProprietarioResponse:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do proprietário
 *         sobrenome:
 *           type: string
 *           description: Sobrenome do proprietário
 *         email:
 *           type: string
 *           description: Email do proprietário
 *         telefone:
 *           type: string
 *           description: Telefone do proprietário
 *         estado:
 *           type: string
 *           description: Estado onde o proprietário reside
 *         uf:
 *           type: string
 *           description: UF do estado
 *         cidade:
 *           type: string
 *           description: Cidade onde o proprietário reside
 *         cep:
 *           type: string
 *           description: CEP do endereço
 *         Bairro:
 *           type: string
 *           description: Bairro do endereço
 *         Rua:
 *           type: string
 *           description: Rua do endereço
 *         Numero:
 *           type: integer
 *           description: Número do endereço
 *         Data_Nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do proprietário
 *         Complemento:
 *           type: string
 *           description: Complemento do endereço
 *         userType:
 *           type: string
 *           description: Tipo de usuário (proprietario)
 *       example:
 *         nome: Carlos
 *         sobrenome: Oliveira
 *         email: carlos.oliveira@exemplo.com
 *         telefone: "11987654321"
 *         estado: São Paulo
 *         uf: SP
 *         cidade: São Paulo
 *         cep: "01234567"
 *         Bairro: Bela Vista
 *         Rua: Avenida Paulista
 *         Numero: 1000
 *         Data_Nascimento: "1985-05-15"
 *         Complemento: Apto 123
 *         userType: proprietario
 *
 *     GerenteResponse:
 *       type: object
 *       properties:
 *         Nome:
 *           type: string
 *           description: Nome do gerente
 *         Sobrenome:
 *           type: string
 *           description: Sobrenome do gerente
 *         CPF:
 *           type: string
 *           description: CPF do gerente
 *         Data_Nascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do gerente
 *         Telefone:
 *           type: string
 *           description: Telefone do gerente
 *         Email:
 *           type: string
 *           description: Email do gerente
 *         userType:
 *           type: string
 *           description: Tipo de usuário (gerente)
 *       example:
 *         Nome: João
 *         Sobrenome: Silva
 *         CPF: "12345678901"
 *         Data_Nascimento: "1990-01-01"
 *         Telefone: "11987654321"
 *         Email: joao.silva@exemplo.com
 *         userType: gerente
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *       example:
 *         error: Erro ao buscar os dados do usuário.
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
 * /api/getUsuarioLogado:
 *   get:
 *     summary: Obtém os dados do usuário logado
 *     tags: [Usuários]
 *     description: Retorna os dados do usuário autenticado com base no token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ProprietarioResponse'
 *                 - $ref: '#/components/schemas/GerenteResponse'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Tipo de usuário não suportado ou acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Usuário não encontrado
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
// Rota para buscar os dados do usuário logado (todos os tipos de usuário)
router.get("/", extractUserID, async (req, res) => {
    try {
        const userType = req.user.user; // Obtém o tipo de usuário do token
        let query, userId;

        // Determina a consulta com base no tipo de usuário

        switch (userType) {
            case "proprietario":
                query = `SELECT proprietario.nome as Nome,
                                Sobrenome,
                                Email,
                                Telefone,
                                estado.Nome       as Estado,
                                estado.UF         as UF,
                                cidade.nome       as Cidade,
                                CEP,
                                CPF,
                                Bairro,
                                Rua,
                                Numero,
                                Data_Nascimento,
                                Complemento,
                                Foto
                         FROM Proprietario
                                  JOIN horse_house.cep cep on cep.CEP = Proprietario.fk_CEP_CEP
                                  JOIN horse_house.cidade cidade on cidade.ID = cep.FK_Cidade_ID
                                  join estado on cidade.fk_Estado_ID = estado.ID
                         WHERE proprietario.ID = ?`;
                userId = req.user.id;
                break;
            case "gerente":
                query = `SELECT Nome,
                                Sobrenome,
                                CPF,
                                Data_Nascimento,
                                Telefone,
                                Email,
                                Foto
                         from gerente
                         WHERE gerente.ID = ?`;
                userId = req.user.id;
                break;
            case "treinador":
                query = `SELECT Nome,
                                Sobrenome,
                                CPF,
                                Telefone,
                                Email,
                                Senha,
                                Data_Nascimento,
                                Foto
                         from treinador
                         where treinador.ID = ?`;
                userId = req.user.id;
                break;
            case "veterinario":
                query = `SELECT Nome,
                                Email,
                                Telefone,
                                Data_Nascimento,
                                CPF,
                                Sobrenome,
                                CRMV,
                                Foto
                         from veterinario
                         WHERE veterinario.ID = ?`;
                userId = req.user.id;
                break;
            case "tratador":
                query = `SELECT Nome,
                                Sobrenome,
                                CPF,
                                Data_Nascimento,
                                Telefone,
                                Email,
                                Foto
                         from tratador
                         WHERE tratador.ID = ?`;
                userId = req.user.id;
                break;
            default:
                return res.status(403).json({error: "Tipo de usuário não suportado."});
        }

        const [results] = await connection.promise().query(query, [userId]);

        //converter foto de array buffer para base64
        if (results.length > 0 && results[0].Foto) {
            const buffer = Buffer.from(results[0].Foto);
            results[0].Foto = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        }

        if (results.length === 0) {
            return res.status(404).json({error: `${userType.charAt(0).toUpperCase() + userType.slice(1)} não encontrado.`});
        }

        // Adiciona o tipo de usuário à resposta
        const userData = {
            ...results[0], userType
        };

        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Erro ao buscar os dados do usuário."});
    }
});

module.exports = router;
