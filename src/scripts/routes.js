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

module.exports = router;
