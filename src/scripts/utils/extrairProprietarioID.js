const jwt = require("jsonwebtoken");

function extrairProprietarioID(req, res, next) {
    const token = req.headers["authorization"];
    console.log("Token recebido:", token);

    if (!token) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        console.log("Token decodificado:", decoded);

        if (decoded.user !== "proprietario") {
            return res.status(403).json({ error: "Acesso permitido apenas para proprietários." });
        }

        req.proprietario = decoded;
        next();
    } catch (err) {
        console.error("Erro ao verificar o token:", err);
        return res.status(403).json({ error: "Token inválido ou expirado." });
    }
}

module.exports = { extrairProprietarioID };