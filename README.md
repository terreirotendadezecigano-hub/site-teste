# Site de teste — Tenda de Zé Cigano

Este repositório é o ambiente de teste dos módulos antes de qualquer publicação no site final.

## Layout e arquivos

- `index.html`: layout V13 aprovado, conectado aos dados públicos da planilha.
- `site versão V13.txt`: cópia TXT da interface para arquivo e revisão.
- `codigo.gs versao V02.txt`: serviço de dados Apps Script do Módulo 01.
- Projeto Apps Script: `TZC_Modulo01_V02.gs` + `Index.html`.
- Implantação de teste: versão 2; mantém o mesmo link `/exec`.

## Módulo 01 — página inicial pública

**Status: publicado no ambiente de teste; dados carregados no navegador em desktop.**

A home usa as abas `Configuracoes_Site`, `Paginas_Site`, `Blocos_Pagina`, `Midias_Sociais`, `Eventos`, `Publicacoes` e os campos públicos permitidos de `Geral`. Os blocos, páginas, canais e cores são controlados pela planilha.

A leitura de Publicacoes não inclui a coluna P, que guarda imagens em base64. O endpoint não devolve dados de membros, saúde, documentos ou auditoria. A chave Pix é incluída porque a interface pública oferece a ação de copiar.

**Atenção:** a Base de Dados de teste ainda contém registros fictícios. Troque ou oculte os exemplos antes de divulgar o link publicamente.

## Ainda não implementado

- Login e perfis de administrador, dirigente, colaborador e membro.
- Área administrativa e operações de cadastro/edição/exclusão lógica.
- Loja, pedidos e pagamentos.
- Teste em celular e validação com usuários.
- Revisão dos registros fictícios e aprovação final do conteúdo.

## Como testar o Módulo 01

1. Abra a página de teste em desktop e celular.
2. Confirme logo, menu, título, apresentação, publicações, agenda, redes e contatos.
3. No celular, toque em Menu, Membros, tema e voltar ao topo.
4. Confira na planilha que alterar um bloco ou canal muda a página após atualizar.
5. Não use registros fictícios como dados reais.

O site final permanece separado no repositório `Tendadezecigano`.
