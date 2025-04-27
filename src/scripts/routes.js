const express = require("express");
const path = require("path");
const router = express.Router();

// Rotas de API
const createProprietarioAPI = require("./api/createProprietario");
const loginAPI = require("./api/login");
const getHorsesAPI = require("./api/apiExample");
const createGerenteAPI = require("./api/createGerente");
const createHarasAPI = require("./api/createHaras");
const getCepAPI = require("./api/getCep");
const getUsuarioLogadoAPI = require("./api/getUsuarioLogado");
const deleteFuncionarioAPI = require("./api/deleteFuncionario");
const getAllHarasAPI = require("./api/GetAllHaras");

router.use("/api/criarProprietario", createProprietarioAPI);
router.use("/api/login", loginAPI);
router.use("/api/exemplo", getHorsesAPI);
router.use("/api/criarGerente", createGerenteAPI);
router.use("/api/criarHaras", createHarasAPI);
router.use("/api/getCep", getCepAPI);
router.use("/api/getUsuarioLogado", getUsuarioLogadoAPI);
router.use("/api/deletarFuncionario", deleteFuncionarioAPI);
router.use("/api/getAllHaras", getAllHarasAPI);

module.exports = router;
