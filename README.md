# Consulta CEP Leopoldina — Versão 0.1

[![HTML5 Semântico](https://img.shields.io/badge/HTML5-Semântico-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3 Puro](https://img.shields.io/badge/CSS3-Puro%20%2F%20Mobile--First-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript Vanilla](https://img.shields.io/badge/JavaScript-Vanilla%20Puro-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%2F%20Vercel-success)](#)

Landing page canônica e interativa para consulta de logradouros e Códigos de Endereçamento Postal (CEP) do município de **Leopoldina - MG**, construída com arquitetura estritamente **Vanilla Web** (sem bibliotecas ou frameworks externos).

Projeto acadêmico desenvolvido para a disciplina de **Programação 2** (Desenvolvimento Web) do curso de **Bacharelado em Sistemas de Informação** da **Universidade do Estado de Minas Gerais (UEMG) — Unidade Acadêmica de Carangola** (2º Período).

---

## 📌 Sumário
- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar Localmente](#-como-executar-localmente)
- [Base de Dados e Higienização](#-base-de-dados-e-higienização)
- [Equipe de Desenvolvimento](#-equipe-de-desenvolvimento)
- [Nota de Transparência sobre o Uso de IA](#-nota-de-transparência-sobre-o-uso-de-ia)
- [Publicação no LinkedIn e Hashtag Obrigatória](#-publicação-no-linkedin-e-hashtag-obrigatória)

---

## 🔍 Visão Geral

O objetivo principal desta aplicação é fornecer uma experiência de busca de CEP rápida, ergonômica e acessível para o município de Leopoldina/MG. Toda a filtragem dos dados é realizada **localmente no navegador** do cliente via `fetch` assíncrono consumindo a base consolidada em `./data/ceps.json`, garantindo privacidade absoluta e tempo de resposta instantâneo.

---

## 🚀 Funcionalidades Principais

- **Mecanismo de Filtro Reativo:** A busca é disparada automaticamente a partir da digitação de **3 caracteres**, filtrando instantaneamente por nome do logradouro, bairro ou CEP.
- **Menu Suspenso de Sugestões (Autocomplete):** Exibição em tempo real das correspondências com destaque tipográfico do termo pesquisado e suporte a navegação por teclado (`↑`, `↓`, `Enter`, `Esc`).
- **Apresentação Completa e Destaque ao CEP:** Card com visualização dos dados cadastrais (Logradouro, Bairro, Localidade/UF, Complemento) e destaque visual absoluto ao CEP com tipografia aumentada, alto contraste e botão de cópia com 1 clique.
- **Janelas Flutuantes Acessíveis (Modais):**
  - **Sobre o Projeto:** Contextualização acadêmica, equipe e nota formal sobre o uso de IA.
  - **Termos de Uso:** Finalidade exclusivamente didática e isenções legais.
  - **Política de Privacidade:** Conformidade com a LGPD e confirmação de processamento 100% local (sem rastreamento).
- **Layout Totalmente Responsivo (Mobile-First):** Experiência adaptada para dispositivos móveis, tablets e telas de alta resolução desktop com Media Queries nativas.

---

## 📁 Estrutura do Projeto

A organização dos arquivos segue rigorosamente o padrão especificado na Seção 4 da Atividade Prática:

```text
Landing Page CEPs Leopoldina/
├── index.html                 # Documento principal em HTML5 semântico
├── css/
│   └── styles.css             # Estilização completa, temas e regras responsivas (CSS3)
├── js/
│   └── app.js                 # Lógica da aplicação, busca, eventos e modais (JS Vanilla)
├── data/
│   └── ceps.json              # Base unificada, higienizada e local de CEPs de Leopoldina
├── assets/                    # Identidade visual e imagens institucionais
│   ├── logo-si.png            # Logotipo de Sistemas de Informação (UEMG Carangola)
│   └── logo-uemg.png          # Logotipo institucional da UEMG Carangola
├── scripts/
│   └── consolidar_ceps.ps1    # Script utilitário de extração e consolidação via API ViaCEP
├── docs/                      # Documentação de apoio e enunciados da atividade
└── README.md                  # Documentação técnica e autoria do projeto
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico:** `<header>`, `<main>`, `<section>`, `<dl>`, `<footer>`, além de atributos ARIA para acessibilidade (`role="dialog"`, `aria-expanded`, `aria-autocomplete`).
- **CSS3 Moderno:** Variáveis CSS (design tokens), Flexbox, CSS Grid nativo, animações sutis e Media Queries para responsividade Mobile-First.
- **JavaScript Vanilla (ES6+):** Manipulação de DOM nativa, requisição assíncrona com `fetch()`, normalização de caracteres acentuados via Unicode `normalize()`, Clipboard API e gerenciamento de modais.
- **API Pública ViaCEP:** Fonte pública oficial utilizada para obtenção dos dados de logradouros de Leopoldina.

---

## 💻 Como Executar Localmente

Por utilizar requisição local assíncrona (`fetch('./data/ceps.json')`), navegadores modernos bloqueiam requisições `file://` devido a políticas de segurança CORS. Para executar o projeto em seu ambiente local:

### Opção 1: VS Code (Extensão Live Server) - Recomendada
1. Abra a pasta do projeto no **Visual Studio Code**.
2. Clique com o botão direito sobre `index.html`.
3. Selecione **"Open with Live Server"**.
4. A página abrirá automaticamente no endereço `http://127.0.0.1:5500`.

### Opção 2: Python (Terminal)
```bash
python -m http.server 8000
```
Acesse: `http://localhost:8000`

### Opção 3: Node.js (npx http-server)
```bash
npx http-server . -p 8000
```
Acesse: `http://localhost:8000`

---

## 📊 Base de Dados e Higienização

A base local reside em [`./data/ceps.json`](./data/ceps.json) e reúne consultas aos três tipos obrigatórios de logradouros definidos na atividade:
- `https://viacep.com.br/ws/MG/Leopoldina/Rua/json/`
- `https://viacep.com.br/ws/MG/Leopoldina/Avenida/json/`
- `https://viacep.com.br/ws/MG/Leopoldina/Praca/json/`

Os dados foram consolidados, higienizados e deduplicados por CEP. Para atualizar ou reprocessar os dados no futuro, basta executar o script utilitário incluído:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\consolidar_ceps.ps1
```

---

## 👥 Equipe de Desenvolvimento

- **Gustavo** — [GitHub / Portfólio](#)
- **[Nome do Aluno 2]** — [GitHub / Portfólio](#)
- **[Nome do Aluno 3]** — [GitHub / Portfólio](#)

---

## 🤖 Nota de Transparência sobre o Uso de IA

> Em consonância com os princípios de integridade acadêmica e transparência tecnológica, declara-se que ferramentas de Inteligência Artificial generativa foram utilizadas durante o desenvolvimento deste projeto.  
> **Detalhamento:** Foram aplicadas como suporte na depuração de expressões regulares do JavaScript, na estruturação semântica do HTML5 e na revisão sintática do CSS, sendo toda a arquitetura, lógica de negócios e validação final concebidas, auditadas e integradas pelos membros da equipe.

---

## 📢 Publicação no LinkedIn e Hashtag Obrigatória

Conforme estabelecido na Seção 5.3 e no Anexo II do edital prático, a entrega da atividade inclui a postagem técnica no LinkedIn por pelo menos um dos integrantes, contendo a **hashtag obrigatória e exata de rastreamento**:

### Hashtag de Rastreamento do Professor:
```text
#sistemasuemgcarangola2p20262
```

### Modelo de Postagem Técnica (Anexo II):
```text
🚀 Desenvolvimento Front-End Vanilla: Consulta Inteligente de CEPs com JavaScript Puro!

Como parte das atividades práticas do curso de Bacharelado em Sistemas de Informação da Universidade do Estado de Minas Gerais (UEMG Carangola), nossa equipe desenvolveu uma landing page canônica para busca interativa de logradouros da cidade de Leopoldina - MG.

Principais desafios e soluções técnicas implementadas:
• Manipulação de JSON local consolidado via requisições assíncronas (Fetch API);
• Algoritmo de busca reativa (autocomplete) sensível a partir de 3 caracteres digitados;
• Interface limpa e totalmente responsiva construída com HTML5 Semântico e CSS3 puro;
• Arquitetura 100% Vanilla (zero dependências, sem o uso de frameworks);
• Modais acessíveis para apresentação do projeto, termos de uso e política de privacidade.

🔗 Acesse a aplicação online: [Link do Deploy na Vercel ou GitHub Pages]
💻 Confira o código-fonte no GitHub: [Link do Repositório]

Agradecimento especial ao nosso professor pela condução da disciplina.

#sistemasuemgcarangola2p20262 #DesenvolvimentoWeb #JavaScript #VanillaJS #HTML5 #CSS3 #SistemasDeInformacao #UEMGCarangola #FrontEnd #TechStudents
```

