# M08 — implementação e validação no SITE-TESTE

Branch isolada: `codex/bloco-autonomo-20261018`, criada a partir da revisão da Agenda. Nenhuma alteração foi feita no site definitivo, na planilha ou na implantação Apps Script V16.

## Arquivos nesta branch

- `index.html`: corrige a posição dos estilos da Agenda, mantém as variáveis CSS de identidade visual com fallback e inclui os estilos A4 reutilizáveis; carrega o frontend M08.
- `m08-ui.js`: formulário público de oração, caixa restrita de pedidos recebidos e telas de estoque/doações em itens.
- `scripts/TZC_M08_Pedidos_Oracao_Estoque_Auditoria.gs`: backend para as abas e operações M08.
- `scripts/TZC_Ponte_Externa_V10_M08.html`: allowlist M08 preparada a partir da ponte V09 versionada no repositório.
- `scripts/TZC_M08_IMPLANTACAO_TESTE.md`: este roteiro de instalação e teste.

## Pedido de Oração

- `TZC_M08_criarPedidoOracao(json)` recebe motivo, nome completo e nascimento; não oferece leitura pública.
- `TZC_M08_listarPedidosOracao(token)` e `TZC_M08_atualizarPedidoOracao(token,id,status)` autorizam somente perfis normalizados exatamente como **Pai de Santo** ou **Mãe de Santo**.
- A auditoria registra criação/alteração sem copiar o motivo para o histórico.
- Para limitar também a leitura direta da planilha, o compartilhamento do Google Sheets precisa ficar restrito a responsáveis confiáveis; um editor consegue ler as células fora do site.

## Estoque, doações e auditoria

- `TZC_M08_setup()` cria as abas/cabeçalhos sem limpar dados existentes.
- O estoque guarda quantidade, unidade, mínimo e exclusão lógica recuperável.
- Doação em item seleciona um insumo existente; uma trava do Apps Script registra a doação e atualiza o saldo do estoque na mesma operação.
- Esta versão não lança doação financeira no Caixa porque o esquema de lançamento e aprovação da tabela Caixa não está mapeado.
- A auditoria registra operações M08 com data e hora em campos separados. Os módulos antigos ainda precisam chamar o logger para a auditoria se tornar universal.
- Alertas entram na fila apenas quando o conteúdo é público. Visitantes só recebem e-mail se a tabela tiver a coluna `Acesso_Publico` e um valor afirmativo; membros ativos com e-mail válido recebem os avisos enfileirados.
- O gatilho de cinco minutos só é criado quando `TZC_M08_instalarGatilhoEmail` for executada no Apps Script. Ele não foi instalado nesta branch.

## Rotas M08

A ponte V10 inclui as rotas abaixo e mantém a validação existente de origem, envelope RPC e limite de argumentos.

| Ação RPC | Função Apps Script | Limites |
|---|---|---|
| `m08CriarPedidoOracao` | `TZC_M08_criarPedidoOracao` | 3000 |
| `m08ListarPedidosOracao` | `TZC_M08_listarPedidosOracao` | 100 |
| `m08AtualizarPedidoOracao` | `TZC_M08_atualizarPedidoOracao` | 100, 100, 30 |
| `m08ListarEstoque` | `TZC_M08_listarEstoque` | 100, 5 |
| `m08SalvarEstoque` | `TZC_M08_salvarEstoque` | 100, 3000 |
| `m08ExcluirEstoque` | `TZC_M08_excluirEstoque` | 100, 100 |
| `m08RestaurarEstoque` | `TZC_M08_restaurarEstoque` | 100, 100 |
| `m08RegistrarDoacao` | `TZC_M08_registrarDoacao` | 100, 3000 |
| `m08ListarAuditoria` | `TZC_M08_listarAuditoria` | 100, 5 |
| `m08InstalarGatilhoEmail` | `TZC_M08_instalarGatilhoEmail` | 100 |
| `m08EnfileirarAviso` | `TZC_M08_enfileirarAviso` | 100, 120, 600, 5 |

## Testes realizados no código local

- Sintaxe JavaScript do backend M08, frontend e ponte V10: aprovada.
- Matriz simulada do acesso a pedidos: Pai/Mãe de Santo permitidos; Dirigente, Administrador, conta inativa e token inválido negados.
- Estrutura HTML: um fechamento de `body/html`, estilos dentro do documento e sem conteúdo após o fechamento.
- Verificadas as regras A4, fallback de cores e ordem móvel Calendário → Lista da Agenda.

## Integração ainda necessária no Apps Script

O código da implantação V16 em execução não está neste repositório. A ponte V10 é uma proposta baseada no HTML V09 versionado; antes de copiá-la, é necessário conferir qual arquivo HTML a função `doGet` realmente carrega. Depois:

1. Adicionar o GS M08 como arquivo novo no Apps Script de teste, sem substituir `Código.gs).
2. Executar `TZC_M08_setup()` e conferir as abas sem linhas antigas removidas.
3. Atualizar a fonte HTML Service ativa com o conteúdo da ponte V10, preservando a função carregada por `doGet`, as rotas atuais e a validação de origem.
4. Criar uma nova implantação **de teste** do Apps Script.
5. Testar pedido público fictício; Pai/Mãe de Santo devem conseguir ler/atualizar; os demais perfis e sessões inválidas devem receber negação.
6. Testar cadastrar/editar item, registrar doação vinculada, conferir saldo, mover para lixeira e restaurar.
7. Testar e-mail com endereço controlado. Instalar o gatilho somente depois de revisar a autorização do serviço de e-mail no Apps Script.

## Escopo pendente desta entrega

O modal de Cloudflare e os campos do gateway de pagamento foram mantidos para configuração futura, sem inserir credenciais. O Template Mestre foi adicionado como base reutilizável e a impressão da Agenda mantém A4; ainda é necessário migrar cada função de impressão para o template e validar cada PDF. Banhos, Ervas, Caixa, Mensagem do Dia e Loja não foram totalmente normalizados para todos os botões, modais e estados de carregamento. O M08 está em branch e precisa da instalação Apps Script para passar pelo teste ponta a ponta. Não mesclar ao site final.
