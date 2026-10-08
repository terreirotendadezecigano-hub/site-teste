# Site-teste — Tenda de Zé Cigano

Este repositório é o ambiente de desenvolvimento e validação. O repositório final `Tendadezecigano` permanece separado e sem alterações.

## Versões atuais

- `index.html`: V31, com títulos mais claros na configuração e agenda reorganizada para celular.
- Apps Script de teste: implantação V16. A sessão não vence por tempo; termina ao sair ou se a conta for desativada.
- A ponte externa V02 mantém a lista fechada de funções e só aceita a origem GitHub Pages do site de teste.
- Nenhuma linha da planilha foi apagada nesta atualização.

## Arquivos publicados e arquivos de consulta

- `index.html`: única página publicada pelo GitHub Pages.
- Arquivos `.txt`: histórico e cópias de leitura; não são páginas publicadas nem carregados pela home.
- Pré-visualizações independentes que não eram usadas já foram removidas anteriormente.

## Configurações existentes

A tela atual controla dados básicos, título e apresentação da home, os blocos que já existem em `Blocos_Pagina`, ordem/exibição desses blocos e redes sociais.

A configuração completa dos conteúdos ainda será implementada nos módulos correspondentes:

| Conteúdo | Tabela |
|---|---|
| Mensagem do dia | `Publicacoes` |
| Banho da semana | `Biblioteca_Banhos` |
| Agenda | `Eventos` |
| Primeira visita | `Paginas_Site` e `Blocos_Pagina` |
| Orientações | `Guias_Instrucoes` |

A agenda atual já lista eventos públicos; a edição integral do conteúdo dessas tabelas será conectada à tela administrativa durante a construção dos módulos.

## Cronograma de implementação

1. **Base visual e home — em validação:** layout V13 aprovado, temas claro/escuro, dados da casa e home configurável.
2. **Acesso e sessão — V16 implantada no teste:** código numérico por e-mail, sessão lembrada sem vencimento automático e saída explícita.
3. **Agenda e presença — em validação:** previsão de membros e visitantes, check-in, confirmação do responsável e relatório.
4. **Configurações da home — em andamento:** completar campos e controles das cinco fontes listadas acima.
5. **Módulos de conteúdo:** mensagens, banhos/ervas, orientações, história, pontos cantados, mural e estudos.
6. **Gestão de membros e área interna:** cadastro, atualização sem duplicidade, exclusão lógica, permissões e avisos.
7. **Loja:** catálogo, cadastro de compradores e pedidos, com banco organizado para a loja.
8. **Revisão final:** celular, computador, acessibilidade, desempenho e permissões; só depois promover a versão aprovada ao repositório final.

## Testes da versão V31/V16

1. No celular, abra a agenda e confira se título, data, local e botão cabem sem rolagem horizontal.
2. Abra Configurações e confira a hierarquia dos títulos: Identidade e contatos; Abertura da página inicial; Página inicial — títulos e seções; Redes e canais.
3. Entre uma vez, recarregue o site e confirme que o acesso lembrado continua ativo. Toque em **Sair**, recarregue e confirme que o site pede login, mantendo o e-mail preenchido.
4. Em Configurações, confira os nomes dos blocos e se continuam permitindo mudar título, texto, ordem e exibição.

Use sempre apenas contas e registros fictícios enquanto estiver no ambiente de teste. Não altere nem publique o site final nesta fase.
