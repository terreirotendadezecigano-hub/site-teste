/**
 * TZC — endpoint público de leitura do catálogo Ponto Cantado.
 * Compatível com o Código.gs V295: reutiliza doGet() para aplicar a visibilidade
 * pública já existente em M201_MODULES/m201Visible_ e limita os campos retornados.
 * Não grava dados, cria gatilhos, consulta mídia individual nem altera permissões.
 */
function TZC_M01_listarPontosCantadosPublicos() {
  var response = doGet({parameter: {sheet: 'Pontos_Cantados'}});
  var rows;

  try {
    rows = JSON.parse(response.getContent());
  } catch (error) {
    return {ok: false, mensagem: 'Não foi possível ler os pontos cantados.'};
  }

  if (!Array.isArray(rows)) {
    return {ok: false, mensagem: 'A lista de pontos cantados não está disponível.'};
  }

  var pontos = rows.map(function (row) {
    return {
      ID_Ponto: String(row.ID_Ponto || ''),
      Titulo_Ponto: String(row.Titulo_Ponto || ''),
      Linha_Entidade: String(row.Linha_Entidade || ''),
      Tipo_Ponto: String(row.Tipo_Ponto || ''),
      Letra_Ponto: String(row.Letra_Ponto || ''),
      Audio_Ponto: String(row.Audio_Ponto || ''),
      Video_Ponto: String(row.Video_Ponto || ''),
      Audio_URL: String(row.Audio_URL || ''),
      Video_URL: String(row.Video_URL || ''),
      Ponto_URL: String(row.Ponto_URL || ''),
      Data_Criacao: row.Data_Criacao || ''
    };
  }).filter(function (row) {
    return row.ID_Ponto && row.Titulo_Ponto;
  });

  return {ok: true, pontos: pontos};
}
