## Tecnologias e Ferramentas
O projeto utiliza uma stack moderna e tipada para desenvolvimento mobile multiplataforma (Android, iOS e Web):

* **[React Native]** - Framework para construção de interfaces nativas.
* **[Expo]** - Plataforma para desenvolvimento universal com suporte à *New Architecture* habilitada (`newArchEnabled: true`).
* **[Expo Router]** - Roteamento baseado em arquivos para React Native (estilo File-based routing).
* **[TanStack Query (React Query)]**- Gerenciamento de estado assíncrono, cache e sincronização de dados.
* **[React Hook Form]** - Gerenciamento de formulários performático e flexível.
* **[Zod]** - Validação de esquemas TypeScript-first.
* **[TypeScript]** - Tipagem estática para maior segurança e produtividade.

## Estruturas do Projeto
```text
catalogo/
├── .expo/                # Arquivos de cache e configuração do Expo
├── node_modules/         # Dependências do projeto
├── app/                  # Rotas e telas (Expo Router)
├── assets/               # Imagens, fontes e recursos estáticos
├── app.json              # Configurações do Expo (slug, scheme, plataformas)
├── babel.config.js       # Configuração do Babel para Expo
├── package.json          # Dependências e scripts do projeto
└── tsconfig.json         # Configuração do TypeScript

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (LTS recomendado)
* Gerenciador de pacotes `npm` ou `yarn` / `pnpm` / `bun`
* Aplicativo **Expo Go** no seu smartphone (Android/iOS) ou um emulador configurado (Android Studio / Xcode).

## Instalação

1. Clone o repositório ou descompacte os arquivos do projeto:
   ```bash
   git clone <url-do-repositorio>
   cd catalogo
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```
## Como Executar

Para iniciar o servidor de desenvolvimento do Expo, utilize um dos comandos abaixo:

* **Iniciar o Metro Bundler (geral):**
  ```bash
  npm start
  ```

* **Executar no Android:**
  ```bash
  npm run android
  ```

* **Executar no iOS (necessário macOS):**
  ```bash
  npm run ios
  ```

* **Executar na Web:**
  ```bash
  npm run web
  ```