-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: horse_house
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cavalo`
--

DROP TABLE IF EXISTS `cavalo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cavalo` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(50) NOT NULL,
  `Data_Nascimento` date NOT NULL,
  `Peso` decimal(5,2) NOT NULL,
  `Sexo` varchar(5) NOT NULL,
  `Pelagem` varchar(20) NOT NULL,
  `Sangue` varchar(2) NOT NULL,
  `Situacao` varchar(50) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `Registro` varchar(20) NOT NULL,
  `CERT` varchar(20) NOT NULL,
  `IMP` tinyint(1) NOT NULL,
  `Foto` blob,
  `fk_Proprietario_ID` int DEFAULT NULL,
  `fk_Haras_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Cavalo_2` (`fk_Proprietario_ID`),
  KEY `FK_Cavalo_4` (`fk_Haras_ID`),
  CONSTRAINT `FK_Cavalo_2` FOREIGN KEY (`fk_Proprietario_ID`) REFERENCES `proprietario` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Cavalo_4` FOREIGN KEY (`fk_Haras_ID`) REFERENCES `haras` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cavalo`
--

LOCK TABLES `cavalo` WRITE;
/*!40000 ALTER TABLE `cavalo` DISABLE KEYS */;
/*!40000 ALTER TABLE `cavalo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cep`
--

DROP TABLE IF EXISTS `cep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cep` (
  `CEP` varchar(8) NOT NULL,
  `FK_Cidade_ID` int DEFAULT NULL,
  PRIMARY KEY (`CEP`),
  KEY `FK_CEP_2` (`FK_Cidade_ID`),
  CONSTRAINT `FK_CEP_2` FOREIGN KEY (`FK_Cidade_ID`) REFERENCES `cidade` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cep`
--

LOCK TABLES `cep` WRITE;
/*!40000 ALTER TABLE `cep` DISABLE KEYS */;
INSERT INTO `cep` VALUES ('04013020',1),('95082220',2),('68551242',3),('69307772',4),('49031416',5);
/*!40000 ALTER TABLE `cep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cidade`
--

DROP TABLE IF EXISTS `cidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cidade` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(50) NOT NULL,
  `fk_Estado_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Cidade_2` (`fk_Estado_ID`),
  CONSTRAINT `FK_Cidade_2` FOREIGN KEY (`fk_Estado_ID`) REFERENCES `estado` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cidade`
--

LOCK TABLES `cidade` WRITE;
/*!40000 ALTER TABLE `cidade` DISABLE KEYS */;
INSERT INTO `cidade` VALUES (1,'São Paulo',1),(2,'Caxias do Sul',2),(3,'Redenção',3),(4,'Boa Vista',4),(5,'Aracaju',5);
/*!40000 ALTER TABLE `cidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consulta_receita`
--

DROP TABLE IF EXISTS `consulta_receita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consulta_receita` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Descricao` text,
  `fk_Veterinario_ID` int DEFAULT NULL,
  `fk_Cavalo_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Consulta_Receita_2` (`fk_Veterinario_ID`),
  KEY `FK_Consulta_Receita_3` (`fk_Cavalo_ID`),
  CONSTRAINT `FK_Consulta_Receita_2` FOREIGN KEY (`fk_Veterinario_ID`) REFERENCES `veterinario` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Consulta_Receita_3` FOREIGN KEY (`fk_Cavalo_ID`) REFERENCES `cavalo` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consulta_receita`
--

LOCK TABLES `consulta_receita` WRITE;
/*!40000 ALTER TABLE `consulta_receita` DISABLE KEYS */;
/*!40000 ALTER TABLE `consulta_receita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(50) NOT NULL,
  `UF` char(2) NOT NULL,
  `fk_Pais_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Estado_2` (`fk_Pais_ID`),
  CONSTRAINT `FK_Estado_2` FOREIGN KEY (`fk_Pais_ID`) REFERENCES `pais` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,'São Paulo','SP',1),(2,'Rio Grande do Sul','RS',1),(3,'Pará','PA',1),(4,'Roraima','RR',1),(5,'Sergipe','SE',1);
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gerente`
--

DROP TABLE IF EXISTS `gerente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gerente` (
  `Senha` varchar(256) NOT NULL,
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(20) NOT NULL,
  `Sobrenome` varchar(50) NOT NULL,
  `CPF` varchar(11) NOT NULL,
  `Data_Nascimento` date NOT NULL,
  `Telefone` varchar(11) DEFAULT NULL,
  `Email` varchar(50) NOT NULL,
  `Foto` blob,
  `fk_Haras_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CPF` (`CPF`),
  KEY `FK_Gerente_2` (`fk_Haras_ID`),
  CONSTRAINT `FK_Gerente_2` FOREIGN KEY (`fk_Haras_ID`) REFERENCES `haras` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gerente`
--

LOCK TABLES `gerente` WRITE;
/*!40000 ALTER TABLE `gerente` DISABLE KEYS */;
INSERT INTO `gerente` VALUES ('$2b$10$RmQudo5uBXx5gg3tdGQbAusujvVw.8mVdxoe6PUv8eo4wrkvQQZWK',1,'Laís','Carvalho','88253514883','1974-03-06','21999907144','laiscarvalho@gmail.com',NULL,1),('$2b$10$g3faUGUQHwMdSt6mYpCZkeldDBqXjFb8NAAdsGyoqGdUHtPhc7zgG',2,'Nicole','Souza','65270451824','1946-04-20','82987324897','nicolesouza@outlook.com',NULL,2),('$2b$10$LBQ3InFpjOhQHy6J1aNUVOb3S2IKNSpAZYJ03JdBDJhcAE8J6bKDe',3,'Murilo','Gael da Costa','86889929080','1965-05-16','86996173836','murilocosta@gmail.com',NULL,1);
/*!40000 ALTER TABLE `gerente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `haras`
--

DROP TABLE IF EXISTS `haras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `haras` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(50) NOT NULL,
  `Rua` varchar(50) NOT NULL,
  `Numero` int DEFAULT NULL,
  `Complemento` varchar(20) DEFAULT NULL,
  `CNPJ` varchar(14) NOT NULL,
  `Bairro` varchar(50) NOT NULL,
  `fk_Proprietario_ID` int DEFAULT NULL,
  `fk_CEP_CEP` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CNPJ` (`CNPJ`),
  KEY `FK_Haras_2` (`fk_Proprietario_ID`),
  KEY `FK_Haras_3` (`fk_CEP_CEP`),
  CONSTRAINT `FK_Haras_2` FOREIGN KEY (`fk_Proprietario_ID`) REFERENCES `proprietario` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Haras_3` FOREIGN KEY (`fk_CEP_CEP`) REFERENCES `cep` (`CEP`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `haras`
--

LOCK TABLES `haras` WRITE;
/*!40000 ALTER TABLE `haras` DISABLE KEYS */;
INSERT INTO `haras` VALUES (1,'Haras Novo Horizonte','Avenida Perimetral',1231,'','75388654000133','Novo Horizonte',1,'68551242'),(2,'Haras Bela Vista','Rua da Gravioleira',4532,'','88214168000140','Caçari',1,'69307772'),(3,'Haras Farofinha','Rua C',345,'','83870685000154','Farolândia',1,'49031416');
/*!40000 ALTER TABLE `haras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pais`
--

DROP TABLE IF EXISTS `pais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pais` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(50) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pais`
--

LOCK TABLES `pais` WRITE;
/*!40000 ALTER TABLE `pais` DISABLE KEYS */;
INSERT INTO `pais` VALUES (1,'Brasil');
/*!40000 ALTER TABLE `pais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `possui`
--

DROP TABLE IF EXISTS `possui`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `possui` (
  `fk_Receita_ID` int DEFAULT NULL,
  `fk_Remedio_ID` int DEFAULT NULL,
  KEY `FK_Possui_1` (`fk_Receita_ID`),
  KEY `FK_Possui_2` (`fk_Remedio_ID`),
  CONSTRAINT `FK_Possui_1` FOREIGN KEY (`fk_Receita_ID`) REFERENCES `consulta_receita` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Possui_2` FOREIGN KEY (`fk_Remedio_ID`) REFERENCES `remedio` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `possui`
--

LOCK TABLES `possui` WRITE;
/*!40000 ALTER TABLE `possui` DISABLE KEYS */;
/*!40000 ALTER TABLE `possui` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proprietario`
--

DROP TABLE IF EXISTS `proprietario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proprietario` (
  `Cpf` varchar(11) NOT NULL,
  `Nome` varchar(20) NOT NULL,
  `Sobrenome` varchar(50) NOT NULL,
  `Telefone` varchar(11) DEFAULT NULL,
  `Data_Nascimento` date NOT NULL,
  `Email` varchar(50) NOT NULL,
  `Rua` varchar(50) NOT NULL,
  `Numero` int DEFAULT NULL,
  `Senha` varchar(256) NOT NULL,
  `Complemento` varchar(20) DEFAULT NULL,
  `ID` int NOT NULL AUTO_INCREMENT,
  `Bairro` varchar(50) NOT NULL,
  `Foto` blob,
  `fk_CEP_CEP` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Cpf` (`Cpf`),
  KEY `FK_Proprietario_2` (`fk_CEP_CEP`),
  CONSTRAINT `FK_Proprietario_2` FOREIGN KEY (`fk_CEP_CEP`) REFERENCES `cep` (`CEP`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proprietario`
--

LOCK TABLES `proprietario` WRITE;
/*!40000 ALTER TABLE `proprietario` DISABLE KEYS */;
INSERT INTO `proprietario` VALUES ('87750408169','Milena','Rebeca Rocha','11982001827','1950-02-18','milena.rebeca.rocha@outlook.com.br','Rua Maracaju',228,'$2b$10$aFIztVnCunkjy65cCOiaoO8tzl3l.dWbR/5wV6xezfM4V7M1rcBQC',NULL,1,'Vila Mariana',NULL,'04013020'),('53368014889','Lucas','Luís da Rosa','54997518632','1973-02-25','lucasrosa@gmail.com','Rua Rocha Pombo',228,'$2b$10$25AU.01egyEiAh6o3XPDIuar0AaB0Ek.Bipnb6w0hcUbuPqVB7TeW',NULL,2,'Cristo Redentor',NULL,'95082220');
/*!40000 ALTER TABLE `proprietario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remedio`
--

DROP TABLE IF EXISTS `remedio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remedio` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remedio`
--

LOCK TABLES `remedio` WRITE;
/*!40000 ALTER TABLE `remedio` DISABLE KEYS */;
/*!40000 ALTER TABLE `remedio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trata`
--

DROP TABLE IF EXISTS `trata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trata` (
  `fk_Cavalo_ID` int DEFAULT NULL,
  `fk_Tratador_ID` int DEFAULT NULL,
  `Dieta` text,
  `ID` int NOT NULL AUTO_INCREMENT,
  `Data` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Trata_2` (`fk_Cavalo_ID`),
  KEY `FK_Trata_3` (`fk_Tratador_ID`),
  CONSTRAINT `FK_Trata_2` FOREIGN KEY (`fk_Cavalo_ID`) REFERENCES `cavalo` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Trata_3` FOREIGN KEY (`fk_Tratador_ID`) REFERENCES `tratador` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trata`
--

LOCK TABLES `trata` WRITE;
/*!40000 ALTER TABLE `trata` DISABLE KEYS */;
/*!40000 ALTER TABLE `trata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tratador`
--

DROP TABLE IF EXISTS `tratador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tratador` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(20) NOT NULL,
  `Sobrenome` varchar(50) NOT NULL,
  `CPF` varchar(11) NOT NULL,
  `Data_Nascimento` date NOT NULL,
  `Telefone` varchar(11) DEFAULT NULL,
  `Email` varchar(50) NOT NULL,
  `Senha` varchar(256) NOT NULL,
  `Foto` blob,
  `fk_Haras_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CPF` (`CPF`),
  KEY `FK_Tratador_2` (`fk_Haras_ID`),
  CONSTRAINT `FK_Tratador_2` FOREIGN KEY (`fk_Haras_ID`) REFERENCES `haras` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tratador`
--

LOCK TABLES `tratador` WRITE;
/*!40000 ALTER TABLE `tratador` DISABLE KEYS */;
/*!40000 ALTER TABLE `tratador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treina`
--

DROP TABLE IF EXISTS `treina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treina` (
  `fk_Cavalo_ID` int DEFAULT NULL,
  `fk_Treinador_ID` int DEFAULT NULL,
  `ID` int NOT NULL AUTO_INCREMENT,
  `Treino` text,
  `Data` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Treina_2` (`fk_Cavalo_ID`),
  KEY `FK_Treina_3` (`fk_Treinador_ID`),
  CONSTRAINT `FK_Treina_2` FOREIGN KEY (`fk_Cavalo_ID`) REFERENCES `cavalo` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Treina_3` FOREIGN KEY (`fk_Treinador_ID`) REFERENCES `treinador` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treina`
--

LOCK TABLES `treina` WRITE;
/*!40000 ALTER TABLE `treina` DISABLE KEYS */;
/*!40000 ALTER TABLE `treina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treinador`
--

DROP TABLE IF EXISTS `treinador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treinador` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nome` varchar(20) NOT NULL,
  `Sobrenome` varchar(20) NOT NULL,
  `CPF` varchar(11) NOT NULL,
  `Telefone` varchar(11) DEFAULT NULL,
  `Email` varchar(50) NOT NULL,
  `Senha` varchar(256) NOT NULL,
  `Data_Nascimento` date DEFAULT NULL,
  `Foto` blob,
  `fk_Haras_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CPF` (`CPF`),
  KEY `FK_Treinador_2` (`fk_Haras_ID`),
  CONSTRAINT `FK_Treinador_2` FOREIGN KEY (`fk_Haras_ID`) REFERENCES `haras` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treinador`
--

LOCK TABLES `treinador` WRITE;
/*!40000 ALTER TABLE `treinador` DISABLE KEYS */;
/*!40000 ALTER TABLE `treinador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `veterinario`
--

DROP TABLE IF EXISTS `veterinario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `veterinario` (
  `Senha` varchar(256) NOT NULL,
  `Nome` varchar(20) NOT NULL,
  `ID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(50) NOT NULL,
  `Telefone` varchar(11) DEFAULT NULL,
  `Data_Nascimento` date NOT NULL,
  `CPF` varchar(11) NOT NULL,
  `Sobrenome` varchar(50) NOT NULL,
  `CRMV` varchar(20) NOT NULL,
  `Foto` blob,
  `fk_Haras_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CPF` (`CPF`),
  KEY `FK_Veterinario_2` (`fk_Haras_ID`),
  CONSTRAINT `FK_Veterinario_2` FOREIGN KEY (`fk_Haras_ID`) REFERENCES `haras` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `veterinario`
--

LOCK TABLES `veterinario` WRITE;
/*!40000 ALTER TABLE `veterinario` DISABLE KEYS */;
/*!40000 ALTER TABLE `veterinario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'horse_house'
--

--
-- Dumping routines for database 'horse_house'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-18 19:29:57
