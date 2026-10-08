const PORTUGUESE_TO_WIKI = [
  ["gasolina", ["gasoline"]], ["óleo diesel", ["diesel"]], ["combustível", ["fuel", "gasoline", "diesel"]],
  ["aço", ["steel"]], ["ferro", ["iron"]], ["alumínio", ["aluminum"]], ["cobre", ["copper"]],
  ["chumbo", ["lead"]], ["titânio", ["titanium"]], ["madeira", ["wood"]], ["tábua", ["board"]],
  ["prego", ["nail"]], ["parafuso", ["screw"]], ["fita isolante", ["insulating tape"]],
  ["ácido sulfúrico", ["sulfuric acid"]], ["água limpa", ["clean water"]], ["água", ["water"]],
  ["carne enlatada", ["canned beef", "canned meat"]], ["comida", ["food"]], ["alimento", ["food"]],
  ["bebida", ["drink"]], ["remédio", ["medicine"]], ["medicamento", ["medicine"]],
  ["antibiótico", ["antibiotic"]], ["kit de primeiros socorros", ["first aid kit"]], ["curativo", ["bandage"]],
  ["carvão", ["charcoal"]], ["lenha", ["firewood"]], ["corda", ["rope"]], ["tecido", ["cloth", "fabric"]],
  ["couro", ["leather"]], ["pele", ["hide"]], ["borracha", ["rubber"]], ["plástico", ["plastic"]],
  ["cimento", ["cement"]], ["tijolo", ["brick"]], ["munição de pistola", ["pistol ammo"]],
  ["munição", ["ammo", "ammunition"]], ["bala", ["bullet"]], ["cartucho", ["shell", "cartridge"]],
  ["arma", ["weapon"]], ["fuzil", ["rifle"]], ["pistola", ["pistol"]], ["escopeta", ["shotgun"]],
  ["arco", ["bow"]], ["flecha", ["arrow"]], ["explosivo", ["explosive"]], ["granada", ["grenade"]],
  ["armadura", ["armor"]], ["capacete", ["helmet"]], ["mochila", ["backpack"]], ["roupa", ["clothes", "clothing"]],
  ["ferramenta", ["tool"]], ["kit de ferramentas", ["tool kit"]], ["machado", ["axe"]], ["pá", ["shovel"]],
  ["picareta", ["pickaxe"]], ["martelo", ["hammer"]], ["faca", ["knife"]], ["serra", ["saw"]],
  ["veículo", ["vehicle"]], ["carro", ["car"]], ["caminhão", ["truck"]], ["motocicleta", ["motorcycle"]],
  ["bicicleta", ["bicycle"]], ["barco", ["boat"]], ["motor", ["engine"]],
  ["peças sobressalentes", ["spare parts"]], ["bateria", ["battery"]], ["pneu", ["tire"]],
  ["óleo", ["oil"]], ["filtro", ["filter"]], ["componente", ["component"]], ["material", ["material"]],
  ["equipamento", ["equipment"]], ["transporte", ["transport"]], ["carne", ["meat", "beef"]],
  ["peixe", ["fish"]], ["farinha", ["flour"]], ["sal", ["salt"]], ["açúcar", ["sugar"]],
  ["batata", ["potato"]], ["milho", ["corn"]], ["trigo", ["wheat"]], ["maçã", ["apple"]],
  ["fruta", ["fruit"]], ["cogumelo", ["mushroom"]], ["mel", ["honey"]], ["leite", ["milk"]],
  ["ovo", ["egg"]], ["chá", ["tea"]], ["café", ["coffee"]], ["álcool", ["alcohol"]],
  ["veneno", ["poison"]], ["antídoto", ["antidote"]], ["saúde", ["health"]], ["cura", ["healing"]],
  ["radiação", ["radiation"]], ["antirradiação", ["antirad"]], ["planta", ["plant"]], ["semente", ["seed"]]
];

export function normalizeSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsTerm(haystack, term) {
  const normalized = normalizeSearchText(term);
  if (!normalized) return false;
  const wrapped = ` ${haystack} `;
  return wrapped.includes(` ${normalized} `) || wrapped.includes(` ${normalized}s `);
}

export function itemSearchText(item) {
  const canonical = normalizeSearchText([item.name, item.category, item.type, item.description, item.descriptionPtBr].filter(Boolean).join(" "));
  const aliasSource = normalizeSearchText([item.name, item.category, item.type].filter(Boolean).join(" "));
  const aliases = PORTUGUESE_TO_WIKI
    .filter(([, wikiTerms]) => wikiTerms.some((term) => containsTerm(aliasSource, term)))
    .map(([portuguese]) => normalizeSearchText(portuguese));
  return `${canonical} ${aliases.join(" ")}`.trim();
}

export function itemMatchesQuery(item, query) {
  const normalizedQuery = normalizeSearchText(query);
  return !normalizedQuery || itemSearchText(item).includes(normalizedQuery);
}

export function textMatchesQuery(value, query) {
  const normalizedQuery = normalizeSearchText(query);
  return !normalizedQuery || normalizeSearchText(value).includes(normalizedQuery);
}

export const portugueseSearchExamples = ["gasolina", "aço", "fita isolante", "água limpa", "munição de pistola"];
