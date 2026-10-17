# Transcrição de pontos cantados — integração de teste

## O que muda para quem usa

No cadastro de um ponto, a caixa **Preencher a letra pelo áudio ou vídeo** permite selecionar um arquivo de até 24 MB e tocar em **Transcrever letra**. O resultado entra no campo **Letra**. A pessoa revisa a transcrição e só então salva o ponto.

A configuração da API é feita uma vez pelo botão **Configurar acesso (primeiro uso)**. A chave é enviada ao Apps Script autenticado, armazenada em Script Properties e nunca devolvida à página.

## Ativação do backend

1. No projeto de Apps Script que atende o ambiente de teste, acrescente o conteúdo de `TZC_M08_Transcricao_Pontos.gs`.
2. Na lista fechada `rotas` da ponte externa **atual** (V09), acrescente estas duas entradas:
   ```js
   configurarTranscricaoPontos: { funcao: 'TZC_M08_configurarTranscricaoPontos', limites: [100, 512] },
   transcreverPontoCantado: { funcao: 'TZC_M08_transcreverPontoCantado', limites: [100, 34000000] }
   ```
   Mantenha as outras rotas existentes. Não substitua a ponte V09 por arquivos históricos V03 ou V05.
3. Implante uma nova versão da implantação de teste do Apps Script, mantendo a URL usada pelo site.
4. Na Plataforma OpenAI, crie uma chave de API e habilite faturamento de API. No formulário do ponto, use **Configurar acesso (primeiro uso)** e cole a chave. Não coloque a chave no código do site, em uma planilha ou em uma mensagem.

A cobrança da API é separada da assinatura do ChatGPT. O custo depende do uso e do modelo.

## Limites e revisão

- O arquivo de transcrição pode ter até 24 MB e deve estar em MP3, WAV, M4A, OGG, FLAC, MP4 ou WEBM.
- A saída é uma transcrição da letra cantada. Canto, percussão e termos pouco comuns podem gerar erros; revise antes de salvar.
- O arquivo usado para transcrever não é anexado automaticamente à mídia do ponto. Se também quiser exibi-lo no site, selecione-o separadamente em **Mídia do ponto**.
- A chave fica em Script Properties no projeto de Apps Script. Somente dirigentes/administradores autenticados conseguem configurar ou usar a transcrição.
