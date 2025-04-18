const express = require("express");
const path = require("path");
const router = express.Router();

// Rotas de API
const createProprietarioAPI = require("./api/createProprietario");
const loginProprietarioAPI = require("./api/loginProprietario");
const getProprietarioAPI = require("./api/getProprietario");
const getHorsesAPI = require("./api/apiExample");
const createGerenteAPI = require("./api/createGerente");
const createHarasAPI = require("./api/createHaras");
const getCepAPI = require("./api/getCep");

router.use("/api/criarProprietario", createProprietarioAPI);
router.use("/api/loginProprietario", loginProprietarioAPI);
router.use("/api/getProprietario", getProprietarioAPI);
router.use("/api/exemplo", getHorsesAPI);
router.use("/api/criarGerente", createGerenteAPI);
router.use("/api/criarHaras", createHarasAPI);
router.use("/api/getCep", getCepAPI);

// Rotas de páginas estáticas
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "index.html"));
});
router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "pages", "cadastro_proprietario.html"));
});

module.exports = router;