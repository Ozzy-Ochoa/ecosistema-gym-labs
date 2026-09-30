# 🏋️‍♂️ Gym Labs (Labcore 2026)

> **Ecossistema Integrado de Saúde, Treinamento de Força, Fisiologia do Exercício e Gestão Profissional Multidisciplinar.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![LGPD](https://img.shields.io/badge/Conformidade-LGPD%20Brasil-emerald?style=for-the-badge&logo=shield)](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

## 📌 Visão Geral

O **Gym Labs** é uma plataforma brasileira desenvolvida para unificar e conectar todos os agentes do ecossistema fitness e de saúde:
- **O Praticante/Atleta**, que busca evolução consistente, controle de sobrecarga e autonomia;
- **O Personal Trainer (CREF)**, que necessita de prontuário esportivo, prescrição técnica e telemetria de cargas;
- **A Nutricionista (CRN)**, que prescreve dietas calculadas, substituições e acompanha o gasto calórico real do treino;
- **A Academia / Studio**, que monitora assiduidade, previne o *churn* (evasão) e valoriza seus espaços;
- **A Administração da Plataforma**, com trilha de auditoria e governança estrita de proveniência de dados.

O sistema foi concebido sob o princípio do **Determinismo Fisiológico**: cálculos metabólicos, zonas cardíacas e predições de carga utilizam fórmulas científicas validadas pela literatura internacional (Mifflin-St Jeor, Epley, Gabbett, Tanaka, Pollock), garantindo precisão matemática e transparência ao usuário.

---

## 👥 Ambientes e Perfis de Acesso

O Gym Labs **não** trata seus usuários como simples variações de telas. Cada ambiente possui regras de negócio, permissões, dashboards e responsabilidades dedicadas:

```
                      ┌─────────────────────────────────┐
                      │      ADMINISTRAÇÃO GERAL        │
                      │  Auditoria, Políticas e Dados   │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│   ACADEMIA / STUDIO   │                             │    PROFISSIONAIS      │
│  Gestão de Alunos,    │◄───────────────────────────►│  Personal (CREF) &    │
│  Telemetria e Evasão  │                             │  Nutricionista (CRN)  │
└───────────┬───────────┘                             └───────────┬───────────┘
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       ▼
                      ┌─────────────────────────────────┐
                      │    ALUNO / ATLETA CONVENCIONAL  │
                      │  Treino Ativo, Cargas, Nutrição │
                      │      e Prontidão Biológica      │
                      └─────────────────────────────────┘
```

### 1. 🏃‍♂️ Aluno / Atleta Convencional
* **Autonomia e Customização**: Treino sugerido inteligente (baseado no objetivo: Hipertrofia, Força, Emagrecimento, Longevidade) 100% personalizável, ou liberdade para montar a rotina do zero definindo dias da semana, divisões (A, B, C...) e exercícios da biblioteca.
* **Console de Treino Ativo ("Ativar Treino")**:
  - Cronômetro de treino em tempo real com controle de pausa;
  - Tabela série a série com edição dinâmica de carga (kg) e repetições na hora do exercício (cargas podem ser deixadas em branco para preenchimento durante a execução);
  - Botão de **Falha Muscular Concêntrica** (RPE 10 / RIR 0);
  - **Temporizador de Descanso Inteligente**: Contagem regressiva entre séries com alerta sonoro (*Web Audio API*) e flash visual luminoso ao concluir;
  - **Relatório de Sessão**: Duração, tonelagem/volume total (kg), número de séries, repetições, falhas e estimativa do gasto calórico queimado.
* **Integração Metabólica**: As calorias do treino concluído são somadas automaticamente ao gasto diário total (TDEE basal + atividade + treino) nas telas de Início e Saúde.
* **Widget Minimalista de Frequência**: Calendário compacto de presença mensal com registro automático pós-treino ou marcação rápida em 1 clique.
* **Score de Prontidão (GL Recovery)**: Análise combinada de sono, VFC (HRV de repouso) e fadiga muscular.
* **Substituição por Personal**: Se o aluno contratar um personal trainer parceiro, a ficha técnica oficial do profissional assume a rotina do app com sincronização instantânea.

### 2. 🏋️‍♂️ Personal Trainer (Gym Labs Trainer)
* **Credenciamento Profissional**: Registro de CREF, jurisdição e especialidades esportivas.
* **Prontuário Esportivo do Aluno**: Histórico de lesões, restrições articulares, objetivos e nível de experiência.
* **Construtor de Periodização & Treinos**: Criação de microciclos, divisões de treino, prescrição de séries, repetições, RPE-alvo e tempo de descanso.
* **Acompanhamento de Cargas em Tempo Real**: Telemetria das cargas reais que o aluno executou na academia.
* **Controle de Carga ACWR (Gabbett)**: Cálculo da razão aguda:crônica (7:28 dias) para mitigação de sobretreinamento e risco de lesão.
* **Canal Seguro Multidisciplinar**: Conversação direta e alinhamento de gasto calórico com a nutricionista do mesmo aluno.

### 3. 🥗 Nutricionista Esportiva (Gym Labs Nutri)
* **Credenciamento Profissional**: Registro de CRN e jurisdição de atendimento.
* **Prontuário Clínico & Anamnese**: Hábitos alimentares, alergias, intolerâncias, exames laboratoriais e metas de composição corporal.
* **Avaliação Antropométrica**: Protocolos de 7 dobras cutâneas de Pollock, bioimpedância tetrapolar e modelagem de perímetros corporais.
* **Elaborador de Planos Alimentares**: Montagem de refeições com macronutrientes calculados, listas de substituições e integração com a Tabela TACO (Tabela Brasileira de Composição de Alimentos).
* **Sincronização Instantânea**: O plano alimentar publicado pelo nutricionista reflete imediatamente no aplicativo do paciente.

### 4. 🏢 Academia / Studio
* **Telemetria de Frequência em Tempo Real**: Visão geral de matriculados que treinaram hoje, assiduidade da semana e ranking de assiduidade.
* **Prevenção Ativa de Evasão (Anti-Churn)**: Identificação automática de alunos sem treinar há mais de 7 dias para contato proativo.
* **Integração do Espaço Físico**: Recepção e alinhamento dos personais e nutricionistas que atendem no ambiente da academia.

### 5. 🛡️ Administração & Auditoria
* **Governança de Dados**: Trilha de auditoria criptográfica e rotulagem estrita de proveniência:
  - `REAL`: Registrado diretamente pelo usuário ou profissional;
  - `CALCULATED`: Derivado matematicamente por equações fisiológicas;
  - `ESTIMATED`: Estimativas aproximadas baseadas em referências de literatura;
  - `INFERRED`: Inferências clínicas e comportamentais;
  - `DEMO`: Dados fictícios protegidos de demonstração e testes.

---

## 🔬 Motores Fisiológicos e Algoritmos Científicos

O Gym Labs rejeita aproximações genéricas e implementa formalmente os principais modelos validados pela ciência esportiva internacional:

| Domínio | Modelo / Algoritmo | Aplicação no Sistema |
| :--- | :--- | :--- |
| **Taxa Metabólica Basal** | **Mifflin-St Jeor (1990)** | Cálculo do gasto basal baseado em peso, estatura, idade e sexo biológico. |
| **Gasto Energético Total** | **TDEE com Multiplicador FAO/OMS** | Multiplicadores de atividade física combinados ao gasto calórico real aferido nas sessões de treino. |
| **Força Máxima (1RM)** | **Epley & Brzycki** | Estimativa determinística de 1RM submáximo com validação de RIR/RPE: $1RM = Carga \times (1 + \frac{Reps}{30})$. |
| **Monitoramento de Carga** | **ACWR de Tim Gabbett (7:28)** | Razão Carga Aguda (7 dias) / Carga Crônica (28 dias) para controle de fadiga e segurança tecidual. |
| **Esforço da Sessão** | **Foster Session-RPE (CR-10)** | Unidades Arbitrárias de Carga interna: $Load = Duração (min) \times RPE_{Foster}$. |
| **Zonas Cardíacas** | **Fórmula de Hirofumi Tanaka (2001)** | $FC_{máx} = 208 - (0.7 \times Idade)$, dividida em 5 zonas fisiológicas (Z1 a Z5). |
| **Hidratação Dinâmica** | **Diretrizes de Armstrong & Sawka** | Ajuste da meta hídrica com base na massa corporal, duração do treino e temperatura ambiente. |
| **Composição Corporal** | **Pollock 7 Dobras / Jackson & Pollock** | Densidade corporal e percentual de gordura estimado pelas equações de Siri e Brozek. |

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**:
  - [React 19](https://react.dev/) — Componentes funcionais e hooks modernos.
  - [TypeScript 5.8](https://www.typescriptlang.org/) — Tipagem estrita para segurança de dados corporais e regras de negócio.
  - [Tailwind CSS v4](https://tailwindcss.com/) — Design responsivo, tipografia mono-espaçada técnica e identidade visual sóbria em modo escuro (*Dark High-Contrast*).
  - [Lucide React](https://lucide.dev/) — Ícones técnicos para interfaces de telemetria.
  - [Recharts](https://recharts.org/) — Gráficos vetoriais de evolução de composição corporal e cargas.
  - [Motion](https://motion.dev/) — Micro-interações e transições fluidas.
  - [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — Síntese nativa de alertas sonoros para o temporizador de descanso.
* **Backend & Servidor**:
  - [Node.js](https://nodejs.org/) & [Express 4](https://expressjs.com/) — Servidor de aplicação full-stack com proxy para APIs seguras.
  - [Vite 6](https://vitejs.dev/) — Tooling e compilação ultra-rápida.
  - [TSX](https://github.com/privatenumber/tsx) & [ESBuild](https://esbuild.github.io/) — Execução TypeScript no ambiente de desenvolvimento e build de produção.
* **Repositório e Dados**:
  - Arquitetura em camadas (`UI` ➔ `Context` ➔ `Service` ➔ `Repository` ➔ `GymLabsDataStore`).
  - Persistência estruturada com validação de esquema e compatibilidade para migração futura de base relacional (PostgreSQL / Cloud SQL).

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** na versão 18.0 ou superior instalada.
* **npm** ou gerenciador de pacotes equivalente.

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/gym-labs.git
cd gym-labs
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente (Opcional)
Se for utilizar recursos de inteligência ou proxies de IA, crie o arquivo `.env`:
```bash
cp .env.example .env
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor de desenvolvimento iniciará automaticamente em:
👉 **`http://localhost:3000`**

### 5. Verificar a Qualidade do Código (Lint)
```bash
npm run lint
```

### 6. Gerar a Build de Produção
```bash
npm run build
npm start
```

---

## 📂 Estrutura de Diretórios

```
gym-labs/
├── src/
│   ├── components/
│   │   ├── common/             # Componentes compartilhados (Calendário, Banners, Badges)
│   │   ├── layout/             # Barras de navegação de Atletas e Profissionais
│   │   ├── training/           # Componentes modulares de treino (Console ativo, Customizador)
│   │   └── views/              # Telas completas por ambiente
│   │       ├── LandingView.tsx              # Apresentação do ecossistema e acessos de teste
│   │       ├── TodayView.tsx                # Dashboard corporal, métricas e gasto calórico
│   │       ├── TrainingView.tsx             # Módulo de treino autônomo e prescrito
│   │       ├── HealthView.tsx               # Registro de bioimpedância, sono e hidratação
│   │       ├── BodyView.tsx                 # Evolução antropométrica e fita métrica
│   │       ├── NutritionView.tsx            # Acompanhamento dietético e refeições
│   │       ├── CoachDashboardView.tsx       # Portal Gym Labs Trainer (Personal CREF)
│   │       ├── NutritionistDashboardView.tsx# Portal Gym Labs Nutri (Nutricionista CRN)
│   │       ├── GymDashboardView.tsx         # Portal Gym Labs Gym (Academias & Studios)
│   │       ├── AdminDashboardView.tsx       # Auditoria e governança do sistema
│   │       └── SettingsView.tsx             # Configurações, conta e preferências
│   ├── context/
│   │   └── GymLabsContext.tsx  # Estado global unificado, cálculos fisiológicos e ações
│   ├── data/
│   │   ├── defaultUserRoutines.ts   # Gerador de treinos sugeridos e modelos ABC/ABCD
│   │   ├── exerciseDatabase.ts      # Biblioteca de exercícios com grupos musculares e padrões
│   │   ├── professionalSeedData.ts  # Dados padrão de demonstração para testes instantâneos
│   │   └── sampleNutriPlans.ts      # Cardápios com equivalentes e tabela TACO
│   ├── repositories/
│   │   └── GymLabsDataStore.ts # Camada desacoplada de armazenamento e persistência
│   ├── science/
│   │   ├── oneRepMax.ts        # Equações de Epley e Brzycki para 1RM
│   │   ├── trainingLoad.ts     # Modelo ACWR Gabbett e Session-RPE
│   │   └── energyExpenditure.ts# Equações Mifflin-St Jeor, Harris-Benedict e TDEE
│   ├── types/
│   │   ├── body.ts             # Tipos de bioimpedância e antropometria
│   │   ├── professional.ts     # Tipos de Personal, Nutricionista e Credenciais
│   │   ├── training.ts         # Tipos de sessões, rotinas, séries e console ativo
│   │   └── user.ts             # Tipos de identidade, perfil e contas salvas
│   ├── App.tsx                 # Roteador central e controle de sessão
│   ├── main.tsx                # Ponto de entrada React 19
│   └── index.css               # Estilos globais e tokens Tailwind CSS v4
├── server.ts                   # Servidor Express com suporte a Vite middlewares em dev
├── package.json                # Dependências e scripts do projeto
├── tsconfig.json               # Configurações do compilador TypeScript
└── README.md                   # Documentação do projeto
```

---

## 🔒 Privacidade e Conformidade LGPD

O Gym Labs foi desenhado sob o regime da **Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)**:
1. **Consentimento Explícito**: O aluno decide ativamente quais dados compartilha com seu Personal Trainer (`TRAINING_READ`, `BODY_READ`) ou Nutricionista (`NUTRITION_READ`, `BODY_READ`), podendo revogar o vínculo a qualquer instante.
2. **Minimização de Dados**: Medidas corporais sensíveis (como circunferências de cintura, quadril e dobras cutâneas) são de preenchimento 100% facultativo e armazenadas sob estrito controle de acesso.
3. **Isolamento de Papéis (RBAC)**: Profissionais só acessam prontuários de atletas vinculados à sua carteira ativa.
4. **Trilha de Auditoria**: Qualquer alteração em fichas ou planos alimentares registra carimbo de data/hora e autor responsável.

---

## 🗺️ Roadmap de Expansão

- [x] **Fase 1 (Brasil-First)**: Ecossistema completo em Português-BR, moeda BRL (R$), sistema métrico e credenciamentos brasileiros (CREF/CRN).
- [x] **Fase 2 (Treinamento Autônomo e Prescrito)**: Console de treino ativo com cronômetro, temporizador de descanso com áudio/flash e sincronização calórica.
- [ ] **Fase 3 (Conectividade Wearables)**: Integração com monitores de frequência cardíaca via Bluetooth Low Energy (BLE) e Apple Health / Google Health Connect.
- [ ] **Fase 4 (Expansão Internacional)**: Internacionalização multi-idioma (i18n), suporte a moedas estrangeiras (USD, EUR) e conselhos profissionais globais (NSCA, NASM, ISSN).

---

## 📄 Licença

Este projeto é desenvolvido para o ecossistema **Gym Labs**. Todos os direitos reservados © 2026.
