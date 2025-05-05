# Controllers

Os controllers nesta aplicação têm como responsabilidade principal orquestrar a comunicação entre as requisições HTTP recebidas pela aplicação e a camada de serviços, que contém a lógica de negócio.

## Objetivo

Cada controller representa um domínio específico da aplicação (ex: `TransactionsController` para transações financeiras) e atua como intermediário entre a entrada do cliente (via API) e os serviços que manipulam os dados.

A classe base `Controller` fornece um mecanismo padronizado para registrar rotas e tratar erros, promovendo reutilização de código e padronização das respostas da API. Todas as rotas registradas utilizam o `express.Router()` de forma encapsulada, e incluem suporte nativo a rotas públicas ou protegidas (controladas via middleware).

## Funcionalidades principais

-   Registro automático de rotas com método HTTP, endpoint, callback, código de resposta e proteção opcional.
-   Tratamento centralizado de erros, com distinção entre erros esperados (ex: `HttpError`) e erros internos.
-   Suporte a tipagem utilizando JSDoc para melhor experiência de desenvolvimento com editores como VSCode.
-   Integração com middlewares de autenticação, permitindo declarar se uma rota é protegida ou pública.

## Exemplo

Essa função `register` recebe 3 parâmetros obrigatórios e 2 opcionais

```ts
function register(
    metodo: string,
    endpoint: string,
    funcao_callback: () => any,
    status_padrao: number,
    rota_protegida: boolean,
) {}
```

```js
this.register('POST', '/', this.create.bind(this), 201, true);
```

Esse trecho define uma rota POST protegida para o endpoint `/transactions/`, que será tratada pelo método `create`, retornando `201` em caso de sucesso.

## Estrutura

-   **Controller.js**: Define a classe abstrata `Controller`, utilizada como base por todos os controllers da aplicação.
-   **transactions.controller.js**: Implementa as operações relacionadas ao domínio de transações financeiras (`create`, `find`, `update`, `delete`), consumindo os serviços correspondentes.

## Boas práticas

-   Toda lógica de negócio deve estar isolada nos serviços, mantendo os controllers leves e focados em receber requisições, validar os dados mínimos e delegar o processamento.
-   Utilize a tipagem via JSDoc para facilitar a leitura e reduzir erros em tempo de desenvolvimento.
-   Erros esperados devem ser lançados com instâncias de `HttpError` ou subclasses específicas como `BadRequestError`.

---

Este diretório segue uma abordagem modular e escalável para a definição de endpoints da API RESTful da aplicação.
