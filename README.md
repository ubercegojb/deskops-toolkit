# DeskOps Toolkit 🧰

**Ferramentas para quem resolve.** Projeto pessoal de portfólio para Service Desk, Infraestrutura de TI e Segurança da Informação.

**Versão:** 1.4 (revisão final de usabilidade, indicadores e testes) · **Tecnologias:** HTML, CSS e JavaScript puro. Sem backend, cadastro, banco de dados ou dependências externas.

## Ferramentas

1. **Calculadora de SLA** — soma horas úteis a uma data de abertura, usando **segunda a sexta, 09h–18h**. Não considera feriados, pausas contratuais ou regras específicas de SLA.
2. **Calculadora IPv4/CIDR** — mostra rede, máscara, broadcast, faixa e quantidade de hosts utilizáveis. Considera /31 ponto a ponto (RFC 3021) e /32 host único.
3. **Gerador de senhas** — utiliza `crypto.getRandomValues` com seleção sem viés por amostragem de rejeição, ao menos um caractere de cada tipo habilitado e embaralhamento. Não armazena as senhas.
4. **Dashboard de chamados** — importa CSV localmente, reconhece ou permite selecionar colunas de status, categoria e datas, e apresenta KPIs e gráficos. Também oferece uma amostra fictícia.

**Site público:** https://ubercegojb.github.io/deskops-toolkit/

**[Estudo de caso do projeto](docs/ESTUDO_DE_CASO.md)** — objetivo, funcionalidades, arquitetura, testes, limites e evidências para apresentar em entrevistas.

### Como usar o Dashboard de chamados

1. Abra a aba **Dashboard**. Clique em **Experimentar com dados fictícios** para entender a apresentação.
2. Para outro arquivo, escolha um CSV UTF-8 ou Windows-1252 de até **2 MB / 10 mil chamados**.
3. Ajuste o mapeamento de **Status** (obrigatório), **Categoria** e datas (opcionais).
4. Clique em **Gerar indicadores**. O arquivo é analisado somente na memória do navegador e não é enviado ao servidor.
5. Use os filtros por **status, categoria e data de abertura**. Você pode combiná-los, e o período inclui o último dia completo. Clique em **Remover filtros** para voltar aos dados completos.
6. O tempo médio é o intervalo em **horas corridas** entre abertura e resolução, para chamados resolvidos com ambas as datas válidas. Não significa SLA.
7. Status desconhecidos aparecem na distribuição, mas não entram nos totais de abertos/resolvidos.

Aceita delimitadores `;`, `,` e tabulações, além de campos entre aspas. **Não envie para este repositório nenhuma exportação real de chamados**. Trabalhe com amostras fictícias ou anonimizadas, respeitando as regras de sua organização.

Um arquivo de exemplo está em [samples/chamados-demo.csv](samples/chamados-demo.csv). A detecção de colunas depende dos nomes; se não reconhecer, selecione manualmente.

## Rodar no computador (jeito mais fácil)

1. Baixe o projeto e extraia a pasta.
2. Abra `index.html` no Chrome, Edge ou Firefox.
3. Escolha uma ferramenta e teste.

Não precisa instalar Python, Node ou extensões para **usar** as ferramentas.

### Opcional: servidor local

Se tiver Python instalado:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`.

## Estrutura

```text
deskops-toolkit/
├── index.html          # Páginas, textos e formulários
├── assets/
│   ├── styles.css      # Visual responsivo, cores e layout
│   ├── dashboard.css   # Layout dos KPIs e gráficos
│   ├── core.js         # Cálculos de SLA, rede e senhas
│   ├── analytics.js    # Parser CSV e agregação de indicadores
│   ├── app.js          # Menu e formulários das ferramentas iniciais
│   ├── dashboard.js    # Importação CSV, mapeamento e painéis
│   └── favicon.svg     # Ícone do navegador
├── samples/
│   └── chamados-demo.csv # Dados 100% fictícios
├── tests/
│   ├── test-core.js     # Testes de SLA, CIDR e senhas
│   └── test-analytics.js # Testes do motor de indicadores
├── .github/workflows/
│   └── testes.yml       # Testes no GitHub Actions
├── .nojekyll           # Publicação simples via GitHub Pages
└── README.md           # Documentação do projeto
```

## Publicar gratuitamente no GitHub Pages

1. Entre em https://github.com e crie um repositório **Public** chamado `deskops-toolkit`.
2. No repositório, clique em **Add file > Upload files**.
3. **Arraste o conteúdo da pasta extraída** (o `index.html` deve ficar na raiz do repositório, e não dentro de outra pasta). Inclua `assets/`, `tests/`, `README.md` e `.nojekyll`.
4. Faça **Commit changes**.
5. Abra **Settings > Pages**.
6. Em **Build and deployment**, escolha **Deploy from a branch**.
7. Configure **Branch: main** e **Folder: /(root)**; clique em **Save**.
8. O site aparecerá em `https://SEU-USUARIO.github.io/deskops-toolkit/` após a publicação ser concluída. O link exato fica em **Settings > Pages**.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

> **Atenção:** o site e o repositório são públicos. Não publique dados internos, credenciais, nomes, prints com informações pessoais ou informações da rede da instituição.

## Testes (opcional, para aprender programação)

Se tiver o Node.js instalado, rode na pasta do projeto:

```bash
node tests/test-core.js
node tests/test-analytics.js
```

Os testes verificam cálculos de SLA, redes e senhas; importação de CSV com aspas, datas, mapeamento, filtros combinados e indicadores. O fluxo do GitHub Actions também os executa a cada push/PR.

## Como estudar cada arquivo

1. Comece pelo `index.html`: encontre um título e altere o texto.
2. Passe para `assets/styles.css`: mude uma cor (por exemplo `--mint`) e recarregue.
3. Leia `assets/app.js`: descubra o que acontece quando clica em **Calcular**.
4. Por último, estude `assets/core.js` e `assets/analytics.js`: a lógica por trás dos resultados.
5. Leia `assets/dashboard.js` para ver como os CSVs se transformam em gráficos.
6. Teste cada modificação antes de publicá-la novamente.

## Melhorias futuras

- Exportação de resultados em PDF (somente se for útil).
- Ferramenta de diagnóstico DNS/IP e documentação de rede (com backend local próprio).
- Revisão aprofundada da importação CSV, formatos de datas especiais e mensagens de erro.
- Página pública de estudos de caso, antes/depois e aprendizados.
- Testes automatizados de interface e melhorias de acessibilidade.

## Histórico de versões

- **1.0:** SLA, IPv4/CIDR, geração de senhas.
- **1.1:** refinamentos visuais, versão visível, navegação com quarto cartão, responsividade e link para código.
- **1.2:** dashboard de chamados com CSV local, mapeamento de colunas, indicadores, dados fictícios e testes.
- **1.3:** filtros combinados por status, categoria e data de abertura; tratamento de filtros sem correspondências; layout responsivo melhorado e testes automatizados.
- **1.4:** barras de gráficos proporcionais ao total, rótulos claros de registros filtrados, prevenção de resultados antigos após erros, testes ampliados e estudo de caso.

## Segurança e limites

- Este projeto roda somente no navegador: **não executa ping, não verifica dispositivos reais e não acessa APIs do GLPI**.
- Todos os cálculos e senhas são processados localmente. Não há coleta nem transmissão de dados pelo código deste projeto.
- O cálculo de SLA **não** substitui as regras oficiais do GLPI ou do contrato.
- Para senhas reais, use um gerenciador confiável, MFA e políticas de sua organização.
- Projeto de estudo independente, sem vínculo ou autorização implícita de terceiros.