const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/", async (req, res) => {
    const token = req.headers["authorization"];
    
    if (!token) {
        return res.status(401).json({ 
            error: "Token não fornecido.",
            expired: false
        });
    }

    try {
        const tokenValue = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

        jwt.verify(tokenValue, process.env.JWT_SECRET);

        return res.json({ 
            expired: false,
            message: "Token válido."
        });
    } catch (err) {
        console.error("Erro ao verificar o token:", err);

        if (err.name === "TokenExpiredError") {
            return res.json({ 
                expired: true,
                message: "Token expirado."
            });
        }

        return res.status(403).json({ 
            error: "Token inválido.",
            expired: false
        });
    }
});

module.exports = router;