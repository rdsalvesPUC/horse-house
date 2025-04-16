const jwt = require("jsonwebtoken");

const autenticar = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Exemplo: "Bearer <token>"
    if (!token) {
        return res.status(401).json({error: "Token não fornecido."});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.proprietarioId = decoded.id; // Armazena o ID do proprietário no request
        next();
    } catch (err) {
        return res.status(401).json({error: "Token inválido."});
    }
};
module.exports = { autenticar };