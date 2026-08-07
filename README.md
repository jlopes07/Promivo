# 🚀 Promivo - SaaS Comparador de Ofertas & Ferramenta para Afiliados

O **Promivo** é uma plataforma SaaS moderna, responsiva, modular e escalável desenvolvida para monitoramento e divulgação de ofertas de produtos nos principais marketplaces e lojas online.

O sistema é dividido em duas áreas totalmente distintas:
1. **Área Pública (Home)**: Otimizada para SEO, exibição de ofertas em destaque, busca em tempo real, filtros por categoria, ordenação inteligente e cards modernos com tema escuro e claro.
2. **Área Privada Secret (Painel de Afiliados)**: Rota oculta (`/painel-afiliados.html`) protegida por Firebase Authentication. Permite o cadastro rápido de ofertas e conta com um **gerador automático de mídias/cópias de vendas** (WhatsApp, Telegram, Instagram, Facebook, CTA, Hashtags) com botões de cópia em 1 clique.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core**: HTML5 Semântico, CSS3 (Design System com CSS Custom Properties), JavaScript ES6+ (Arquitetura de Módulos ESM).
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/) v5.
- **Backend & Cloud**:
  - **Firebase Authentication**: Autenticação por e-mail e senha para afiliados.
  - **Cloud Firestore**: Banco de dados NoSQL em tempo real.
  - **Firebase Storage**: Armazenamento de imagens e mídias.
  - **Firebase Hosting**: Hospedagem de alta performance com HTTPS e rotas limpas.
- **Design Aesthetic**: Inspirado no Notion, Linear, Vercel e Stripe (Bordas arredondadas, sombras suaves, tipografia Inter, Dark/Light Mode automático e manual).

---

## 📂 Estrutura do Projeto

```text
Promivo/
├── .env                        # Variáveis de ambiente do Firebase (VITE_API_KEY, etc.)
├── firebase.json               # Configuração do Firebase Hosting e Rewrites
├── firestore.rules             # Regras de segurança do Cloud Firestore
├── storage.rules               # Regras de segurança do Firebase Storage
├── vite.config.js              # Configuração multi-páginas do Bundler Vite
├── package.json                # Dependências do projeto
├── README.md                   # Documentação do projeto
├── index.html                  # Área Pública (Home)
├── painel-afiliados.html        # Área Privada (Login & Gerador de Afiliados)
└── src/
    ├── main.js                 # Script principal da área pública
    ├── pages/
    │   └── affiliatePanel.js   # Lógica do painel de afiliados e proteção de rota
    ├── firebase/
    │   └── config.js           # Inicialização e exportação dos serviços do Firebase
    ├── services/
    │   ├── authService.js      # Autenticação e bloqueio de usuários não autorizados
    │   ├── offersService.js    # CRUD de ofertas no Cloud Firestore
    │   └── categoriesService.js# Gestão e Seeding de categorias
    ├── utils/
    │   ├── copyGenerator.js    # Motor de geração de cópias (WhatsApp, Telegram, IG, FB, etc.)
    │   ├── clipboard.js        # Utilitário de cópia para área de transferência com toast
    │   ├── formatters.js       # Formatadores de moeda (BRL), desconto (%) e datas
    │   └── theme.js            # Gerenciador de Dark/Light mode + preferência do SO
    ├── components/
    │   ├── Header.js           # Cabeçalho global com busca e controle de tema
    │   ├── ProductCard.js      # Card moderno de oferta
    │   ├── CategoryFilter.js   # Chips responsivos de seleção de categorias
    │   ├── CopyTool.js         # Interface de preview e botões de cópia rápida
    │   └── Toast.js            # Notificações estilo Vercel/Linear
    └── styles/
        ├── main.css            # Tokens de design, variáveis CSS e reset
        ├── theme.css           # Regras de transição de tema Dark/Light
        ├── components.css      # Estilos dos componentes modulares
        └── utilities.css       # Utilitários, botões, formulários e layouts
```

---

## 🔒 Segurança & Área Privada

- **Sem botões de login/registro na Home pública**: Visitantes navegam normalmente sem saber a rota de login.
- **Acesso exclusivo por URL secreta**: A rota `/painel-afiliados` é protegida.
- **Bloqueio de e-mails não autorizados**: Tentativas de autenticação com e-mails que não possuam flag `authorized: true` no Firestore são encerradas imediatamente.
- **Sem cadastro público**: Toda a criação de contas é administrada diretamente pelo proprietário no Firebase Authentication.

---

## 🏷️ Categorias Suportadas

O banco de dados Firestore é semeado automaticamente na primeira execução com 8 categorias iniciais e suporte expansível:

- **Categorias Iniciais**: Suplementos, Mercado, Peças de computador, Games, Livros, Perfumes, Cosméticos, Produtos fitness.
- **Categorias Expansíveis**: Smartphones, Informática, Eletrônicos, Eletrodomésticos, Casa e Cozinha, Ferramentas, Papelaria, Brinquedos, Moda, Calçados, Bebidas, Pet Shop, Móveis, Automotivo.

---

## 📋 Coleções no Cloud Firestore

1. **`users`**: Armazena status de autorização (`authorized: true/false`), role (`admin`/`affiliate`) e último acesso.
2. **`categories`**: Nomes, slugs e ícones das categorias.
3. **`products`**: Cadastro de produtos e especificações.
4. **`offers`**: Ofertas ativas publicadas com preços, links de afiliado, cupons e imagens.
5. **`settings`**: Configurações gerais do sistema.
6. **`logs`**: Histórico de ações e publicações.

---

## ⚡ Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18+) e NPM instalados.

### 1. Clonar e instalar dependências
```bash
npm install
```

### 2. Configurar o arquivo `.env`
Verifique se o arquivo `.env` na raiz do projeto contém as chaves do seu projeto Firebase:
```env
VITE_API_KEY=sua_api_key
VITE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_PROJECT_ID=seu-projeto
VITE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_MESSAGING_SENDER_ID=seu_sender_id
VITE_APP_ID=seu_app_id
VITE_MEASUREMENT_ID=seu_measurement_id
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:5173`. Para acessar o painel de afiliados, acesse `http://localhost:5173/painel-afiliados.html`.

### 4. Gerar build de produção
```bash
npm run build
```

---

## 🚀 Implantação (Deploy) no Firebase Hosting

1. Instale a Firebase CLI globalmente (caso não possua):
   ```bash
   npm install -g firebase-tools
   ```
2. Faça login na sua conta do Firebase:
   ```bash
   firebase login
   ```
3. Associe o projeto (se necessário):
   ```bash
   firebase use --add
   ```
4. Faça o deploy da aplicação e das regras do Firestore:
   ```bash
   firebase deploy
   ```

---

## 📜 Licença

Este projeto é um SaaS proprietário desenvolvido com as melhores práticas de Engenharia de Software, Clean Code e SOLID.
