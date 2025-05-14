const jwt = require("jsonwebtoken");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtido após o login
 * 
 *   schemas:
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *       example:
 *         error: "Token não fornecido."
 *     
 *     ForbiddenError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *       example:
 *         error: "Token inválido ou expirado."
 */

/**
 * Middleware para extrair e validar o token JWT
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 */
const extractUserID = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({
            error: "Token não fornecido."
        });
    }

    // Verifica se o token está no formato correto
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            error: "Formato de token inválido. Use: Bearer <token>"
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        // Verifica se o token contém as informações necessárias
        if (!decoded.id || !decoded.user) {
            return res.status(403).json({
                error: "Token inválido: informações ausentes"
            });
        }

        // Adiciona as informações do usuário à requisição
        if(decoded.harasId){
            req.user = {
                id: decoded.id,
                user: decoded.user,
                email: decoded.email,
                harasId: decoded.harasId
            };
        } else{
            req.user = {
                id: decoded.id,
                user: decoded.user,
                email: decoded.email
            };
        }

        next();
    } catch (err) {
        console.error("Erro ao verificar o token:", err);

        if (err.name === "TokenExpiredError") {
            return res.status(403).json({
                error: "Token expirado."
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({
                error: "Token inválido."
            });
        }

        return res.status(403).json({
            error: "Erro ao processar o token."
        });
    }
};

/**
 * Middleware para verificar se o usuário tem permissão de proprietário
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 */
const requireProprietario = (req, res, next) => {
    if (!req.user || req.user.user !== "proprietario") {
        return res.status(403).json({
            error: "Acesso negado. Apenas proprietários podem acessar este recurso."
        });
    }
    next();
};

/**
 * Middleware para verificar se o usuário tem permissão de gerente
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 */
const requireGerente = (req, res, next) => {
    if (!req.user || req.user.user !== "gerente") {
        return res.status(403).json({
            error: "Acesso negado. Apenas gerentes podem acessar este recurso."
        });
    }
    next();
};

/**
 * Middleware para verificar se o usuário tem permissão de gerente ou proprietário
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 */
const requireGerenteouProprietario = (req, res, next) => {
    if (!req.user || (req.user.user !== "gerente" && req.user.user !== "proprietario")) {
        return res.status(403).json({
            error: "Acesso negado. Apenas gerentes podem acessar este recurso."
        });
    }
    next();
};

module.exports = {
    extractUserID,
    requireProprietario,
    requireGerente,
    requireGerenteouProprietario
}; 