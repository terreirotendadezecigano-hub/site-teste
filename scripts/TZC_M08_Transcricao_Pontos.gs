/**
 * TZC — M08: transcrição de pontos cantados
 * Requer que os dois nomes abaixo também sejam liberados na lista fechada da ponte externa.
 * A chave fica em Script Properties e nunca volta para o navegador.
 */
function TZC_M08_configurarTranscricaoPontos(token, apiKey) {
  var acesso = TZC_M08_usuarioAutorizado_(token);
  if (!acesso.ok) return acesso;
  var key = String(apiKey || '').trim();
  if (key.length < 20 || key.length > 512) {
    return { ok: false, mensagem: 'A chave da API parece incompleta. Confira e tente novamente.' };
  }
  try {
    PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', key);
    return { ok: true, mensagem: 'Acesso à transcrição configurado.' };
  } catch (e) {
    return { ok: false, mensagem: 'Não foi possível guardar a chave com segurança neste projeto.' };
  }
}

function TZC_M08_transcreverPontoCantado(token, payloadJson) {
  var acesso = TZC_M08_usuarioAutorizado_(token);
  if (!acesso.ok) return acesso;

  var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    return { ok: false, mensagem: 'Configure o acesso à transcrição neste formulário antes de usar.' };
  }

  var payload;
  try {
    payload = JSON.parse(String(payloadJson || '{}'));
  } catch (e) {
    return { ok: false, mensagem: 'O arquivo recebido não pôde ser lido. Tente selecioná-lo novamente.' };
  }
  var base64 = String(payload.base64 || '');
  if (!base64 || base64.length > 34000000) {
    return { ok: false, mensagem: 'O arquivo está vazio ou ultrapassa o limite de 24 MB.' };
  }

  var name = String(payload.name || 'ponto-audio').replace(/[\\/\\?%*:|"<>]/g, '_').slice(0, 180);
  var extension = (name.match(/\\.([a-z0-9]+)$/i) || [,''])[1].toLowerCase();
  var allowedExtensions = ['mp3','wav','ogg','m4a','flac','mp4','webm','mpeg','mpga'];
  if (allowedExtensions.indexOf(extension) < 0) {
    return { ok: false, mensagem: 'Formato não aceito. Use MP3, WAV, M4A, OGG, FLAC, MP4 ou WEBM.' };
  }
  var mime = String(payload.mime || '').toLowerCase().split(';')[0];
  var mimeByExtension = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
    flac: 'audio/flac', mp4: 'video/mp4', webm: 'video/webm',
    mpeg: 'audio/mpeg', mpga: 'audio/mpeg'
  };
  if (!mime || mime === 'application/octet-stream') mime = mimeByExtension[extension];
  if (mime.indexOf('audio/') !== 0 && mime.indexOf('video/') !== 0) {
    return { ok: false, mensagem: 'Escolha um arquivo de áudio ou vídeo compatível.' };
  }

  try {
    var bytes = Utilities.base64Decode(base64);
    if (bytes.length > 24 * 1024 * 1024) {
      return { ok: false, mensagem: 'O arquivo ultrapassa o limite de 24 MB.' };
    }
    var blob = Utilities.newBlob(bytes, mime, name);
    var response = UrlFetchApp.fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'post',
      headers: { Authorization: 'Bearer ' + apiKey },
      payload: {
        file: blob,
        model: 'gpt-4o-mini-transcribe',
        language: 'pt',
        prompt: 'Transcreva integralmente a letra cantada de um ponto de Umbanda em português brasileiro. Preserve as palavras, as repetições e as chamadas e respostas que conseguir ouvir. Não resuma nem acrescente palavras.'
      },
      muteHttpExceptions: true
    });
    var status = response.getResponseCode();
    var body = response.getContentText();
    if (status < 200 || status >= 300) {
      if (status === 401) return { ok: false, mensagem: 'A chave OpenAI não foi aceita. Confira a configuração e tente novamente.' };
      if (status === 429) return { ok: false, mensagem: 'A API OpenAI está sem saldo disponível ou temporariamente ocupada. Confira o faturamento da API e tente novamente.' };
      if (status === 413) return { ok: false, mensagem: 'O arquivo é grande demais para a API. Tente um trecho menor.' };
      return { ok: false, mensagem: 'A transcrição não foi concluída (código ' + status + '). Tente novamente com outro arquivo.' };
    }
    var result = JSON.parse(body || '{}');
    var text = String(result.text || '').trim();
    if (!text) return { ok: false, mensagem: 'Não foi possível identificar a letra neste arquivo. Tente um trecho mais nítido.' };
    return { ok: true, text: text };
  } catch (e) {
    return { ok: false, mensagem: 'Não foi possível processar este arquivo agora. Tente novamente.' };
  }
}

/** Confere a sessão e repete no servidor a mesma regra de acesso do formulário. */
function TZC_M08_usuarioAutorizado_(token) {
  try {
    var session = TZC_M02_validarSessao(String(token || ''));
    var profile = String(session && session.usuario && session.usuario.perfil || '').trim();
    if (!session || !session.ok || !/^(dirigente|administrador)$/i.test(profile)) {
      return { ok: false, mensagem: 'A transcrição é restrita à equipe autorizada. Entre novamente como dirigente ou administrador.' };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, mensagem: 'Não foi possível validar seu acesso. Entre novamente e tente de novo.' };
  }
}
