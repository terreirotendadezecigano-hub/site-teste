# M08 — implementação e validação no SITE-TESTE

Branch isolada: `codex/bloco-autonomo-20261018`, criada a partir da revisão da Agenda. Não houve alteração em `main), site final, planilha ou implantação Apps Script V16.

## Arquivos nesta branch

- `index.html`: corrige a posição dos estilos da revisão da Agenda, consolida variáveis globais de identidade visual, incorpora estilos A4 e carrega o frontend M08.
- `m08-ui.js`: formulários e listagens responsivos de Pedido de Oração, Pedidos Recebidos, Estoque e Doações.
- `scripts/TZC_M08_Pedidos_Oracao_Estoque_Auditoria.gs`: backend para as abas e operações M08.
- `scripts/TZC_M08_IMPLANTACAO_TESTE.md`: roteiro de instalação, permissões e testes.

## Pedido de Oração

- `TZC_M08_criarPedidoOracao(json)` recebe motivo, nome completo e nascimento; o envio é público e a consulta não.
- `TZC_M08_listarPedidosOracao(token)` e `TZC_M08_atualizarPedidoOracao(token,id,status)` autorizam somente perfis normalizados exatamente como **Pai de Santo** ou **Mãe de Santo**.
- A auditoria registra criação e alteração sem duplicar o motivo da oração.
- Para a privacidade alcançar também a planilha, o acesso direto ao arquivo deve ficar restrito a responsáveis confiáveis; um editor do Google Sheets consegue ler as células fora do site.

## Estoque, doações e auditoria

- `TZC_M08_setup()` cria cabeçalhos por nome de coluna, sem limpar dados existentes.
- O estoque inclui quantidade, unidade, mínimo e exclusão lógica recuperável.
- Doação em item seleciona um insumo existente; sob trava do Apps Script, registra a doação e atualiza o saldo do estoque. O financeiro em dinheiro não é lançado no Caixa por esta versão.
- A auditoria registra as ações do M08 com data e hora em campos separados. Os módulos antigos ainda precisam instrumentar suas operações para a auditoria se tornar universal.
- Os alertas entram em fila somente quando o conteúdo é público. Visitantes só entram na lista de destinatários se existir a coluna `Acesso_Publico` e ela tiver valor afirmativo; membros ativos com e-mail válido recebem os avisos enfileirados.
- O gatilho de cinco minutos é criado somente ao chamar `TZC_M08_instalarGatilhoEmail` no Apps Script; nenhum gatilho ou autorização externa foi executado.

## Rotas que precisam ser habilitadas na ponte ativa

| Ação RPC | Função Apps Script | Limites por argumento |
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

O frontend já chama essas ações. A allowlist ativa está no projeto Apps Script V16, cuja fonte não consta neste repositório; a página de teste deve ser validada só depois de incluir as funções M08 nesse backend e criar uma nova implantação de teste. O arquivo `scripts/TZC-Ponte-Externa-V03.txt` é uma referência versionada e não comprova qual ponte está ativa.

## Testes realizados no código local

- Sintaxe JavaScript do backend M08 e do frontend: passou.
- Controle de acesso por perfil: Pai de Santo e Mãe de Santo permitidos; Dirigente, Administrador, usuário inativo e token inválido negados para leitura do Pedido de Oração.
- Estrutura do HTML: um único fechamento de `body/html`, estilos antes do fechamento, sem conteúdo solto após o documento.
- Verificadas as regras de impressão A4 e a ordem Calendário → Lista no CSS móvel da Agenda.

## Instalação e aceite ponta a ponta

1. Adicionar o arquivo GS no Apps Script de teste como arquivo novo, sem substituir `Código.gs`.
2. Executar `TZC_M08_setup()`; conferir que as abas foram criadas sem apagar registros.
3. Copiar as rotas M08 para a allowlist ativa, preservando validação de origem e limites; criar uma nova implantação **de teste**.
4. Testar envio público fictício e leitura por Pai/Mãe de Santo; testar negação para os outros perfis.
5. Testar criar/editar item, registrar doação vinculada, atualizar saldo, mover para lixeira e restaurar.
6. Testar e-mail com endereço controlado e somente conteúdo público.
7. Instalar o gatilho após revisar a autorização do serviço de e-mail no próprio Apps Script.

## Escopo ainda não concluído

A aba de configuração de pagamento e o modal de Cloudflare foram mantidos para configuração futura e não receberam segredos. A aplicação do Template Mestre ainda precisa ser migrada e validada em cada função de impressão dos módulos. Banhos, Ervas, Caixa, Mensagem do Dia e Loja ainda não foram normalizados por completo para todos os botões, modais, carregamento e impressão. Os módulos M08 estão preparados em branch, mas ainda dependem das funções e rotas no Apps Script de teste para funcionar de ponta a ponta. Não publicar esta branch no site final.
