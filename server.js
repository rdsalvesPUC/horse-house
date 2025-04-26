require("dotenv").config();
const connectLivereload = require('connect-livereload')
const livereload        = require('livereload')
const express           = require("express");
const path              = require("path");
const app               = express();
const port              = process.env.PORT || 3000;

app.use(express.json());
app.use(connectLivereload());

// 1) expõe seus componentes em /components/*
app.use(
  "/components",
  express.static(path.join(__dirname, "public", "components"))
);

// 2) expõe assets estáticos (CSS, JS, imagens…)  
app.use("/styles", express.static(path.join(__dirname, "public", "styles")));
app.use("/scripts", express.static(path.join(__dirname, "public", "scripts")));
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// 3) agora expõe as páginas “limpas” em /*  
//    cada pasta pages/slug/index.html vira URL /slug/   
app.use(
  express.static(path.join(__dirname, "public", "pages"), {
    extensions: ["html"],
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "home", "index.html"));
});

// 4) rotas de API
const routes = require("./src/scripts/routes");
app.use(routes);

const liveReloadServer = livereload.createServer({ debug: false });
liveReloadServer.watch(path.join(__dirname, "public"));

// 5) start
app.listen(port, () =>
  console.log(`Servidor rodando em http://localhost:${port}`)
);