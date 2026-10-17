/* Check-in por QR por evento — site-teste. O QR nunca autentica: exige sessão de membro ativa. */
function tzcM04_qrNovoTokenV01_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
}

/** O QR e sua chave só são entregues a dirigente/administrador autenticado. */
function TZC_M04_qrEventoObter(token, eventoId) {
  var caller = tzcM04_usuarioSessaoV01_(String(token || ''));
  if (!caller) return {ok:false, mensagem:'Entre novamente para continuar.'};
  if (!/^(dirigente|administrador)$/i.test(String(caller.perfil || '')))
    return {ok:false, mensagem:'Somente dirigente ou administrador pode imprimir o QR.'};
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sh = SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID).getSheetByName(TZC_M04_CFG_V01.ABA_EVENTOS);
    if (!sh || sh.getLastRow() < 2) return {ok:false, mensagem:'Evento não encontrado.'};
    tzcM04_garantirColunasV01_(sh, ['ID_Evento','Token_Checkin_QR']);
    var rows = tzcM04_lerObjetosV01_(sh), event = rows.find(function(e){return String(e.ID_Evento) === String(eventoId);});
    if (!event || !tzcM04_simV01_(event.Status)) return {ok:false, mensagem:'Este evento não está ativo.'};
    var map = tzcM04_indicesV01_(sh), row = sh.getRange(2, map.ID_Evento + 1, sh.getLastRow() - 1, 1)
      .createTextFinder(String(eventoId)).matchEntireCell(true).matchCase(true).findNext();
    if (!row) return {ok:false, mensagem:'Evento não encontrado.'};
    var qr = String(event.Token_Checkin_QR || '').trim();
    if (!qr) { qr = tzcM04_qrNovoTokenV01_(); sh.getRange(row.getRow(), map.Token_Checkin_QR + 1).setValue(qr); SpreadsheetApp.flush(); }
    return {ok:true, id:String(event.ID_Evento), token:qr, titulo:String(event.Titulo || ''),
      data:tzcM04_dataISO_V02_(event.Data_Inicio), local:String(event.Local || '')};
  } catch (e) {
    console.error('M04 QR obter: ' + e.message);
    return {ok:false, mensagem:'Não foi possível preparar o QR deste evento.'};
  } finally { try { lock.releaseLock(); } catch (ignore) {} }
}

/** Registra presença confirmada diretamente para o membro autenticado que leu o QR. */
function TZC_M04_registrarCheckinQR(token, eventoId, qrToken) {
  var caller = tzcM04_usuarioSessaoV01_(String(token || ''));
  if (!caller || !caller.id || !caller.email) return {ok:false, mensagem:'Entre na área de membros para confirmar sua presença.'};
  var key = String(qrToken || '').trim();
  if (!/^[a-f0-9]{64}$/i.test(key)) return {ok:false, mensagem:'Este QR não é válido.'};
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID);
    var event = tzcM04_eventoV01_(eventoId);
    if (!event || !tzcM04_simV01_(event.Status) || String(event.Token_Checkin_QR || '') !== key)
      return {ok:false, mensagem:'O QR não corresponde a um evento ativo.'};
    var eventDate = tzcM04_dataISO_V02_(event.Data_Inicio).slice(0, 10);
    var today = Utilities.formatDate(new Date(), TZC_M04_CFG_V01.FUSO, 'yyyy-MM-dd');
    if (!eventDate || eventDate !== today)
      return {ok:false, mensagem:'O check-in por QR fica disponível no dia do evento.'};
    var sh = ss.getSheetByName(TZC_M04_CFG_V01.ABA_PRESENCAS);
    if (!sh) return {ok:false, mensagem:'A lista de presenças não está disponível.'};
    tzcM04_garantirColunasV01_(sh, TZC_M04_CAB_PRESENCAS_V01.concat(['Metodo_Checkin']));
    var map = tzcM04_indicesV01_(sh), rows = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues() : [];
    var row = 0, old = null;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][map.ID_Evento] || '') === String(eventoId) && String(rows[i][map.ID_Usuario] || '') === String(caller.id)) {
        row = i + 2; old = rows[i]; break;
      }
    }
    if (old && String(old[map.Presenca] || '').toLowerCase() === 'presente')
      return {ok:true, jaRegistrado:true, evento:String(event.Titulo || ''), mensagem:'Sua presença neste evento já foi registrada.'};
    if (old && String(old[map.Presenca] || '').toLowerCase() === 'ausente' && String(old[map.Status] || '').toLowerCase() === 'confirmado')
      return {ok:false, mensagem:'A gestão já confirmou sua ausência. Peça a um responsável para corrigir o registro.'};
    var now = new Date(), label = String(caller.nome || caller.email) + ' (' + caller.email + ')';
    var before = old ? {Presenca:old[map.Presenca], Status:old[map.Status], Checkin_Em:old[map.Checkin_Em]} : {};
    if (!row) row = sh.getLastRow() + 1;
    tzcM04_gravarObjetoV01_(sh, map, row, {
      ID_Presenca:old ? old[map.ID_Presenca] : TZC_ID_proximoSequencial('Presencas', 'ID_Presenca'),
      ID_Evento:String(eventoId), ID_Usuario:String(caller.id), Data_Resposta:now, Resposta:'Compareci',
      Presenca:'Presente', Observacoes:'', Criado_Em:old ? old[map.Criado_Em] : now, Atualizado_Em:now,
      Nome_Visitante:'', WhatsApp_Visitante:'', Email_Visitante:'', Tipo_Participante:'Membro',
      Aceita_Lembrete:'Sim', Contato_Lembrete:caller.email, Status:'Confirmado', Confirmado_Por:label,
      Checkin_Em:now, Confirmado_Em:now, Metodo_Checkin:'QR'
    });
    tzcM04_auditarV01_(ss, caller, 'CHECKIN_QR', String(eventoId) + ':' + String(caller.id), before,
      {Presenca:'Presente', Status:'Confirmado', Metodo_Checkin:'QR', Confirmado_Por:label, Confirmado_Em:now});
    SpreadsheetApp.flush();
    return {ok:true, evento:String(event.Titulo || ''), mensagem:'Check-in confirmado. Sua presença foi registrada.'};
  } catch (e) {
    console.error('M04 QR check-in: ' + e.message);
    return {ok:false, mensagem:'Não foi possível confirmar sua presença agora. Tente novamente.'};
  } finally { try { lock.releaseLock(); } catch (ignore) {} }
}
