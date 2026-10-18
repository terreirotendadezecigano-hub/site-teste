/* TZC M08 UI — menus and forms for prayer requests, inventory and audit.
 * Uses the existing authenticated RPC bridge. Backend routes must be enabled before use.
 */
(function(){
  'use strict';
  var $=function(id){return document.getElementById(id)};
  var text=function(tag,value,cls){var n=document.createElement(tag);n.textContent=value;if(cls)n.className=cls;return n};
  var role=function(){return String(window.authUser&&window.authUser.perfil||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()};
  var hasSession=function(){return !!(window.authToken&&window.authUser)};
  var norm=function(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()};
  var canPrayer=function(){return ['pai de santo','mae de santo'].indexOf(role())>=0};
  var canManage=function(){return ['dirigente','administrador'].indexOf(role())>=0};
  var styles=`
  .tzc-m08{max-width:1040px;margin:0 auto;padding:8px 12px 34px;color:var(--text)}
  .tzc-m08-head{text-align:center;margin:0 auto 18px;max-width:780px}
  .tzc-m08-head h1{margin:8px 0;color:var(--primary);font:700 clamp(1.7rem,4vw,2.4rem) var(--fonte-titulo,Georgia,serif)}
  .tzc-m08-head p{margin:0;color:var(--muted)}
  .tzc-m08-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;margin:12px 0;box-shadow:var(--shadow)}
  .tzc-m08-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .tzc-m08-field{display:grid;gap:5px;min-width:0}
  .tzc-m08-field.full{grid-column:1/-1}
  .tzc-m08-field label{font-weight:700;font-size:14px}
  .tzc-m08-field :is(input,select,textarea){width:100%;min-height:42px;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);font:inherit}
  .tzc-m08-field textarea{min-height:100px;resize:vertical}
  .tzc-m08-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap}
  .tzc-m08-actions button{min-height:42px;padding:9px 15px;border:1px solid var(--primary);border-radius:10px;background:var(--primary);color:#fff;font:700 14px var(--fonte-interface,"Segoe UI",Arial,sans-serif)}
  .tzc-m08-actions button.secondary{background:transparent;color:var(--primary)}
  .tzc-m08-actions button:disabled{opacity:.65;cursor:wait}
  .tzc-m08-status{min-height:1.4em;margin:10px 0 0;color:var(--muted);font-size:14px}
  .tzc-m08-table-wrap{overflow:auto}
  .tzc-m08-table{width:100%;border-collapse:collapse}
  .tzc-m08-table th{padding:9px;background:var(--brand-wine,#641d29);color:#fff;text-align:center}
  .tzc-m08-table td{padding:9px;border-bottom:1px solid var(--line);vertical-align:top}
  .tzc-m08-low{font-weight:700;color:#9b4b14}
  .tzc-m08-private{padding:10px 12px;border-radius:9px;background:var(--gold-soft);color:var(--text)}
  @media(max-width:640px){.tzc-m08{padding:6px 4px 24px}.tzc-m08-card{padding:12px}.tzc-m08-form{grid-template-columns:1fr}.tzc-m08-field.full,.tzc-m08-actions{grid-column:1}.tzc-m08-actions>*{flex:1 1 100%}.tzc-m08-table th,.tzc-m08-table td{padding:7px;font-size:13px}}
  `;
  function installStyle(){if($('tzc-m08-css'))return;var s=document.createElement('style');s.id='tzc-m08-css';s.textContent=styles;document.head.appendChild(s)}
  function status(area,msg){var x=area&&area.querySelector('.tzc-m08-status');if(x)x.textContent=msg||''}
  function page(id,title,subtitle){
    installStyle();var a=$('dynamicPage');if(!a)return null;
    if($('homeView'))$('homeView').hidden=true;if($('settingsView'))$('settingsView').hidden=true;a.hidden=false;a.replaceChildren();
    window.paginaAtual=id;if(typeof window.atualizarMenuAtivo==='function')window.atualizarMenuAtivo(id);
    window.scrollTo({top:0,behavior:'smooth'});
    var root=document.createElement('div');root.className='tzc-m08';
    var h=document.createElement('header');h.className='tzc-m08-head';h.append(text('h1',title),text('p',subtitle));root.appendChild(h);a.appendChild(root);return root;
  }
  function field(label,type,name,required,full){
    var wrap=document.createElement('div');wrap.className='tzc-m08-field'+(full?' full':'');
    var l=text('label',label);l.htmlFor='m08-'+name;var input=type==='textarea'?document.createElement('textarea'):document.createElement('input');
    input.id='m08-'+name;input.name=name;if(type!=='textarea')input.type=type;if(required)input.required=true;
    wrap.append(l,input);return {wrap:wrap,input:input};
  }
  function rpc(action,args,done){if(typeof window.authRpc!=='function'){done({ok:false,mensagem:'A conexão de teste não está disponível.'});return}window.authRpc(action,args,done)}
  function openPrayer(){
    var root=page('__m08_oracao','Pedido de Oração','Envie seu pedido com carinho. A consulta é restrita à direção espiritual autorizada.');
    if(!root)return;
    var notice=text('p','Os pedidos são consultados somente por Pai de Santo e Mãe de Santo autorizados.','tzc-m08-private');
    var card=document.createElement('section');card.className='tzc-m08-card';var form=document.createElement('form');form.className='tzc-m08-form';
    var reason=field('Motivo da oração','textarea','motivo',true,true),name=field('Nome completo','text','nome',true,false),birth=field('Data de nascimento','date','dataNascimento',true,false);
    form.append(reason.wrap,name.wrap,birth.wrap);
    var actions=document.createElement('div');actions.className='tzc-m08-actions';var submit=text('button','Enviar pedido');submit.type='submit';actions.appendChild(submit);form.appendChild(actions);
    var msg=text('p','','tzc-m08-status');msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');form.appendChild(msg);
    form.addEventListener('submit',function(ev){ev.preventDefault();if(submit.disabled)return;submit.disabled=true;submit.textContent='Enviando…';msg.textContent='';rpc('m08CriarPedidoOracao',[JSON.stringify({motivo:reason.input.value,nome:name.input.value,dataNascimento:birth.input.value})],function(r){submit.disabled=false;submit.textContent='Enviar pedido';if(r&&r.ok){form.reset();msg.textContent=r.mensagem||'Pedido recebido.'}else msg.textContent=r&&r.mensagem||'Não foi possível enviar. Tente novamente.'})});
    card.appendChild(form);root.append(notice,card);
  }
  function openPrayerInbox(){
    if(!hasSession()){if(typeof window.memberOpen==='function')window.memberOpen();return}
    if(!canPrayer()){if(typeof window.aviso==='function')window.aviso('A consulta é restrita a Pai de Santo e Mãe de Santo.');return}
    var root=page('__m08_oracoes_recebidas','Pedidos de Oração','Lista reservada à direção espiritual autorizada.');
    var card=document.createElement('section');card.className='tzc-m08-card';var msg=text('p','Carregando pedidos…','tzc-m08-status');msg.setAttribute('role','status');card.appendChild(msg);root.appendChild(card);
    rpc('m08ListarPedidosOracao',[window.authToken],function(r){card.replaceChildren();if(!r||!r.ok){card.append(text('p',r&&r.mensagem||'Não foi possível carregar os pedidos.','tzc-m08-status'));return}
      if(!r.pedidos||!r.pedidos.length){card.append(text('p','Nenhum pedido recebido.','tzc-m08-status'));return}
      var wrap=document.createElement('div');wrap.className='tzc-m08-table-wrap';var table=document.createElement('table');table.className='tzc-m08-table';var thead=document.createElement('thead'),tr=document.createElement('tr');
      ['Nome','Nascimento','Motivo da oração','Recebido','Status'].forEach(function(x){tr.appendChild(text('th',x))});thead.appendChild(tr);table.appendChild(thead);var body=document.createElement('tbody');
      r.pedidos.forEach(function(x){var row=document.createElement('tr');[x.nome,x.dataNascimento,x.motivo,(x.data||'')+' '+(x.hora||'')].forEach(function(v){row.appendChild(text('td',v||'—'))});
        var cell=document.createElement('td'),sel=document.createElement('select');['Recebido','Em oração','Concluído'].forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o)});sel.value=x.status||'Recebido';sel.addEventListener('change',function(){sel.disabled=true;rpc('m08AtualizarPedidoOracao',[window.authToken,x.id,sel.value],function(z){sel.disabled=false;if(!z||!z.ok){if(typeof window.aviso==='function')window.aviso(z&&z.mensagem||'Não foi possível atualizar o pedido.')} })});cell.appendChild(sel);row.appendChild(cell);body.appendChild(row)});
      table.appendChild(body);wrap.appendChild(table);card.appendChild(wrap);
    });
  }
  function openStock(){
    if(!hasSession()){if(typeof window.memberOpen==='function')window.memberOpen();return}
    if(!canManage()){if(typeof window.aviso==='function')window.aviso('A gestão do estoque é restrita à direção e administração.');return}
    var root=page('__m08_estoque','Estoque e Doações','Acompanhe insumos, mínimos e doações recebidas.');
    var card=document.createElement('section');card.className='tzc-m08-card';var form=document.createElement('form');form.className='tzc-m08-form';
    var name=field('Nome do insumo','text','item',true,false),category=field('Categoria','text','categoria',false,false),unit=field('Unidade','text','unidade',true,false),quantity=field('Quantidade atual','number','quantidade',true,false),minimum=field('Quantidade mínima','number','minimo',true,false),note=field('Observação','textarea','observacao',false,true);
    quantity.input.min='0';quantity.input.step='any';minimum.input.min='0';minimum.input.step='any';
    form.append(name.wrap,category.wrap,unit.wrap,quantity.wrap,minimum.wrap,note.wrap);
    var actions=document.createElement('div');actions.className='tzc-m08-actions';var save=text('button','Salvar item');save.type='submit';actions.appendChild(save);form.appendChild(actions);
    var msg=text('p','Preencha os campos para cadastrar um insumo.','tzc-m08-status');form.appendChild(msg);
    form.addEventListener('submit',function(ev){ev.preventDefault();if(save.disabled)return;save.disabled=true;save.textContent='Salvando…';rpc('m08SalvarEstoque',[window.authToken,JSON.stringify({nome:name.input.value,categoria:category.input.value,unidade:unit.input.value,quantidade:quantity.input.value,minimo:minimum.input.value,observacao:note.input.value})],function(r){save.disabled=false;save.textContent='Salvar item';msg.textContent=r&&r.mensagem||'Não foi possível salvar.';if(r&&r.ok){form.reset();loadStock()}})});
    root.appendChild(card);card.appendChild(form);
    var donationCard=document.createElement('section');donationCard.className='tzc-m08-card';var donationForm=document.createElement('form');donationForm.className='tzc-m08-form';
    var dName=field('Item recebido','text','doacaoItem',true,false),dQty=field('Quantidade recebida','number','doacaoQuantidade',true,false),dUnit=field('Unidade','text','doacaoUnidade',true,false),donor=field('Doador (opcional)','text','doador',false,false),dNote=field('Observação','textarea','doacaoObservacao',false,true);
    dQty.input.min='0.01';dQty.input.step='any';donationForm.append(dName.wrap,dQty.wrap,dUnit.wrap,donor.wrap,dNote.wrap);
    var dActions=document.createElement('div');dActions.className='tzc-m08-actions';var dSave=text('button','Registrar doação');dSave.type='submit';dActions.appendChild(dSave);donationForm.appendChild(dActions);
    var dStatus=text('p','Doações ficam registradas para conferência.','tzc-m08-status');dStatus.setAttribute('role','status');donationForm.appendChild(dStatus);
    donationForm.addEventListener('submit',function(ev){ev.preventDefault();if(dSave.disabled)return;dSave.disabled=true;dSave.textContent='Registrando…';rpc('m08RegistrarDoacao',[window.authToken,JSON.stringify({nome:dName.input.value,quantidade:dQty.input.value,unidade:dUnit.input.value,doador:donor.input.value,observacao:dNote.input.value})],function(r){dSave.disabled=false;dSave.textContent='Registrar doação';dStatus.textContent=r&&r.mensagem||'Não foi possível registrar a doação.';if(r&&r.ok){donationForm.reset();loadStock()}})});
    donationCard.appendChild(donationForm);root.appendChild(donationCard);
    var list=text('p','Carregando estoque…','tzc-m08-status');var listCard=document.createElement('section');listCard.className='tzc-m08-card';listCard.appendChild(list);root.appendChild(listCard);
    function loadStock(){rpc('m08ListarEstoque',[window.authToken,'false'],function(r){listCard.replaceChildren();if(!r||!r.ok){listCard.append(text('p',r&&r.mensagem||'Não foi possível carregar o estoque.','tzc-m08-status'));return}if(!r.itens||!r.itens.length){listCard.append(text('p','Nenhum insumo cadastrado.','tzc-m08-status'));return}
      var wrap=document.createElement('div');wrap.className='tzc-m08-table-wrap';var table=document.createElement('table');table.className='tzc-m08-table';var hd=document.createElement('thead'),hr=document.createElement('tr');['Insumo','Categoria','Quantidade','Mínimo','Ação'].forEach(function(x){hr.appendChild(text('th',x))});hd.appendChild(hr);table.appendChild(hd);var body=document.createElement('tbody');
      r.itens.forEach(function(item){var tr=document.createElement('tr');[item.nome,item.categoria,item.quantidade+' '+item.unidade,item.minimo+' '+item.unidade].forEach(function(v){tr.appendChild(text('td',v||'—'))});if(item.quantidade<=item.minimo)tr.className='tzc-m08-low';var td=document.createElement('td'),del=text('button','Mover para lixeira');del.type='button';del.addEventListener('click',function(){if(!window.confirm('Mover este insumo para a lixeira?'))return;del.disabled=true;rpc('m08ExcluirEstoque',[window.authToken,item.id],function(z){if(!z||!z.ok){del.disabled=false;if(typeof window.aviso==='function')window.aviso(z&&z.mensagem||'Não foi possível excluir.');return}loadStock()})});td.appendChild(del);tr.appendChild(td);body.appendChild(tr)});
      table.appendChild(body);wrap.appendChild(table);listCard.appendChild(wrap)
    })}
    loadStock();
  }
  function addMenuButton(nav,id,label,action){
    if($(id))return;var b=document.createElement('button');b.type='button';b.id=id;b.setAttribute('data-page-id',id);b.appendChild(text('span','✦','ico'));b.appendChild(document.createTextNode(label));b.addEventListener('click',function(){action();if(typeof window.closeMenu==='function')window.closeMenu()});nav.appendChild(b);
  }
  function syncMenu(){
    var nav=$('nav');if(!nav)return;
    addMenuButton(nav,'tzcM08PrayerButton','Pedido de Oração',openPrayer);
    if(hasSession()&&canPrayer())addMenuButton(nav,'tzcM08InboxButton','Pedidos recebidos',openPrayerInbox);
    else if($('tzcM08InboxButton'))$('tzcM08InboxButton').remove();
    if(hasSession()&&canManage())addMenuButton(nav,'tzcM08StockButton','Estoque e Doações',openStock);
    else if($('tzcM08StockButton'))$('tzcM08StockButton').remove();
  }
  window.TZCM08UI={abrirPedido:openPrayer,abrirRecebidos:openPrayerInbox,abrirEstoque:openStock};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncMenu);else syncMenu();
  if(window.MutationObserver&&$('nav'))new MutationObserver(syncMenu).observe($('nav'),{childList:true});
  window.addEventListener('tzc-auth-change',syncMenu);
})();
