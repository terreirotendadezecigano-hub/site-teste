/* Ações compactas compartilhadas pelas listagens do site. Não altera permissões ou handlers. */
(function(){'use strict';
  var NS='http://www.w3.org/2000/svg',paths={Editar:'M16 3l5 5M4 16L16 4a2.1 2.1 0 013 3L7 19l-4 1z',Excluir:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',Visualizar:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z',Cadastrar:'M12 5v14M5 12h14'};
  function svg(kind){var s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');var p=document.createElementNS(NS,'path');p.setAttribute('d',paths[kind]);s.appendChild(p);if(kind==='Visualizar'){var c=document.createElementNS(NS,'circle');c.setAttribute('cx','12');c.setAttribute('cy','12');c.setAttribute('r','3');s.appendChild(c)}return s}
  function format(b){var label=b.textContent.trim(),isRow=!!b.closest('table'),kind=isRow&&paths[label]?label:/^(Cadastrar|Novo|Nova)\b/.test(label)&&b.closest('.data-page-actions')?'Cadastrar':null;
    if(!kind){if(b.classList.contains('tzc-icon-action')){b.classList.remove('tzc-icon-action','tzc-action-delete');b.removeAttribute('aria-label');b.removeAttribute('title')}return}
    if(b.dataset.tzcAction===label&&b.querySelector('svg'))return;
    b.dataset.tzcAction=label;var text=document.createElement('span');text.textContent=label;
    if(kind==='Cadastrar'){b.classList.add('tzc-create-action');b.replaceChildren(svg(kind),text);return}
    var row=b.closest('tr'),name=row&&row.cells[0]?row.cells[0].textContent.trim():'';
    b.classList.add('tzc-icon-action');b.classList.toggle('tzc-action-delete',kind==='Excluir');b.setAttribute('aria-label',label+(name?' — '+name:''));b.title=label;text.className='tzc-action-label';b.replaceChildren(svg(kind),text);
  }
  function scan(scope){if(scope.nodeType!==1)return;if(scope.matches('button'))format(scope);scope.querySelectorAll('button').forEach(format)}
  function start(){scan(document.body);var pending=new Set(),scheduled=false;new MutationObserver(function(records){records.forEach(function(r){var target=r.target.nodeType===1?r.target:r.target.parentElement;var b=target&&target.closest('button');if(b)pending.add(b);r.addedNodes.forEach(function(n){if(n.nodeType===1)pending.add(n)})});if(scheduled||!pending.size)return;scheduled=true;queueMicrotask(function(){scheduled=false;var nodes=Array.from(pending);pending.clear();nodes.forEach(function(n){if(n.isConnected)scan(n)})})}).observe(document.body,{childList:true,subtree:true,characterData:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
