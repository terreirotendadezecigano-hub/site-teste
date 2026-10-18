/** TZC M04 · Agenda, arquivo de eventos, arte, permissões e aniversários. */
function TZC_M04_listarArquivoEventos(token) {
  const raw = String(token || '').trim();
  const caller = raw ? tzcM04_usuarioSessaoV01_(raw) : null;
  if (raw && !caller) return {ok:false,mensagem:'Entre novamente para consultar a agenda.',eventos:[]};
  try {
    const ss = SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID);
    const sh = ss.getSheetByName(TZC_M04_CFG_V01.ABA_EVENTOS);
    if (!sh || sh.getLastRow() < 2) {
      const aniversarios=caller?TZC_M04_listarAniversariosAgenda_(caller):[];
      return {ok:true,eventos:aniversarios};
    }
    const leader = !!(caller && /^(dirigente|administrador)$/i.test(String(caller.perfil||'')));
    const eventos = tzcM04_lerObjetosV01_(sh)
      .map(e => ({origem:e,dataISO:tzcM04_dataISO_V02_(e.Data_Inicio)}))
      .filter(x => {
        const e=x.origem;
        if(!x.dataISO||!e.ID_Evento||!e.Titulo||!tzcM04_simV01_(e.Status))return false;
        if(/atendimento/i.test(String(e.Tipo||''))) {
          const ids=String(e.Responsaveis_Atendimento||'').split(',').map(s=>s.trim());
          return !!(leader||caller&&ids.indexOf(String(caller.id))>=0);
        }
        return !!(caller||tzcM04_simV01_(e.Acesso_Publico));
      })
      .sort((a,b)=>a.dataISO.localeCompare(b.dataISO))
      .map(x=>({id:String(x.origem.ID_Evento),titulo:String(x.origem.Titulo),tipo:String(x.origem.Tipo||''),
        data:x.dataISO,local:String(x.origem.Local||''),descricao:String(x.origem.Descricao||''),
        imagem:String(x.origem.Imagem_URL||''),responsaveis:leader?String(x.origem.Responsaveis_Atendimento||''):'',
        acesso:tzcM04_simV01_(x.origem.Acesso_Publico)?'Sim':'Não'}));
    if(caller)eventos.push.apply(eventos,TZC_M04_listarAniversariosAgenda_(caller));
    eventos.sort((a,b)=>String(a.data||'').localeCompare(String(b.data||'')));
    return {ok:true,eventos:eventos};
  } catch(e) {
    console.error('M04 listarArquivoEventos: '+e.message);
    return {ok:false,mensagem:'Não foi possível carregar a agenda agora.',eventos:[]};
  }
}

function TZC_M04_salvarEvento(token,json) {
  const user=tzcM04_usuarioSessaoV01_(token);
  if(!user||! /^(dirigente|administrador)$/i.test(String(user.perfil||'')))return {ok:false,mensagem:'Sem autorização para cadastrar eventos.'};
  const lock=LockService.getScriptLock();
  try {
    const d=JSON.parse(String(json||'{}')),title=String(d.titulo||'').trim(),date=String(d.data||''),type=String(d.tipo||'').trim();
    if(!title||title.length>180||!type||type.length>100||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)||isNaN(new Date(date).getTime()))throw Error('Informe nome, tipo, data e horário válidos.');
    lock.waitLock(10000);
    const ss=SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID),sh=ss.getSheetByName(TZC_M04_CFG_V01.ABA_EVENTOS);
    if(!sh)throw Error('Aba Eventos não encontrada.');
    tzcM04_garantirColunasV01_(sh,['ID_Evento','Titulo','Data_Inicio','Tipo','Local','Descricao','Acesso_Publico','Status','Criado_Em','Atualizado_Em','Token_Checkin_QR','Imagem_URL','Responsaveis_Atendimento']);
    const map=tzcM04_indicesV01_(sh),id=String(d.id||''),rows=tzcM04_lerObjetosV01_(sh),old=id?rows.find(r=>String(r.ID_Evento)===id):null;
    if(id&&!old)throw Error('Evento não encontrado.');
    const found=id?sh.getRange(2,map.ID_Evento+1,sh.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).matchCase(true).findNext():null;
    if(id&&!found)throw Error('Evento não encontrado.');
    const row=found?found.getRow():sh.getLastRow()+1,eventId=id||TZC_ID_proximoSequencial('Eventos','ID_Evento');
    const clean=(v,max)=>{const s=String(v||'').trim();if(s.length>max)throw Error('Texto muito longo.');return /^[=+@-]/.test(s)?"'"+s:s};
    const isAppointment=/atendimento/i.test(type);let assigned=Array.isArray(d.responsaveis)?Array.from(new Set(d.responsaveis.map(String).filter(Boolean))):[];
    if(isAppointment&&assigned.length){
      const members=ss.getSheetByName(TZC_M04_CFG_V01.ABA_USUARIOS),valid=Object.create(null);
      if(members&&members.getLastRow()>1){const mm=tzcM04_indicesV01_(members),rs=members.getRange(2,1,members.getLastRow()-1,members.getLastColumn()).getDisplayValues();rs.forEach(r=>{if(String(r[mm.Status]||'').toLowerCase()==='ativo'&&String(r[mm.Perfil]||'').toLowerCase()==='membro')valid[String(r[mm.ID_Usuario])]=true})}
      if(assigned.some(x=>!valid[x]))throw Error('Revise a lista de responsáveis selecionados.');
    } else assigned=[];
    if(!isAppointment)assigned=[];
    const image=String(d.imagem||old&&old.Imagem_URL||'').trim();
    if(image&&!/^https:\/\/drive\.google\.com\/(?:uc\?|file\/d\/)/i.test(image))throw Error('A imagem do evento não é válida.');
    const qr=String(old&&old.Token_Checkin_QR||'').trim()||tzcM04_qrNovoTokenV01_();
    const values={ID_Evento:eventId,Titulo:clean(title,180),Data_Inicio:date.replace('T',' '),Tipo:clean(type,100),Local:clean(d.local,300),Descricao:clean(d.descricao,4000),Acesso_Publico:isAppointment?'Não':(d.acesso==='Não'?'Não':'Sim'),Responsaveis_Atendimento:assigned.join(','),Imagem_URL:image,Status:'Ativo',Atualizado_Em:new Date(),Token_Checkin_QR:qr};
    if(!old)values.Criado_Em=new Date();
    tzcM04_gravarObjetoV01_(sh,map,row,values);
    ['TZC_M04_AGENDA_PUBLICA_V02','TZC_M04_AGENDA_PUBLICA_V03'].forEach(k=>CacheService.getScriptCache().remove(k));
    SpreadsheetApp.flush();return {ok:true,id:eventId,mensagem:'Evento salvo.'};
  } catch(e) {return {ok:false,mensagem:String(e.message||e)}}
  finally {try{lock.releaseLock()}catch(ignore){}}
}

/** Recebe arte de evento de dirigente e grava no Drive da casa. */
function TZC_M04_eventoUploadImagem(token,json) {
  const user=tzcM04_usuarioSessaoV01_(token);
  if(!user||! /^(dirigente|administrador)$/i.test(String(user.perfil||'')))return {ok:false,mensagem:'Sem autorização para enviar imagens de eventos.'};
  try {
    const p=JSON.parse(String(json||'{}')),mime=String(p.mime||'').toLowerCase(),base=String(p.base64||'');
    if(!/^image\/(jpeg|png|webp)$/.test(mime)||!base||base.length>7000000)throw Error('Escolha uma imagem JPG, PNG ou WebP de até 5 MB.');
    const bytes=Utilities.base64Decode(base);if(!bytes.length||bytes.length>5*1024*1024)throw Error('A imagem deve ter até 5 MB.');
    const name=String(p.name||'arte-evento').replace(/[\\/\x00-\x1f]/g,'_').slice(0,120);
    const file=DriveApp.createFile(Utilities.newBlob(bytes,mime,name));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
    return {ok:true,url:'https://drive.google.com/uc?export=view&id='+file.getId(),mensagem:'Imagem do evento enviada.'};
  } catch(e) {return {ok:false,mensagem:'Não foi possível enviar a imagem: '+String(e.message||e)}}
}

/** Aniversários de membros visíveis apenas após autenticação; não infere aniversário de visitantes. */
function TZC_M04_listarAniversariosAgenda_(caller) {
  const out=[],ss=SpreadsheetApp.openById(TZC_M04_CFG_V01.PLANILHA_ID),sh=ss.getSheetByName('Cadastro_Filhos');
  if(!sh||sh.getLastRow()<2)return out;
  const year=Number(Utilities.formatDate(new Date(),TZC_M04_CFG_V01.FUSO,'yyyy'));
  tzcM04_lerObjetosV01_(sh).forEach(r=>{
    const status=String(r.Status_Ativo||r.Status||'Ativo').toLowerCase();if(status&& !/^(ativo|sim|true|1)$/.test(status))return;
    let month='',day='',raw=r.Data_Nascimento;
    if(raw instanceof Date&&!isNaN(raw.getTime())){month=Utilities.formatDate(raw,TZC_M04_CFG_V01.FUSO,'MM');day=Utilities.formatDate(raw,TZC_M04_CFG_V01.FUSO,'dd')}
    else {const str=String(raw||''),iso=str.match(/^\d{4}-(\d{2})-(\d{2})/),br=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);if(iso){month=iso[1];day=iso[2]}else if(br){month=String(br[2]).padStart(2,'0');day=String(br[1]).padStart(2,'0')}}
    const name=String(r.Nome_Completo||'').trim();if(!month||!day||!name)return;
    let phone=String(r.Telefone||'').replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;
    [year,year+1].forEach(y=>{const date=String(y)+'-'+month+'-'+day,check=new Date(Date.UTC(y,Number(month)-1,Number(day)));if(check.getUTCFullYear()===y&&check.getUTCMonth()+1===Number(month)&&check.getUTCDate()===Number(day))out.push({id:'aniversario-'+String(r.ID_Filho||name)+'-'+y,titulo:'Aniversário · '+name,tipo:'Aniversário',data:date+'T09:00:00',local:'',descricao:'',isBirthday:true,whatsapp:phone})});
  });
  return out;
}

function TZC_M04_excluirEvento(token,id) {
  const actor=TZC_M02_validarSessao(String(token||''));
  if(!actor||!actor.ok)return {ok:false,mensagem:'Entre com sua conta para continuar.'};
  const result=TZC_LIXEIRA_moverParaLixeira(token,TZC_M04_CFG_V01.ABA_EVENTOS,String(id||''),'ID_Evento','Titulo');
  if(result&&result.ok)['TZC_M04_AGENDA_PUBLICA_V02','TZC_M04_AGENDA_PUBLICA_V03'].forEach(k=>CacheService.getScriptCache().remove(k));
  return result;
}


/** Salva as credenciais Cloudflare somente nas propriedades privadas do Apps Script. */
function TZC_M04_eventoIAConfigurar(token, json) {
  var user=tzcM04_usuarioSessaoV01_(token);
  if(!user||! /^(dirigente|administrador)$/i.test(String(user.perfil||'')))return {ok:false,mensagem:'Somente a direção pode configurar a criação de artes.'};
  try {
    var cfg=JSON.parse(String(json||'{}'));
    var account=String(cfg.accountId||'').trim(),secret=String(cfg.apiToken||'').trim();
    if(!/^[a-f0-9]{32}$/i.test(account))throw Error('Confira o ID da conta Cloudflare (32 caracteres).');
    if(secret.length<20||secret.length>300)throw Error('Confira o token de API da Cloudflare.');
    var props=PropertiesService.getScriptProperties();
    props.setProperties({TZC_CLOUDFLARE_ACCOUNT_ID:account,TZC_CLOUDFLARE_AI_TOKEN:secret},false);
    return {ok:true,configurada:true,mensagem:'Integração gratuita configurada.'};
  } catch(e) {return {ok:false,mensagem:String(e.message||'Não foi possível salvar a configuração.')}}
}

/** Informa apenas se há credenciais salvas; nunca devolve os segredos à página. */
function TZC_M04_eventoIAStatus(token) {
  var user=tzcM04_usuarioSessaoV01_(token);
  if(!user||! /^(dirigente|administrador)$/i.test(String(user.perfil||'')))return {ok:false,mensagem:'Acesso restrito à direção.'};
  var props=PropertiesService.getScriptProperties();
  return {ok:true,configurada:!!(props.getProperty('TZC_CLOUDFLARE_ACCOUNT_ID')&&props.getProperty('TZC_CLOUDFLARE_AI_TOKEN'))};
}

/** Gera três propostas FLUX; a composição final e a logo são aplicadas no navegador em 4:5. */
function TZC_M04_eventoIAGerar(token,json) {
  var user=tzcM04_usuarioSessaoV01_(token);
  if(!user||! /^(dirigente|administrador)$/i.test(String(user.perfil||'')))return {ok:false,mensagem:'Somente a direção pode criar artes.'};
  var props=PropertiesService.getScriptProperties(),account=props.getProperty('TZC_CLOUDFLARE_ACCOUNT_ID'),secret=props.getProperty('TZC_CLOUDFLARE_AI_TOKEN');
  if(!account||!secret)return {ok:false,configurar:true,mensagem:'Configure a integração gratuita da Cloudflare para gerar as artes.'};
  try {
    var d=JSON.parse(String(json||'{}')),title=String(d.titulo||'').trim(),type=String(d.tipo||'').trim(),date=String(d.data||'').trim();
    if(!title||!type||!date)throw Error('Preencha título, tipo e data antes de criar as artes.');
    if(/atendimento/i.test(type))throw Error('A criação automática de arte é restrita a eventos divulgáveis.');
    if(title.length>180||String(d.descricao||'').length>700||String(d.local||'').length>200)throw Error('Revise o tamanho dos dados do evento.');
    var logoDataUrl='';
    if(d.incluirLogo){
      var logoUrl=String(d.logoUrl||'');
      if(!/^https:\/\/(?:lh3\.googleusercontent\.com|drive\.google\.com)\//i.test(logoUrl))throw Error('Não consegui acessar a logo cadastrada da casa.');
      var logoResponse=UrlFetchApp.fetch(logoUrl,{muteHttpExceptions:true,followRedirects:true}),logoBlob=logoResponse.getBlob(),logoBytes=logoBlob.getBytes(),logoMime=String(logoBlob.getContentType()||'image/png').toLowerCase();
      if(logoResponse.getResponseCode()<200||logoResponse.getResponseCode()>=300||logoBytes.length>3*1024*1024||!/^image\/(?:png|jpeg|webp)$/.test(logoMime))throw Error('Não foi possível carregar a logo da casa.');
      logoDataUrl='data:'+logoMime+';base64,'+Utilities.base64Encode(logoBytes);
    }
    var styles=[
      {nome:'Clássica',guia:'elegant spiritual gathering poster background, refined burgundy and antique gold, soft candlelight, subtle floral ornament, balanced clean composition'},
      {nome:'Natureza',guia:'Brazilian nature inspired spiritual gathering poster background, botanical leaves and flowers, warm cream light, burgundy and gold accents, serene balanced composition'},
      {nome:'Festiva',guia:'joyful elegant community celebration poster background, tasteful festive light, subtle gold accents, burgundy and cream palette, uplifting balanced composition'}
    ];
    var images=[];
    styles.forEach(function(style,index){
      var prompt='Create a polished vertical mobile event-poster background for a Brazilian Umbanda terreiro, visual concept: '+style.guia+'. Subject: '+type+'. Event name: '+title+'. Description for visual context: '+String(d.descricao||'').slice(0,350)+'. Use no readable letters, no words, no dates, no logos, no watermark, no QR code. Preserve generous uncluttered safe areas near the top and bottom where the website will add the event information. Portrait composition suitable for cropping to a 4:5 poster.';
      var endpoint='https://api.cloudflare.com/client/v4/accounts/'+account+'/ai/run/@cf/black-forest-labs/flux-1-schnell';
      var response=UrlFetchApp.fetch(endpoint,{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+secret},muteHttpExceptions:true,payload:JSON.stringify({prompt:prompt,steps:4,seed:Math.floor(Math.random()*2147483000)+index})});
      var code=response.getResponseCode(),contentType=String(response.getHeaders()['Content-Type']||response.getHeaders()['content-type']||'').toLowerCase(),bytes=response.getContent();
      if(code<200||code>=300){var errText=response.getContentText()||'',err='';try{var parsedErr=JSON.parse(errText);err=String(parsedErr.errors&&parsedErr.errors[0]&&parsedErr.errors[0].message||parsedErr.message||'')}catch(ignore){};if(code===401||code===403)throw Error('A Cloudflare recusou o token. Confira as permissões de Workers AI.');if(code===429)throw Error('O limite gratuito diário da Cloudflare foi atingido. Tente novamente amanhã.');throw Error('A Cloudflare não conseguiu gerar a opção '+style.nome+(err?' · '+err:'')+' (HTTP '+code+').');}
      var b64='',mime='image/jpeg';
      if(contentType.indexOf('image/')===0){mime=contentType.split(';')[0];b64=Utilities.base64Encode(bytes)}
      else {var body=JSON.parse(response.getContentText()||'{}'),image=body.image||body.result&&body.result.image||body.data&&body.data.image;if(typeof image!=='string'||!image)throw Error('A Cloudflare não devolveu a imagem '+style.nome+'.');b64=image.replace(/^data:image\/[a-z0-9.+-]+;base64,/i,'');mime=String(body.mimeType||body.result&&body.result.mimeType||'image/jpeg')}
      if(!b64||b64.length>6500000)throw Error('A imagem '+style.nome+' ficou grande demais para ser transferida.');
      images.push({nome:style.nome,mimeType:mime,base64:b64});
    });
    return {ok:true,imagens:images,logoDataUrl:logoDataUrl,mensagem:'Três opções foram criadas. Escolha uma para aplicar os dados do evento.'};
  } catch(e) {return {ok:false,mensagem:String(e.message||'Não foi possível criar as artes agora.')}}
}
