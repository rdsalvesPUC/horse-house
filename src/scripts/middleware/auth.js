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
 *         login:
 *           type: boolean
 *           description: Indica se o usuário precisa fazer login
 *       example:
 *         error: "Token não fornecido."
 *         login: true
 *     
 *     ForbiddenError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *         login:
 *           type: boolean
 *           description: Indica se o usuário precisa fazer login
 *       example:
 *         error: "Token inválido ou expirado."
 *         login: true
 * 
 *   security:
 *     - bearerAuth: []
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Não autorizado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnauthorizedError'
 *     
 *     ForbiddenError:
 *       description: Acesso negado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForbiddenError'
 * 
 *   x-codeSamples:
 *     - lang: JavaScript
 *       source: |
 *         // Exemplo de uso do middleware requireVeterinario
 *         router.get('/veterinario/perfil', [extractUserID, requireVeterinario], (req, res) => {
 *           // Apenas veterinários podem acessar
 *         });
 *         
 *         // Exemplo de uso do middleware requireTreinador
 *         router.get('/treinador/perfil', [extractUserID, requireTreinador], (req, res) => {
 *           // Apenas treinadores podem acessar
 *         });
 *         
 *         // Exemplo de uso do middleware requireTratador
 *         router.get('/tratador/perfil', [extractUserID, requireTratador], (req, res) => {
 *           // Apenas tratadores podem acessar
 *         });
 */

/**
 * Middleware para extrair e validar o token JWT
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 * 
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtido após o login
 */
const extractUserID = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({
            error: "Token não fornecido.",
            login: true
        });
    }

    // Verifica se o token está no formato correto
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            error: "Formato de token inválido. Use: Bearer <token>",
            login: true
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        // Verifica se o token contém as informações necessárias
        if (!decoded.id || !decoded.user) {
            return res.status(403).json({
                error: "Token inválido: informações ausentes",
                login: true
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
                error: "Token expirado.",
                login: true
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({
                error: "Token inválido.",
                login: true
            });
        }

        return res.status(403).json({
            error: "Erro ao processar o token.",
            login: true
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

/**
 * Middleware para verificar se o usuário tem permissão de veterinário
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 * 
 * @swagger
 * components:
 *   responses:
 *     VeterinarioForbiddenError:
 *       description: Acesso negado - Apenas veterinários
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "Acesso negado. Apenas veterinários podem acessar este recurso."
 */
const requireVeterinario = (req, res, next) => {
    if (!req.user || req.user.user !== "veterinario") {
        return res.status(403).json({
            error: "Acesso negado. Apenas veterinários podem acessar este recurso."
        });
    }
    next();
}

/**
 * Middleware para verificar se o usuário tem permissão de treinador
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 * 
 * @swagger
 * components:
 *   responses:
 *     TreinadorForbiddenError:
 *       description: Acesso negado - Apenas treinadores
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "Acesso negado. Apenas treinadores podem acessar este recurso."
 */
const requireTreinador = (req, res, next) => {
    if (!req.user || req.user.user !== "treinador") {
        return res.status(403).json({
            error: "Acesso negado. Apenas treinadores podem acessar este recurso."
        });
    }
    next();
}

/**
 * Middleware para verificar se o usuário tem permissão de tratador
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @param {Function} next - Função para continuar o fluxo
 * @returns {void}
 * 
 * @swagger
 * components:
 *   responses:
 *     TratadorForbiddenError:
 *       description: Acesso negado - Apenas tratadores
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "Acesso negado. Apenas tratadores podem acessar este recurso."
 */
const requireTratador = (req, res, next) => {
    if (!req.user || req.user.user !== "tratador") {
        return res.status(403).json({
            error: "Acesso negado. Apenas tratadores podem acessar este recurso."
        });
    }
    next();
}

module.exports = {
    extractUserID,
    requireProprietario,
    requireGerente,
    requireGerenteouProprietario,
    requireVeterinario,
    requireTreinador,
    requireTratador
}; 