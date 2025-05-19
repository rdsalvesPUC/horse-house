const express = require("express");
const router = express.Router();

// Rotas de API
const ProprietarioAPI = require("./api/Proprietario");
const loginAPI = require("./api/login");
const getHorsesAPI = require("./api/apiExample");
const GerenteAPI = require("./api/Gerente");
const VeterinarioAPI = require("./api/Veterinario");
const TratadorAPI = require("./api/Tratador");
const HarasAPI = require("./api/Haras");
const getCepAPI = require("./api/getCep");
const getUsuarioLogadoAPI = require("./api/getUsuarioLogado");
const deleteFuncionarioAPI = require("./api/deleteFuncionario");
const controleAcessoAPI = require("./api/controleAcesso");
const CavalosAPI = require("./api/Cavalos");
const tratamentoAPI = require("./api/tratamento");


router.use("/api", ProprietarioAPI);
router.use("/api/login", loginAPI);
router.use("/api/exemplo", getHorsesAPI);
router.use("/api", GerenteAPI);
router.use("/api", VeterinarioAPI);
router.use("/api", TratadorAPI);
router.use("/api", HarasAPI);
router.use("/api/getCep", getCepAPI);
router.use("/api/getUsuarioLogado", getUsuarioLogadoAPI);
router.use("/api/deletarFuncionario", deleteFuncionarioAPI);
router.use("/api", controleAcessoAPI);
router.use("/api", CavalosAPI);
router.use("/api", tratamentoAPI);

module.exports = router;
