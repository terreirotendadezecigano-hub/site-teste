# Site-teste — Tenda de Zé Cigano

Este é o ambiente de desenvolvimento e validação. O repositório final `Tendadezecigano` continua separado e não foi alterado.

## O que está ativo aqui

- `index.html`: site V29, baseado no layout aprovado V13.
- Google Apps Script de teste: implantação V15, ligada ao banco de dados fictício de testes.
- A ponte externa V02 aceita somente mensagens do domínio GitHub Pages deste site e nomes de função definidos em uma lista fechada. O modo `ALLOWALL` é aplicado só à página mínima da ponte.
- A home carrega apresentação, mensagem do dia, agenda próxima, contatos e redes cadastradas no banco de dados.
- O botão Membros abre o fluxo de acesso por e-mail. A conferência do endereço já respondeu pelo caminho GitHub Pages → ponte V15 → função Apps Script.
- O fluxo de código numérico, sessão e as ações de presença continuam precisando de validação completa com uma conta de teste autorizada.

## Arquivos da raiz

- `index.html`: única página inicial publicada pelo GitHub Pages.
- Arquivos `.txt` com versões antigas: arquivo histórico para consulta; não são páginas publicadas nem carregados pela home.
- As prévias visuais independentes foram removidas porque não eram usadas nem referenciadas pelo site.

## Cronograma de implementação

1. **Base visual e home — em uso no teste:** layout aprovado, responsivo, tema claro/escuro, conteúdo inicial e dados públicos.
2. **Acesso e sessões — em validação:** conferência do e-mail, código numérico, sessão lembrada, encerramento da sessão e perfis.
3. **Agenda e presença — em validação:** previsão de presença de membros e visitantes, check-in de membros, confirmação por responsável autorizado e relatório PDF.
4. **Configurações do site — próximo passo:** controlar dados básicos, aparência, páginas e blocos configuráveis pela casa.
5. **Módulos de conteúdo:** história, mensagens, banhos/ervas, pontos cantados, orientações, mural e estudos.
6. **Gestão de membros e área interna:** cadastro, atualização sem duplicidade, exclusão lógica, histórico, permissões e avisos de mensalidade.
7. **Loja:** catálogo, cadastro de compradores, pedidos e integração de pagamentos, em banco/abas definidos sem misturar com dados do terreiro.
8. **Revisão e publicação:** testar celular e computador, perfis, acessibilidade para pessoas mais velhas, desempenho, backup e só então promover para o repositório final.

## Regras para o teste

- Os dados da planilha são fictícios. Não tratar registros de teste como informação real.
- Os acessos permanecem liberados para facilitar a construção; as permissões finais serão configuradas e testadas antes da publicação.
- Não publicar nem alterar o site final durante esta fase.
- Ao testar o acesso, use um e-mail de teste autorizado. A primeira ação apenas confere o cadastro; o botão **Enviar código** envia um e-mail.

## Verificação da ponte V15

Foi testada a chamada de conferência com endereço fictício. O sistema respondeu pela ponte e manteve a resposta genérica para não revelar se um e-mail pertence a um membro. Nenhum código foi enviado nesse teste.

O próximo teste funcional é o fluxo com uma conta de teste autorizada: conferir o e-mail, solicitar o código numérico, entrar, reabrir a página para validar a sessão lembrada e sair.