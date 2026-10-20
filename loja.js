/* TZC — Loja/Pedidos V01. UI isolada; depende da API estreita exposta pelo site. */
(function(){
  'use strict';
  var api, root, notice, current='catalogo', products=[], orders=[], cart=[], buyerToken='', buyerOrdersActive=false, buyerName='', buyerEmail='', pendingProductId='', pendingOrderId='', catalogTabButton=null, cartTabButton=null, ordersTabButton=null, afterCatalogMessage='', catalogLoadId=0;
  var styles=`
  .loja-wrap{display:grid;gap:14px;max-width:1180px;margin:0 auto;padding:12px 0 30px}.loja-wrap>.intro-title{text-align:center}.loja-wrap>.intro-title+.m04-note{text-align:center;max-width:62ch;margin-inline:auto}
  .loja-wrap>.intro-title{margin:0;padding:0;color:var(--primary);font:700 clamp(28px,3vw,38px)/1.2 Georgia,serif;text-align:center}.loja-wrap>.loja-muted{max-width:62ch;margin-inline:auto;text-align:center}
  .loja-wrap>.intro-title+.m04-note{max-width:760px;margin:8px auto 20px;color:var(--muted);font:400 17px/1.5 "Segoe UI",Arial,sans-serif;text-align:center}
  .loja-muted{color:var(--muted);font-size:14px;line-height:1.5}
  .loja-error{color:#a22;font-weight:700}.loja-success{color:#176c43;font-weight:700}.loja-warning{color:#956500;font-weight:700}
  .loja-status-line{min-height:1.4em;margin:0;text-align:center;font-size:14px}
  .loja-form-row .loja-status-line{grid-column:1/-1;min-height:0;text-align:left;margin:0;font-size:13px;line-height:1.4}
  .loja-tabs{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:8px 0 10px}
  .loja-tabs button{min-height:44px;padding:9px 18px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--text);font-weight:700;box-shadow:var(--shadow)}
  .loja-tabs button[aria-pressed=true]{background:var(--primary);border-color:var(--primary);color:#fff}
  html[data-theme="escuro"] .loja-tabs button[aria-pressed=true]{color:#24191a}
  .loja-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:14px;background:linear-gradient(115deg,var(--surface2),var(--surface));box-shadow:var(--shadow)}
  .loja-hero h2{margin:0 0 2px;color:var(--primary);font:700 20px Georgia,serif}
  .loja-hero p{margin:0;color:var(--muted);max-width:760px;font-size:13px}
  .loja-hero-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--gold-soft);color:var(--primary);font-size:21px}
  .loja-section{display:grid;gap:16px;margin-top:10px}
  .loja-section-heading h2{margin:0;color:var(--primary);font:700 clamp(21px,2.2vw,25px) Georgia,serif;text-align:center}
  .loja-section-heading p{margin:4px auto 0;text-align:center;max-width:70ch}
  .loja-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),350px));justify-content:center;gap:22px}
  .loja-cart-panel{display:grid;gap:14px;padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:var(--shadow)}
  .loja-cart-line{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
  .loja-cart-total{display:flex;justify-content:flex-end;gap:12px;align-items:center;font-size:18px;font-weight:800;color:var(--primary)}
  .loja-checkout{max-width:760px;margin:0 auto}
  .loja-pix-panel{display:grid;justify-items:center;gap:12px;padding:20px;border:1px solid var(--line);border-top:4px solid var(--gold);border-radius:16px;background:var(--surface);box-shadow:var(--shadow);text-align:center}
  .loja-pix-panel img{width:240px;height:240px;object-fit:contain;padding:8px;background:#fff;border:1px solid var(--line);border-radius:10px}
  .loja-pix-code{width:100%;min-height:96px;resize:vertical;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);font:12px/1.45 monospace;overflow-wrap:anywhere}
  .loja-pix-summary{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;color:var(--muted)}
  .loja-product-card{overflow:hidden;display:flex;flex-direction:column;min-width:0;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:var(--shadow);transition:transform .16s ease,box-shadow .16s ease}
  .loja-product-card:hover{transform:translateY(-2px);box-shadow:0 14px 32px #3c20141c}
  .loja-study-detail{width:min(640px,calc(100vw - 28px));max-width:640px;max-height:min(88dvh,900px);padding:0;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:var(--surface);color:var(--text);box-shadow:0 24px 70px #09111f40}
  .loja-study-detail-form{display:flex;flex-direction:column;max-height:inherit}.loja-study-detail .dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid var(--line)}.loja-study-detail .dialog-head h2{margin:0;color:var(--primary);font:700 22px Georgia,serif}.loja-study-detail-body{overflow:auto;display:grid;justify-items:start;gap:12px;padding:20px}.loja-study-detail-body>img{display:block;width:min(100%,320px);max-height:320px;object-fit:contain;margin:0 auto 5px;border-radius:12px}.loja-study-description{margin:0;white-space:pre-wrap;line-height:1.6}.loja-study-detail .dialog-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 20px;border-top:1px solid var(--line)}.loja-product-card[role=button]{cursor:pointer}.loja-product-card:focus-visible{outline:3px solid var(--gold);outline-offset:2px}

  .loja-card-cover{height:196px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#641d29,#8b4c39 58%,#bd8b38);color:#fff}
  .loja-card-cover img{width:100%;height:100%;object-fit:cover}
  .loja-book-mark{display:grid;gap:7px;place-items:center;width:112px;height:136px;border:1px solid #fff8;border-radius:8px;background:#fff2;box-shadow:8px 9px 18px #2d101855;transform:rotate(-3deg);font-size:36px}
  .loja-book-mark span{font-size:10px;font-weight:800;letter-spacing:.13em}
  .loja-product-body{display:grid;align-content:start;gap:12px;padding:20px;flex:1}
  .loja-product-category{justify-self:start;padding:4px 10px;border-radius:999px;background:var(--gold-soft);color:var(--primary);font-size:12px;font-weight:800}
  .loja-product-body h3{margin:0;color:var(--text);font-size:21px;line-height:1.3}
  .loja-product-body p{margin:0;color:var(--muted);font-size:14px;line-height:1.5;white-space:pre-line}
  .loja-product-buy{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:5px}
  .loja-price{color:var(--primary);font-size:22px;font-weight:850;white-space:nowrap}
  .loja-empty{display:grid;justify-items:center;gap:7px;padding:28px 18px;border:1px dashed var(--line);border-radius:16px;background:var(--surface);text-align:center}
  .loja-empty strong{color:var(--primary);font:700 20px Georgia,serif}
  .loja-work-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.loja-work-card{display:grid;grid-template-columns:minmax(0,1fr);align-items:stretch;gap:14px;padding:22px 24px;min-height:210px;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:16px;background:linear-gradient(115deg,var(--surface2),var(--surface));box-shadow:var(--shadow)}
  .loja-work-copy{display:grid;gap:7px;min-width:0}
  .loja-work-title{display:flex;align-items:center;gap:10px;min-width:0}
  .loja-work-mark{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:50%;background:var(--gold-soft);color:var(--primary);font-size:20px}
  .loja-work-card h3{margin:0;color:var(--primary);font:700 19px/1.2 Georgia,serif}
  .loja-work-card p{max-width:62ch;margin:0;color:var(--muted);font-size:14px;line-height:1.5}
  .loja-work-card .member-btn{justify-self:start;align-self:end;max-width:100%;box-sizing:border-box;min-height:46px;padding:10px 16px;white-space:normal;text-align:center}
  .loja-management-tab{min-width:190px}
  @media(max-width:760px){.loja-work-grid{grid-template-columns:1fr}.loja-work-card{grid-template-columns:minmax(0,1fr);gap:14px;padding:18px;min-height:0}.loja-work-card .member-btn{width:100%;box-sizing:border-box}.loja-work-card p{max-width:none}}@media(max-width:520px){.loja-tabs{gap:8px}.loja-tabs button{padding:9px 14px}.loja-product-buy{align-items:stretch;flex-direction:column}.loja-product-buy button{width:100%}.loja-card-cover{height:180px}}
  .loja-editor{display:grid;gap:16px;padding:20px;border:1px solid var(--line);border-top:4px solid var(--gold);border-radius:16px;background:var(--surface);box-shadow:var(--shadow)}
  .loja-access-panel{width:min(100%,760px);margin:0 auto;padding:20px;border-top-width:4px;gap:14px}
  .loja-access-copy{margin:0;color:var(--muted);line-height:1.5}
  .loja-access-email{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface2)}
  .loja-access-email-copy{display:grid;gap:3px;min-width:0}
  .loja-access-email-copy strong{color:var(--text);font-size:13px}
  .loja-access-email-copy span{color:var(--primary);font-weight:750;overflow-wrap:anywhere}
  .loja-code-field{width:min(100%,380px);grid-column:1/-1!important}
  .loja-code-field input{text-align:center;font-size:22px;font-weight:750;letter-spacing:.32em}
  .loja-access-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .loja-access-actions button{min-height:44px}
  .loja-resend-note{margin:0;color:var(--muted);font-size:13px}
  .loja-link-button{border:0;background:transparent;color:var(--primary);padding:8px 4px;font-weight:750;text-decoration:underline;text-underline-offset:3px}
  .loja-link-button:disabled{color:var(--muted);text-decoration:none;cursor:wait}
  .loja-editor-head h3{margin:0;color:var(--primary);font:700 21px Georgia,serif}
  .loja-editor-head p{margin:4px 0 0}
  .loja-form-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}
  .loja-field{grid-column:span 3;display:grid;align-content:start;gap:6px;min-width:0;color:var(--text);font-size:14px;font-weight:700}
  .loja-field.wide{grid-column:span 6}.loja-field.full{grid-column:1/-1}
  .loja-field input,.loja-field textarea{box-sizing:border-box;width:100%;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--bg);color:var(--text);font:inherit;font-weight:400}
  .loja-field textarea{min-height:74px;resize:vertical}
  .loja-field input[type=file]{padding:8px;background:var(--surface)}
  .loja-file-note{margin:0;color:var(--muted);font-size:12px;font-weight:400}
  .loja-consent{display:flex;align-items:flex-start;gap:9px;color:var(--muted);font-size:14px;line-height:1.4}
  .loja-consent input{width:18px;height:18px;flex:none;margin:2px 0 0;accent-color:var(--primary)}
  .loja-editor-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .loja-editor-actions button{min-width:170px;min-height:46px}
  .loja-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:14px;background:var(--surface);box-shadow:var(--shadow)}
  .loja-table{width:100%;border-collapse:collapse;table-layout:fixed}
  .loja-table th,.loja-table td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:middle}
  .loja-table th{background:var(--surface2);color:var(--primary);font-size:12px;font-weight:800;letter-spacing:.02em;border-bottom:1px solid var(--line)}
  .loja-table th:nth-child(1){width:15%}.loja-table th:nth-child(2){width:28%}.loja-table th:nth-child(3){width:12%}.loja-table th:nth-child(4){width:17%}.loja-table th:nth-child(5){width:28%}
  .loja-table td{font-size:14px;overflow-wrap:anywhere}.loja-order-id{font:700 12px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted);white-space:nowrap}.loja-order-products{display:grid;gap:3px}.loja-order-products span{line-height:1.35}.loja-order-actions{display:grid;justify-items:start;gap:8px}.loja-upload-details{width:100%;max-width:360px;border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:8px 10px}.loja-upload-details summary{color:var(--primary);font-size:13px;font-weight:800;cursor:pointer}.loja-form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.loja-form-row label{display:grid;gap:4px;min-width:0;color:var(--muted);font-size:12px;font-weight:700}.loja-form-row input,.loja-form-row select{width:100%;min-width:0;min-height:38px;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:var(--bg);color:var(--text);font:inherit;font-size:13px}.loja-form-row label:nth-child(3){grid-column:1/-1}.loja-form-row button{min-height:38px;padding:7px 10px;font-size:13px}.loja-form-row .loja-file-note{grid-column:1/-1}
  @media(max-width:760px){.loja-table-wrap{overflow-x:auto}.loja-table{min-width:780px}.loja-table th,.loja-table td{padding:9px 10px}}
  @media(max-width:520px){.loja-table{min-width:740px}.loja-upload-details{max-width:100%}.loja-form-row{grid-template-columns:1fr}.loja-form-row label:nth-child(3){grid-column:auto}}
  .loja-table tbody tr:nth-child(even){background:color-mix(in srgb,var(--surface2) 30%,var(--surface))}
  .loja-table tbody tr:last-child td{border-bottom:0}
  .loja-status{display:inline-flex;border-radius:30px;padding:4px 9px;background:var(--gold-soft);color:var(--primary);font-size:13px;font-weight:750;white-space:nowrap}
  .loja-load-error{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;border:1px solid var(--line);border-left:4px solid #a22;border-radius:10px;background:var(--surface);color:var(--text)}
  .loja-load-error p{margin:0;font-size:14px}
  .loja-proof-dialog{width:min(880px,calc(100vw - 28px));max-height:92dvh;overflow:hidden;padding:0;border-radius:16px}
  .loja-proof-dialog .loja-proof-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line)}
  .loja-proof-dialog .loja-proof-dialog-head h2{margin:0;color:var(--primary);font:700 21px Georgia,serif}
  .loja-proof-dialog .loja-proof{max-height:calc(92dvh - 72px);overflow:auto;margin:0;padding:12px;border:0;border-radius:0;background:var(--surface)}
  .loja-proof-dialog .loja-proof iframe{display:block;width:100%;height:min(72dvh,760px);border:0;background:#fff}
  .loja-proof-dialog .loja-proof img{display:block;max-width:100%;max-height:72dvh;margin:auto;object-fit:contain;background:#fff}
  @media(max-width:600px){.loja-proof-dialog{width:calc(100vw - 20px);max-height:90dvh}.loja-proof-dialog .loja-proof{max-height:calc(90dvh - 62px);padding:8px}.loja-proof-dialog .loja-proof iframe{height:70dvh}.loja-proof-dialog .loja-proof img{max-height:70dvh}.loja-proof-dialog .loja-proof-dialog-head{padding:11px 13px}.loja-proof-dialog .loja-proof-dialog-head h2{font-size:18px}}
  @media(max-width:760px){.loja-hero{grid-template-columns:1fr;padding:12px 14px}.loja-hero-mark{display:none}.loja-field,.loja-field.wide{grid-column:span 6}.loja-field.full{grid-column:1/-1}}
  @media(max-width:520px){.loja-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%}.loja-tabs button{padding:9px 10px}.loja-tabs button:last-child:nth-child(odd){grid-column:1/-1}.loja-hero{padding:12px}.loja-field,.loja-field.wide{grid-column:1/-1}.loja-editor{padding:15px}.loja-editor-actions{display:grid;grid-template-columns:1fr;width:100%}.loja-editor-actions button{width:100%}.loja-access-panel{padding:15px}.loja-access-email{align-items:flex-start}.loja-access-actions{display:grid;grid-template-columns:1fr;width:100%}.loja-access-actions button{width:100%}.loja-table{min-width:580px}.loja-cart-line{grid-template-columns:minmax(0,1fr) auto}.loja-cart-line .loja-remove{grid-column:2}.loja-pix-panel{padding:14px}.loja-pix-panel img{width:210px;height:210px}}
  @media(max-width:520px){.loja-card-cover{height:138px}.loja-book-mark{width:78px;height:92px;font-size:30px}.loja-product-body{gap:8px;padding:14px}.loja-product-body h3{font-size:18px}.loja-product-buy{gap:8px}.loja-price{font-size:18px}.loja-product-buy .member-btn{min-height:42px;padding:9px 12px}}
  .loja-manage-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 14px;padding-bottom:10px;border-bottom:1px solid var(--line)}
  .loja-manage-tabs button{min-height:42px;padding:9px 16px;border-radius:999px}
  .loja-manage-pane{display:grid;gap:14px}
  .loja-manage-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:10px 0}
  .loja-manage-toolbar>span{margin:0}
  .loja-manage-toolbar button{min-height:42px;padding:9px 15px}
  .loja-editor-slot{display:grid;gap:12px}
  .loja-row-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .loja-row-actions button{min-height:38px;padding:7px 11px;white-space:nowrap}
  .loja-manage-pane .loja-section{gap:8px}
  @media(max-width:600px){.loja-manage-toolbar{align-items:stretch}.loja-manage-toolbar button{width:100%}.loja-row-actions{min-width:160px}}
  .loja-table-products th:first-child{width:48%}.loja-table-products th:nth-child(2),.loja-table-products th:nth-child(3){width:26%}
  .loja-table-types th:first-child{width:34%}.loja-table-types th:nth-child(2){width:66%}
  .loja-table tr.loja-clickable-row{cursor:pointer}
  .loja-table tr.loja-clickable-row:hover,.loja-table tr.loja-clickable-row:focus-visible{background:color-mix(in srgb,var(--gold-soft) 42%,var(--surface));outline:none}
  .loja-table tr.loja-clickable-row:focus-visible{box-shadow:inset 0 0 0 3px var(--gold)}

  /* Loja: pedidos em cartões para telas estreitas; sem rolagem horizontal na área de comprovante. */
  @media(max-width:600px){
    .loja-wrap{padding:8px 0 24px}
    .loja-wrap>.intro-title{font-size:30px}
    .loja-orders-table-wrap{overflow:visible;border:0;background:transparent;box-shadow:none}
    .loja-orders-table-wrap .loja-table{display:block;width:100%;min-width:0;table-layout:auto}
    .loja-orders-table-wrap .loja-table thead{display:none}
    .loja-orders-table-wrap .loja-table tbody{display:grid;gap:12px}
    .loja-orders-table-wrap .loja-table tbody tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--surface);box-shadow:var(--shadow)}
    .loja-orders-table-wrap .loja-table tbody td{display:block;min-width:0;max-width:100%;padding:0;border:0;overflow-wrap:anywhere;white-space:normal}
    .loja-orders-table-wrap .loja-table tbody td:before{display:block;margin-bottom:3px;color:var(--muted);font-size:11px;font-weight:750;letter-spacing:.03em}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(1){grid-column:1/-1;color:var(--primary);font-weight:800}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(1):before{content:'Pedido'}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(2){grid-column:1/-1}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(2):before{content:'Produto(s)'}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(3){grid-column:1}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(3):before{content:'Valor'}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(4){grid-column:2;align-self:end;text-align:right}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(4):before{content:'Situação'}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(5){grid-column:1/-1;padding-top:9px;border-top:1px solid var(--line)}
    .loja-orders-table-wrap .loja-table tbody td:nth-child(5):before{content:'Pagamento / comprovante'}
    .loja-orders-table-wrap .loja-order-actions{display:grid;gap:9px;width:100%;min-width:0}
    .loja-orders-table-wrap .loja-upload-details{width:100%;max-width:none}
    .loja-orders-table-wrap .loja-form-row{grid-template-columns:1fr}
    .loja-orders-table-wrap .loja-form-row label:nth-child(3){grid-column:auto}
    .loja-orders-table-wrap .loja-form-row input[type=file]{width:100%;max-width:100%;font-size:13px}
    .loja-orders-table-wrap .loja-form-row button{width:100%;min-height:44px;white-space:normal}
    .loja-orders-table-wrap .loja-status{white-space:normal;text-align:center}
  }


  `;
  function el(tag, text, cls){var n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
  function btn(text,fn,cls){var b=el('button',text,cls||'secondary');b.type='button';b.addEventListener('click',fn);return b}
  function money(c){return (Number(c||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function say(text,kind){if(!notice)return;notice.textContent=text||'';notice.className=kind==='error'?'loja-error':kind==='success'?'loja-success':kind==='warning'?'loja-warning':'loja-muted';}
  function loadError(message,retry){var box=el('div',null,'loja-load-error');box.setAttribute('role','alert');box.append(el('p',message||'Não foi possível carregar esta seção.'));box.append(btn('Tentar novamente',retry,'secondary'));return box}
  function section(title,description,parent){var s=el('section',null,'loja-section'),head=el('header',null,'loja-section-heading');head.append(el('h2',title));if(description)head.append(el('p',description,'loja-muted'));s.append(head);(parent||content()||root).append(s);return s}
  function table(headers){var wrap=el('div',null,'loja-table-wrap'),t=el('table',null,'loja-table'),thead=el('thead'),tr=el('tr');headers.forEach(function(x){tr.append(el('th',x))});thead.append(tr);t.append(thead,el('tbody'));wrap.append(t);return {wrap:wrap,body:t.tBodies[0]}}
  function invoke(route,args,done){var finished=false,timer=setTimeout(function(){if(finished)return;finished=true;var r={ok:false,mensagem:'A solicitação demorou mais que o esperado. Confira o resultado antes de tentar novamente.'};say(r.mensagem,'error');if(done)done(r)},60000);api.rpc(route,args,function(r){if(finished)return;finished=true;clearTimeout(timer);if(!r||!r.ok){say(r&&r.mensagem||'Não foi possível concluir a solicitação.','error');if(done)done(r||{ok:false});return}if(done)done(r)})}
  function init(){api=window.TZCLojaAPI;if(!api||!api.host){return}root=api.host();if(!root)return;root.replaceChildren();api.prepare('Atendimentos & Materiais da Casa','Confira os atendimentos e materiais da casa; escolha uma opção ou acompanhe suas solicitações.');root=api.host();root.className='dynamic-page loja-wrap';try{buyerToken=sessionStorage.getItem('tzc-loja-visitante-token')||'';buyerOrdersActive=sessionStorage.getItem('tzc-loja-visitor-orders-active')==='true';buyerEmail=sessionStorage.getItem('tzc-loja-visitante-email')||'';pendingOrderId=sessionStorage.getItem('tzc-loja-pending-order-id')||'';cart=JSON.parse(sessionStorage.getItem('tzc-loja-carrinho')||'[]');if(!Array.isArray(cart))cart=[]}catch(ignore){cart=[]}
    var style=document.getElementById('tzc-loja-style');if(!style){style=document.createElement('style');style.id='tzc-loja-style';style.textContent=styles+"\n/* Cabeçalho compacto e navegação direta entre as duas áreas da Loja. */\n.loja-wrap{gap:7px!important;padding-top:8px!important}\n.loja-wrap>.intro-title+.m04-note{margin:3px auto 4px!important}\n.loja-status-line{min-height:0!important;line-height:1.25!important;margin:0!important}\n.loja-tabs{margin:3px 0 6px!important}\n.loja-section-heading{margin:8px 0 9px!important}\n.loja-catalog-hero{display:grid;justify-items:center;text-align:center;gap:5px;margin:7px auto 10px;padding:20px 18px;max-width:980px;border:1px solid var(--line);border-top:3px solid var(--gold);border-radius:18px;background:linear-gradient(125deg,var(--surface2),var(--surface));box-shadow:var(--shadow)}\n.loja-catalog-eyebrow{color:var(--gold);font-size:11px;font-weight:850;letter-spacing:.15em}\n.loja-catalog-title{margin:0;color:var(--primary);font:700 clamp(23px,2.4vw,30px)/1.2 Georgia,serif}\n.loja-catalog-copy{margin:0;color:var(--muted);max-width:62ch}\n.loja-catalog-switcher{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-width:880px;margin:0 auto 12px}\n.loja-catalog-choice{min-height:54px!important;padding:12px 16px!important;border:1px solid var(--line)!important;border-radius:13px!important;background:var(--surface)!important;color:var(--text)!important;font-weight:750}\n.loja-catalog-choice[aria-pressed=true]{background:#641d29!important;border-color:#641d29!important;color:#fff!important;box-shadow:inset 0 -3px #bd8b38!important}\nhtml[data-theme=\"escuro\"] .loja-catalog-choice[aria-pressed=true]{background:#641d29!important;border-color:#8b4a55!important;color:#fff!important}\n.loja-catalog-pane{min-height:160px}\n.loja-catalog-search{display:flex;align-items:center;gap:10px;max-width:760px;margin:0 auto 14px;font-weight:700;color:var(--muted)}\n.loja-catalog-search input{flex:1;min-width:0;min-height:44px;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);font:inherit}\n.loja-material-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),320px));justify-content:center}\n.loja-work-card{min-height:185px;padding:19px 21px}\n.loja-section-heading h2{margin:0;color:var(--primary);font:700 24px/1.2 Georgia,serif}\n.loja-section-heading p{margin:5px auto 0;max-width:66ch;color:var(--muted);text-align:center}\n@media(max-width:620px){.loja-catalog-hero{padding:16px 13px}.loja-catalog-switcher{grid-template-columns:1fr;gap:7px}.loja-catalog-choice{min-height:46px!important}.loja-catalog-search{display:grid;gap:5px}.loja-section-heading h2{font-size:21px}.loja-work-card{padding:15px;min-height:0}}\n";document.head.append(style)}
    notice=el('p','Carregando…','loja-status-line loja-muted');notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');root.append(notice);
    var tabs=el('div',null,'loja-tabs'),catalogTab=btn('Atendimentos & Materiais',function(){current='catalogo';setTab();loadCatalog()}),cartTab=btn('Carrinho',function(){current='carrinho';setTab();showCart()}),ordersTab=btn('Acompanhar pedidos',function(){current='pedidos';setTab();if(buyerOrdersActive||activeToken())loadOrders();else showBuyerAccess()});catalogTabButton=catalogTab;cartTabButton=cartTab;cartTab.classList.add('loja-cart-tab');ordersTabButton=ordersTab;catalogTab.hidden=true;tabs.append(cartTab);var orderMenu=el('details',null,'loja-order-shortcut'),orderSummary=el('summary','Acompanhar pedido');orderMenu.append(orderSummary,ordersTab);tabs.append(orderMenu);var u=api.user(),managementTab=null;if(u&&/administrador|dirigente|pai de santo|mãe de santo|responsável financeiro/i.test(String(u.perfil||''))){managementTab=btn('＋ Cadastrar',function(){current='gestao';setTab();loadManagement()});managementTab.classList.add('loja-management-tab','member-btn');tabs.append(managementTab)}root.append(tabs);var panel=el('div');panel.id='lojaContent';root.append(panel);function setTab(){[catalogTab,cartTab,ordersTab,managementTab].filter(Boolean).forEach(function(b){b.setAttribute('aria-pressed',String((b===catalogTab&&current==='catalogo')||(b===cartTab&&current==='carrinho')||(b===ordersTab&&current==='pedidos')||(b===managementTab&&current==='gestao')))});}setTab();updateCartTab();if(pendingOrderId){current='pedidos';setTab();if(buyerOrdersActive||activeToken())loadOrderForProof(pendingOrderId);else showBuyerAccess('Retomando seu pedido. Confirme o e-mail usado na compra para anexar o comprovante.')}else loadCatalog();
  }
  function content(){return root&&root.querySelector('#lojaContent')}
  function activeToken(){return api&&api.user()?api.token():buyerToken}
  function ordersToken(){return buyerOrdersActive?buyerToken:activeToken()}
  function markCurrentTab(){[catalogTabButton,cartTabButton,ordersTabButton].filter(Boolean).forEach(function(b){b.setAttribute('aria-pressed',String((b===catalogTabButton&&current==='catalogo')||(b===cartTabButton&&(current==='carrinho'||current==='checkout'||current==='pix'))||(b===ordersTabButton&&current==='pedidos')))});updateCartTab()}
  function clearCatalogCache(){try{localStorage.removeItem('tzc-loja-catalogo-v1')}catch(ignore){}}
  function loadCatalog(){
    if(!content())return;
    var requestId=++catalogLoadId,host=content(),cached=null;
    try{cached=JSON.parse(localStorage.getItem('tzc-loja-catalogo-v1')||'null')}catch(ignore){}
    if(cached&&Array.isArray(cached.produtos)&&Array.isArray(cached.tipos)){
      products=cached.produtos;renderCatalog(host,cached.produtos,cached.tipos);
      say('Materiais disponíveis para compra. Atualizando catálogo…');
    }else{host.replaceChildren(el('p','Carregando a Loja…','loja-muted'));say('Buscando materiais disponíveis…')}
    var result={products:null,types:null,productError:false,typeError:false},remaining=2;
    function finishCatalogLoad(){
      if(remaining>0||requestId!==catalogLoadId||current!=='catalogo'||host!==content())return;
      if(result.productError){
        if(cached){say('Exibindo a última lista carregada. Tente atualizar em instantes.','warning');return}
        host.replaceChildren(loadError('Não foi possível carregar os produtos.',loadCatalog));return
      }
      var freshProducts=result.products||[];
      if(result.typeError){
        if(cached){products=freshProducts;renderCatalog(host,freshProducts,cached.tipos);say('Produtos atualizados. As opções de atendimento serão atualizadas em instantes.','warning');return}
        products=freshProducts;renderCatalog(host,freshProducts,[]);host.append(loadError('Não foi possível carregar os atendimentos.',loadCatalog));return
      }
      var freshTypes=result.types||[];
      try{localStorage.setItem('tzc-loja-catalogo-v1',JSON.stringify({at:Date.now(),produtos:freshProducts,tipos:freshTypes}))}catch(ignore){}
      renderCatalog(host,freshProducts,freshTypes);say(afterCatalogMessage||(freshProducts.length?'Materiais disponíveis para compra.':''));afterCatalogMessage=''
    }
    invoke('listarCatalogoLoja',[],function(r){
      result.productError=!r||!r.ok;result.products=r&&r.produtos||[];remaining--;finishCatalogLoad()
    });
    invoke('listarTiposAtendimentoLoja',[],function(t){
      result.typeError=!t||!t.ok;result.types=t&&t.tipos||[];remaining--;finishCatalogLoad()
    });
  }
  function renderCatalog(host,items,types){
    if(host!==content())return;
    products=items||[];types=types||[];host.replaceChildren();
    var mode=products.length?'materiais':'atendimentos';
    var hero=el('section',null,'loja-catalog-hero');
    hero.append(el('span','ACERVO DA CASA','loja-catalog-eyebrow'),el('h2','Encontre o que procura','loja-catalog-title'),el('p','Peça uma orientação ou escolha um material digital para acompanhar sua caminhada.','loja-catalog-copy'));
    host.append(hero);
    var switcher=el('nav',null,'loja-catalog-switcher');switcher.setAttribute('aria-label','Escolher seção da Loja');
    var serviceButton=btn('Atendimentos espirituais'+(types.length?' · '+types.length:''),function(){mode='atendimentos';paint()},'loja-catalog-choice');
    var materialButton=btn('Livros e materiais digitais'+(products.length?' · '+products.length:''),function(){mode='materiais';paint()},'loja-catalog-choice');
    serviceButton.type=materialButton.type='button';switcher.append(serviceButton,materialButton);host.append(switcher);
    var searchWrap=el('label','Buscar atendimento ou material','loja-catalog-search'),search=el('input');search.type='search';search.placeholder='Digite nome, assunto ou descrição';search.setAttribute('aria-label','Buscar atendimentos e materiais');searchWrap.append(search);host.append(searchWrap);search.addEventListener('input',function(){paint()});
    var pane=el('div',null,'loja-catalog-pane');host.append(pane);
    function openMaterialDetail(product){
      var dialog=el('dialog',null,'loja-study-detail');dialog.dataset.tzcKind='estudo';dialog.dataset.tzcKey=String(product.id);dialog.dataset.tzcTitle=product.nome||'Material digital';dialog.setAttribute('aria-label','Detalhes de '+(product.nome||'material'));
      var form=el('div',null,'loja-study-detail-form'),head=el('header',null,'dialog-head'),title=el('h2',product.nome||'Material digital'),closeTop=el('button','×','close');closeTop.type='button';closeTop.setAttribute('aria-label','Fechar detalhes');closeTop.onclick=function(){dialog.close()};head.append(title,closeTop);
      var body=el('div',null,'dialog-body loja-study-detail-body');if(product.imagemUrl){var image=el('img');image.src=product.imagemUrl;image.alt='Capa de '+(product.nome||'material');image.loading='lazy';body.append(image)}body.append(el('span',product.categoria||'Leitura digital','loja-product-category'),el('p',product.descricao||'Material digital em PDF.','loja-study-description'),el('strong',money(product.precoCentavos),'loja-price'));
      var actions=el('div',null,'dialog-actions');var cancel=btn('Fechar',function(){dialog.close()},'secondary'),add=btn(cart.some(function(x){return String(x)===String(product.id)})?'No carrinho':'Adicionar ao carrinho',function(){addToCart(product.id);add.textContent='No carrinho';add.disabled=true},'member-btn');add.classList.add('primary');actions.append(cancel,add);form.append(head,body,actions);dialog.append(form);document.body.append(dialog);dialog.addEventListener('click',function(e){if(e.target===dialog)dialog.close()});dialog.addEventListener('close',function(){dialog.remove()},{once:true});dialog.showModal()
    }
    function paint(){
      if(host!==content())return;
      serviceButton.setAttribute('aria-pressed',String(mode==='atendimentos'));
      materialButton.setAttribute('aria-pressed',String(mode==='materiais'));
      pane.replaceChildren();
      if(mode==='atendimentos'){
        var services=section('Atendimentos espirituais','Escolha um tipo de atendimento para enviar sua solicitação. A equipe entrará em contato para orientar os próximos passos.',pane);
        var query=String(search.value||'').trim().toLocaleLowerCase('pt-BR'),visibleTypes=types.filter(function(item){return !query||[item.nome,item.descricao].join(' ').toLocaleLowerCase('pt-BR').includes(query)});if(!visibleTypes.length){var noServices=el('div',null,'loja-empty');noServices.append(el('strong',types.length?'Nenhum atendimento encontrado':'Atendimentos indisponíveis'),el('span',types.length?'Altere a busca para ver outras opções.':'Novas opções serão divulgadas por aqui.','loja-muted'));services.append(noServices);return}
        var serviceGrid=el('div',null,'loja-products loja-work-grid');
        visibleTypes.forEach(function(item){
          var work=el('article',null,'loja-work-card'),mark=el('span','✦','loja-work-mark'),copy=el('div',null,'loja-work-copy'),title=el('div',null,'loja-work-title');
          title.append(mark,el('h3',item.nome));copy.append(title,el('p',item.descricao||'Solicite uma conversa para receber orientação individual.'));
          var contact=btn('Solicitar atendimento',function(){showInquiryForm(services,types,item.id)},'member-btn');contact.setAttribute('aria-label','Solicitar atendimento: '+item.nome);work.append(copy,contact);serviceGrid.append(work)
        });services.append(serviceGrid);return
      }
      var catalog=section('Livros e materiais digitais','Veja a descrição, confira o valor e adicione o material escolhido ao carrinho.',pane);
      var grid=el('div',null,'loja-products loja-material-grid');
      function drawProducts(){
        var query=String(search.value||'').trim().toLocaleLowerCase('pt-BR'),shown=products.filter(function(p){return !query||[p.nome,p.categoria,p.descricao].join(' ').toLocaleLowerCase('pt-BR').includes(query)});
        grid.replaceChildren();
        if(!shown.length){grid.append(el('p','Nenhum material corresponde à busca.','loja-empty'));return}
        shown.forEach(function(p){
          var card=el('article',null,'loja-product-card'),cover=el('div',null,'loja-card-cover');card.dataset.tzcLinkKind='estudo';card.dataset.tzcLinkKey=String(p.id);card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Abrir detalhes de '+(p.nome||'material'));card.addEventListener('click',function(e){if(e.target.closest('button,a'))return;openMaterialDetail(p)});card.addEventListener('keydown',function(e){if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openMaterialDetail(p)}});
          if(p.imagemUrl){var img=el('img');img.src=p.imagemUrl;img.alt='Capa de '+p.nome;img.loading='lazy';cover.append(img)}
          else{var mark=el('div',null,'loja-book-mark');mark.append(el('span','▤'),el('span','PDF DIGITAL'));cover.append(mark)}
          var body=el('div',null,'loja-product-body');body.append(el('span',p.categoria||'Leitura digital','loja-product-category'),el('h3',p.nome),el('p',p.descricao||'Material digital em PDF.'));
          var buy=el('div',null,'loja-product-buy'),orderButton=btn(cart.some(function(x){return String(x)===String(p.id)})?'No carrinho':'Adicionar ao carrinho',function(){addToCart(p.id)},'member-btn');
          orderButton.dataset.productId=String(p.id);orderButton.addEventListener('click',function(e){e.stopPropagation()});buy.append(el('span',money(p.precoCentavos),'loja-price'),orderButton);body.append(buy);card.append(cover,body);grid.append(card)
        })
      }
      catalog.append(grid);drawProducts()
    }
    paint()
  }
  function showInquiryForm(services,types,selectedId){
    if(services.querySelector('.loja-inquiry'))return;
    if(!types||!types.length){say('Não há tipos de atendimento disponíveis no momento.','warning');return}
    var form=el('form',null,'loja-editor loja-inquiry'),grid=el('div',null,'loja-form-grid'),name=el('input'),email=el('input'),phone=el('input'),type=el('select'),details=el('textarea'),consentWrap=el('label',null,'loja-consent'),consent=el('input'),status=el('p','','loja-status-line'),actions=el('div',null,'loja-editor-actions');
    name.type='text';name.autocomplete='name';name.maxLength=120;name.required=true;name.placeholder='Seu nome';
    email.type='email';email.autocomplete='email';email.maxLength=254;email.required=true;email.placeholder='voce@exemplo.com';
    phone.type='tel';phone.autocomplete='tel';phone.maxLength=30;phone.required=true;phone.placeholder='WhatsApp com DDD';
    types.forEach(function(x){var o=el('option',x.nome);o.value=String(x.id);type.append(o)});if(selectedId)type.value=String(selectedId);
    details.maxLength=1500;details.required=true;details.placeholder='Conte, com suas palavras, o que você procura. Não envie dados de cartão, senhas ou documentos.';
    consent.type='checkbox';consent.required=true;consentWrap.append(consent,el('span','Autorizo o envio destes dados e da descrição somente ao Pai e à Mãe de Santo da Tenda de Zé Cigano, para que entrem em contato sobre meu atendimento.'));
    function field(label,input,cls){var l=el('label',label,'loja-field'+(cls?' '+cls:''));l.append(input);return l}
    grid.append(field('Nome',name,'wide'),field('E-mail',email,'wide'),field('WhatsApp',phone,'wide'),field('Tipo de atendimento',type,'wide'),field('O que você procura?',details,'full'));
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    var send=btn('Enviar solicitação',function(){},'member-btn'),cancel=btn('Cancelar',function(){form.remove()},'secondary');send.type='submit';actions.append(send,cancel);
    form.append(grid,consentWrap,status,actions);services.append(form);name.focus();
    form.addEventListener('submit',function(e){e.preventDefault();if(!consent.checked){status.textContent='Autorize o uso dos dados para que a solicitação seja enviada.';return}send.disabled=true;send.textContent='Enviando…';status.textContent='Enviando sua solicitação à equipe…';
      invoke('solicitarAtendimentoLojaV02',[name.value.trim(),email.value.trim().toLowerCase(),phone.value.trim(),type.value,details.value.trim(),'true'],function(r){
        send.disabled=false;send.textContent='Enviar solicitação';
        if(!r.ok)return;
        form.replaceChildren(el('strong','Solicitação recebida'),el('p',r.mensagem||'O Pai e a Mãe de Santo entrarão em contato para orientar os próximos passos. Nenhum agendamento foi confirmado.','loja-muted'));
        say(r.mensagem||'Solicitação enviada à equipe.','success')
      })
    })
  }
  function persistCart(){try{sessionStorage.setItem('tzc-loja-carrinho',JSON.stringify(cart))}catch(ignore){}updateCartTab()}
  function updateCartTab(){if(cartTabButton){cartTabButton.textContent='Carrinho'+(cart.length?' ('+cart.length+')':'');cartTabButton.hidden=false;cartTabButton.setAttribute('aria-label','Carrinho com '+cart.length+' produto(s)')}}
  function addToCart(productId){if(!products.some(function(p){return String(p.id)===String(productId)})){say('Este produto não está disponível no catálogo.','error');return}if(!cart.some(function(x){return String(x)===String(productId)})){cart.push(String(productId));persistCart();say('Produto adicionado ao carrinho.','success')}else say('Este produto já está no carrinho.','success');var p=content();if(p)p.querySelectorAll('.loja-product-card button').forEach(function(b){if(b.dataset.productId===String(productId))b.textContent='No carrinho'})}
  function showCart(){if(!content())return;content().replaceChildren();say('');var s=section('Seu carrinho','Confira os materiais escolhidos antes de informar seus dados e concluir o pagamento.');if(!cart.length){var empty=el('div',null,'loja-empty');empty.append(el('strong','Seu carrinho está vazio'),el('span','Adicione um material para iniciar a compra.','loja-muted'),btn('Ver produtos',function(){current='catalogo';if(catalogTabButton)catalogTabButton.click()},'member-btn'));s.append(empty);return}var panel=el('div',null,'loja-cart-panel'),total=0;cart.slice().forEach(function(id){var p=products.find(function(x){return String(x.id)===String(id)});if(!p)return;total+=Number(p.precoCentavos||0);var line=el('div',null,'loja-cart-line');line.append(el('strong',p.nome),el('span',money(p.precoCentavos),'loja-price'),btn('Remover',function(){cart=cart.filter(function(x){return String(x)!==String(id)});persistCart();if(!cart.length){current='catalogo';markCurrentTab();loadCatalog()}else showCart()},'secondary'));line.lastChild.classList.add('loja-remove');panel.append(line)});panel.append(el('div','Total: '+money(total),'loja-cart-total'));var actions=el('div',null,'loja-editor-actions');actions.append(btn('Continuar comprando',function(){current='catalogo';if(catalogTabButton)catalogTabButton.click()},'secondary'),btn('Ir para pagamento',showCheckout,'member-btn'));panel.append(actions);s.append(panel)}
  function buyerCheckoutMessage(productId){var p=products.find(function(x){return String(x.id)===String(productId)}),name=p&&p.nome?'“'+p.nome+'”':'produto escolhido';return 'Para concluir a compra de '+name+', informe seu cadastro de comprador.'}
  function openBuyerCheckout(productId,message){pendingProductId=String(productId||pendingProductId||'');current='pedidos';if(catalogTabButton)catalogTabButton.setAttribute('aria-pressed','false');if(ordersTabButton)ordersTabButton.setAttribute('aria-pressed','true');showBuyerAccess(message||buyerCheckoutMessage(pendingProductId))}
  function createOrder(productId){var token=activeToken();if(!token){openBuyerCheckout(productId);return}var button=null;content().querySelectorAll('.loja-product-card button').forEach(function(b){if(b.dataset.productId===String(productId))button=b});if(button){button.disabled=true;button.textContent='Criando pedido…'}say('Criando seu pedido…');invoke('criarPedidoLoja',[token,productId],function(out){if(!out.ok){var failure=String(out.mensagem||'');if(!api.user()&&/expir|sess[aã]o|token|acesso.*(nov|novamente)|entr(e|ar).*novamente|não encontrado/i.test(failure)){buyerToken='';try{sessionStorage.removeItem('tzc-loja-visitante-token')}catch(ignore){}openBuyerCheckout(productId);return}if(button){button.disabled=false;button.textContent='Comprar'}return}if(button){button.disabled=false;button.textContent='Comprar'}pendingProductId='';say(out.jaExistia?'Este material já está nos seus pedidos.':'Pedido criado. Envie o comprovante em “Meus pedidos”.','success');current='pedidos';if(ordersTabButton)ordersTabButton.click();else loadOrders()})}
  function showCheckout(){
    if(!cart.length){say('Adicione ao menos um produto ao carrinho.','error');return}
    current='checkout';markCurrentTab();var host=content();if(!host)return;host.replaceChildren();say('');
    var heading=section('Dados para concluir a compra','Preencha seus dados uma vez. Ao continuar, o pedido e o Pix aparecem na mesma tela; crie seu cadastro para acompanhar compras em “Meus pedidos”.',host);
    var form=el('form',null,'loja-editor loja-access-panel loja-checkout'),grid=el('div',null,'loja-form-grid'),name=el('input'),email=el('input'),phone=el('input');
    name.type='text';name.autocomplete='name';name.maxLength=120;name.required=true;name.placeholder='Seu nome completo';email.type='email';email.autocomplete='email';email.maxLength=254;email.required=true;email.placeholder='voce@exemplo.com';phone.type='tel';phone.autocomplete='tel';phone.maxLength=30;phone.required=true;phone.placeholder='(31) 99999-9999';
    var user=api.user()||{};try{var saved=JSON.parse(sessionStorage.getItem('tzc-loja-checkout')||'{}');name.value=user.nome||user.Nome||buyerName||saved.nome||'';email.value=user.email||user.Email||buyerEmail||saved.email||'';phone.value=user.telefone||user.Telefone||saved.telefone||''}catch(ignore){}
    function field(label,input,cls){var l=el('label',label,'loja-field'+(cls?' '+cls:''));l.append(input);return l}
    grid.append(field('Nome completo',name,'wide'),field('E-mail',email,'wide'),field('WhatsApp com DDD',phone,'wide'));
    var consent=document.createElement('label');consent.className='loja-consent';var accept=el('input');accept.type='checkbox';accept.required=true;consent.append(accept,el('span','Autorizo o uso dos meus dados para processar esta compra e enviar atualizações do pedido.'));
    var news=document.createElement('label');news.className='loja-consent';var newsCheck=el('input');newsCheck.type='checkbox';news.append(newsCheck,el('span','Quero receber novidades por e-mail.'));
    var status=el('p','','loja-status-line');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    var member=btn('Entrar como membro',function(){saveDraft();api.login(email.value.trim())},'secondary');member.hidden=true;
    var actions=el('div',null,'loja-access-actions'),submit=btn('Ir para pagamento Pix',function(){},'member-btn');submit.type='submit';actions.append(submit,member);form.append(grid,consent,news,status,actions);heading.append(form);
    function saveDraft(){buyerName=name.value.trim();buyerEmail=email.value.trim().toLowerCase();try{sessionStorage.setItem('tzc-loja-checkout',JSON.stringify({nome:buyerName,email:buyerEmail,telefone:phone.value.trim()}))}catch(ignore){}}
    form.addEventListener('submit',function(e){e.preventDefault();member.hidden=true;if(!name.value.trim()||!phone.value.trim()||!email.checkValidity()||!accept.checked){status.textContent='Confira nome, e-mail, WhatsApp e autorização para continuar.';return}saveDraft();submit.disabled=true;submit.textContent='Preparando pedido e Pix…';status.textContent='Salvando seus dados e preparando o pagamento Pix…';
      var args=[name.value.trim(),email.value.trim().toLowerCase(),phone.value.trim(),accept.checked?'true':'false',newsCheck.checked?'true':'false',JSON.stringify(cart.slice())];
      if(api.user()){createCartOrder(activeToken());return}
      invoke('criarPedidoVisitanteLoja',args,function(out){submit.disabled=false;submit.textContent='Ir para pagamento Pix';if(!out||!out.ok){status.textContent=(out&&out.mensagem)||'Não foi possível preparar o pedido. Confira os dados e tente novamente.';if(out&&out.codigo==='MEMBRO')member.hidden=false;return}buyerName=name.value.trim();buyerEmail=email.value.trim().toLowerCase();try{sessionStorage.setItem('tzc-loja-visitante-email',buyerEmail)}catch(ignore){}cart=[];persistCart();showPixOrder(out)})
    })
  }
  function createCartOrder(token){var ids=cart.slice();if(!token||!ids.length){say('O carrinho ou o acesso expirou. Confira seus dados e tente novamente.','error');return}say('Criando seu pedido e preparando o Pix…');content().replaceChildren(el('p','Criando pedido e preparando o pagamento…','loja-muted'));invoke('criarPedidoCarrinhoLoja',[token,JSON.stringify(ids)],function(out){if(!out.ok){content().replaceChildren();say(out.mensagem||'Não foi possível criar o pedido.','error');if(/expir|sess[aã]o|token|acesso.*(nov|novamente)|entr(e|ar).*novamente/i.test(String(out.mensagem||''))&&!api.user()){buyerToken='';try{sessionStorage.removeItem('tzc-loja-visitante-token')}catch(ignore){}showCheckout()}return}cart=[];persistCart();showPixOrder(out)})}
  function showPixOrder(order){
    current='pix';markCurrentTab();content().replaceChildren();say('');
    var status=String(order.status||'Aguardando pagamento'),canAttach=status!=='Pago'&&status!=='Em conferência';
    var s=section(order.jaExistia?'Pagamento do pedido':'Pedido criado',(order.numeroPedido?'Pedido '+order.numeroPedido:'Pedido '+String(order.id||''))+' · '+status+'. Pague pelo Pix e envie o comprovante nesta tela. A liberação depende da conferência de outra pessoa autorizada.',content()),panel=el('div',null,'loja-pix-panel');
    panel.append(el('strong','Total: '+money(order.valorCentavos),'loja-price'));
    if(order.pixCopiaECola){var qr=el('div',null);qr.setAttribute('aria-label','QR Code Pix do pedido');panel.append(qr);renderPixQr(qr,order.pixCopiaECola);var label=el('label','Pix copia e cola','loja-field full'),code=el('textarea',order.pixCopiaECola,'loja-pix-code');code.readOnly=true;label.append(code);panel.append(label,btn('Copiar código Pix',function(){copyText(order.pixCopiaECola,'Código Pix copiado. Abra o aplicativo do banco e escolha Pix copia e cola.')},'member-btn'))}
    else panel.append(el('p',order.pixMensagem||'A chave Pix da loja ainda não está configurada. Peça os dados ao responsável antes de pagar.','loja-error'));
    panel.append(el('p','O pedido só será confirmado após a análise do comprovante por outra pessoa autorizada.','loja-muted'));
    if(canAttach){
      var proof=el('section',null,'loja-editor'),head=el('header',null,'loja-editor-head');
      head.append(el('h3','Já pagou? Anexe o comprovante'),el('p','Informe a data do pagamento e selecione o arquivo. Aceitamos PDF, PNG ou JPG de até 2 MB.','loja-muted'));proof.append(head);
      if(activeToken())proof.append(paymentForm(order,activeToken(),function(){loadOrderForProof(order.id)}));
      else{proof.append(el('p','Para proteger seus pedidos, entre com seu cadastro de comprador. O pedido ficará vinculado a esse e-mail; depois você poderá anexar o comprovante e acompanhar o status em Meus pedidos.','loja-muted'),btn('Entrar para anexar comprovante',function(){pendingOrderId=String(order.id||'');try{sessionStorage.setItem('tzc-loja-pending-order-id',pendingOrderId)}catch(ignore){}buyerEmail=buyerEmail||sessionStorage.getItem('tzc-loja-visitante-email')||'';current='pedidos';showBuyerAccess('Entre com o cadastro usado nesta compra. O pedido reabrirá aqui para anexar o comprovante.')},'member-btn'))}
      s.append(proof)
    }else s.append(el('p',status==='Em conferência'?'Comprovante recebido. Aguardando a análise de outra pessoa autorizada.':'Pagamento confirmado. O material fica disponível em Meus pedidos.','loja-success'));
    var actions=el('div',null,'loja-editor-actions');actions.append(btn('Ir para Meus pedidos',function(){if(ordersTabButton)setOrdersTab();else loadOrders()},'secondary'),btn('Voltar à loja',function(){current='catalogo';if(catalogTabButton)catalogTabButton.click()},'secondary'));panel.append(actions);s.append(panel)
  }
  function renderPixQr(host,payload){if(window.QRCode){try{new window.QRCode(host,{text:String(payload),width:240,height:240,colorDark:'#000000',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M});return}catch(e){}}host.replaceChildren(el('p','O QR não carregou neste navegador. Use o código Pix copia e cola abaixo.','loja-muted'));var script=document.getElementById('tzc-qrcode-local');if(script){script.addEventListener('load',function(){host.replaceChildren();renderPixQr(host,payload)},{once:true});return}script=document.createElement('script');script.id='tzc-qrcode-local';script.src=new URL('./qrcode.js',location.href).href;script.onload=function(){host.replaceChildren();renderPixQr(host,payload)};script.onerror=function(){host.replaceChildren(el('p','Use o código Pix copia e cola abaixo.','loja-muted'))};document.head.append(script)}
  function copyText(value,success){function ok(){say(success,'success')}if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(String(value)).then(ok,function(){say('Não foi possível copiar automaticamente; selecione e copie o código.','error')});else{var ta=el('textarea');ta.value=String(value);ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){say('Não foi possível copiar automaticamente; selecione e copie o código.','error')}ta.remove()}}
  function setOrdersTab(){if(ordersTabButton)ordersTabButton.click()}
  function showBuyerAccess(accessMessage){
    try{buyerEmail=buyerEmail||sessionStorage.getItem('tzc-loja-visitante-email')||'';pendingOrderId=pendingOrderId||sessionStorage.getItem('tzc-loja-pending-order-id')||''}catch(ignore){}
    if(!content())return;
    content().replaceChildren();say('');
    var s=section('Acesse suas compras','Crie seu cadastro ou entre com e-mail e senha. Para vincular um pedido, use o nome e o WhatsApp informados na compra.');
    var box=el('form',null,'loja-editor loja-access-panel');box.noValidate=true;
    var switcher=el('div',null,'loja-access-actions');
    var loginMode=true,registerBtn=btn('Criar cadastro',function(){setMode(false)},'secondary'),loginBtn=btn('Já tenho cadastro',function(){setMode(true)},'member-btn');
    switcher.append(loginBtn,registerBtn);
    var grid=el('div',null,'loja-form-grid'),name=el('input'),email=el('input'),phone=el('input'),password=el('input'),confirm=el('input');
    function field(label,input,cls){var l=el('label',label,'loja-field'+(cls?' '+cls:''));l.append(input);return l}
    var checkoutDraft={};try{checkoutDraft=JSON.parse(sessionStorage.getItem('tzc-loja-checkout')||'{}')}catch(ignore){}
    name.autocomplete='name';name.maxLength=120;name.placeholder='Seu nome completo';name.value=buyerName||checkoutDraft.nome||'';
    email.type='email';email.autocomplete='email';email.maxLength=254;email.required=true;email.placeholder='voce@exemplo.com';email.value=buyerEmail||checkoutDraft.email||'';
    phone.type='tel';phone.autocomplete='tel';phone.maxLength=30;phone.placeholder='WhatsApp com DDD';phone.value=checkoutDraft.telefone||'';
    password.type='password';password.inputMode='numeric';password.pattern='[0-9]{4}';password.autocomplete='current-password';password.minLength=4;password.maxLength=4;password.required=true;password.placeholder='PIN de 4 dígitos';
    confirm.type='password';confirm.inputMode='numeric';confirm.pattern='[0-9]{4}';confirm.autocomplete='new-password';confirm.minLength=4;confirm.maxLength=4;confirm.placeholder='Repita o PIN de 4 dígitos';
    var nameField=field('Nome completo',name,'wide'),emailField=field('E-mail',email,'wide'),phoneField=field('WhatsApp com DDD',phone,'wide'),passField=field('Senha',password,'wide'),confirmField=field('Confirme a senha',confirm,'wide');
    grid.append(nameField,emailField,phoneField,passField,confirmField);
    var status=el('p',accessMessage||'Use o mesmo e-mail informado na compra.','loja-status-line');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    var submit=btn('Entrar',function(){},'member-btn');submit.type='submit';
    var member=btn('Entrar como membro',function(){api.login(email.value.trim())},'secondary');member.hidden=true;
    box.append(switcher,grid,status,submit,member);s.append(box);
    function setMode(isLogin){loginMode=!!isLogin;loginBtn.className=loginMode?'member-btn':'secondary';registerBtn.className=loginMode?'secondary':'member-btn';nameField.hidden=loginMode;phoneField.hidden=loginMode;confirmField.hidden=loginMode;password.autocomplete=loginMode?'current-password':'new-password';submit.textContent=loginMode?'Entrar':'Criar cadastro';status.textContent=loginMode?'Informe seu e-mail e PIN para consultar as compras.':'Informe seus dados e crie um PIN de 4 números para acessar suas compras.';member.hidden=true}
    function finishAccess(r,mail){
      if(!r||!r.ok){submit.disabled=false;submit.textContent=loginMode?'Entrar':'Criar cadastro';status.textContent=r&&r.mensagem||'Não foi possível concluir o acesso.';if(r&&r.codigo==='MEMBRO'){member.hidden=false;status.textContent=r.mensagem||'Este e-mail pertence a um membro. Entre pela conta de membro.'}return}
      if(!r.token){submit.disabled=false;submit.textContent=loginMode?'Entrar':'Criar cadastro';status.textContent='O acesso não foi concluído. Tente novamente.';return}
      buyerToken=String(r.token);buyerName=(r.usuario&&r.usuario.nome)||name.value.trim();buyerEmail=mail;
      try{sessionStorage.setItem('tzc-loja-visitante-token',buyerToken);sessionStorage.setItem('tzc-loja-visitor-orders-active','true');sessionStorage.setItem('tzc-loja-visitante-email',mail)}catch(ignore){}
      status.textContent='Acesso confirmado. Carregando suas compras…';submit.disabled=true;submit.textContent='Carregando…';
      try{if(pendingOrderId)loadOrderForProof(pendingOrderId);else if(pendingProductId){var id=pendingProductId;createOrder(id)}else loadOrders()}catch(error){var panel=content();if(panel)panel.replaceChildren(loadError('Não foi possível abrir suas compras. Tente novamente.',function(){loadOrders()}));say('Acesso confirmado, mas a lista não carregou.','error')}
    }
    function makeSalt(){var a=new Uint8Array(16);crypto.getRandomValues(a);return bytesToB64(a)}
    function bytesToB64(bytes){var bin='';for(var i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
    function derive(pass,salt,iterations){var raw=atob(String(salt).replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((String(salt).length+3)%4));var material=Uint8Array.from(raw,function(c){return c.charCodeAt(0)});return crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveBits']).then(function(key){return crypto.subtle.deriveBits({name:'PBKDF2',salt:material,iterations:iterations,hash:'SHA-256'},key,256)}).then(function(bits){return new Uint8Array(bits)})}
    function proofFor(keyBytes,nonce){return crypto.subtle.importKey('raw',keyBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']).then(function(key){return crypto.subtle.sign('HMAC',key,new TextEncoder().encode(nonce))}).then(function(sig){return bytesToB64(new Uint8Array(sig))})}
    box.addEventListener('submit',function(e){
      e.preventDefault();member.hidden=true;
      var mail=email.value.trim().toLowerCase();
      if(!email.checkValidity()){email.focus();status.textContent='Informe um e-mail válido.';return}
      if(!/^[0-9]{4}$/.test(password.value)){password.focus();status.textContent='Informe um PIN com exatamente 4 números.';return}
      if(!window.crypto||!crypto.subtle){status.textContent='Este navegador não oferece criptografia segura. Atualize o navegador ou tente outro.';return}
      submit.disabled=true;submit.textContent=loginMode?'Verificando…':'Criando cadastro…';status.textContent=loginMode?'Verificando seu acesso…':'Protegendo seu PIN e criando seu cadastro…';
      if(!loginMode){
        if(name.value.trim().length<2||phone.value.replace(/\D/g,'').length<8){submit.disabled=false;submit.textContent='Criar cadastro';status.textContent='Informe nome completo e WhatsApp com DDD.';return}
        if(password.value!==confirm.value){submit.disabled=false;submit.textContent='Criar cadastro';status.textContent='Os PINs não coincidem.';confirm.focus();return}
        var salt=makeSalt(),iterations=120000;
        derive(password.value,salt,iterations).then(function(keyBytes){var verifier=bytesToB64(keyBytes);invoke('criarAcessoCompradorLoja',[mail,name.value.trim(),phone.value.trim(),salt,verifier],function(r){finishAccess(r,mail)})}).catch(function(){submit.disabled=false;submit.textContent='Criar cadastro';status.textContent='Não foi possível preparar a senha neste navegador. Tente novamente.'});
        return
      }
      invoke('desafioAcessoCompradorLoja',[mail],function(challenge){
        if(!challenge||!challenge.ok||!challenge.salt){submit.disabled=false;submit.textContent='Entrar';status.textContent=challenge&&challenge.mensagem||'Não foi possível iniciar o acesso.';return}
        derive(password.value,challenge.salt,Number(challenge.iterations)||120000).then(function(keyBytes){return proofFor(keyBytes,challenge.nonce)}).then(function(proof){invoke('entrarCompradorLoja',[mail,challenge.challengeId,proof],function(r){finishAccess(r,mail)})}).catch(function(){submit.disabled=false;submit.textContent='Entrar';status.textContent='Não foi possível verificar a senha neste navegador. Tente novamente.'})
      })
    });
    setMode(true);
  }
  function loadOrderForProof(orderId){
    var token=activeToken();
    if(!token){pendingOrderId=String(orderId||'');try{sessionStorage.setItem('tzc-loja-pending-order-id',pendingOrderId)}catch(ignore){}showBuyerAccess('Confirme o e-mail usado na compra para abrir este pedido e anexar o comprovante.');return}
    content().replaceChildren(el('p','Abrindo seu pedido…','loja-muted'));say('Localizando pedido pelo e-mail confirmado…');
    invoke('listarMeusPedidosLoja',[token],function(r){
      if(!r.ok){var failure=String(r.mensagem||'');if(!api.user()&&/expir|sess[aã]o|token|acesso.*(nov|novamente)|entr(e|ar).*novamente|não encontrado/i.test(failure)){buyerToken='';try{sessionStorage.removeItem('tzc-loja-visitante-token')}catch(ignore){}pendingOrderId=String(orderId||'');showBuyerAccess('Seu acesso expirou. Confirme o e-mail da compra novamente para anexar o comprovante.');return}content().replaceChildren(loadError(failure||'Não foi possível localizar o pedido.',function(){loadOrderForProof(orderId)}));return}
      var order=(r.pedidos||[]).find(function(x){return String(x.id)===String(orderId)});
      if(!order){content().replaceChildren(loadError('Este pedido não apareceu na lista vinculada ao e-mail confirmado. Confira se você usou o mesmo e-mail da compra.',function(){loadOrders()}));return}
      pendingOrderId='';try{sessionStorage.removeItem('tzc-loja-pending-order-id')}catch(ignore){}showPixOrder(order)
    })
  }
  function loadOrders(successMessage){var token=activeToken();if(!token){showBuyerAccess(pendingProductId?buyerCheckoutMessage(pendingProductId):'Acesse com seu e-mail para acompanhar os pedidos.');return}content().replaceChildren(el('p','Carregando pedidos…','loja-muted'));say('Consultando pedidos…');invoke('listarMeusPedidosLoja',[token],function(r){if(!r.ok){var failure=String(r.mensagem||'');if(/expir|sess[aã]o|token|acesso.*(nov|novamente)|entr(e|ar).*novamente|não encontrado/i.test(failure)&&!api.user()){buyerToken='';try{sessionStorage.removeItem('tzc-loja-visitante-token')}catch(ignore){}showBuyerAccess(pendingProductId?buyerCheckoutMessage(pendingProductId):'Seu acesso às compras expirou. Entre novamente com seu e-mail e senha para continuar.');return}content().replaceChildren(loadError(failure||'Não foi possível carregar seus pedidos.',loadOrders));return}orders=r.pedidos||[];content().replaceChildren();say(orders.length?'Pedidos carregados.':'Você ainda não tem pedidos.');if(successMessage)say(successMessage,'success');var s=section('Meus pedidos','O comprovante será analisado por outro responsável.');if(!orders.length){s.append(el('p','Seus pedidos aparecerão aqui.','loja-muted'));return}var t=table(['Pedido','Produto(s)','Valor','Situação','Pagamento / entrega']);t.wrap.classList.add('loja-orders-table-wrap');orders.forEach(function(o){var tr=el('tr'),items=(o.itens||[]),names=items.map(function(i){return i.nome}).join(', ')||'—',st=el('span',o.status,'loja-status'),actions=el('div',null,'loja-order-actions');if(o.pixCopiaECola)actions.append(btn('Ver QR Pix',function(){showPixOrder(o)},'secondary'));if(o.status!=='Pago'&&o.status!=='Em conferência'){var form=paymentForm(o);actions.append(form)}else if(o.status==='Em conferência')actions.append(el('span','Aguardando validação de outra pessoa.','loja-muted'));items.forEach(function(i){if(i.podeBaixar)actions.append(btn('Baixar '+i.nome,function(){downloadItem(i.id)},'member-btn'))});if(o.pagamento&&o.pagamento.status==='Pagamento recusado')actions.append(el('p','Comprovante devolvido: '+(o.pagamento.motivo||'revise e envie novamente.'),'loja-error'));var idCell=el('td',o.numeroPedido?'Pedido '+o.numeroPedido:o.id),namesCell=el('td',names),valueCell=el('td',money(o.valorCentavos),'loja-price'),statusCell=el('td'),actionsCell=el('td');statusCell.append(st);actionsCell.append(actions);tr.append(idCell,namesCell,valueCell,statusCell,actionsCell);t.body.append(tr)});s.append(t.wrap)})
  }
  function arquivoParaBase64(arquivo, concluido, falhou){
    var finalizado=false;
    function erro(){if(!finalizado){finalizado=true;falhou()}}
    function converter(buffer){
      try{
        var bytes=new Uint8Array(buffer),binario='',bloco=32768;
        for(var i=0;i<bytes.length;i+=bloco)binario+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+bloco,bytes.length)));
        if(!finalizado){finalizado=true;concluido(btoa(binario))}
      }catch(e){erro()}
    }
    function viaFileReader(){
      try{
        var leitor=new FileReader();
        leitor.onerror=erro;
        leitor.onload=function(){if(leitor.result instanceof ArrayBuffer)converter(leitor.result);else erro()};
        leitor.readAsArrayBuffer(arquivo)
      }catch(e){erro()}
    }
    try{
      if(arquivo&&typeof arquivo.arrayBuffer==='function')arquivo.arrayBuffer().then(converter,viaFileReader);
      else viaFileReader()
    }catch(e){viaFileReader()}
  }
  function prepararComprovante(arquivo,pronto){
    function original(){pronto({blob:arquivo,tipo:arquivo.type,nome:arquivo.name})}
    if(!arquivo||arquivo.type.indexOf('image/')!==0||arquivo.size<600*1024||typeof window.createImageBitmap!=='function'){original();return}
    window.createImageBitmap(arquivo).then(function(img){
      try{
        var limite=1600,escala=Math.min(1,limite/Math.max(img.width,img.height)),canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.width*escala));canvas.height=Math.max(1,Math.round(img.height*escala));
        var ctx=canvas.getContext('2d');if(!ctx){if(img.close)img.close();original();return}
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
        canvas.toBlob(function(blob){
          if(img.close)img.close();
          if(!blob||blob.size>=arquivo.size){original();return}
          pronto({blob:blob,tipo:'image/jpeg',nome:String(arquivo.name||'comprovante').replace(/\.[^.]+$/,'')+'.jpg'})
        },'image/jpeg',0.84)
      }catch(e){if(img.close)img.close();original()}
    }).catch(original)
  }
  function paymentForm(o,token,afterDone){
    var wrap=el('div',null,'loja-form-row'),dateLabel=el('label','Data do pagamento'),date=el('input'),formLabel=el('label','Forma'),form=el('select'),fileLabel=el('label','Comprovante (PDF, PNG ou JPG · até 2 MB)'),file=el('input'),submit=btn('Enviar comprovante',submitProof,'member-btn'),status=el('p','Selecione o comprovante e toque em “Enviar comprovante”.','loja-status-line');
    date.type='date';date.required=true;var hoje=new Date();date.value=hoje.getFullYear()+'-'+('0'+(hoje.getMonth()+1)).slice(-2)+'-'+('0'+hoje.getDate()).slice(-2);dateLabel.append(date);
    [['Pix','Pix'],['Transferência','Transferência'],['Dinheiro','Dinheiro']].forEach(function(x){var op=el('option',x[0]);op.value=x[1];form.append(op)});
    formLabel.append(form);file.type='file';file.accept='.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';fileLabel.append(file);
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    wrap.append(dateLabel,formLabel,fileLabel,submit,status);
    function feedback(message,type){status.textContent=message;status.className='loja-status-line'+(type?' '+type:'')}
    function busy(on){submit.disabled=on;date.disabled=on;form.disabled=on;file.disabled=on;submit.textContent=on?'Enviando…':'Enviar comprovante'}
    file.addEventListener('change',function(){var selected=file.files&&file.files[0];feedback(selected?'Arquivo selecionado: '+selected.name+'. Enviaremos quando você tocar no botão.':'Selecione o comprovante e toque em “Enviar comprovante”.')});
    function submitProof(){
      if(submit.disabled)return;
      var f=file.files&&file.files[0];
      if(!date.value||!f){feedback('Informe a data do pagamento e selecione o comprovante.','loja-error');say('Informe a data e selecione o comprovante.','error');return}
      if(f.size>2*1024*1024||['application/pdf','image/png','image/jpeg'].indexOf(f.type)<0){feedback('O comprovante deve ser PDF, PNG ou JPG de até 2 MB.','loja-error');say('O comprovante deve ser PDF, PNG ou JPG de até 2 MB.','error');return}
      var proofToken=token||activeToken();
      if(!proofToken){feedback('Confirme o e-mail do comprador antes de enviar o comprovante.','loja-error');say('Confirme o e-mail do comprador antes de enviar o comprovante.','error');return}
      busy(true);feedback('Enviando para o sistema. Aguarde aqui; o pedido só será enviado uma vez.');say('Enviando comprovante com segurança…');
      var timer=window.setTimeout(function(){feedback('O envio ainda está sendo processado. Não toque novamente; confira se o pedido muda para “Em conferência”.','')},12000);
      function finish(){window.clearTimeout(timer);busy(false)}
      feedback('Preparando o comprovante…');
      prepararComprovante(f,function(arquivoPronto){
      arquivoParaBase64(arquivoPronto.blob,function(b64){
        feedback('Enviando comprovante. Aguarde aqui; o pedido só será enviado uma vez.');
        invoke('enviarComprovanteLoja',[proofToken,o.id,date.value,form.value,arquivoPronto.tipo,arquivoPronto.nome,b64],function(r){
          finish();
          if(!r||!r.ok){var message=r&&r.mensagem||'Não foi possível enviar o comprovante. Confira se o pedido mudou para “Em conferência” antes de tentar novamente.';feedback('Não foi enviado: '+message,'loja-error');say(message,'error');return}
          var message=r.mensagem||'Comprovante enviado. O pedido aguarda validação.';
          feedback(message,'loja-success');say(message,r.avisoResponsaveis==='Falhou'?'warning':'success');
          if(afterDone)afterDone();else loadOrders(message)
        })
      },function(){finish();feedback('Não foi possível ler o arquivo. Selecione o comprovante novamente.','loja-error');say('Não foi possível ler o arquivo. Selecione o comprovante novamente.','error')})
      })
    }
    return wrap
  }
  function downloadItem(id){invoke('baixarProdutoLoja',[ordersToken(),id],function(r){if(!r.ok)return;var raw=atob(r.base64),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);var blob=new Blob([bytes],{type:r.mimeType||'application/pdf'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=r.nome||'material.pdf';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);say('Download autorizado para este pedido.','success')})}
  function loadManagement(){
    if(!api.user()){api.login();return}
    content().replaceChildren(el('p','Abrindo a gestão da Loja…','loja-muted'));say('Carregando seus produtos…');
    invoke('listarProdutosGestaoLoja',[api.token()],function(r){
      if(!r.ok){content().replaceChildren(loadError('Não foi possível abrir a gestão da Loja.',loadManagement));return}
      content().replaceChildren();say('');
      var page=section('Cadastro de Materiais e Atendimentos','Organize os materiais e as opções de atendimento da vitrine.');
      var tabs=el('div',null,'loja-manage-tabs'),pane=el('div',null,'loja-manage-pane');
      var productsTab=btn('Materiais digitais',showProducts,'member-btn'),typesTab=btn('Atendimentos',showTypes,'secondary');
      tabs.append(productsTab,typesTab);page.append(tabs,pane);
      var existing=(r.produtos||[]).slice();
      function selectTab(which){productsTab.className=which==='produtos'?'member-btn':'secondary';typesTab.className=which==='tipos'?'member-btn':'secondary';productsTab.setAttribute('aria-pressed',String(which==='produtos'));typesTab.setAttribute('aria-pressed',String(which==='tipos'))}
      function showProducts(){selectTab('produtos');renderProducts()}
      function showTypes(){selectTab('tipos');loadTypeManagement(pane)}
      function renderProducts(){
        pane.replaceChildren();
        var sectionProducts=section('Materiais digitais','',pane);
        var toolbar=el('div',null,'loja-manage-toolbar'),add=btn('＋ Novo produto',function(){openProductEditor(null)},'member-btn');
        toolbar.append(add);sectionProducts.append(toolbar);
        var editorSlot=el('div',null,'loja-editor-slot');sectionProducts.append(editorSlot);
        if(!existing.length){var empty=el('div',null,'loja-empty');empty.append(el('strong','Nenhum produto cadastrado'),el('span','Cadastre um PDF para publicar o primeiro material.','loja-muted'));sectionProducts.append(empty);return}
        var t=table(['Produto','Categoria','Preço']);t.wrap.querySelector('table').classList.add('loja-table-products');
        existing.forEach(function(p){
          var tr=el('tr');tr.className='loja-clickable-row';tr.tabIndex=0;tr.setAttribute('aria-label','Editar produto '+String(p.nome||''));
          tr.addEventListener('click',function(){openProductEditor(p)});
          tr.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openProductEditor(p)}});
          tr.append(el('td',p.nome||'—'),el('td',p.categoria||'—'),el('td',money(p.precoCentavos),'loja-price'));t.body.append(tr)
        });
        sectionProducts.append(t.wrap);
        function openProductEditor(item){
          editorSlot.replaceChildren();
          var editing=!!item,editor=el('section',null,'loja-editor'),head=el('header',null,'loja-editor-head');
          head.append(el('h3',editing?'Editar produto':'Novo produto digital'));
          if(editing)head.append(el('p','Situação atual: '+String(item.status||'Rascunho'),'loja-muted'));
          var grid=el('div',null,'loja-form-grid'),name=el('input'),cat=el('input'),desc=el('textarea'),price=el('input'),file=el('input');
          name.placeholder='Ex.: Livro de estudos da Umbanda';name.maxLength=120;name.required=true;name.value=item&&item.nome||'';
          cat.placeholder='Ex.: Estudos';cat.maxLength=60;cat.value=item&&item.categoria||'';
          desc.placeholder='Descrição do material';desc.maxLength=2000;desc.value=item&&item.descricao||'';
          price.type='number';price.min='0.01';price.step='0.01';price.placeholder='0,00';price.required=true;price.value=item?(Number(item.precoCentavos||0)/100).toFixed(2):'';
          file.type='file';file.accept='.pdf,application/pdf';file.required=!editing;
          function field(label,input,cls){var f=el('label',label,'loja-field'+(cls?' '+cls:''));f.append(input);return f}
          grid.append(field('Nome do produto',name,'wide'),field('Categoria',cat),field('Preço (R$)',price),field('Descrição',desc,'full'));
          var pdfField=field('Arquivo em PDF',file,'full');pdfField.append(el('span',editing?'Selecione outro PDF somente se quiser trocar o arquivo.':'Selecione o livro ou material em PDF.','loja-file-note'));grid.append(pdfField);
          var actions=el('div',null,'loja-editor-actions'),save=btn(editing?'Salvar alterações':'Salvar e publicar',saveProduct,'member-btn'),cancel=btn('Cancelar',function(){editorSlot.replaceChildren()},'secondary');
          actions.append(save);
          if(editing){
            var remove=btn('Excluir da loja',removeProduct,'secondary');
            remove.title='Retira o produto da vitrine e preserva os pedidos já realizados.';
            actions.append(remove)
          }
          actions.append(cancel);editor.append(head,grid,actions);editorSlot.append(editor);editor.scrollIntoView({behavior:'smooth',block:'nearest'});name.focus();
          function removeProduct(){
            if(!window.confirm('Retirar “'+item.nome+'” da vitrine? Os pedidos e o cadastro serão preservados.'))return;
            remove.disabled=true;remove.textContent='Retirando…';say('Retirando o produto da vitrine…');
            invoke('publicarProdutoLoja',[api.token(),item.id,'false'],function(out){
              if(!out.ok){remove.disabled=false;remove.textContent='Excluir da loja';return}
              item.status=out.status||'Rascunho';clearCatalogCache();say('Produto retirado da vitrine. O cadastro e os pedidos foram preservados.','success');renderProducts()
            })
          }
          function saveProduct(){
            var f=file.files&&file.files[0],cost=Number(price.value);
            if(name.value.trim().length<2){say('Informe o nome do produto.','error');name.focus();return}
            if(!Number.isFinite(cost)||cost<=0){say('Informe um preço válido.','error');price.focus();return}
            if(!editing&&!f){say('Selecione o PDF antes de salvar.','error');file.focus();return}
            if(f&&(f.size>8*1024*1024||f.type!=='application/pdf')){say('O arquivo deve ser um PDF de até 8 MB.','error');return}
            var data={id:item?String(item.id):'',nome:name.value.trim(),categoria:cat.value.trim(),descricao:desc.value.trim(),precoCentavos:Math.round(cost*100)};
            function persist(){
              save.disabled=true;cancel.disabled=true;save.textContent='Salvando…';say('Salvando o produto…');
              invoke('salvarProdutoLoja',[api.token(),JSON.stringify(data)],function(out){
                if(!out.ok){save.disabled=false;cancel.disabled=false;save.textContent=editing?'Salvar alterações':'Salvar e publicar';return}
                if(editing){item.nome=data.nome;item.categoria=data.categoria;item.descricao=data.descricao;item.precoCentavos=data.precoCentavos;clearCatalogCache();say('Produto atualizado.','success');renderProducts();return}
                save.textContent='Publicando na loja…';say('Publicando o produto na vitrine…');
                invoke('publicarProdutoLoja',[api.token(),out.id,'true'],function(pub){
                  if(!pub.ok){save.disabled=false;cancel.disabled=false;save.textContent='Salvar e publicar';say('O produto foi salvo, mas não publicado. Tente novamente pela edição.','error');return}
                  clearCatalogCache();afterCatalogMessage='Produto salvo e publicado na loja.';current='catalogo';if(catalogTabButton)catalogTabButton.click();else loadCatalog()
                })
              })
            }
            if(!f){persist();return}
            save.disabled=true;save.textContent='Lendo PDF…';say('Preparando o arquivo…');
            arquivoParaBase64(f,function(b64){
              data.arquivoNome=f.name;data.arquivoMime=f.type;data.arquivoBase64=b64;
              if(JSON.stringify(data).length>12000000){save.disabled=false;cancel.disabled=false;save.textContent=editing?'Salvar alterações':'Salvar e publicar';say('Este PDF ultrapassa o limite de envio. Escolha um arquivo menor.','error');return}
              persist()
            },function(){save.disabled=false;cancel.disabled=false;save.textContent=editing?'Salvar alterações':'Salvar e publicar';say('Não foi possível ler o PDF. Selecione o arquivo novamente.','error')})
          }
        }
      }
      showProducts()
    })
  }
  function loadTypeManagement(host){
    host.replaceChildren();
    var sectionTypes=section('Tipos de atendimento','',host);
    var toolbar=el('div',null,'loja-manage-toolbar'),add=btn('＋ Novo tipo',function(){openEditor(null)},'member-btn');
    toolbar.append(add);sectionTypes.append(toolbar);
    var editorSlot=el('div',null,'loja-editor-slot'),listSlot=el('div',null);sectionTypes.append(editorSlot,listSlot);loadTypes();
    function openEditor(item){
      editorSlot.replaceChildren();
      var editing=!!item,editor=el('section',null,'loja-editor'),head=el('header',null,'loja-editor-head');
      head.append(el('h3',editing?'Editar tipo de atendimento':'Novo tipo de atendimento'));
      var grid=el('div',null,'loja-form-grid'),name=el('input'),description=el('textarea'),enabled=el('input');
      name.maxLength=100;name.required=true;name.placeholder='Ex.: Orientação espiritual';name.value=item&&item.nome||'';
      description.maxLength=1000;description.placeholder='Descrição exibida na loja';description.value=item&&item.descricao||'';
      enabled.type='checkbox';enabled.checked=item?!!item.ativo:true;
      function field(label,input,cls){var f=el('label',label,'loja-field'+(cls?' '+cls:''));f.append(input);return f}
      grid.append(field('Nome do atendimento',name,'wide'),field('Descrição',description,'full'));
      var activeLabel=el('label',null,'loja-consent');activeLabel.append(enabled,el('span','Mostrar na loja'));grid.append(activeLabel);
      var actions=el('div',null,'loja-editor-actions'),save=btn(editing?'Salvar alterações':'Salvar tipo',saveType,'member-btn'),cancel=btn('Cancelar',function(){editorSlot.replaceChildren()},'secondary');
      actions.append(save);
      if(editing){var remove=btn(item.ativo?'Excluir tipo':'Reativar tipo',toggleType,'secondary');remove.title='Oculta ou reativa esta opção na vitrine.';actions.append(remove)}
      actions.append(cancel);editor.append(head,grid,actions);editorSlot.append(editor);editor.scrollIntoView({behavior:'smooth',block:'nearest'});name.focus();
      function payload(){return {id:item?String(item.id):'',nome:name.value.trim(),descricao:description.value.trim(),ordem:item?(Number(item.ordem)||10):10,ativo:enabled.checked}}
      function saveType(){
        if(name.value.trim().length<2){say('Informe o nome do tipo.','error');name.focus();return}
        var data=payload();save.disabled=true;cancel.disabled=true;save.textContent='Salvando…';say('Salvando o tipo de atendimento…');
        invoke('salvarTipoAtendimentoLoja',[api.token(),JSON.stringify(data)],function(out){
          if(!out.ok){save.disabled=false;cancel.disabled=false;save.textContent=editing?'Salvar alterações':'Salvar tipo';return}
          clearCatalogCache();say('Tipo de atendimento salvo.','success');editorSlot.replaceChildren();loadTypes()
        })
      }
      function toggleType(){
        var next=!item.ativo;
        if(!next&&!window.confirm('Excluir “'+item.nome+'” da vitrine? O cadastro poderá ser reativado depois.'))return;
        remove.disabled=true;remove.textContent=next?'Reativando…':'Excluindo…';say(next?'Reativando tipo de atendimento…':'Excluindo tipo de atendimento…');
        var data={id:String(item.id),nome:item.nome,descricao:item.descricao||'',ordem:Number(item.ordem)||10,ativo:next};
        invoke('salvarTipoAtendimentoLoja',[api.token(),JSON.stringify(data)],function(out){
          if(!out.ok){remove.disabled=false;remove.textContent=next?'Reativar tipo':'Excluir tipo';return}
          item.ativo=next;clearCatalogCache();say(next?'Tipo reativado na loja.':'Tipo excluído da vitrine.','success');editorSlot.replaceChildren();loadTypes()
        })
      }
    }
    function loadTypes(){
      listSlot.replaceChildren(el('p','Carregando atendimentos…','loja-muted'));
      invoke('listarTiposAtendimentoGestaoLoja',[api.token()],function(r){
        if(!r.ok){listSlot.replaceChildren(loadError('Não foi possível carregar os atendimentos.',loadTypes));return}
        var items=r.tipos||[];
        if(!items.length){var empty=el('div',null,'loja-empty');empty.append(el('strong','Nenhum tipo cadastrado'),el('span','Adicione as opções que deseja mostrar na loja.','loja-muted'));listSlot.replaceChildren(empty);return}
        var t=table(['Atendimento','Descrição']);t.wrap.querySelector('table').classList.add('loja-table-types');
        items.forEach(function(item){
          var tr=el('tr');tr.className='loja-clickable-row';tr.tabIndex=0;tr.setAttribute('aria-label','Editar tipo de atendimento '+String(item.nome||''));
          tr.addEventListener('click',function(){openEditor(item)});
          tr.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openEditor(item)}});
          tr.append(el('td',item.nome||'—'),el('td',item.descricao||'—'));t.body.append(tr)
        });
        listSlot.replaceChildren(t.wrap)
      })
    }
  }
  function renderPendencias(host,status,items){api=window.TZCLojaAPI;if(!api)return;notice=status;host.replaceChildren();if(!items.length){host.append(el('p','A fila só recebe pedidos depois que o comprador envia o comprovante em Meus pedidos. Pedidos ainda aguardando pagamento não precisam de análise.','m04-note'));status.textContent='Nenhum comprovante da Loja aguardando conferência.';return}status.textContent=items.length+' pagamento(s) da Loja aguardando análise.';items.forEach(function(x){renderPendingItem(host,status,x)})}
  function dataLegivelBR(valor,comHora){
    var s=String(valor||'').trim();if(!s)return '';
    var br=s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if(br)return br[1]+'/'+br[2]+'/'+br[3]+(comHora&&br[4]&&!(br[4]==='00'&&br[5]==='00')?' '+('0'+br[4]).slice(-2)+':'+br[5]:'');
    var iso=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if(iso)return iso[3]+'/'+iso[2]+'/'+iso[1]+(comHora&&iso[4]&&!(iso[4]==='0'||iso[4]==='00')||comHora&&iso[5]&&iso[5]!=='00'?' '+('0'+(iso[4]||'0')).slice(-2)+':'+(iso[5]||'00'):'');
    var d=new Date(s);if(isNaN(d.getTime()))return '';
    var parts=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d),out={};
    parts.forEach(function(p){out[p.type]=p.value});
    var data=(out.day||'')+'/'+(out.month||'')+'/'+(out.year||''),temHora=/[T ]\d{1,2}:\d{2}/.test(s)&&!/(?:T|\s)00:00(?::00)?(?:\.|\s|$)/.test(s);
    return data+(comHora&&temHora?' '+out.hour+':'+out.minute:'')
  }
  function renderPendingItem(host,status,x){api=window.TZCLojaAPI;notice=status;if(!api)return;var card=el('article',null,'myarea-review-card');card.dataset.pendingType='loja';var pagamentoBR=dataLegivelBR(x.dataPagamento,false)||'—',enviadoBR=dataLegivelBR(x.enviadoEm,true),linhaPagamento='Pagamento em '+pagamentoBR+' · '+(x.forma||'Forma não informada')+(enviadoBR?' · enviado '+enviadoBR:'');card.append(el('span','Loja · aguardando conferência','pending-kind'),el('strong',x.nome||'Comprador'),el('span',(x.produtos||[]).join(', ')+' · Pedido '+(x.numeroPedido||x.pedidoId)+' · '+money(x.valorCentavos),'myarea-review-detail'),el('span',linhaPagamento,'myarea-review-detail'));var actions=el('div',null,'myarea-action-buttons'),view=btn('Conferir comprovante',function(){view.disabled=true;view.textContent='Abrindo…';invoke('obterComprovanteLoja',[api.token(),x.id],function(r){view.disabled=false;view.textContent='Conferir comprovante';if(!r.ok)return;var raw=atob(r.base64),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);var blob=new Blob([bytes],{type:r.mimeType}),url=URL.createObjectURL(blob),dialog=el('dialog',null,'loja-proof-dialog'),head=el('div',null,'loja-proof-dialog-head'),title=el('h2','Comprovante de pagamento'),close=el('button','×','close'),box=el('div',null,'loja-proof');close.type='button';close.setAttribute('aria-label','Fechar comprovante');close.addEventListener('click',function(){dialog.close()});head.append(title,close);if(r.mimeType==='application/pdf'){var frame=el('iframe');frame.title='Comprovante de pagamento';frame.src=url;box.append(frame)}else{var img=el('img');img.alt='Comprovante de pagamento';img.src=url;box.append(img)}dialog.append(head,box);document.body.append(dialog);dialog.addEventListener('click',function(e){if(e.target===dialog)dialog.close()});dialog.addEventListener('close',function(){URL.revokeObjectURL(url);dialog.remove()},{once:true});dialog.showModal()})},'secondary'),approve=btn('Aprovar pagamento',function(){decide('Aprovar','')},'member-btn'),reject=btn('Devolver para correção',function(){var reason=card.querySelector('.loja-reason');if(!reason){reason=el('input');reason.className='loja-reason';reason.maxLength=500;reason.placeholder='Informe o motivo da devolução';card.append(reason);reject.textContent='Confirmar devolução';return}decide('Recusar',reason.value)});actions.append(view,approve,reject);card.append(actions);host.append(card);function decide(action,reason){if(action==='Recusar'&&!reason.trim()){say('Informe o motivo para devolver o comprovante.','error');return}actions.querySelectorAll('button').forEach(function(b){b.disabled=true});approve.textContent=action==='Aprovar'?'Salvando…':approve.textContent;reject.textContent=action==='Recusar'?'Salvando…':reject.textContent;say('Salvando a análise do pedido…');invoke('decidirPagamentoLoja',[api.token(),x.id,action,reason],function(r){if(!r.ok){actions.querySelectorAll('button').forEach(function(b){b.disabled=false});return}card.replaceChildren(el('span',r.status+' · decisão registrada','pending-kind'));status.textContent=r.mensagem||'Análise salva.';setTimeout(function(){if(api&&api.refreshPendencias)api.refreshPendencias()},500)})}}
  window.TZCLojaUI={abrir:init,renderPendencias:renderPendencias,renderPendingItem:renderPendingItem};
})();

