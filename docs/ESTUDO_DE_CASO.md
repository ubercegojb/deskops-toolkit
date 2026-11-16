# Estudo de caso — DeskOps Toolkit

## Visão geral

O **DeskOps Toolkit** é um projeto independente de estudo e portfólio de TI. Seu objetivo é reunir pequenas ferramentas úteis para profissionais de suporte, Service Desk e infraestrutura, com interface simples, rápida e acessível. Não se conecta a sistemas internos de nenhuma organização.

- **Site:** https://ubercegojb.github.io/deskops-toolkit/
- **Código:** https://github.com/ubercegojb/deskops-toolkit
- **Stack:** HTML, CSS, JavaScript nativo, GitHub Pages e GitHub Actions.
- **Modo de operação:** estático, sem backend e sem banco de dados.

## Problemas que o projeto explora

1. Operações de Service Desk demandam cálculos rápidos de prazos dentro de horários de expediente.
2. Diagnóstico de conectividade depende de fundamentos de endereçamento IPv4/CIDR.
3. É útil criar senhas aleatórias com boa geração de entropia e opções de complexidade.
4. Exportações de chamados em CSV podem ajudar a entender padrões de atendimento sem disponibilizar os dados em um servidor.

## Soluções implementadas

### Calculadora de SLA
Soma um prazo em horas úteis a uma data de abertura usando segunda a sexta-feira, das 9h às 18h. Exibe o resultado em português e indica quando o prazo já terminou. **Não** incorpora feriados, diferentes jornadas, pausas contratuais ou políticas específicas de GLPI.

### Calculadora IPv4
Retorna endereço da rede, máscara, broadcast, intervalo e hosts disponíveis a partir de um endereço IPv4 e prefixo CIDR. Aborda redes especiais /31 (ponto a ponto) e /32 (host único).

### Gerador de senhas
Produz senhas localmente com `crypto.getRandomValues`; permite combinar letras, números e símbolos. Garante ao menos um caractere de cada conjunto escolhido, sem gravar os resultados.

### Dashboard de chamados
Importa CSV com mapeamento de colunas e calcula totais, status, categorias e tempo médio até a resolução. Oferece filtros por status, categoria e período. Um conjunto de **20 registros fictícios** permite demonstração sem dados pessoais.

## Arquitetura e boas práticas

- A interface é estática, e as regras de cálculo ficam separadas da manipulação dos elementos HTML.
- Arquivos CSV são lidos com APIs locais do navegador (não há envio do arquivo a um servidor).
- Resultados de texto da importação são inseridos na interface por `textContent`, evitando renderização de HTML do CSV.
- O projeto tem testes de regras de negócio e GitHub Actions para executar os testes a cada alteração.
- As telas são responsivas; estão sujeitas a revisões adicionais conforme novos navegadores e dispositivos.

## Evidências demonstrativas (dados fictícios)

Com o arquivo `samples/chamados-demo.csv`:
- 20 chamados;
- 9 em aberto e 11 resolvidos;
- 5 de acesso, 5 de impressoras, 4 de rede, 3 de equipamentos e 3 de software;
- filtro de categoria **Rede**: 4 chamados.

Os números acima são **apenas dados de demonstração**, não resultados de uma empresa nem métricas de uma operação real.

## Como apresentar em entrevista

Demonstre as ferramentas, explique como uma regra de negócio é transformada em código, importe o CSV de exemplo, altere filtros e abra os testes. Descreva limitações conhecidas e as melhorias planejadas. Não atribua métricas fictícias a uma operação real.

## Limitações conhecidas

- A calculadora de SLA é demonstrativa, não substitui uma ferramenta ITSM.
- O dashboard não interpreta todas as variações de CSV ou status do mercado; exige associação de colunas e datas nos formatos previstos.
- O cálculo do tempo médio usa horas corridas, não SLA.
- O projeto não faz ping, inspeção de rede, consultas ao GLPI ou testes de vulnerabilidade.
- Mesmo com processamento local, arquivos sensíveis só devem ser tratados com autorização e política apropriada.

## Próximos aprendizados

O projeto cria uma base para aplicações futuras com testes automatizados, APIs, backend e monitoramento real de ambientes próprios ou autorizados.
