# Oh My Cash - [Controle Financeiro Pessoal]

## 📝 Descrição

API RESTful completa para gerenciamento financeiro pessoal, incluindo controle de usuários, categorias e transações. Suporte à autenticação JWT, validações robustas e filtros avançados para busca de dados.

## 🚀 Tecnologias utilizadas

-   Node.js
-   Express.js
-   PostgreSQL
-   JWT (jsonwebtoken)
-   Bcrypt
-   dotenv
-   cors
-   qs

## 🔧 Como executar

```bash
# Clone o repositório
git clone https://github.com/HormigaDev/oh-my-cash

# Instale as dependências
npm install

# Configure o banco de dados
# Crie um arquivo .env com suas variáveis de ambiente
# Exemplo:
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=postgres
# DATABASE_PASSWORD=postgres
# DATABASE_NAME=ohmycash
# JWT_SECRET=sua-chave-secreta

# Rode o script SQL para criar as tabelas ubicado em:
# src/databse/init.sql

# Inicie o servidor
npm run dev
```

# 📚 Documentação da API

## 🎯 Endpoints com exemplos

### 👤 Usuários

#### `POST /users`

Cria um novo usuário.

**Request:**

```json
{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "SenhaForte@123"
}
```

**Response:**

```json
{
    "user": {
        "id": 1,
        "name": "João Silva",
        "email": "joao@email.com"
    }
}
```

#### `POST /users/get-token`

Autentica e retorna o token JWT.

**Request:**

```json
{
    "email": "joao@email.com",
    "password": "SenhaForte@123"
}
```

**Response:**

```json
{
    "token": "jwt.token.aqui"
}
```

#### `GET /users/me`

Retorna os dados do usuário autenticado.

**Response:**

```json
{
    "user": {
        "id": 1,
        "name": "João Silva",
        "email": "joao@email.com"
    }
}
```

#### `PUT /users/me`

Atualiza completamente os dados do usuário.

**Request:**

```json
{
    "name": "João Atualizado",
    "email": "joao@novoemail.com"
}
```

**Response:**

```json
{
    "message": "Usuário atualizado com sucesso!"
}
```

#### `PATCH /users/me`

Atualiza parcialmente os dados do usuário.

**Request:**

```json
{
    "name": "João Parcial"
}
```

**Response:**

```json
{
    "message": "Usuário atualizado com sucesso!"
}
```

#### `PATCH /users/inactive`

Inativa o usuário autenticado.

**Response:**

```json
{
    "message": "Usuário inativado com sucesso!"
}
```

#### `DELETE /users/me`

Remove o próprio usuário.

**Response:**
204 No Content

### 🗂️ Categorias

#### `POST /categories`

Cria uma nova categoria.

**Request:**

```json
{
    "name": "Transporte"
}
```

**Response:**

```json
{
    "category": {
        "id": 1,
        "name": "Transporte"
    }
}
```

#### `GET /categories`

Lista todas as categorias do usuário autenticado.

**Response:**

```json
{
    "categories": [
        {
            "id": 1,
            "name": "Transporte"
        }
    ]
}
```

#### `PUT /categories/:id`

Atualiza uma categoria existente.

**Request:**

```json
{
    "name": "Lazer"
}
```

**Response:**

```json
{
    "message": "Categoria atualizada com sucesso!"
}
```

#### `DELETE /categories/:id`

Remove uma categoria.

**Response:**
204 No Content

### 💸 Transações

#### `POST /transactions`

Cria uma nova transação.

**Request:**

```json
{
    "type": "expense",
    "amount": 100,
    "date": "2025-05-01",
    "description": "Supermercado",
    "categoryId": 1
}
```

**Response:**

```json
{
    "transaction": {
        "id": 1,
        "type": "expense",
        "amount": 100,
        "description": "Supermercado"
    }
}
```

#### `GET /transactions`

Lista transações com filtros opcionais.

**Exemplo de requisição com filtros:**

```
GET /transactions?type=income&limit=10&page=1
```

**Response:**

```json
{
    "transactions": [
        {
            "id": 1,
            "type": "expense",
            "amount": 100,
            "description": "Supermercado"
        }
    ],
    "total": 1
}
```

#### `PATCH /transactions/:id`

Atualiza parcialmente uma transação.

**Request:**

```json
{
    "description": "Farmácia"
}
```

**Response:**

```json
{
    "message": "Transação alterada com sucesso!"
}
```

#### `DELETE /transactions/:id`

Remove uma transação.

**Response:**
204 No Content

## 🔒 Autenticação

Todas as rotas protegidas exigem autenticação JWT.

**Exemplo de header:**

```http
Authorization: Bearer <token>
```

## 🧪 Validações

-   Nome: entre 2 e 100 caracteres alfanuméricos.
-   Email: válido e único.
-   Senha: no mínimo 12 caracteres com maiúscula, minúscula, número e caractere especial.
-   Datas: no formato yyyy-mm-dd.
-   Categorias: únicas por usuário.
-   Transações: valores numéricos não nulos, categoria válida.

## 📁 Estrutura do Projeto

```
oh-my-cash/
├── .env.template
├── .prettierrc
├── README.md
├── middlewares.js
├── package-lock.json
├── package.json
├── router.js
├── server.js
└── src
    ├── controllers
    │   ├── README.md
    │   ├── categories.controller.js
    │   ├── transactions.controller.js
    │   └── users.controller.js
    ├── database
    │   ├── init.sql
    │   └── queries
    │       ├── README.md
    │       ├── categories.sql
    │       ├── transactions.sql
    │       └── users.sql
    ├── middlewares
    │   ├── authMiddleware.js
    │   └── queryParser.js
    ├── schemas
    │   ├── category.schema.js
    │   ├── transaction-filters.schema.js
    │   ├── transaction.schema.js
    │   └── user.schema.js
    ├── services
    │   ├── categories.service.js
    │   ├── transactions.service.js
    │   └── users.service.js
    └── utils
        ├── Controller.js
        ├── QueryManager.js
        ├── Service.js
        ├── Times.js
        └── errors.js
```

## ✅ Status

API estável e funcional, com arquitetura modular, tratamento de erros, validações personalizadas e autenticação segura.
