-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: horse_house
-- ------------------------------------------------------
-- Server version	8.0.40

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

-- lucas.ferreira@exemplo.com
-- L@c4s2025!

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
  `IMP` varchar(20) NOT NULL,
  `fk_Proprietario_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Cavalo_2` (`fk_Proprietario_ID`),
  CONSTRAINT `FK_Cavalo_2` FOREIGN KEY (`fk_Proprietario_ID`) REFERENCES `proprietario` (`ID`) ON DELETE CASCADE
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
INSERT INTO `cep` VALUES ('01001000',1),('20010000',2),('30130110',3),('89010001',4),('90010320',5),('89201100',6),('07221000',7);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cidade`
--

LOCK TABLES `cidade` WRITE;
/*!40000 ALTER TABLE `cidade` DISABLE KEYS */;
INSERT INTO `cidade` VALUES (1,'São Paulo',1),(2,'Rio de Janeiro',2),(3,'Belo Horizonte',3),(4,'Blumenau',4),(5,'Porto Alegre',5),(6,'Joinville',4),(7,'Guarulhos',1);
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
INSERT INTO `estado` VALUES (1,'São Paulo','SP',1),(2,'Rio de Janeiro','RJ',1),(3,'Minas Gerais','MG',1),(4,'Santa Catarina','SC',1),(5,'Rio Grande do Sul','RS',1);
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
  `fk_Haras_ID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CPF` (`CPF`),
  KEY `FK_Gerente_2` (`fk_Haras_ID`),
  CONSTRAINT `FK_Gerente_2` FOREIGN KEY (`fk_Haras_ID`) REFERENCES `haras` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gerente`
--

LOCK TABLES `gerente` WRITE;
/*!40000 ALTER TABLE `gerente` DISABLE KEYS */;
INSERT INTO `gerente` VALUES ('$2b$15$R3qxITMDUx3gtQMaKPXawOidDJte3VEfdo2oe89wyqpb6B/hInMOq',1,'João','Silva','12345678001','1990-01-01','11987654321','joao.silva@exemplo.com',1),('$2b$15$nFzm7iRN7Zu09zqmuxWBV.64lslRv5aWtkOX..4THMXMaor/K/A3K',2,'Mariana','Oliveira','23456789012','1985-06-15','11991234567','mariana.oliveira@exemplo.com',1),('$2b$15$.HezsGDEUqONfOtHM2lnv.6z1pGlD0rli5PREESRCQjh1qJ0z5BZe',3,'Carlos','Souza','34567890123','1978-03-22','11993456789','carlos.souza@exemplo.com',1),('$2b$15$muI39qWPU6bUBkJx8kpcOu3BVUrdwTTXnEIUuFDuZYU3B.QMiB/aS',4,'Ana','Ferreira','45678901234','1995-12-05','11996543210','ana.ferreira@exemplo.com',1),('$2b$15$g4NjkpEoM37AqjL/./EeE..ebXi73LPJmMeI/.DvnFichKb4W.rY6',5,'Ricardo','Almeida','56789012345','1982-10-10','11999887766','ricardo.almeida@exemplo.com',1),('$2b$15$5jo797guB.DYn.G36B39p.3MvWYos22kPl7dAKjtljQQsyy/1wMci',6,'Juliana','Mendes','67890123456','1989-04-08','11998345267','juliana.mendes@exemplo.com',2),('$2b$15$UrFpTKhnAbXcdRt6oKeJZOVjxdQ6Vs59AEozSKPPBxs4HZtUoBmh.',7,'Thiago','Lima','78901234567','1993-11-11','11997654321','thiago.lima@exemplo.com',2);
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
  `Dominio` varchar(20) NOT NULL,
  `fk_Proprietario_ID` int DEFAULT NULL,
  `fk_CEP_CEP` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CNPJ` (`CNPJ`),
  UNIQUE KEY `Dominio` (`Dominio`),
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
INSERT INTO `haras` VALUES (1,'Haras Bela Vista','Estrada Rural',1500,'Km 5','12345678000195','Zona Rural','belavista',1,'01001000'),(2,'Haras São João','Rodovia BR-101',1200,'Fazenda São João','45678932000167','Zona Rural','saojoaoagro',1,'89201100'),(3,'Sítio Nova Esperança','Estrada do Lageado',345,'Km 12','87412365000132','Lageado','novaesperanca',1,'07221000');
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
  `fk_CEP_CEP` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Cpf` (`Cpf`),
  KEY `FK_Proprietario_2` (`fk_CEP_CEP`),
  CONSTRAINT `FK_Proprietario_2` FOREIGN KEY (`fk_CEP_CEP`) REFERENCES `cep` (`CEP`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proprietario`
--

LOCK TABLES `proprietario` WRITE;
/*!40000 ALTER TABLE `proprietario` DISABLE KEYS */;
INSERT INTO `proprietario` VALUES ('39813278050','Lucas','Ferreira','11981234567','1992-11-03','lucas.ferreira@exemplo.com','Praça da Sé',100,'$2b$15$rCAQEDnWl.qrEam8Jb6tlO32nRV6jazsRsKbnp.AHqxiPG5g3Auki','Sala 201',1,'Sé','01001000'),('21579343091','Juliana','Mendes','21998765432','1988-06-17','juliana.mendes@exemplo.com','Avenida Rio Branco',1,'$2b$15$8TmI7zEXGI2SeFJ7xPynm.ZNyLxsNhuFfbEXa653kM2AcZYgseLym','',2,'Centro','20010000'),('52100432065','Thiago','Costa','31996543210','1987-08-09','thiago.costa@exemplo.com','Rua da Bahia',500,'$2b$15$pY14DwT8.FYDt2KlbhMtd.T8MQm1LADU6obWLyK/2mC0mDwWnuK8O','Cobertura',3,'Lourdes','30130110'),('87420915000','Beatriz','Souza','47991234567','1996-02-25','beatriz.souza@exemplo.com','Rua XV de Novembro',123,'$2b$15$SKIEgexqkEvQtYlFBc6n7OkeumSerBjFNRF3WztGkc..BoiMlCOHK','',4,'Centro','89010001'),('06382969086','Fernando','Lima','51999887766','1975-03-30','fernando.lima@exemplo.com','Avenida Borges de Medeiros',1500,'$2b$15$Ee/jMeABMvOCWUqfFgA8zeVAaUIG0WbO2ioG6BJe.f4vJsy7X.q8a','Conj. 5',5,'Centro Histórico','90010320');
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

-- Dump completed on 2025-05-13 10:56:10
