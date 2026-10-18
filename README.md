# Site-teste — Tenda de Zé Cigano

Este repositório publica o ambiente de teste do site. A página é servida pelo GitHub Pages na branch `main`.

## Arquivos de execução

- `index.html`: página principal e ponte de comunicação com o backend.
- `listagens.js`, `loja.js`, `m08-ui.js`, `multicanal.js` e `qrcode.js`: módulos de interface carregados pela página.
- `tests/multicanal.test.cjs`: testes locais do módulo multicanal.

A página usa uma implantação web do Google Apps Script configurada em `APP_WEB_URL` dentro de `index.html`. O código-fonte da implantação fica no editor do Apps Script e não é uma cópia versionada neste repositório. A limpeza removeu snapshots e fragmentos antigos; não alterou a implantação nem a planilha.

## Verificação local

Execute os testes multicanal com Node.js:

```sh
node --test tests/multicanal.test.cjs
```

Use dados fictícios no ambiente de teste. Este repositório é separado do site final.
