
# Progressio — Evolução Arquitetural

**Disciplina:** Programação para Sistemas Web  
**Atividade:** Evolução Arquitetural do Projeto Final  
**Integrante:** Thainara de Fátima Jacob Vieira  
**Tecnologias:** React 19, TypeScript, Vite, Node.js, Fastify e MySQL

## 1. Apresentação do projeto

O **Progressio** é uma aplicação web desenvolvida para organizar fichas de treino e acompanhar a evolução dos exercícios físicos.

O sistema possui funcionalidades como:

- Login demonstrativo.
- Catálogo de exercícios integrado à API wger.
- Cadastro e gerenciamento de fichas de treino.
- Inclusão, edição e exclusão de exercícios.
- Registro de sessões de treinamento.
- Dashboard de acompanhamento.
- Histórico de treinos e gráficos de evolução.
- Pesquisa e paginação das fichas.

Nesta etapa, o projeto passou por uma evolução arquitetural, utilizando arquitetura em camadas, persistência em MySQL, validação de entradas com Fastify e integração entre backend e frontend React.

A entidade central escolhida para a refatoração foi **treinos**, responsável pelo gerenciamento das fichas e seus exercícios.

As fichas e os exercícios são armazenados no MySQL. O histórico de sessões e o login demonstrativo permanecem no armazenamento local do navegador (`localStorage`).

## 2. Arquitetura escolhida e justificativa

Foi adotada uma **arquitetura em camadas organizada por funcionalidade**.

Essa abordagem permite separar as responsabilidades do sistema, facilitando sua manutenção, organização, reutilização de código e evolução.

O backend foi organizado nas seguintes camadas:

| Camada | Responsabilidade |
|---|---|
| Routes | Definição dos endpoints da API |
| Controllers | Recebimento das requisições e respostas HTTP |
| Services | Regras de negócio e operações da aplicação |
| Repositories | Consultas SQL e persistência dos dados |
| Schemas | Validação das entradas com Fastify |
| Database | Configuração da conexão com MySQL |

O frontend React utiliza componentes reutilizáveis, páginas e serviços responsáveis pela comunicação com a API.

A separação permite modificar regras de negócio ou consultas SQL sem concentrar todas as funcionalidades em um único arquivo.

## 3. Estrutura de pastas

```text
progressio/
├── backend/
│   ├── database/
│   │   └── setup.sql
│   ├── src/
│   │   ├── database/
│   │   │   └── connection.ts
│   │   ├── modules/
│   │   │   └── treinos/
│   │   │       ├── treinos.routes.ts
│   │   │       ├── treinos.controller.ts
│   │   │       ├── treinos.service.ts
│   │   │       ├── treinos.repository.ts
│   │   │       ├── treinos.schemas.ts
│   │   │       └── treinos.types.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── features/
│   │   └── treinos/
│   │       └── components/
│   │           └── TreinosNavegacao.tsx
│   ├── pages/
│   │   └── Workouts.tsx
│   ├── services/
│   │   ├── treinosApi.ts
│   │   ├── exerciseApi.ts
│   │   ├── workoutStorage.ts
│   │   └── authStorage.ts
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── docs/
├── evidencias/
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── vite.config.ts
```

### Responsabilidades dos principais arquivos

**Backend:**

- `server.ts`: inicialização do servidor Fastify.
- `connection.ts`: configuração do pool de conexões com MySQL.
- `treinos.routes.ts`: definição das rotas.
- `treinos.controller.ts`: tratamento das requisições HTTP.
- `treinos.service.ts`: aplicação das regras de negócio.
- `treinos.repository.ts`: execução das consultas SQL.
- `treinos.schemas.ts`: validação dos dados recebidos.
- `treinos.types.ts`: definição dos tipos utilizados.
- `setup.sql`: criação do banco e da tabela de treinos.

**Frontend:**

- `Workouts.tsx`: interface de gerenciamento das fichas.
- `TreinosNavegacao.tsx`: pesquisa e paginação.
- `treinosApi.ts`: comunicação com o backend.
- `exerciseApi.ts`: comunicação com o catálogo externo de exercícios.
- `workoutStorage.ts`: armazenamento local do histórico.
- `authStorage.ts`: autenticação demonstrativa.

## 4. Fluxo de uma requisição

O sistema utiliza comunicação entre o frontend React, a API Fastify e o banco de dados MySQL.

Exemplo do fluxo de pesquisa e paginação:

```text
Usuário acessa Minhas fichas
             |
             v
Interface React (Workouts.tsx)
             |
             v
Componente TreinosNavegacao
             |
             v
Serviço treinosApi.ts
             |
             v
Rota Fastify
             |
             v
Controller
             |
             v
Service
             |
             v
Repository
             |
             v
Banco de dados MySQL
             |
             v
Resposta JSON
             |
             v
Atualização da interface React
```

O repository executa as consultas SQL parametrizadas, enquanto o service concentra as regras da aplicação.

O controller recebe o resultado e retorna a resposta HTTP para o frontend.

## 5. Configuração e execução

### 5.1. Pré-requisitos

Para executar o projeto localmente, são necessários:

- Node.js e npm.
- MySQL 8.x.
- MySQL Workbench ou outro cliente SQL.
- Editor de código, como Visual Studio Code.
- Navegador web.
- Conexão com a internet para acessar a API externa de exercícios.

Recomenda-se Node.js 20.19 ou superior, ou 22.12 ou superior, conforme os requisitos do Vite utilizado.

### 5.2. Configuração do banco de dados

Abra o MySQL Workbench e execute o arquivo:

```text
backend/database/setup.sql
```

Esse script cria o banco de dados `progressio` e a tabela `treinos`, caso ainda não existam.

A tabela possui os seguintes campos:

| Campo | Finalidade |
|---|---|
| id | Identificador da ficha |
| nome | Nome do treino |
| exercicios | Exercícios armazenados em JSON |
| criado_em | Data e hora da criação |

O script também adiciona uma ficha inicial chamada `Treino A`, caso ela ainda não exista.

Para verificar os registros:

```sql
USE progressio;

SELECT id, nome, criado_em
FROM treinos
ORDER BY criado_em;
```

### 5.3. Configuração das variáveis de ambiente

Na pasta `backend`, copie o arquivo `.env.example` e renomeie a cópia para `.env`.

Configure os dados de conexão:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=progressio
PORT=3333
CORS_ORIGIN=http://localhost:5173
```

O campo `DB_PASSWORD` deve receber a senha do MySQL configurada no computador.

O arquivo `.env` contém configurações locais e não deve ser publicado no GitHub.

O arquivo `.env.example` deve permanecer no repositório como modelo de configuração, sem credenciais pessoais.

### 5.4. Executar o backend

Abra um terminal na pasta principal do projeto e execute:

```bash
cd backend
npm install
npm run dev
```

O backend será iniciado na porta `3333`.

Endereço local:

```text
http://localhost:3333
```

Para verificar o funcionamento da API e sua conexão com o banco:

```text
http://localhost:3333/health
```

### 5.5. Executar o frontend

Abra outro terminal na pasta principal `progressio`.

Execute:

```bash
npm install
npm run dev
```

O frontend será iniciado pelo Vite.

Endereço local:

```text
http://localhost:5173
```

O backend e o frontend devem permanecer em execução simultaneamente.

### 5.6. Acesso demonstrativo

O sistema possui um login de demonstração:

```text
E-mail: usuario@progressio.com
Senha: 123456
```

O e-mail é normalizado antes da comparação, permitindo o acesso com letras maiúsculas ou minúsculas.

Exemplos aceitos:

```text
usuario@progressio.com
USUARIO@PROGRESSIO.COM
Usuario@Progressio.Com
```

O login demonstrativo utiliza `localStorage` e não representa um sistema de autenticação de produção.

## 6. Endpoints da API

A API utiliza métodos HTTP para implementar as operações de gerenciamento das fichas.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/health` | Verifica a API e a conexão com MySQL |
| GET | `/treinos` | Lista todas as fichas |
| GET | `/treinos/:id` | Consulta uma ficha pelo ID |
| POST | `/treinos` | Cadastra uma nova ficha |
| PUT | `/treinos/:id` | Atualiza uma ficha |
| DELETE | `/treinos/:id` | Exclui uma ficha |
| GET | `/treinos/paginated` | Consulta fichas com busca e paginação |

### 6.1. Primeiro exemplo de paginação

Consulta da primeira página, com limite de 10 registros e filtro por nome:

```http
GET http://localhost:3333/treinos/paginated?page=1&limit=10&search=Costas
```

### 6.2. Segundo exemplo de paginação

Consulta da segunda página, com limite de cinco registros:

```http
GET http://localhost:3333/treinos/paginated?page=2&limit=5&search=Treino
```

### 6.3. Formato da resposta

A API retorna os registros e os metadados de paginação no formato JSON.

Exemplo ilustrativo:

```json
{
  "data": [
    {
      "id": "treino-a",
      "nome": "Treino A",
      "exercicios": [],
      "criadoEm": "2026-11-22T17:23:05.591Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Os campos representam:

- `data`: lista de registros encontrados.
- `total`: quantidade total de registros filtrados.
- `page`: página atual.
- `limit`: quantidade máxima de registros por página.
- `totalPages`: total de páginas disponíveis.

## 7. Busca e paginação no MySQL

A paginação é realizada diretamente no banco de dados, utilizando consultas SQL parametrizadas.

O backend calcula o deslocamento:

```typescript
const offset = (page - 1) * limit
```

A consulta utiliza:

- `LIKE` para aplicar filtros pelo nome da ficha.
- `LIMIT` para limitar a quantidade de registros.
- `OFFSET` para selecionar a página.
- `ORDER BY` para manter a ordenação previsível.
- `COUNT(*)` para obter o total de registros filtrados.

Os valores fornecidos pelo usuário são enviados como parâmetros, evitando sua concatenação direta na consulta SQL.

O endpoint original de listagem foi preservado para manter a compatibilidade com as funcionalidades existentes.

## 8. Validações e regras de negócio

O sistema utiliza JSON Schemas do Fastify para validar entradas recebidas pela API.

### 8.1. Validação de cadastro e edição

As operações de cadastro e edição verificam:

- Nome obrigatório.
- Limite de 120 caracteres para o nome.
- Lista de exercícios válida.
- Limite de 300 exercícios por ficha.
- Tipos e valores dos campos dos exercícios.

Entradas inválidas são rejeitadas pela API.

### 8.2. Validação de paginação

Os parâmetros utilizados na paginação seguem as regras:

| Parâmetro | Regra |
|---|---|
| page | Inteiro maior ou igual a 1 |
| limit | Inteiro entre 1 e 50 |
| search | Texto opcional com até 100 caracteres |

Valores padrão:

```text
page = 1
limit = 10
search = ""
```

Exemplo de requisição inválida:

```http
GET http://localhost:3333/treinos/paginated?page=0
```

A API rejeita essa entrada com HTTP `400 Bad Request`, pois o valor mínimo permitido para `page` é 1.

### 8.3. Prevenção de fichas duplicadas

O backend verifica no MySQL se já existe uma ficha com o mesmo nome antes de realizar um cadastro ou alteração.

A comparação desconsidera diferenças entre letras maiúsculas e minúsculas.

Exemplo:

```text
Treino A
TREINO A
treino a
```

Esses nomes são considerados equivalentes.

Caso a ficha já exista, a API rejeita a operação, retornando HTTP `409 Conflict`.

A validação ocorre no backend e não depende somente das fichas exibidas na página atual do React.

### 8.4. Validação dos exercícios

Para exercícios de musculação:

- O número de séries deve ser maior que zero.
- O número de repetições deve ser maior que zero.
- A carga não pode ser negativa.

Para exercícios cardiovasculares:

- O tempo de execução deve ser maior que zero.
- Séries e repetições podem permanecer zeradas quando o exercício utiliza tempo.

O sistema também impede que o mesmo identificador de exercício seja adicionado duas vezes à mesma ficha.

### 8.5. Outras regras

- Não é permitido excluir a última ficha existente.
- Operações com fichas inexistentes retornam erro apropriado.
- Os exercícios são mantidos associados às respectivas fichas.
- O cadastro, a edição e a exclusão são realizados por meio da API.

## 9. Integração com React

A tela **Minhas fichas** foi integrada ao novo endpoint de busca e paginação.

A interface disponibiliza:

- Campo de pesquisa por nome.
- Paginação com botões Anterior e Próxima.
- Indicação da página atual.
- Total de fichas encontradas.
- Mensagens de carregamento.
- Tratamento de erros da API.
- Exibição de lista vazia.
- Cadastro de fichas.
- Edição dos nomes.
- Exclusão de fichas.
- Inclusão e gerenciamento dos exercícios.

A pesquisa possui um pequeno intervalo após a digitação, reduzindo requisições desnecessárias ao backend.

As funcionalidades anteriores da aplicação foram preservadas.

## 10. Persistência dos dados

As fichas e seus exercícios são armazenados na tabela `treinos` do banco de dados `progressio`.

O campo `exercicios` utiliza o tipo JSON, permitindo armazenar os dados associados a cada exercício.

Entre as informações armazenadas estão:

- Identificador do exercício.
- Nome.
- Categoria.
- Tipo.
- Equipamento.
- Séries.
- Repetições.
- Carga.
- Tempo, quando aplicável.

Para consultar os exercícios de uma ficha:

```sql
USE progressio;

SELECT JSON_PRETTY(exercicios) AS exercicios_salvos
FROM treinos
WHERE nome = 'Treino A';
```

Para visualizar os exercícios em linhas separadas:

```sql
USE progressio;

SELECT
    jt.nome AS exercicio,
    jt.series,
    jt.repeticoes,
    jt.carga,
    jt.equipamento
FROM treinos t,
JSON_TABLE(
    t.exercicios,
    '$[*]' COLUMNS (
        nome VARCHAR(150) PATH '$.nome',
        series INT PATH '$.series',
        repeticoes INT PATH '$.repeticoes',
        carga DECIMAL(10,2) PATH '$.carga',
        equipamento VARCHAR(100) PATH '$.equipamento'
    )
) AS jt
WHERE t.nome = 'Treino A';
```

Essas consultas permitem verificar diretamente no MySQL os exercícios cadastrados no sistema.

O histórico de sessões realizadas continua armazenado no `localStorage` do navegador.

## 11. Testes realizados

Foram realizados testes locais utilizando React, Fastify e MySQL.

### 11.1. Cadastro de fichas

Foi cadastrada uma ficha chamada `Treino B`.

Após atualizar a página, a ficha permaneceu cadastrada, demonstrando a persistência dos dados.

### 11.2. Pesquisa

A pesquisa pelo termo `treino b` retornou somente a ficha correspondente.

### 11.3. Paginação

Foram cadastradas 11 fichas para verificar a navegação entre páginas.

O sistema apresentou:

```text
11 fichas encontradas — Página 2 de 2
```

O botão Anterior permitiu retornar à primeira página.

### 11.4. Edição

A ficha `Treino B` foi renomeada para:

```text
Treino B - Costas
```

A alteração permaneceu após atualizar a página e foi confirmada no MySQL.

### 11.5. Exclusão

A ficha `Treino K` foi excluída.

Após a exclusão, a API retornou 10 fichas cadastradas.

### 11.6. Validação da API

Foi realizada uma requisição utilizando:

```http
GET http://localhost:3333/treinos/paginated?page=0
```

O Fastify rejeitou o parâmetro inválido com a mensagem:

```json
{
  "erro": "Dados inválidos",
  "detalhes": "querystring/page must be >= 1"
}
```

### 11.7. Validação de nomes duplicados

Foi realizada uma tentativa de cadastrar outra ficha chamada `TREINO A`, quando já existia `Treino A`.

O sistema impediu a operação.

### 11.8. Validação de séries e repetições

Foi testada a tentativa de salvar um exercício de musculação com zero séries ou zero repetições.

O sistema impediu o salvamento inválido.

### 11.9. Persistência no MySQL

As fichas foram consultadas diretamente pelo MySQL Workbench.

Os registros encontrados corresponderam aos dados apresentados pela API e pela interface.

Também foi realizada uma consulta para visualizar os exercícios armazenados na ficha `Treino A`.

## 12. Evidências

As capturas de tela dos testes estão organizadas na pasta `evidencias`.

| Arquivo | Descrição |
|---|---|
| `01_mysql_treinos.png` | Criação e consulta da tabela de treinos |
| `02_fichas_mysql.png` | Listagem de fichas no React |
| `03_pesquisa_treinos.png` | Pesquisa por nome |
| `04_paginacao_treinos.png` | Navegação entre páginas |
| `05_edicao_treino.png` | Edição de ficha |
| `06_exclusao_treino_K.png` | Exclusão de ficha |
| `07_validacao_fastify.png` | Validação de parâmetros inválidos |
| `08_api_paginada.png` | Resposta JSON da API paginada |
| `09_mysql_final.png` | Confirmação dos registros no MySQL |
| `10_exercicios_salvos_mysql.png` | Consulta dos exercícios armazenados |

As evidências demonstram a integração entre o React, a API Fastify e o banco MySQL, além do funcionamento das principais operações do CRUD.
