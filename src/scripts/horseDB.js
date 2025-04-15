const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados MySQL bem-sucedida!');
    }
});
// Exportando a conexão para ser usada em outros arquivos
module.exports = connection;