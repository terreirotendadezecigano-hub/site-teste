# Publicação multicanal no site atual

O módulo usa `multicanal.js`, o contêiner `dynamicPage`, `authRpc` e a sessão do site atual. Não abre outro painel. O menu e o atalho em Configurações são exibidos ao Dirigente; o backend verifica novamente esse perfil.

Backend: adicionar `TZC_M07_Multicanal_V01.gs` ao projeto Apps Script de teste existente, acrescentar as cinco rotas `mc*` à ponte V09 e encaminhar `doPost` para `TZC_MC_receberResultado_`. Acrescentar o escopo `https://www.googleapis.com/auth/script.external_request` ao manifesto e concluir a autorização Google antes de habilitar APIs.

As redes reutilizam `Midias_Sociais`; colunas `MC_*` ampliam a tabela sem apagar os links públicos. `MC_Ativa` controla o disparo, independentemente de `Ativo` no rodapé. As credenciais ficam em ScriptProperties, com referências JSON na tabela, sem retornar tokens ao navegador. Editores do projeto Apps Script têm acesso administrativo a essas propriedades. O cadastro atual de links públicos não é uma autorização para enviar às redes.

Publicações são gravadas na aba existente `Publicacoes`. Rascunhos não aparecem na home. Ao publicar, `Status=Publicado` e `Acesso_Publico=Sim` seguem o contrato atual da home. A mídia específica é guardada em Imagem_URL/Video_URL; a home atual pode usar imagem padrão da casa conforme suas configurações. O módulo não muda silenciosamente esse comportamento visual.

Fila e histórico: `Publicacoes_Disparos`, `Publicacoes_Disparos_Log`. Um gatilho de minuto é criado uma única vez após abrir o painel autenticado. A marca MC_Pronto evita enviar registros incompletos. Chave idempotente evita duplicar conteúdo após timeout de salvamento. Checkpoints de Instagram são persistidos antes de publicar. Timeout/5xx e interrupções são resultado incerto, sem republicação cega. Apps Script/Sheets não oferecem transação SQL: a recuperação do salvamento reutiliza o post e cria apenas destinos faltantes.

Telegram: texto, uma imagem ou um vídeo por chamada. Instagram: Instagram Login, conta profissional, versão Graph habilitada no aplicativo, imagem/Reel. OAuth e renovação de token não são automáticos.

Outras redes usam webhook, que exige fluxo real no orquestrador, credenciais/escopos e requisitos específicos da plataforma. TikTok precisa da UX de consentimento/privacidade; WhatsApp exige definir destinatários, produto e templates. Não habilitar esses destinos antes de configurar esse fluxo. Cadastrar uma rede não cria uma integração automaticamente.

O webhook recebe um POST por destino, com `Idempotency-Key=ID_Disparo`, `X-Timestamp` e `X-Signature=HMAC-SHA256(secret,timestamp+'.'+JSON_original)`. Não inclui tokens OAuth. O consumidor deve verificar o HMAC, persistir o delivery_id com unicidade e responder `{accepted:true}` somente depois de aceitar duravelmente. Se concluir de forma síncrona, pode responder `{status:'succeeded',external_id:'...'}`.

Para retorno assíncrono, POST para callback_url com **envelope JSON** (Apps Script não expõe headers arbitrários no doPost):

```json
{"timestamp":"segundos_unix","body":"{\"delivery_id\":\"id\",\"status\":\"succeeded\",\"external_id\":\"id_remoto\"}","signature":"HMAC_HEX"}
```

Assine `timestamp+'.'+body` com callback_secret. Em falha definitiva, use status failed. Nunca repita a publicação para repetir o callback. A confirmação fica disponível por sete dias após finalização; os segredos dos jobs diretos são removidos após sucesso/falha, e os de webhook após sete dias. Segredos de resultados incertos ficam retidos para reconciliação administrativa. Respostas usam JSON `{ok:true|false}`; conferir o corpo, não somente o HTTP 200 do Apps Script.

Limites: segredo JSON por conta/job até 7 KB, armazenamento ScriptProperties e cotas Apps Script limitam o volume; esta arquitetura é para uso pequeno da casa, sem servidor novo. Até três destinos processados por execução, tempo máximo de loop 45 s entre chamadas. Uma chamada UrlFetchApp pode durar além desse limite. Segredos não são criptografados pela aplicação; dependem do controle de acesso da plataforma Google. Nunca copiar propriedades para repositório ou planilha.

Testes locais: `node --test tests/multicanal.test.cjs`. Mocks verificam sessão, preservação de colunas, proteção de segredos, rascunhos, idempotência, rejeições, worker, desativação e timeout. Não equivalem à validação real com APIs/redes, que depende de credenciais fornecidas pelo dirigente. Não foi alterado o repositório final `Tendadezecigano`.
