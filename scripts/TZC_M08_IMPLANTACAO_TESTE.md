# M08 — instalação e validação no SITE-TESTE

Este pacote prepara pedidos de oração, estoque, doações em itens e auditoria no Apps Script de teste. Ele não altera a implantação Apps Script V16 nem o banco até a instalação manual no projeto correto.

## Arquivos nesta branch

- `scripts/TZC_M08_Pedidos_Oracao_Estoque_Auditoria.gs`: funções de backend e criação não destrutiva das abas.
- `scripts/TZC_M08_IMPLANTACAO_TESTE.md`: este roteiro.
- `index.html`: revisão da estrutura de fechamento do HTML, variáveis globais de identidade visual, impressão A4 e layout da Agenda; o site principal não foi alterado.

## Segurança do Pedido de Oração

- `TZC_M08_criarPedidoOracao(json)` recebe motivo, nome completo e nascimento, mas não oferece leitura pública.
- `TZC_M08_listarPedidosOracao(token)` e `TZC_M08_atualizarPedidoOracao(token,id,status)` autorizam apenas perfis normalizados exatamente como **Pai de Santo** ou **Mãe de Santo**.
- O histórico registra que o pedido foi criado/atualizado, sem copiar o motivo da oração para a auditoria.
- A proteção da tela não substitui a permissão do banco: a planilha deve ficar compartilhada só com responsáveis confiáveis. Um editor da planilha consegue ler as células diretamente, fora do site.

## Auditoria, estoque, doações e alertas

- O módulo cria abas com cabeçalho por nome de coluna e preserva abas/células já existentes.
- O estoque suporta mínimo, item ativo e exclusão lógica recuperável.
- Doações de itens são registradas vinculáveis por `ID_Item` e ficam como pendentes de conferência; esta versão não lança valores no Caixa porque o contrato atual da tabela Caixa não está mapeado.
- A auditoria detalha operações deste M08. Os módulos antigos ainda precisam chamar o logger para que a auditoria seja universal.
- A fila só aceita avisos marcados como públicos. Visitantes precisam ter `Acesso_Publico` como coluna e valor afirmativo; sem essa coluna não recebem e-mail.
- O gatilho de cinco minutos é criado somente quando `TZC_M08_instalarGatilhoEmail` for executada no Apps Script. Esta branch não instalou nem autorizou o gatilho.

## Integração da ponte

A ponte ativa do SITE-TESTE mantém uma allowlist de rotas. Acrescentar, preservando validação de origem, validação do envelope RPC e limites:

| Ação RPC | Função Apps Script | Argumentos (limites) |
|---|---|---|
| `m08CriarPedidoOracao` | `TZC_M08_criarPedidoOracao` | JSON (3000) |
| `m08ListarPedidosOracao` | `TZC_M08_listarPedidosOracao` | token (100) |
| `m08AtualizarPedidoOracao` | `TZC_M08_atualizarPedidoOracao` | token (100), ID (100), status (30) |
| `m08ListarEstoque` | `TZC_M08_listarEstoque` | token (100), incluir excluídos (5) |
| `m08SalvarEstoque` | `TZC_M08_salvarEstoque` | token (100), JSON (3000) |
| `m08ExcluirEstoque` | `TZC_M08_excluirEstoque` | token (100), ID (100) |
| `m08RestaurarEstoque` | `TZC_M08_restaurarEstoque` | token (100), ID (100) |
| `m08RegistrarDoacao` | `TZC_M08_registrarDoacao` | token (100), JSON (3000) |
| `m08ListarAuditoria` | `TZC_M08_listarAuditoria` | token (100), limite (5) |
| `m08InstalarGatilhoEmail` | `TZC_M08_instalarGatilhoEmail` | token (100) |
| `m08EnfileirarAviso` | `TZC_M08_enfileirarAviso` | token (100), título (120), resumo público (600), público (5) |

O caminho `scripts/TZC-Ponte-Externa-V03.txt` é referência versionada, não prova que seja a ponte ativa. Confirmar a implantação V16 e editar a fonte correta antes de adicionar essas rotas.

## Ordem segura de instalação e teste

1. No projeto Apps Script de teste, adicionar o arquivo GS como arquivo novo; não substituir `Código.gs`.
2. Executar `TZC_M08_setup()` e confirmar as cinco abas sem linhas antigas removidas.
3. Acrescentar as rotas na ponte ativa e criar uma nova implantação **de teste**.
4. Enviar um pedido fictício sem login; conferir registro na aba `Pedidos_Oracao`.
5. Tentar leitura com Pai de Santo e Mãe de Santo (deve permitir); repetir com dirigente, administrador, colaborador, membro, visitante, token inválido e sessão encerrada (deve negar).
6. Criar/editar item, baixar abaixo do mínimo, excluir e restaurar; conferir log, datas e horas em colunas separadas.
7. Registrar uma doação de item; conferir associação e estado pendente, sem lançamento duplicado no Caixa.
8. Testar e-mail com endereço controlado; confirmar que visitantes só recebem aviso público e que tentativa privada não entra na fila.
9. Instalar o gatilho somente depois de testar a execução manual e autorizar o serviço de e-mail no próprio Apps Script.

## Limites desta entrega

A impressão A4 Mestre tem classes reutilizáveis; a regressão automática dos PDFs de todos os módulos ainda depende de aplicar essas classes e validar cada função de impressão. Banhos, Ervas, Caixa, Mensagem do Dia e Loja não foram reescritos nesta etapa. O frontend do M08 ainda precisa ser conectado à allowlist da ponte ativa e às telas. Não publicar esta branch no site final.
