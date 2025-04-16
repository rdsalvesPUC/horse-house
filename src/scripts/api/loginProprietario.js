const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../horseDB");

const router = express.Router();

// Rota de login
router.post("/", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {
        // Verificar se o proprietário existe
        const query = "SELECT * FROM Proprietario WHERE email = ?";
        const [results] = await connection.promise().query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        const proprietario = results[0];

        console.log(senha)

        // Verificar a senha
        const senhaValida = await bcrypt.compare(senha, proprietario.Senha);
        console.log(senhaValida);
        console.log(proprietario.Senha);
        if (!senhaValida) {
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        // Gerar o token JWT
        const token = jwt.sign(
            { id: proprietario.ID, email: proprietario.email },
            process.env.JWT_SECRET, // Defina uma chave secreta no arquivo .env
            { expiresIn: "1h" } // Token expira em 1 hora
        );

        res.json({ message: "Login realizado com sucesso!", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao processar a solicitação." });
    }
});

module.exports = router;