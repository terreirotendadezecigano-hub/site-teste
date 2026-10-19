# Site-teste — Tenda de Zé Cigano

Este repositório publica o ambiente de teste do site pela branch `main`.

## Arquivos de execução

- `index.html`: página principal, estilos, menu e ponte de comunicação.
- `listagens.js`, `loja.js`, `m08-ui.js`, `multicanal.js` e `qrcode.js`: módulos de interface carregados pela página.
- Backend: a URL da implantação web do Google Apps Script está centralizada em `APP_WEB_URL`, no `index.html`.

A implantação Apps Script é externa a este repositório e não foi alterada nesta limpeza. O repositório não contém cópias antigas ou fragmentos do backend. A quantidade de arquivos-fonte `.gs` na implantação deve ser conferida e consolidada no editor do Apps Script, pois o projeto implantado não está disponível por este repositório.

Este ambiente é separado do site final. Use dados fictícios durante a validação.

## Backlog aprovado

- **NFS-e:** implementar emissão de Nota Fiscal de Serviço Eletrônica para atendimentos e giras com cobrança, incluindo cadastro fiscal da casa, integração com provedor municipal/nacional, contingência, armazenamento do número e link/PDF da nota, cancelamento e auditoria. Credenciais fiscais devem permanecer somente no servidor.
- **Estudos & Desenvolvimento:** publicar apenas após existir rota no Apps Script com autorização verificada no servidor: cada médium acessa somente o próprio histórico; Pai e Mãe de Santo acessam todos. Não expor respostas espirituais nem credenciais no frontend.
