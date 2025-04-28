# Documentação Swagger da API Horse House

Este documento explica como acessar e utilizar a documentação Swagger da API Horse House.

## O que é Swagger?

Swagger (OpenAPI) é uma ferramenta que permite documentar APIs de forma padronizada e interativa. Com o Swagger UI, você pode:

- Visualizar todos os endpoints disponíveis na API
- Testar os endpoints diretamente pela interface
- Ver os modelos de dados utilizados pela API
- Entender os parâmetros necessários para cada requisição
- Visualizar os possíveis códigos de resposta

## Como acessar a documentação Swagger

A documentação Swagger da API Horse House está disponível em:

```
http://localhost:3000/api-docs
```

Basta iniciar o servidor com `npm start` e acessar o endereço acima em seu navegador.

## Autenticação

A maioria dos endpoints da API requer autenticação via token JWT. Para testar esses endpoints no Swagger UI:

1. Primeiro, faça login usando o endpoint `/api/login`
2. Copie o token JWT retornado na resposta
3. Clique no botão "Authorize" no topo da página do Swagger UI
4. Cole o token no campo "Value" (sem adicionar "Bearer " - o Swagger fará isso automaticamente)
5. Clique em "Authorize" e depois em "Close"

Agora você está autenticado e pode testar os endpoints protegidos.

## Categorias de APIs

A API Horse House está organizada nas seguintes categorias:

- **Autenticação**: Endpoints para login e verificação de token
- **Usuários**: Endpoints para gerenciar dados de usuários
- **Proprietários**: Endpoints para gerenciar proprietários
- **Haras**: Endpoints para gerenciar haras
- **Gerentes**: Endpoints para gerenciar gerentes
- **Funcionários**: Endpoints para gerenciar funcionários (gerentes, treinadores, veterinários, tratadores)
- **Cavalos**: Endpoints para gerenciar cavalos
- **Utilitários**: Endpoints utilitários como consulta de CEP

## Instalação das dependências

As dependências necessárias para o Swagger já estão incluídas no projeto. Se precisar instalá-las manualmente:

```bash
npm install swagger-jsdoc swagger-ui-express --save
```

## Estrutura da documentação

A documentação Swagger é gerada automaticamente a partir das anotações JSDoc nos arquivos de código. Cada endpoint é documentado com:

- Método HTTP e caminho
- Descrição e resumo
- Parâmetros necessários
- Corpo da requisição (quando aplicável)
- Possíveis respostas
- Esquemas de dados

## Exportando a documentação

Você pode exportar a documentação Swagger em formato JSON acessando:

```
http://localhost:3000/swagger.json
```

Este arquivo pode ser importado em outras ferramentas compatíveis com OpenAPI.