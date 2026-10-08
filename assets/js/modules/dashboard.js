import { statCard } from "../components/stat-card.js";
import { emptyState } from "../components/empty-state.js";
import { available, escapeHTML, icon, itemName, memberName, sum } from "../utils/helpers.js";
import { formatDateTime, formatNumber } from "../utils/formatter.js";
import { navigate } from "../router.js";

export function render(state) {
  const totalQuantity = sum(state.inventories, inv => inv.quantity);
  const totalReserved = sum(state.inventories, inv => inv.reserved);
  const openRequests = state.requests.filter(request => ["open","partial"].includes(request.status));
  const openTrades = state.trades.filter(trade => ["open","reserved","waiting_delivery"].includes(trade.status));
  const published = state.tutorials.filter(tutorial => tutorial.status === "published");
  const totalsByItem = state.items.map(item => ({ item, available: sum(state.inventories.filter(inv => inv.itemId === item.id), available) })).filter(entry => entry.available > 0).sort((a,b) => a.available - b.available).slice(0, 5);
  const requested = state.items.map(item => ({ item, amount: sum(openRequests.filter(req => req.itemId === item.id), req => Math.max(0, req.requestedQuantity - req.fulfilledQuantity)) })).filter(entry => entry.amount > 0).sort((a,b) => b.amount - a.amount).slice(0, 5);
  return `<header class="page-header"><div><span class="eyebrow">CENTRAL DO CLÃ · DADOS DE DEMONSTRAÇÃO</span><h1 class="page-title">Bom retorno, ${escapeHTML(state.profile.nickname)}.</h1><p class="page-subtitle">Uma visão consolidada do que o clã informou. Os valores não são dados oficiais do jogo.</p></div><span class="badge badge-success">${escapeHTML(state.clan.tag)} · Operacional</span></header>
  <section class="stats-grid" aria-label="Resumo do clã">
    ${statCard({ label: "Recursos disponíveis", value: formatNumber(totalQuantity - totalReserved), iconName: "boxes", note: `${formatNumber(totalReserved)} reservados` })}
    ${statCard({ label: "Pedidos abertos", value: formatNumber(openRequests.length), iconName: "hand-helping", note: `${openRequests.filter(x => x.priority === "urgent").length} urgentes` })}
    ${statCard({ label: "Trocas em andamento", value: formatNumber(openTrades.length), iconName: "arrow-left-right", note: `${state.trades.filter(x => x.status === "open").length} abertas` })}
    ${statCard({ label: "Tutoriais publicados", value: formatNumber(published.length), iconName: "book-open-text", note: `${state.tutorials.filter(x => x.status === "draft").length} rascunhos` })}
  </section>
  <section class="card" style="margin-top:18px"><div class="panel-header"><div><span class="eyebrow">AÇÃO RÁPIDA</span><h2 class="section-title">O que precisa registrar?</h2></div></div><div class="quick-actions">
    <button class="quick-action" data-action="quick-inventory">${icon("package-plus")}<strong>Adicionar recurso</strong></button>
    <button class="quick-action" data-action="quick-request">${icon("clipboard-plus")}<strong>Criar pedido</strong></button>
    <button class="quick-action" data-action="quick-trade">${icon("repeat-2")}<strong>Criar troca</strong></button>
    <button class="quick-action" data-action="quick-tutorial">${icon("file-plus-2")}<strong>Criar tutorial</strong></button>
  </div></section>
  <div class="dashboard-grid">
    <div class="stack">
      <section class="card"><div class="panel-header"><div><span class="eyebrow">PRIORIDADE</span><h2 class="section-title">Pedidos ativos</h2></div><a class="button button-ghost button-sm" href="#/requests">Ver todos</a></div>${openRequests.length ? `<div class="list">${openRequests.slice(0,4).map(req => { const pct = Math.min(100, (req.fulfilledQuantity / req.requestedQuantity) * 100); return `<div class="list-row"><div class="list-row-main"><strong>${escapeHTML(itemName(state,req.itemId))}</strong><small>${formatNumber(req.fulfilledQuantity)} de ${formatNumber(req.requestedQuantity)} recebidos</small><div class="progress ${req.priority === "urgent" ? "danger" : req.priority === "high" ? "warning" : ""}" style="margin-top:8px"><span style="width:${pct}%"></span></div></div><span class="badge ${req.priority === "urgent" ? "badge-danger" : req.priority === "high" ? "badge-warning" : "badge-neutral"}">${req.priority === "urgent" ? "Urgente" : req.priority === "high" ? "Alta" : "Normal"}</span></div>`; }).join("")}</div>` : emptyState({ title:"Nenhum pedido ativo", message:"Quando alguém precisar de recursos, os pedidos aparecerão aqui.", action:"quick-request", actionLabel:"Criar pedido", iconName:"circle-check" })}</section>
      <div class="split-grid">
        <section class="card"><div class="panel-header"><h2 class="section-title">Itens mais solicitados</h2></div>${requested.length ? `<div class="list">${requested.map(entry => `<div class="list-row"><div class="list-row-main"><strong>${escapeHTML(entry.item.name)}</strong><small>Demanda pendente</small></div><strong class="mono">${formatNumber(entry.amount)}</strong></div>`).join("")}</div>` : `<p class="muted">Ainda não há demanda suficiente.</p>`}</section>
        <section class="card"><div class="panel-header"><h2 class="section-title">Menor disponibilidade</h2></div>${totalsByItem.length ? `<div class="list">${totalsByItem.map(entry => `<div class="list-row"><div class="list-row-main"><strong>${escapeHTML(entry.item.name)}</strong><small>Disponível no clã</small></div><strong class="mono">${formatNumber(entry.available)}</strong></div>`).join("")}</div>` : `<p class="muted">Cadastre o estoque para gerar esta análise.</p>`}</section>
      </div>
    </div>
    <div class="stack">
      <section class="card"><div class="panel-header"><div><span class="eyebrow">SITUAÇÃO</span><h2 class="section-title">${escapeHTML(state.clan.name)}</h2></div><span class="badge badge-info">${state.members.length} membros</span></div><p class="muted">${escapeHTML(state.clan.description)}</p><div class="detail-metrics"><div class="metric"><small>Itens conhecidos</small><strong>${formatNumber(state.items.length)}</strong></div><div class="metric"><small>Total</small><strong>${formatNumber(totalQuantity)}</strong></div><div class="metric"><small>Reservado</small><strong>${formatNumber(totalReserved)}</strong></div></div></section>
      <section class="card"><div class="panel-header"><div><span class="eyebrow">STATUS DA WIKI</span><h2 class="section-title">${escapeHTML(state.wikiSync?.source || "Day R Wiki")}</h2></div><span class="badge ${state.wikiSync?.updateAvailable ? "badge-warning" : "badge-success"}">${state.wikiSync?.updateAvailable ? "Revisão disponível" : "Fonte ativa"}</span></div><div class="list"><div class="list-row"><div class="list-row-main"><small>Última sincronização</small><strong>${formatDateTime(state.wikiSync?.lastSync)}</strong></div></div><div class="list-row"><div class="list-row-main"><small>Itens / miniaturas</small><strong>${formatNumber(state.wikiSync?.itemCount)} / ${formatNumber(state.wikiSync?.thumbnailCount || state.wikiSync?.imageCount)}</strong></div></div></div><a class="button button-secondary button-sm" href="#/sources" style="margin-top:14px">Ver proveniência</a></section>
      <section class="card"><div class="panel-header"><h2 class="section-title">Últimos tutoriais</h2><a class="button button-ghost button-sm" href="#/tutorials">Ver todos</a></div>${published.length ? `<div class="list">${published.slice(0,3).map(tutorial => `<div class="list-row"><div class="list-row-main"><strong>${escapeHTML(tutorial.title)}</strong><small>${escapeHTML(tutorial.category)} · ${formatDateTime(tutorial.updatedAt)}</small></div></div>`).join("")}</div>` : `<p class="muted">Nenhum tutorial publicado.</p>`}</section>
      <section class="card"><div class="panel-header"><h2 class="section-title">Atividade recente</h2></div>${state.activities.length ? `<div class="list">${state.activities.slice(0,6).map(activity => `<div class="list-row"><span class="activity-marker"></span><div class="list-row-main"><span>${escapeHTML(activity.message)}</span><small>${formatDateTime(activity.createdAt)} · ${escapeHTML(memberName(state, activity.userId))}</small></div></div>`).join("")}</div>` : `<p class="muted">Nenhuma atividade registrada.</p>`}</section>
    </div>
  </div>`;
}

export async function handleAction(action) {
  const routes = { "quick-inventory": ["inventory",{ new:"1" }], "quick-request": ["requests",{ new:"1" }], "quick-trade": ["trades",{ new:"1" }], "quick-tutorial": ["tutorials",{ new:"1" }] };
  if (routes[action]) navigate(routes[action][0], routes[action][1]);
}
