DROP DATABASE IF EXISTS horse_house;

CREATE DATABASE horse_house;

use horse_house;

/* Lógico_1: */

CREATE TABLE Proprietario
(
    Cpf             VARCHAR(11) NOT NULL UNIQUE,
    Nome            VARCHAR(20) NOT NULL,
    Sobrenome       VARCHAR(50) NOT NULL,
    Telefone        VARCHAR(11),
    Data_Nascimento DATE NOT NULL,
    Email           VARCHAR(50) NOT NULL,
    Rua             VARCHAR(50) NOT NULL,
    Numero          INT,
    Senha           VARCHAR(255) NOT NULL,
    Complemento     VARCHAR(20),
    ID              INT PRIMARY KEY AUTO_INCREMENT,
    Bairro          VARCHAR(50) NOT NULL,
    fk_CEP_CEP      VARCHAR(8)
);

CREATE TABLE Haras
(
    ID                 INT PRIMARY KEY AUTO_INCREMENT,
    Nome               VARCHAR(50) NOT NULL,
    Rua                VARCHAR(50) NOT NULL,
    Numero             INT,
    Complemento        VARCHAR(20),
    CNPJ               VARCHAR(14) NOT NULL UNIQUE ,
    Bairro             VARCHAR(50) NOT NULL,
    Dominio           VARCHAR(20) NOT NULL UNIQUE,
    fk_Proprietario_ID INT,
    fk_CEP_CEP         VARCHAR(8)
);

CREATE TABLE Treinador
(
    ID              INT PRIMARY KEY AUTO_INCREMENT,
    Nome            VARCHAR(20) NOT NULL,
    Sobrenome       VARCHAR(20) NOT NULL,
    CPF             VARCHAR(11) NOT NULL UNIQUE,
    Telefone        VARCHAR(11),
    Email           VARCHAR(50) NOT NULL,
    Senha           VARCHAR(255) NOT NULL,
    Data_Nascimento DATE,
    fk_Haras_ID     INT
);

CREATE TABLE Veterinario
(
    Senha           VARCHAR(255) NOT NULL,
    Nome            VARCHAR(20) NOT NULL,
    ID              INT PRIMARY KEY AUTO_INCREMENT,
    Email           VARCHAR(50) NOT NULL,
    Telefone        VARCHAR(11),
    Data_Nascimento DATE NOT NULL,
    CPF             VARCHAR(11) NOT NULL UNIQUE,
    Sobrenome       VARCHAR(50) NOT NULL,
    CRMV            VARCHAR(20) NOT NULL,
    fk_Haras_ID     INT
);

CREATE TABLE Tratador
(
    ID              INT PRIMARY KEY AUTO_INCREMENT,
    Nome            VARCHAR(20) NOT NULL,
    Sobrenome       VARCHAR(50) NOT NULL,
    CPF             VARCHAR(11) NOT NULL UNIQUE,
    Data_Nascimento DATE NOT NULL,
    Telefone        VARCHAR(11),
    Email           VARCHAR(50) NOT NULL,
    Senha           VARCHAR(255) NOT NULL,
    fk_Haras_ID     INT
);

CREATE TABLE Cavalo
(
    ID                 INT PRIMARY KEY AUTO_INCREMENT,
    Nome               VARCHAR(50) NOT NULL,
    Data_Nascimento    DATE NOT NULL,
    Peso               DECIMAL(5, 2) NOT NULL,
    Sexo               VARCHAR(5) NOT NULL,
    Pelagem            VARCHAR(20) NOT NULL,
    Sangue             VARCHAR(2) NOT NULL,
    Situacao           VARCHAR(50),
    Status             VARCHAR(50),
    Registro           VARCHAR(20) NOT NULL,
    CERT               VARCHAR(20) NOT NULL,
    IMP                VARCHAR(20) NOT NULL,
    fk_Proprietario_ID INT
);

CREATE TABLE CEP
(
    CEP          VARCHAR(8) PRIMARY KEY,
    FK_Cidade_ID INT
);

CREATE TABLE Cidade
(
    ID           INT PRIMARY KEY AUTO_INCREMENT,
    Nome         VARCHAR(50) NOT NULL,
    fk_Estado_ID INT
);

CREATE TABLE Estado
(
    ID         INT PRIMARY KEY AUTO_INCREMENT,
    Nome       VARCHAR(50) NOT NULL,
    UF         CHAR(2) NOT NULL,
    fk_Pais_ID INT
);

CREATE TABLE Pais
(
    ID   INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(50) NOT NULL
);

CREATE TABLE Gerente
(
    Senha           VARCHAR(255) NOT NULL,
    ID              INT PRIMARY KEY AUTO_INCREMENT,
    Nome            VARCHAR(20) NOT NULL,
    Sobrenome       VARCHAR(50) NOT NULL,
    CPF             VARCHAR(11) NOT NULL UNIQUE,
    Data_Nascimento DATE NOT NULL,
    Telefone        VARCHAR(11),
    Email           VARCHAR(50) NOT NULL,
    fk_Haras_ID     INT
);

CREATE TABLE Consulta_Receita
(
    ID                INT PRIMARY KEY AUTO_INCREMENT,
    Descricao         TEXT,
    fk_Veterinario_ID INT,
    fk_Cavalo_ID      INT
);

CREATE TABLE Remedio
(
    ID   INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(20) NOT NULL
);

CREATE TABLE Possui
(
    fk_Receita_ID INT,
    fk_Remedio_ID INT
);

CREATE TABLE Trata
(
    fk_Cavalo_ID   INT,
    fk_Tratador_ID INT,
    Dieta          TEXT,
    ID             INT PRIMARY KEY AUTO_INCREMENT,
    Data           DATETIME NOT NULL
);

CREATE TABLE Treina
(
    fk_Cavalo_ID    INT,
    fk_Treinador_ID INT,
    ID              INT PRIMARY KEY AUTO_INCREMENT,
    Treino          TEXT,
    Data            DATETIME NOT NULL
);

ALTER TABLE Proprietario
    ADD CONSTRAINT FK_Proprietario_2
        FOREIGN KEY (fk_CEP_CEP)
            REFERENCES CEP (CEP)
            ON DELETE CASCADE;

ALTER TABLE Haras
    ADD CONSTRAINT FK_Haras_2
        FOREIGN KEY (fk_Proprietario_ID)
            REFERENCES Proprietario (ID)
            ON DELETE CASCADE;

ALTER TABLE Haras
    ADD CONSTRAINT FK_Haras_3
        FOREIGN KEY (fk_CEP_CEP)
            REFERENCES CEP (CEP)
            ON DELETE CASCADE;

ALTER TABLE Treinador
    ADD CONSTRAINT FK_Treinador_2
        FOREIGN KEY (fk_Haras_ID)
            REFERENCES Haras (ID)
            ON DELETE CASCADE;

ALTER TABLE Veterinario
    ADD CONSTRAINT FK_Veterinario_2
        FOREIGN KEY (fk_Haras_ID)
            REFERENCES Haras (ID)
            ON DELETE CASCADE;

ALTER TABLE Tratador
    ADD CONSTRAINT FK_Tratador_2
        FOREIGN KEY (fk_Haras_ID)
            REFERENCES Haras (ID)
            ON DELETE CASCADE;

ALTER TABLE Cavalo
    ADD CONSTRAINT FK_Cavalo_2
        FOREIGN KEY (fk_Proprietario_ID)
            REFERENCES Proprietario (ID)
            ON DELETE CASCADE;

ALTER TABLE CEP
    ADD CONSTRAINT FK_CEP_2
        FOREIGN KEY (FK_Cidade_ID)
            REFERENCES Cidade (ID)
            ON DELETE CASCADE;

ALTER TABLE Cidade
    ADD CONSTRAINT FK_Cidade_2
        FOREIGN KEY (fk_Estado_ID)
            REFERENCES Estado (ID)
            ON DELETE CASCADE;

ALTER TABLE Estado
    ADD CONSTRAINT FK_Estado_2
        FOREIGN KEY (fk_Pais_ID)
            REFERENCES Pais (ID)
            ON DELETE CASCADE;

ALTER TABLE Gerente
    ADD CONSTRAINT FK_Gerente_2
        FOREIGN KEY (fk_Haras_ID)
            REFERENCES Haras (ID)
            ON DELETE CASCADE;

ALTER TABLE Consulta_Receita
    ADD CONSTRAINT FK_Consulta_Receita_2
        FOREIGN KEY (fk_Veterinario_ID)
            REFERENCES Veterinario (ID)
            ON DELETE CASCADE;

ALTER TABLE Consulta_Receita
    ADD CONSTRAINT FK_Consulta_Receita_3
        FOREIGN KEY (fk_Cavalo_ID)
            REFERENCES Cavalo (ID)
            ON DELETE CASCADE;

ALTER TABLE Possui
    ADD CONSTRAINT FK_Possui_1
        FOREIGN KEY (fk_Receita_ID)
            REFERENCES Consulta_Receita (ID)
            ON DELETE CASCADE;

ALTER TABLE Possui
    ADD CONSTRAINT FK_Possui_2
        FOREIGN KEY (fk_Remedio_ID)
            REFERENCES Remedio (ID)
            ON DELETE CASCADE;

ALTER TABLE Trata
    ADD CONSTRAINT FK_Trata_2
        FOREIGN KEY (fk_Cavalo_ID)
            REFERENCES Cavalo (ID)
            ON DELETE CASCADE;

ALTER TABLE Trata
    ADD CONSTRAINT FK_Trata_3
        FOREIGN KEY (fk_Tratador_ID)
            REFERENCES Tratador (ID)
            ON DELETE CASCADE;

ALTER TABLE Treina
    ADD CONSTRAINT FK_Treina_2
        FOREIGN KEY (fk_Cavalo_ID)
            REFERENCES Cavalo (ID)
            ON DELETE CASCADE;

ALTER TABLE Treina
    ADD CONSTRAINT FK_Treina_3
        FOREIGN KEY (fk_Treinador_ID)
            REFERENCES Treinador (ID)
            ON DELETE CASCADE;