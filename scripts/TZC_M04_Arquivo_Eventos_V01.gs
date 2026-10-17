/** Leitura da agenda completa: eventos públicos para visitantes e todos os ativos para membros autenticados. */
function TZC_M04_listarArquivoEventos(token) {
  const raw = String(token || '').trim();
  const caller = raw ? tzcM04_usuarioSessaoV01_(raw) : null;
  if (raw && !caller) return {ok:false,mensagem:'Entre novamente para consultar os eventos.',eventos:[]};
  try {
    const ss = SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID);
    const sh = ss.getSheetByName(TZC_M04_CFG_V01.ABA_EVENTOS);
    if (!sh || sh.getLastRow() < 2) return {ok:true,eventos:[]};
    const eventos = tzcM04_lerObjetosV01_(sh)
      .map(e => ({origem:e,dataISO:tzcM04_dataISO_V02_(e.Data_Inicio)}))
      .filter(x => x.dataISO && x.origem.ID_Evento && x.origem.Titulo &&
        tzcM04_simV01_(x.origem.Status) &&
        (caller || tzcM04_simV01_(x.origem.Acesso_Publico)))
      .sort((a,b) => a.dataISO.localeCompare(b.dataISO))
      .map(x => ({id:String(x.origem.ID_Evento),titulo:String(x.origem.Titulo),
        tipo:String(x.origem.Tipo||''),data:x.dataISO,local:String(x.origem.Local||''),
        descricao:String(x.origem.Descricao||''),acesso:tzcM04_simV01_(x.origem.Acesso_Publico)?'Sim':'Não'}));
    return {ok:true,eventos:eventos};
  } catch(e) {
    console.error('M04 listarArquivoEventos: '+e.message);
    return {ok:false,mensagem:'Não foi possível carregar o histórico de eventos agora.',eventos:[]};
  }
}
function TZC_M04_salvarEvento(token,json){
 var session=tzcM02_sessaoV03_(token),u=session?tzcM02_buscarUsuarioV03_(session.email):null;if(!u||u.status!=='ativo'||! /^(dirigente|administrador)$/i.test(String(u.perfil||'')))return {ok:false,mensagem:'Sem autorização para cadastrar eventos.'};var lock=LockService.getScriptLock();
 try{var d=JSON.parse(json||'{}'),title=String(d.titulo||'').trim(),date=String(d.data||'');if(!title||title.length>180||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)||isNaN(new Date(date).getTime()))throw Error('Informe título, data e hora válidos.');lock.waitLock(10000);var ss=SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID),sh=ss.getSheetByName(TZC_M04_CFG_V01.ABA_EVENTOS);if(!sh)throw Error('Aba Eventos não encontrada.');tzcM04_garantirColunasV01_(sh,['ID_Evento','Titulo','Data_Inicio','Tipo','Local','Descricao','Acesso_Publico','Status','Criado_Em','Atualizado_Em','Token_Checkin_QR']);var map=tzcM04_indicesV01_(sh),id=String(d.id||''),rows=tzcM04_lerObjetosV01_(sh),old=id?rows.find(function(r){return String(r.ID_Evento)===id}):null;if(id&&!old)throw Error('Evento não encontrado.');var row=id?sh.getRange(2,map.ID_Evento+1,sh.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).matchCase(true).findNext().getRow():sh.getLastRow()+1;id=id||TZC_ID_proximoSequencial('Eventos','ID_Evento');var clean=function(v,max){var s=String(v||'').trim();if(s.length>max)throw Error('Texto muito longo.');return /^[=+@-]/.test(s)?"'"+s:s};var qr=String(old&&old.Token_Checkin_QR||'').trim()||tzcM04_qrNovoTokenV01_();var data={ID_Evento:id,Titulo:clean(title,180),Data_Inicio:date.replace('T',' '),Tipo:clean(d.tipo,100),Local:clean(d.local,300),Descricao:clean(d.descricao,4000),Acesso_Publico:d.acesso==='Não'?'Não':'Sim',Status:'Ativo',Atualizado_Em:new Date(),Token_Checkin_QR:qr};if(!old)data.Criado_Em=new Date();tzcM04_gravarObjetoV01_(sh,map,row,data);CacheService.getScriptCache().remove('TZC_M04_AGENDA_PUBLICA_V03');SpreadsheetApp.flush();return {ok:true,id:id,mensagem:'Evento salvo.'}}catch(e){return {ok:false,mensagem:String(e.message||e)}}finally{try{lock.releaseLock()}catch(ignore){}}
}
function TZC_M04_excluirEvento(token,id){var actor=TZC_M02_validarSessao(String(token||''));if(!actor||!actor.ok)return {ok:false,mensagem:'Entre com sua conta para continuar.'};var result=TZC_LIXEIRA_moverParaLixeira(token,TZC_M04_CFG_V01.ABA_EVENTOS,String(id||''),'ID_Evento','Titulo');if(result&&result.ok)CacheService.getScriptCache().remove('TZC_M04_AGENDA_PUBLICA_V03');return result;}
