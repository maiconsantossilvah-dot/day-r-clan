# Sincronização da Day R Wiki

## Princípios

A Day R Wiki em `dayr.wiki.gg` é a fonte primária inicial. O sistema não a considera uma dependência eterna: a tela **Fontes** mede vários sinais, e fontes alternativas podem ser cadastradas para revisão. Nenhuma fonte assume prioridade com base em uma única edição recente.

As ferramentas consultam a MediaWiki API, não raspam páginas HTML em massa. Elas usam paginação, lotes de até 50 páginas, pausa entre requisições, timeout e tentativas limitadas. Nenhum arquivo de imagem é baixado; somente URLs e metadados são armazenados.

## Executar

Com Python 3:

```bash
python tools/sync-wiki.py
```

Alternativa com Node 18+:

```bash
node tools/sync-wiki.mjs
```

O script consulta categorias como Items, All Items, Material, Components, Weapons, Equipment, Transport, Food, Medicine, Ammunition e Tools. Categorias ausentes não interrompem o catálogo completo; IDs de página eliminam duplicatas.

## Arquivos gerados

- `data/wiki-items.json`: catálogo rastreável;
- `data/wiki-sync-state.json`: fonte, datas, contagens, revisão mais nova e relatório.
- `data/item-descriptions-pt-BR.json`: cache de traduções separado por ID e revisão.

Cada item inclui, quando disponível: `wikiId`, `wikiPageUrl`, `sourceRevisionId`, `sourceLastModified`, `sourceGameVersion`, `syncedAt`, imagem, miniatura, página do arquivo, dimensões, MIME, licença e atribuição.

Campos ausentes ficam `null`. O parser não infere estatísticas.

## Sincronização incremental

O snapshot novo é comparado ao anterior por ID e revisão. O relatório conta itens novos, atualizados e sem alteração. Uma página antes conhecida que desapareça não é apagada: ela permanece com `sourceStatus: "missing"`. Redirecionamentos são seguidos pela API.

O processamento ainda consulta o conjunto de páginas para produzir um snapshot determinístico. Páginas cuja revisão não mudou são classificadas como “sem alteração”; uma evolução futura pode persistir conteúdo bruto por revisão para evitar o parse repetido.

Depois da sincronização, execute `python tools/translate-descriptions.py`. Entradas cuja revisão não mudou são reaproveitadas; descrições alteradas são traduzidas novamente. Consulte `docs/TRANSLATIONS.md`.

## Verificação pelo navegador

O botão **Verificar atualizações** consulta apenas `siteinfo` e `recentchanges`. Se existir revisão maior que a do cache, a interface orienta executar o sincronizador local. Se CORS, rede ou timeout falharem, o catálogo salvo continua disponível.

## Frescor

`evaluateWikiFreshness()` combina:

- atividade recente;
- cobertura de itens;
- presença de versões nas páginas;
- cobertura de imagens.

O score é administrativo. Conflitos continuam exigindo leitura da página, revisão e versão declarada. Se a evidência for inconclusiva, a fonte primária permanece e a divergência deve ser revisada manualmente.

## Testes recomendados

1. Execute a ferramenta duas vezes e confirme que não duplica IDs.
2. Abra um item com imagem e outro sem imagem.
3. Desative a rede após o primeiro carregamento e recarregue o catálogo.
4. Confirme que item histórico permanece filtrável.
5. Use **Ver na Wiki** e **Fonte da imagem**.
6. Simule timeout e confirme que o cache continua carregando.
7. Compare a revisão exibida com `wiki-sync-state.json`.
