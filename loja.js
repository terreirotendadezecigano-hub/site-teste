/* TZC — Loja/Pedidos V01. UI isolada; depende da API estreita exposta pelo site. */
(function(){
  'use strict';
  var api, root, notice, current='catalogo', products=[], orders=[];
  var styles=`
  .loja-wrap{display:grid;gap:18px;max-width:1120px;margin-inline:auto}
  .loja-muted{color:var(--muted);font-size:14px;line-height:1.5}
  .loja-error{color:#a22;font-weight:700}.loja-success{color:#176c43;font-weight:700}
  .loja-status-line{min-height:1.4em;margin:0;text-align:center;font-size:14px}
  .loja-tabs{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin:0 auto 2px}
  .loja-tabs button{min-height:44px;padding:9px 18px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--text);font-weight:700;box-shadow:var(--shadow)}
  .loja-tabs button[aria-pressed=true]{background:var(--primary);border-color:var(--primary);color:#fff}
  html[data-theme="escuro"] .loja-tabs button[aria-pressed=true]{color:#24191a}
  .loja-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr auto;align-items:center;gap:18px;padding:24px 28px;border:1px solid var(--line);border-left:5px solid var(--gold);border-radius:18px;background:linear-gradient(115deg,var(--surface2),var(--surface));box-shadow:var(--shadow)}
  .loja-hero h2{margin:0 0 6px;color:var(--primary);font:700 clamp(22px,3vw,30px) Georgia,serif}
  .loja-hero p{margin:0;color:var(--muted);max-width:620px}
  .loja-hero-mark{display:grid;place-items:center;width:68px;height:68px;border-radius:50%;background:var(--gold-soft);color:var(--primary);font-size:32px}
  .loja-section{display:grid;gap:14px}
  .loja-section-heading h2{margin:0;color:var(--primary);font:700 24px Georgia,serif;text-align:center}
  .loja-section-heading p{margin:5px 0 0;text-align:center}
  .loja-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:18px}
  .loja-product-card{overflow:hidden;display:flex;flex-direction:column;min-width:0;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:var(--shadow);transition:transform .16s ease,box-shadow .16s ease}
  .loja-product-card:hover{transform:translateY(-2px);box-shadow:0 14px 32px #3c20141c}
  .loja-card-cover{height:170px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#641d29,#8b4c39 58%,#bd8b38);color:#fff}
  .loja-card-cover img{width:100%;height:100%;object-fit:cover}
  .loja-book-mark{display:grid;gap:4px;place-items:center;width:110px;height:130px;border:1px solid #fff8;border-radius:8px;background:#fff2;box-shadow:8px 9px 18px #2d101855;transform:rotate(-3deg);font-size:36px}
  .loja-book-mark span{font-size:10px;font-weight:800;letter-spacing:.13em}
  .loja-product-body{display:grid;align-content:start;gap:10px;padding:17px;flex:1}
  .loja-product-category{justify-self:start;padding:4px 10px;border-radius:999px;background:var(--gold-soft);color:var(--primary);font-size:12px;font-weight:800}
  .loja-product-body h3{margin:0;color:var(--text);font-size:19px;line-height:1.3}
  .loja-product-body p{margin:0;color:var(--muted);font-size:14px;line-height:1.5;white-space:pre-line}
  .loja-product-buy{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:5px}
  .loja-price{color:var(--primary);font-size:20px;font-weight:850;white-space:nowrap}
  .loja-empty{display:grid;justify-items:center;gap:7px;padding:28px 18px;border:1px dashed var(--line);border-radius:16px;background:var(--surface);text-align:center}
  .loja-empty strong{color:var(--primary);font:700 20px Georgia,serif}
  .loja-editor{display:grid;gap:16px;padding:20px;border:1px solid var(--line);border-top:4px solid var(--gold);border-radius:16px;background:var(--surface);box-shadow:var(--shadow)}
  .loja-editor-head h3{margin:0;color:var(--primary);font:700 21px Georgia,serif}
  .loja-editor-head p{margin:4px 0 0}
  .loja-form-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}
  .loja-field{grid-column:span 3;display:grid;align-content:start;gap:6px;min-width:0;color:var(--text);font-size:14px;font-weight:700}
  .loja-field.wide{grid-column:span 6}.loja-field.full{grid-column:1/-1}
  .loja-field input,.loja-field textarea{box-sizing:border-box;width:100%;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--bg);color:var(--text);font:inherit;font-weight:400}
  .loja-field textarea{min-height:74px;resize:vertical}
  .loja-field input[type=file]{padding:8px;background:var(--surface)}
  .loja-file-note{margin:0;color:var(--muted);font-size:12px;font-weight:400}
  .loja-editor-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .loja-editor-actions button{min-width:170px;min-height:46px}
  .loja-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:14px;background:var(--surface);box-shadow:var(--shadow)}
  .loja-table{width:100%;border-collapse:collapse;table-layout:auto}
  .loja-table th,.loja-table td{padding:12px 14px;text-align:left;border-bottom:1px solid var(--line);vertical-align:middle}
  .loja-table th{background:var(--surface2);color:var(--primary);font-size:13px}
  .loja-table tbody tr:nth-child(even){background:color-mix(in srgb,var(--surface2) 30%,var(--surface))}
  .loja-table tbody tr:last-child td{border-bottom:0}
  .loja-status{display:inline-flex;border-radius:30px;padding:4px 9px;background:var(--gold-soft);color:var(--primary);font-size:13px;font-weight:750;white-space:nowrap}
  .loja-load-error{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--line);border-left:4px solid #a22;border-radius:10px;background:var(--surface);color:var(--text)}
  .loja-load-error p{margin:0;font-size:14px}
  .loja-proof{margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--surface2)}
  .loja-proof iframe{width:100%;height:440px;border:0;background:white}.loja-proof img{max-width:100%;max-height:440px;display:block;margin:auto}
  @media(max-width:760px){.loja-hero{grid-template-columns:1fr;padding:20px}.loja-hero-mark{display:none}.loja-field,.loja-field.wide{grid-column:span 6}.loja-field.full{grid-column:1/-1}}
  @media(max-width:520px){.loja-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%}.loja-tabs button{padding:9px 10px}.loja-tabs button:last-child:nth-child(odd){grid-column:1/-1}.loja-hero{padding:17px}.loja-field,.loja-field.wide{grid-column:1/-1}.loja-editor{padding:15px}.loja-editor-actions{display:grid;grid-template-columns:1fr;width:100%}.loja-editor-actions button{width:100%}.loja-table{min-width:580px}}
  `;
  function el(tag, text, cls){var n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
  function btn(text,fn,cls){var b=el('button',text,cls||'secondary');b.type='button';b.addEventListener('click',fn);return b}
  function money(c){return (Number(c||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function say(text,kind){if(!notice)return;notice.textContent=text||'';notice.className=kind==='error'?'loja-error':kind==='success'?'loja-success':'loja-muted';}
  function loadError(message,retry){var box=el('div',null,'loja-load-error');box.setAttribute('role','alert');box.append(el('p',message||'Não foi possível carregar esta seção.'));box.append(btn('Tentar novamente',retry,'secondary'));return box}
  function section(title,description,parent){var s=el('section',null,'loja-section'),head=el('header',null,'loja-section-heading');head.append(el('h2',title));if(description)head.append(el('p',description,'loja-muted'));s.append(head);(parent||content()||root).append(s);return s}
  function table(headers){var wrap=el('div',null,'loja-table-wrap'),t=el('table',null,'loja-table'),thead=el('thead'),tr=el('tr');headers.forEach(function(x){tr.append(el('th',x))});thead.append(tr);t.append(thead,el('tbody'));wrap.append(t);return {wrap:wrap,body:t.tBodies[0]}}
  function invoke(route,args,done){var finished=false,timer=setTimeout(function(){if(finished)return;finished=true;var r={ok:false,mensagem:'A solicitação demorou mais que o esperado. Confira o resultado antes de tentar novamente.'};say(r.mensagem,'error');if(done)done(r)},60000);api.rpc(route,args,function(r){if(finished)return;finished=true;clearTimeout(timer);if(!r||!r.ok){say(r&&r.mensagem||'Não foi possível concluir a solicitação.','error');if(done)done(r||{ok:false});return}if(done)done(r)})}
  function init(){api=window.TZCLojaAPI;if(!api||!api.host){return}root=api.host();if(!root)return;root.replaceChildren();api.prepare('Loja da Casa','Livros e materiais digitais da Tenda.');root=api.host();root.className='dynamic-page loja-wrap';
    var style=document.getElementById('tzc-loja-style');if(!style){style=document.createElement('style');style.id='tzc-loja-style';style.textContent=styles;document.head.append(style)}
    notice=el('p','Carregando…','loja-status-line loja-muted');notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');root.append(notice);
    var tabs=el('div',null,'loja-tabs'),catalogTab=btn('Produtos',function(){current='catalogo';setTab();loadCatalog()}),ordersTab=btn('Meus pedidos',function(){if(!api.user()){api.login();return}current='pedidos';setTab();loadOrders()});tabs.append(catalogTab,ordersTab);
    var u=api.user(),managementTab=null;if(u&&/administrador|dirigente|pai de santo|mãe de santo|responsável financeiro/i.test(String(u.perfil||''))){managementTab=btn('Gestão da Loja',function(){current='gestao';setTab();loadManagement()});tabs.append(managementTab)}root.append(tabs);var panel=el('div');panel.id='lojaContent';root.append(panel);function setTab(){[catalogTab,ordersTab,managementTab].filter(Boolean).forEach(function(b){b.setAttribute('aria-pressed',String((b===catalogTab&&current==='catalogo')||(b===ordersTab&&current==='pedidos')||(b===managementTab&&current==='gestao')))});}setTab();loadCatalog();
  }
  function content(){return root&&root.querySelector('#lojaContent')}
  function loadCatalog(){if(!content())return;content().replaceChildren(el('p','Carregando produtos…','loja-muted'));say('Consultando produtos…');invoke('listarCatalogoLoja',[],function(r){if(!r.ok){content().replaceChildren(loadError('Não foi possível carregar os produtos.',loadCatalog));return}products=r.produtos||[];content().replaceChildren();say(products.length?'Produtos disponíveis para você.':'');var hero=el('section',null,'loja-hero');hero.append(el('div',null));hero.firstChild.append(el('h2','Encontre seu próximo aprendizado'),el('p','Publicações e materiais digitais selecionados pela Tenda. Compre com segurança e acompanhe a liberação em Meus pedidos.'));hero.append(el('div','✦','loja-hero-mark'));content().append(hero);var s=section('Materiais disponíveis','Cada material é adquirido individualmente.');if(!products.length){var empty=el('div',null,'loja-empty');empty.append(el('strong','Em breve, novidades para você'),el('span','Os livros e materiais digitais aparecerão aqui quando forem publicados.','loja-muted'));s.append(empty);return}var grid=el('div',null,'loja-products');products.forEach(function(p){var card=el('article',null,'loja-product-card'),cover=el('div',null,'loja-card-cover');if(p.imagemUrl){var img=el('img');img.src=p.imagemUrl;img.alt='Capa de '+p.nome;img.loading='lazy';cover.append(img)}else{var mark=el('div',null,'loja-book-mark');mark.append(el('span','▤'),el('span','PDF DIGITAL'));cover.append(mark)}var body=el('div',null,'loja-product-body');body.append(el('span',p.categoria||'Leitura digital','loja-product-category'),el('h3',p.nome),el('p',p.descricao||'Material digital em PDF.'));var buy=el('div',null,'loja-product-buy'),orderButton=btn(api.user()?'Fazer pedido':'Entrar para pedir',function(){if(!api.user()){api.login();return}orderButton.disabled=true;orderButton.textContent='Criando pedido…';invoke('criarPedidoLoja',[api.token(),p.id],function(out){orderButton.disabled=false;orderButton.textContent='Fazer pedido';if(out.ok){say(out.jaExistia?'Já existe um pedido aguardando pagamento.':'Pedido criado. Envie o comprovante em “Meus pedidos”.','success');current='pedidos';loadOrders()}})},'member-btn');buy.append(el('span',money(p.precoCentavos),'loja-price'),orderButton);body.append(buy);card.append(cover,body);grid.append(card)});s.append(grid)})}
  function loadOrders(){if(!api.user()){api.login();return}content().replaceChildren(el('p','Carregando pedidos…','loja-muted'));say('Consultando pedidos…');invoke('listarMeusPedidosLoja',[api.token()],function(r){if(!r.ok){content().replaceChildren(loadError('Não foi possível carregar seus pedidos.',loadOrders));return}orders=r.pedidos||[];content().replaceChildren();say(orders.length?'Pedidos carregados.':'Você ainda não tem pedidos.');var s=section('Meus pedidos','O comprovante será analisado por outro responsável.');if(!orders.length){s.append(el('p','Seus pedidos aparecerão aqui.','loja-muted'));return}var t=table(['Pedido','Produto(s)','Valor','Situação','Pagamento / entrega']);orders.forEach(function(o){var tr=el('tr'),items=(o.itens||[]),names=items.map(function(i){return i.nome}).join(', ')||'—',st=el('span',o.status,'loja-status'),actions=el('div');if(o.status!=='Pago'&&o.status!=='Em conferência'){var form=paymentForm(o);actions.append(form)}else if(o.status==='Em conferência')actions.append(el('span','Aguardando validação de outra pessoa.','loja-muted'));items.forEach(function(i){if(i.podeBaixar)actions.append(btn('Baixar '+i.nome,function(){downloadItem(i.id)},'member-btn'))});if(o.pagamento&&o.pagamento.status==='Pagamento recusado')actions.append(el('p','Comprovante devolvido: '+(o.pagamento.motivo||'revise e envie novamente.'),'loja-error'));tr.append(el('td',o.id),el('td',names),el('td',money(o.valorCentavos),'loja-price'),el('td',st),el('td',actions));t.body.append(tr)});s.append(t.wrap)})}
  function paymentForm(o){var wrap=el('div',null,'loja-form-row'),dateLabel=el('label','Data do pagamento'),date=el('input'),formLabel=el('label','Forma'),form=el('select'),fileLabel=el('label','Comprovante (PDF, PNG ou JPG · até 2 MB)'),file=el('input'),submit=btn('Enviar comprovante',submitProof,'member-btn');date.type='date';date.required=true;dateLabel.append(date);[['Pix','Pix'],['Transferência','Transferência'],['Dinheiro','Dinheiro']].forEach(function(x){var op=el('option',x[0]);op.value=x[1];form.append(op)});formLabel.append(form);file.type='file';file.accept='.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';fileLabel.append(file);wrap.append(dateLabel,formLabel,fileLabel,submit);function submitProof(){var f=file.files&&file.files[0];if(!date.value||!f){say('Informe a data e selecione o comprovante.','error');return}if(f.size>2*1024*1024||['application/pdf','image/png','image/jpeg'].indexOf(f.type)<0){say('O comprovante deve ser PDF, PNG ou JPG de até 2 MB.','error');return}submit.disabled=true;submit.textContent='Enviando…';say('Enviando comprovante com segurança…');var reader=new FileReader();reader.onerror=function(){submit.disabled=false;submit.textContent='Enviar comprovante';say('Não foi possível ler o arquivo.','error')};reader.onload=function(){var b64=String(reader.result).split(',')[1]||'';invoke('enviarComprovanteLoja',[api.token(),o.id,date.value,form.value,f.type,f.name,b64],function(r){submit.disabled=false;submit.textContent='Enviar comprovante';if(r.ok){say('Comprovante enviado. O pedido aguarda validação.','success');loadOrders()}})};reader.readAsDataURL(f)}return wrap}
  function downloadItem(id){invoke('baixarProdutoLoja',[api.token(),id],function(r){if(!r.ok)return;var raw=atob(r.base64),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);var blob=new Blob([bytes],{type:r.mimeType||'application/pdf'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=r.nome||'material.pdf';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);say('Download autorizado para este pedido.','success')})}
  function loadManagement(){
    if(!api.user()){api.login();return}
    content().replaceChildren(el('p','Carregando produtos…','loja-muted'));say('Carregando a gestão da Loja…');
    invoke('listarProdutosGestaoLoja',[api.token()],function(r){
      if(!r.ok){content().replaceChildren(loadError('Não foi possível carregar a gestão da Loja.',loadManagement));return}
      content().replaceChildren();say('');
      var s=section('Gestão de produtos','Cadastre livros e materiais digitais em PDF. Depois, publique o produto para que apareça na Loja.');
      var editor=el('section',null,'loja-editor'),head=el('header',null,'loja-editor-head');
      head.append(el('h3','Novo produto digital'),el('p','O PDF será guardado em pasta privada. O produto começa como rascunho.','loja-muted'));
      var grid=el('div',null,'loja-form-grid'),name=el('input'),cat=el('input'),desc=el('textarea'),price=el('input'),file=el('input');
      name.placeholder='Ex.: Livro de estudos da Umbanda';name.maxLength=120;name.required=true;
      cat.placeholder='Ex.: Estudos';cat.maxLength=60;
      desc.placeholder='Conte em poucas linhas o que a pessoa encontrará no material.';desc.maxLength=2000;
      price.type='number';price.min='0.01';price.step='0.01';price.placeholder='0,00';price.required=true;
      file.type='file';file.accept='.pdf,application/pdf';file.required=true;
      function field(label,input,cls){var l=el('label',label,'loja-field'+(cls?' '+cls:''));l.append(input);return l}
      grid.append(field('Nome do produto',name,'wide'),field('Categoria',cat),field('Preço (R$)',price));
      grid.append(field('Descrição',desc,'full'));
      var pdfField=field('Livro ou material em PDF',file,'full');pdfField.append(el('span','PDF de até 8 MB. O arquivo não fica público antes da confirmação do pagamento.','loja-file-note'));grid.append(pdfField);
      var actions=el('div',null,'loja-editor-actions'),save=btn('Salvar rascunho',saveProduct,'member-btn');save.type='button';actions.append(save);
      editor.append(head,grid,actions);s.append(editor);
      var list=section('Produtos cadastrados','A publicação pode ser ativada ou pausada sem apagar o cadastro.');
      var existing=r.produtos||[];
      if(!existing.length){var empty=el('div',null,'loja-empty');empty.append(el('strong','Seu catálogo começa aqui'),el('span','Cadastre um livro em PDF acima. Depois de salvo, use “Publicar” para exibi-lo na Loja.','loja-muted'));list.append(empty);return}
      var t=table(['Produto','Categoria','Valor','Status','Ação']);
      existing.forEach(function(p){var tr=el('tr'),status=el('span',p.status||'Rascunho','loja-status'),toggle=btn(p.status==='Publicado'?'Pausar publicação':'Publicar',function(){toggle.disabled=true;toggle.textContent='Atualizando…';say('Atualizando a publicação…');invoke('publicarProdutoLoja',[api.token(),p.id,p.status!=='Publicado'?'true':'false'],function(out){if(out.ok){say(out.status==='Publicado'?'Produto publicado na Loja.':'Publicação pausada.','success');loadManagement()}else{toggle.disabled=false;toggle.textContent=p.status==='Publicado'?'Pausar publicação':'Publicar'}})},p.status==='Publicado'?'secondary':'member-btn');
        tr.append(el('td',p.nome),el('td',p.categoria||'—'),el('td',money(p.precoCentavos),'loja-price'),el('td',status),el('td',toggle));t.body.append(tr)});
      list.append(t.wrap);
      function saveProduct(){
        var f=file.files&&file.files[0],cost=Number(price.value);
        if(name.value.trim().length<2){say('Informe o nome do produto.','error');name.focus();return}
        if(!Number.isFinite(cost)||cost<=0){say('Informe um preço válido.','error');price.focus();return}
        if(!f){say('Selecione o PDF do livro antes de salvar.','error');file.focus();return}
        if(f.size>8*1024*1024||f.type!=='application/pdf'){say('O material deve ser um PDF de até 8 MB.','error');return}
        save.disabled=true;save.textContent='Lendo PDF…';say('Preparando o PDF para salvar…');
        var data={nome:name.value.trim(),categoria:cat.value.trim(),descricao:desc.value.trim(),precoCentavos:Math.round(cost*100)};
        var reader=new FileReader();
        reader.onerror=function(){save.disabled=false;save.textContent='Salvar rascunho';say('Não foi possível ler o PDF. Selecione o arquivo novamente.','error')};
        reader.onload=function(){
          data.arquivoNome=f.name;data.arquivoMime=f.type;data.arquivoBase64=String(reader.result).split(',')[1]||'';
          var json=JSON.stringify(data);
          if(json.length>12000000){save.disabled=false;save.textContent='Salvar rascunho';say('Este arquivo ultrapassa o limite seguro de envio. Use um PDF menor que 8 MB.','error');return}
          save.textContent='Salvando…';say('Salvando o livro e o PDF privado…');
          invoke('salvarProdutoLoja',[api.token(),json],function(out){save.disabled=false;save.textContent='Salvar rascunho';if(out.ok){say('Livro salvo como rascunho. Agora você pode publicá-lo na Loja.','success');loadManagement()}})
        };
        reader.readAsDataURL(f)
      }
    })
  }
  function renderPendencias(host,status,items){api=window.TZCLojaAPI;if(!api)return;notice=status;host.replaceChildren();if(!items.length){host.append(el('p','Não há pendências de pedidos no momento.','m04-note'));status.textContent='Nenhuma pendência da Loja.';return}status.textContent=items.length+' pagamento(s) da Loja aguardando análise.';items.forEach(function(x){renderPendingItem(host,status,x)})}
  function renderPendingItem(host,status,x){api=window.TZCLojaAPI;notice=status;if(!api)return;var card=el('article',null,'myarea-review-card');card.dataset.pendingType='loja';card.append(el('span','Loja · aguardando conferência','pending-kind'),el('strong',x.nome||'Comprador'),el('span',(x.produtos||[]).join(', ')+' · Pedido '+x.pedidoId+' · '+money(x.valorCentavos),'myarea-review-detail'),el('span','Pagamento em '+x.dataPagamento+' · '+(x.forma||'Forma não informada')+' · enviado '+x.enviadoEm,'myarea-review-detail'));var actions=el('div',null,'myarea-action-buttons'),view=btn('Conferir comprovante',function(){view.disabled=true;view.textContent='Abrindo…';invoke('obterComprovanteLoja',[api.token(),x.id],function(r){view.disabled=false;view.textContent='Conferir comprovante';if(!r.ok)return;var raw=atob(r.base64),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);var blob=new Blob([bytes],{type:r.mimeType}),url=URL.createObjectURL(blob),box=el('div',null,'loja-proof');if(r.mimeType==='application/pdf'){var frame=el('iframe');frame.title='Comprovante de pagamento';frame.src=url;box.append(frame)}else{var img=el('img');img.alt='Comprovante de pagamento';img.src=url;box.append(img)}card.append(box)})},'secondary'),approve=btn('Aprovar pagamento',function(){decide('Aprovar','')},'member-btn'),reject=btn('Devolver para correção',function(){var reason=card.querySelector('.loja-reason');if(!reason){reason=el('input');reason.className='loja-reason';reason.maxLength=500;reason.placeholder='Informe o motivo da devolução';card.append(reason);reject.textContent='Confirmar devolução';return}decide('Recusar',reason.value)});actions.append(view,approve,reject);card.append(actions);host.append(card);function decide(action,reason){if(action==='Recusar'&&!reason.trim()){say('Informe o motivo para devolver o comprovante.','error');return}actions.querySelectorAll('button').forEach(function(b){b.disabled=true});approve.textContent=action==='Aprovar'?'Salvando…':approve.textContent;reject.textContent=action==='Recusar'?'Salvando…':reject.textContent;say('Salvando a análise do pedido…');invoke('decidirPagamentoLoja',[api.token(),x.id,action,reason],function(r){if(!r.ok){actions.querySelectorAll('button').forEach(function(b){b.disabled=false});return}card.replaceChildren(el('span',r.status+' · decisão registrada','pending-kind'));status.textContent=r.mensagem||'Análise salva.';setTimeout(function(){if(api&&api.refreshPendencias)api.refreshPendencias()},500)})}}
  window.TZCLojaUI={abrir:init,renderPendencias:renderPendencias,renderPendingItem:renderPendingItem};
})();
