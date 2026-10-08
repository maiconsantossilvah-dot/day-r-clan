const stamp = (days = 0, hours = 10) => new Date(Date.UTC(2026, 9, 7 - days, hours, 0)).toISOString();

export function createDemoData() {
  return {
    schemaVersion: 1,
    mode: "demo",
    onboardingCompleted: false,
    profile: { id: "user-survivor", nickname: "Sobrevivente", email: "demo@local.invalid", role: "member", clanId: "clan-a07", avatar: "S" },
    clan: { id: "clan-a07", name: "Abrigo 07", tag: "A07", description: "Espaço fictício para explorar os recursos do sistema.", ownerId: "user-aurora", inviteCode: "A07-DEMO", createdAt: stamp(60), updatedAt: stamp(1) },
    items: [
      { id: "wiki-7404", name: "Gasoline", sourceKind: "wiki" },
      { id: "wiki-2524", name: "Steel", sourceKind: "wiki" },
      { id: "wiki-10508", name: "Sulfuric Acid", sourceKind: "wiki" },
      { id: "wiki-10687", name: "Insulating Tape", sourceKind: "wiki" },
      { id: "wiki-10431", name: "Canned beef", sourceKind: "wiki" },
      { id: "wiki-4819", name: "Clean Water", sourceKind: "wiki" },
      { id: "wiki-13276", name: "First Aid Kit", sourceKind: "wiki" },
      { id: "wiki-13802", name: "Auto spare parts", sourceKind: "wiki" },
      { id: "wiki-4544", name: "Pistol Ammo", sourceKind: "wiki" },
      { id: "wiki-5127", name: "Tool Kit", sourceKind: "wiki" }
    ],
    members: [
      { id: "user-aurora", nickname: "Aurora", role: "owner", joinedAt: stamp(90), lastActiveAt: stamp(0, 11), avatar: "A" },
      { id: "user-vector", nickname: "Vector", role: "admin", joinedAt: stamp(72), lastActiveAt: stamp(0, 9), avatar: "V" },
      { id: "user-survivor", nickname: "Sobrevivente", role: "member", joinedAt: stamp(48), lastActiveAt: stamp(0, 10), avatar: "S" },
      { id: "user-nomad", nickname: "Nômade", role: "member", joinedAt: stamp(31), lastActiveAt: stamp(1, 20), avatar: "N" },
      { id: "user-observer", nickname: "Observador", role: "viewer", joinedAt: stamp(15), lastActiveAt: stamp(3, 18), avatar: "O" }
    ],
    inventories: [
      { id: "inv-1", clanId: "clan-a07", userId: "user-survivor", itemId: "wiki-7404", quantity: 15000, reserved: 3000, notes: "Reserva para atividade interna.", updatedAt: stamp(0, 9) },
      { id: "inv-2", clanId: "clan-a07", userId: "user-survivor", itemId: "wiki-2524", quantity: 350, reserved: 0, notes: "", updatedAt: stamp(1, 8) },
      { id: "inv-3", clanId: "clan-a07", userId: "user-aurora", itemId: "wiki-10508", quantity: 200, reserved: 40, notes: "", updatedAt: stamp(0, 7) },
      { id: "inv-4", clanId: "clan-a07", userId: "user-vector", itemId: "wiki-2524", quantity: 950, reserved: 200, notes: "", updatedAt: stamp(2, 16) },
      { id: "inv-5", clanId: "clan-a07", userId: "user-nomad", itemId: "wiki-10687", quantity: 90, reserved: 10, notes: "", updatedAt: stamp(1, 13) },
      { id: "inv-6", clanId: "clan-a07", userId: "user-vector", itemId: "wiki-4819", quantity: 120, reserved: 20, notes: "", updatedAt: stamp(3, 11) },
      { id: "inv-7", clanId: "clan-a07", userId: "user-aurora", itemId: "wiki-10431", quantity: 84, reserved: 14, notes: "", updatedAt: stamp(2, 15) },
      { id: "inv-8", clanId: "clan-a07", userId: "user-nomad", itemId: "wiki-13802", quantity: 48, reserved: 8, notes: "", updatedAt: stamp(4, 12) }
    ],
    requests: [
      { id: "req-1", clanId: "clan-a07", creatorId: "user-survivor", itemId: "wiki-2524", requestedQuantity: 500, fulfilledQuantity: 200, priority: "urgent", reason: "Organização de uma atividade demonstrativa.", status: "partial", createdAt: stamp(4), updatedAt: stamp(1) },
      { id: "req-2", clanId: "clan-a07", creatorId: "user-nomad", itemId: "wiki-10687", requestedQuantity: 120, fulfilledQuantity: 0, priority: "high", reason: "Reposição interna do estoque.", status: "open", createdAt: stamp(3), updatedAt: stamp(3) },
      { id: "req-3", clanId: "clan-a07", creatorId: "user-vector", itemId: "wiki-4819", requestedQuantity: 60, fulfilledQuantity: 60, priority: "normal", reason: "Pedido demonstrativo concluído.", status: "completed", createdAt: stamp(8), updatedAt: stamp(2) }
    ],
    requestContributions: [
      { id: "contrib-1", requestId: "req-1", userId: "user-vector", quantity: 200, status: "confirmed", createdAt: stamp(1) },
      { id: "contrib-2", requestId: "req-3", userId: "user-survivor", quantity: 60, status: "confirmed", createdAt: stamp(2) }
    ],
    trades: [
      { id: "trade-1", clanId: "clan-a07", creatorId: "user-aurora", accepterId: "", offerItemId: "wiki-10431", offerQuantity: 20, wantItemId: "wiki-10687", wantQuantity: 10, status: "open", notes: "Oferta fictícia.", createdAt: stamp(2), updatedAt: stamp(2) },
      { id: "trade-2", clanId: "clan-a07", creatorId: "user-nomad", accepterId: "user-vector", offerItemId: "wiki-13802", offerQuantity: 5, wantItemId: "wiki-7404", wantQuantity: 1000, status: "waiting_delivery", notes: "Negociação demonstrativa.", createdAt: stamp(5), updatedAt: stamp(1) },
      { id: "trade-3", clanId: "clan-a07", creatorId: "user-vector", accepterId: "user-survivor", offerItemId: "wiki-4819", offerQuantity: 12, wantItemId: "wiki-10431", wantQuantity: 8, status: "completed", notes: "Concluída apenas para exemplo.", createdAt: stamp(9), updatedAt: stamp(6) }
    ],
    exchangeRates: [
      { id: "rate-1", baseItemId: "wiki-7404", baseQuantity: 300, targetItemId: "wiki-10508", targetQuantity: 1, type: "clan", source: "Tabela demonstrativa do clã", notes: "Valor fictício; substitua pelos dados adotados pelo seu clã.", updatedAt: stamp(2) },
      { id: "rate-2", baseItemId: "wiki-2524", baseQuantity: 10, targetItemId: "wiki-10687", targetQuantity: 3, type: "community", source: "Exemplo comunitário", notes: "Não oficial e apenas demonstrativo.", updatedAt: stamp(5) }
    ],
    tutorials: [
      { id: "tut-1", clanId: "clan-a07", authorId: "user-survivor", title: "Como organizar recursos para uma expedição", slug: "organizar-recursos-expedicao", description: "Um fluxo genérico para separar, conferir e registrar recursos antes de sair.", category: "Recursos", difficulty: "Iniciante", gameVersion: "", status: "published", steps: [{ id: "step-1", title: "Defina o objetivo", text: "Registre o objetivo da expedição e quais participantes irão colaborar.", imageUrl: "" }, { id: "step-2", title: "Separe os recursos", text: "Use o campo reservado para não contar o mesmo recurso duas vezes.", imageUrl: "" }], requirements: [{ itemId: "wiki-2524", quantity: 500 }, { itemId: "wiki-10508", quantity: 200 }, { itemId: "wiki-7404", quantity: 10000 }], createdAt: stamp(12), updatedAt: stamp(1) },
      { id: "tut-2", clanId: "clan-a07", authorId: "user-aurora", title: "Preparação de estoque para viagens longas", slug: "preparacao-estoque-viagens", description: "Checklist demonstrativo para organizar recursos informados pelos membros.", category: "Iniciantes", difficulty: "Intermediário", gameVersion: "", status: "published", steps: [{ id: "step-3", title: "Revise o estoque", text: "Confirme quando cada registro foi atualizado.", imageUrl: "" }], requirements: [{ itemId: "wiki-4819", quantity: 100 }, { itemId: "wiki-10431", quantity: 80 }], createdAt: stamp(18), updatedAt: stamp(4) },
      { id: "tut-3", clanId: "clan-a07", authorId: "user-vector", title: "Como usar pedidos internos do clã", slug: "usar-pedidos-internos", description: "Guia da própria plataforma para pedir e registrar contribuições.", category: "Trocas", difficulty: "Iniciante", gameVersion: "", status: "draft", steps: [{ id: "step-4", title: "Crie um pedido", text: "Escolha um item cadastrado, uma quantidade e uma prioridade.", imageUrl: "" }], requirements: [], createdAt: stamp(6), updatedAt: stamp(2) }
    ],
    activities: [
      { id: "act-1", clanId: "clan-a07", userId: "user-survivor", type: "inventory_updated", entityType: "inventory", entityId: "inv-1", message: "Sobrevivente atualizou o estoque de Gasoline.", createdAt: stamp(0, 9) },
      { id: "act-2", clanId: "clan-a07", userId: "user-vector", type: "request_contributed", entityType: "request", entityId: "req-1", message: "Vector contribuiu com um pedido de Steel.", createdAt: stamp(1, 16) },
      { id: "act-3", clanId: "clan-a07", userId: "user-aurora", type: "trade_created", entityType: "trade", entityId: "trade-1", message: "Aurora publicou uma nova oferta.", createdAt: stamp(2, 14) },
      { id: "act-4", clanId: "clan-a07", userId: "user-survivor", type: "tutorial_published", entityType: "tutorial", entityId: "tut-1", message: "Um tutorial foi publicado.", createdAt: stamp(3, 17) },
      { id: "act-5", clanId: "clan-a07", userId: "user-observer", type: "member_joined", entityType: "member", entityId: "user-observer", message: "Observador entrou no clã como visitante.", createdAt: stamp(15, 12) }
    ],
    notifications: [
      { id: "note-1", userId: "user-survivor", message: "Seu pedido de Steel recebeu uma contribuição.", read: false, createdAt: stamp(1) },
      { id: "note-2", userId: "user-survivor", message: "Uma troca foi concluída.", read: true, createdAt: stamp(6) }
    ],
    sources: [{ id:"dayr-wiki-gg-en", name:"Day R Wiki", baseUrl:"https://dayr.wiki.gg", apiUrl:"https://dayr.wiki.gg/api.php", language:"en", enabled:true, priority:1, status:"cache" }],
    wikiSync: { source:"Day R Wiki", sourceUrl:"https://dayr.wiki.gg", lastSync:null, itemCount:0, imageCount:0, latestRevisionSeen:null, gameVersionDetected:null, status:"loading" },
    settings: { theme: "dark" }
  };
}
