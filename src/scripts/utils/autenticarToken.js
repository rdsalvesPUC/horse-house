const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.proprietario = decoded; // Adiciona os dados do token à requisição
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido ou expirado." });
    }
}

module.exports = autenticarToken;