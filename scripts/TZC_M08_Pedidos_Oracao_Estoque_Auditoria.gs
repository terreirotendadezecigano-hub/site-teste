/**
 * TZC M08 — Pedidos de oração, estoque, doações, notificações e auditoria.
 * Instalar somente no Apps Script do SITE-TESTE. O arquivo não substitui Código.gs.
 * Segredos não são colocados neste arquivo nem enviados pelo navegador.
 */
const TZC_M08 = {
  SPREADSHEET_ID: '1WGlSF_Z9zxQ1zO52wWmiLOlkegJEczsgTJEtj8GvlhM',
  PEDIDOS: 'Pedidos_Oracao',
  ESTOQUE: 'Estoque_Insumos',
  DOACOES: 'Doacoes_Insumos',
  AUDITORIA: 'Auditoria_Universal',
  FILA_EMAIL: 'Fila_Alertas_Email'
};

const TZC_M08_HEADERS = {
  Pedidos_Oracao: ['ID_Pedido','Motivo_Oracao','Nome_Completo','Data_Nascimento','Status','Data_Criacao','Hora_Criacao','Data_Atualizacao','Hora_Atualizacao','Excluido'],
  Estoque_Insumos: ['ID_Item','Nome_Item','Categoria','Unidade','Quantidade_Atual','Quantidade_Minima','Observacao','Data_Criacao','Hora_Criacao','Data_Atualizacao','Hora_Atualizacao','Excluido'],
  Doacoes_Insumos: ['ID_Doacao','ID_Item','Nome_Item','Quantidade','Unidade','Nome_Doador','Observacao','Status_Caixa','Data_Criacao','Hora_Criacao','Excluido'],
  Auditoria_Universal: ['ID_Auditoria','Modulo','ID_Registro','Acao','Usuario_Email','Data','Hora','Resumo'],
  Fila_Alertas_Email: ['ID_Alerta','Titulo','Resumo_Publico','Acesso_Publico','Status','Data_Criacao','Hora_Criacao','Data_Envio','Hora_Envio','Resultado']
};

function TZC_M08_setup() {
  Object.keys(TZC_M08_HEADERS).forEach(function(name) {
    var sh = tzcM08_sheet_(name);
    var existing = sh.getLastColumn() ? sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0] : [];
    var headers = existing.filter(String);
    TZC_M08_HEADERS[name].forEach(function(h) { if (headers.indexOf(h) < 0) headers.push(h); });
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  });
  return {ok:true, mensagem:'Estrutura M08 verificada sem apagar dados.'};
}

/** Pedidos podem ser enviados sem login. A leitura e qualquer alteração passam por perfil estrito. */
function TZC_M08_criarPedidoOracao(json) {
  try {
    var d = JSON.parse(String(json || '{}'));
    var motivo = tzcM08_text_(d.motivo, 1200, true);
    var nome = tzcM08_text_(d.nome, 160, true);
    var nascimento = String(d.dataNascimento || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento) || isNaN(Date.parse(nascimento + 'T12:00:00'))) {
      throw new Error('Informe uma data de nascimento válida.');
    }
    var now = new Date(), id = Utilities.getUuid();
    tzcM08_append_(TZC_M08.PEDIDOS, {
      ID_Pedido:id, Motivo_Oracao:motivo, Nome_Completo:nome,
      Data_Nascimento:nascimento, Status:'Recebido',
      Data_Criacao:tzcM08_date_(now), Hora_Criacao:tzcM08_time_(now),
      Data_Atualizacao:tzcM08_date_(now), Hora_Atualizacao:tzcM08_time_(now), Excluido:false
    });
    tzcM08_audit_('Pedido de oração',id,'Criado','Solicitação recebida; conteúdo omitido do histórico.','Público');
    return {ok:true,mensagem:'Pedido de oração recebido.'};
  } catch(e) {
    return {ok:false,mensagem:e.message || 'Não foi possível registrar o pedido.'};
  }
}

function TZC_M08_listarPedidosOracao(token) {
  try {
    var user = tzcM08_requireRole_(token, ['pai de santo','mae de santo']);
    var rows = tzcM08_read_(TZC_M08.PEDIDOS).filter(function(r) { return !tzcM08_yes_(r.Excluido); });
    rows.sort(function(a,b) { return String(b.Data_Criacao+b.Hora_Criacao).localeCompare(String(a.Data_Criacao+a.Hora_Criacao)); });
    return {ok:true,pedidos:rows.map(function(r) {
      return {id:String(r.ID_Pedido),motivo:String(r.Motivo_Oracao),nome:String(r.Nome_Completo),
        dataNascimento:String(r.Data_Nascimento),status:String(r.Status),
        data:String(r.Data_Criacao),hora:String(r.Hora_Criacao)};
    })};
  } catch(e) { return {ok:false,mensagem:e.message || 'Acesso restrito.',pedidos:[]}; }
}

function TZC_M08_atualizarPedidoOracao(token, id, status) {
  try {
    var user = tzcM08_requireRole_(token, ['pai de santo','mae de santo']);
    var allowed = ['Recebido','Em oração','Concluído'];
    if (allowed.indexOf(String(status)) < 0) throw new Error('Status inválido.');
    var sh=tzcM08_sheet_(TZC_M08.PEDIDOS), row=tzcM08_findRow_(sh,'ID_Pedido',id);
    if (!row) throw new Error('Pedido não encontrado.');
    tzcM08_set_(sh,row,{Status:String(status),Data_Atualizacao:tzcM08_date_(new Date()),Hora_Atualizacao:tzcM08_time_(new Date())});
    tzcM08_audit_('Pedido de oração',id,'Atualizado','Status alterado.',user.email);
    return {ok:true,mensagem:'Pedido atualizado.'};
  } catch(e) { return {ok:false,mensagem:e.message || 'Não foi possível atualizar.'}; }
}

function TZC_M08_listarEstoque(token, incluirExcluidos) {
  try {
    tzcM08_requireRole_(token,['dirigente','administrador']);
    return {ok:true,itens:tzcM08_read_(TZC_M08.ESTOQUE).filter(function(r) {
      return incluirExcluidos===true || !tzcM08_yes_(r.Excluido);
    }).map(function(r) {
      return {id:String(r.ID_Item),nome:String(r.Nome_Item),categoria:String(r.Categoria),unidade:String(r.Unidade),
        quantidade:Number(r.Quantidade_Atual)||0,minimo:Number(r.Quantidade_Minima)||0,observacao:String(r.Observacao||''),
        excluido:tzcM08_yes_(r.Excluido)};
    })};
  } catch(e) { return {ok:false,mensagem:e.message || 'Acesso restrito.',itens:[]}; }
}

function TZC_M08_salvarEstoque(token, json) {
  try {
    var user=tzcM08_requireRole_(token,['dirigente','administrador']), d=JSON.parse(String(json||'{}'));
    var nome=tzcM08_text_(d.nome,120,true), cat=tzcM08_text_(d.categoria,80,false), unidade=tzcM08_text_(d.unidade,24,true);
    var qtd=Number(d.quantidade), min=Number(d.minimo);
    if(!isFinite(qtd)||qtd<0||!isFinite(min)||min<0) throw new Error('Quantidade e mínimo devem ser números iguais ou maiores que zero.');
    var sh=tzcM08_sheet_(TZC_M08.ESTOQUE), now=new Date(), id=String(d.id||Utilities.getUuid()), row=tzcM08_findRow_(sh,'ID_Item',id);
    var fields={ID_Item:id,Nome_Item:nome,Categoria:cat,Unidade:unidade,Quantidade_Atual:qtd,Quantidade_Minima:min,
      Observacao:tzcM08_text_(d.observacao,500,false),Data_Atualizacao:tzcM08_date_(now),Hora_Atualizacao:tzcM08_time_(now),Excluido:false};
    if(row) tzcM08_set_(sh,row,fields);
    else {fields.Data_Criacao=tzcM08_date_(now);fields.Hora_Criacao=tzcM08_time_(now);tzcM08_append_(TZC_M08.ESTOQUE,fields);}
    tzcM08_audit_('Estoque',id,row?'Editado':'Criado','Item atualizado.',user.email);
    if(qtd<=min) tzcM08_enqueue_('Estoque baixo: '+nome,'Item abaixo do mínimo configurado.',true);
    return {ok:true,id:id,mensagem:'Item salvo.'};
  } catch(e) { return {ok:false,mensagem:e.message || 'Não foi possível salvar o item.'}; }
}

function TZC_M08_excluirEstoque(token,id) { return tzcM08_softDelete_(token,TZC_M08.ESTOQUE,'ID_Item',id,'Estoque'); }
function TZC_M08_restaurarEstoque(token,id) { return tzcM08_restore_(token,TZC_M08.ESTOQUE,'ID_Item',id,'Estoque'); }

function TZC_M08_registrarDoacao(token,json) {
  try {
    var user=tzcM08_requireRole_(token,['dirigente','administrador']);
    var d=JSON.parse(String(json||'{}')), nome=tzcM08_text_(d.nome,120,true), unidade=tzcM08_text_(d.unidade,24,true);
    var qtd=Number(d.quantidade); if(!isFinite(qtd)||qtd<=0)throw new Error('Informe uma quantidade maior que zero.');
    var sh=tzcM08_sheet_(TZC_M08.DOACOES),id=Utilities.getUuid(),now=new Date();
    var idItem=String(d.idItem||'');
    tzcM08_append_(TZC_M08.DOACOES,{ID_Doacao:id,ID_Item:idItem,Nome_Item:nome,Quantidade:qtd,Unidade:unidade,
      Nome_Doador:tzcM08_text_(d.doador,120,false),Observacao:tzcM08_text_(d.observacao,500,false),
      Status_Caixa:'Pendente de conferência',Data_Criacao:tzcM08_date_(now),Hora_Criacao:tzcM08_time_(now),Excluido:false});
    tzcM08_audit_('Doações',id,'Registrado','Doação registrada; lançamento financeiro aguarda conferência.',user.email);
    return {ok:true,id:id,mensagem:'Doação registrada para conferência.'};
  } catch(e) { return {ok:false,mensagem:e.message || 'Não foi possível registrar a doação.'}; }
}

function TZC_M08_listarAuditoria(token, limite) {
  try {
    tzcM08_requireRole_(token,['dirigente','administrador']);
    var n=Math.min(Math.max(Number(limite)||100,1),500),rows=tzcM08_read_(TZC_M08.AUDITORIA);
    return {ok:true,registros:rows.slice(-n).reverse().map(function(r){return {
      modulo:String(r.Modulo),id:String(r.ID_Registro),acao:String(r.Acao),usuario:String(r.Usuario_Email),
      data:String(r.Data),hora:String(r.Hora),resumo:String(r.Resumo)
    };})};
  } catch(e) { return {ok:false,mensagem:e.message || 'Acesso restrito.',registros:[]}; }
}

/** Enfileira somente avisos públicos; quem chamou os módulos existentes deve chamar esta função após salvar. */
function TZC_M08_enfileirarAviso(token,titulo,resumo,publico) {
  try {
    tzcM08_requireRole_(token,['dirigente','administrador']);
    if(publico!==true && publico!=='true')throw new Error('Somente conteúdos públicos podem gerar este aviso.');
    var t=tzcM08_text_(titulo,120,true), s=tzcM08_text_(resumo,600,true);
    tzcM08_enqueue_(t,s,true);
    return {ok:true,mensagem:'Aviso preparado para envio.'};
  } catch(e) { return {ok:false,mensagem:e.message || 'Não foi possível preparar o aviso.'}; }
}

function TZC_M08_instalarGatilhoEmail(token) {
  try {
    tzcM08_requireRole_(token,['dirigente']);
    var exists=ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='TZC_M08_processarFilaEmail';});
    if(!exists)ScriptApp.newTrigger('TZC_M08_processarFilaEmail').timeBased().everyMinutes(5).create();
    return {ok:true,mensagem:'Fila de e-mail configurada.'};
  } catch(e) { return {ok:false,mensagem:e.message || 'Não foi possível configurar os alertas.'}; }
}

function TZC_M08_processarFilaEmail() {
  var sh=tzcM08_sheet_(TZC_M08.FILA_EMAIL), rows=tzcM08_read_(TZC_M08.FILA_EMAIL);
  rows.filter(function(r){return String(r.Status)==='Pendente';}).slice(0,20).forEach(function(r){
    try {
      var members=tzcM08_recipients_('Membros',false), visitors=tzcM08_recipients_('Visitantes',true), recipients=members.concat(visitors);
      var subject='Tenda de Zé Cigano — '+String(r.Titulo||'Atualização');
      recipients.forEach(function(email){MailApp.sendEmail(email,subject,String(r.Resumo_Publico||'Há uma atualização pública no site.'));});
      var now=new Date(); tzcM08_set_(sh,r._row,{Status:'Enviado',Data_Envio:tzcM08_date_(now),Hora_Envio:tzcM08_time_(now),Resultado:'Concluído'});
    } catch(e) {
      tzcM08_set_(sh,r._row,{Status:'Falhou',Resultado:String(e.message||'Erro ao enviar').slice(0,200)});
    }
  });
}

function tzcM08_recipients_(sheetName, publicOnly) {
  var sh=SpreadsheetApp.openById(TZC_M08.SPREADSHEET_ID).getSheetByName(sheetName);
  if(!sh||sh.getLastRow()<2)return [];
  var v=sh.getDataRange().getDisplayValues(),h=v.shift().map(function(x){return String(x).trim().toLowerCase();});
  var iEmail=h.indexOf('email'),iStatus=h.indexOf('status_ativo'),iPublic=h.indexOf('acesso_publico'),iNotify=h.indexOf('receber_notificacoes');
  return v.filter(function(r){
    if(iStatus>=0&&!/^(ativo|sim|true)$/i.test(r[iStatus]))return false;
    if(publicOnly&&(iPublic<0||!/^(sim|true|publico|público)$/i.test(r[iPublic])))return false;
    if(iNotify>=0&&!/^(sim|true|ativo)$/i.test(r[iNotify]))return false;
    return iEmail>=0&&r[iEmail]&&/@/.test(r[iEmail]);
  }).map(function(r){return r[iEmail].trim();});
}

function tzcM08_enqueue_(title,summary,isPublic) {
  var now=new Date();
  tzcM08_append_(TZC_M08.FILA_EMAIL,{ID_Alerta:Utilities.getUuid(),Titulo:title,Resumo_Publico:summary,
    Acesso_Publico:!!isPublic,Status:'Pendente',Data_Criacao:tzcM08_date_(now),Hora_Criacao:tzcM08_time_(now),
    Data_Envio:'',Hora_Envio:'',Resultado:''});
}
function tzcM08_softDelete_(token,sheetName,idCol,id,module) {
  try { tzcM08_requireRole_(token,['dirigente','administrador']);var sh=tzcM08_sheet_(sheetName),row=tzcM08_findRow_(sh,idCol,id);
    if(!row)throw new Error('Registro não encontrado.');tzcM08_set_(sh,row,{Excluido:true,Data_Atualizacao:tzcM08_date_(new Date()),Hora_Atualizacao:tzcM08_time_(new Date())});
    tzcM08_audit_(module,id,'Movido para lixeira','Exclusão recuperável.',tzcM08_requireRole_(token,['dirigente','administrador']).email);return {ok:true,mensagem:'Registro movido para a lixeira.'};
  } catch(e){return {ok:false,mensagem:e.message||'Não foi possível excluir.'};}
}
function tzcM08_restore_(token,sheetName,idCol,id,module) {
  try { tzcM08_requireRole_(token,['dirigente','administrador']);var sh=tzcM08_sheet_(sheetName),row=tzcM08_findRow_(sh,idCol,id);
    if(!row)throw new Error('Registro não encontrado.');tzcM08_set_(sh,row,{Excluido:false,Data_Atualizacao:tzcM08_date_(new Date()),Hora_Atualizacao:tzcM08_time_(new Date())});
    tzcM08_audit_(module,id,'Restaurado','Registro recuperado da lixeira.',tzcM08_requireRole_(token,['dirigente','administrador']).email);return {ok:true,mensagem:'Registro restaurado.'};
  } catch(e){return {ok:false,mensagem:e.message||'Não foi possível restaurar.'};}
}
function tzcM08_requireRole_(token,allowed) {
  var session=typeof tzcM02_sessaoV03_==='function'?tzcM02_sessaoV03_(String(token||'')):null;
  if(!session)throw new Error('Entre novamente para continuar.');
  var user=typeof tzcM02_buscarUsuarioV03_==='function'?tzcM02_buscarUsuarioV03_(session.email):null;
  if(!user||String(user.status||'').toLowerCase()!=='ativo')throw new Error('Acesso inativo.');
  var role=tzcM08_norm_(user.perfil||'');
  if(allowed.indexOf(role)<0)throw new Error('Você não tem autorização para esta ação.');
  return user;
}
function tzcM08_audit_(module,id,action,summary) {
  var user=Session.getActiveUser().getEmail()||'sessão autenticada',now=new Date();
  tzcM08_append_(TZC_M08.AUDITORIA,{ID_Auditoria:Utilities.getUuid(),Modulo:module,ID_Registro:String(id),
    Acao:action,Usuario_Email:user,Data:tzcM08_date_(now),Hora:tzcM08_time_(now),Resumo:summary});
}
function tzcM08_read_(name) {
  var sh=tzcM08_sheet_(name);if(sh.getLastRow()<2)return [];
  var v=sh.getDataRange().getValues(),h=v.shift().map(String);
  return v.map(function(r,i){var o={_row:i+2};h.forEach(function(k,j){if(k)o[k]=r[j];});return o;});
}
function tzcM08_sheet_(name) {
  var ss=SpreadsheetApp.openById(TZC_M08.SPREADSHEET_ID),sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  var headers=TZC_M08_HEADERS[name]||[];
  if(!sh.getLastRow()&&headers.length)sh.getRange(1,1,1,headers.length).setValues([headers]);
  return sh;
}
function tzcM08_append_(name,values) {
  var sh=tzcM08_sheet_(name),headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0],row=headers.map(function(h){return Object.prototype.hasOwnProperty.call(values,h)?values[h]:'';});
  sh.appendRow(row);
}
function tzcM08_findRow_(sh,column,id) {
  if(sh.getLastRow()<2)return 0;var h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0],i=h.indexOf(column);
  if(i<0)throw new Error('Coluna necessária não encontrada: '+column);
  var cell=sh.getRange(2,i+1,sh.getLastRow()-1,1).createTextFinder(String(id)).matchEntireCell(true).findNext();
  return cell?cell.getRow():0;
}
function tzcM08_set_(sh,row,values) {
  var h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0],r=sh.getRange(row,1,1,h.length).getValues()[0];
  Object.keys(values).forEach(function(k){var i=h.indexOf(k);if(i<0)throw new Error('Coluna necessária não encontrada: '+k);r[i]=values[k];});
  sh.getRange(row,1,1,h.length).setValues([r]);
}
function tzcM08_text_(v,max,required) {
  var s=String(v||'').trim().replace(/[\u0000-\u001f]/g,' ');
  if(required&&!s)throw new Error('Preencha todos os campos obrigatórios.');
  if(s.length>max)throw new Error('O texto ultrapassa o limite permitido.');
  return /^[=+@-]/.test(s)?"'"+s:s;
}
function tzcM08_yes_(v) { return v===true||/^(true|sim|1|yes)$/i.test(String(v||'').trim()); }
function tzcM08_norm_(v) { return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' '); }
function tzcM08_date_(d) { return Utilities.formatDate(d,Session.getScriptTimeZone()||'America/Sao_Paulo','yyyy-MM-dd'); }
function tzcM08_time_(d) { return Utilities.formatDate(d,Session.getScriptTimeZone()||'America/Sao_Paulo','HH:mm'); }
