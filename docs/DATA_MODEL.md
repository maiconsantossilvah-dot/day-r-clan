# Modelo de dados

## Dados globais da fonte

### `wikiItems` / `data/wiki-items.json`

Campos principais: `id`, `wikiId`, `name`, `category`, `type`, `description`, `imageUrl`, `thumbnailUrl`, `wikiPageTitle`, `wikiPageUrl`, `imageFileName`, `imageSourceUrl`, dimensões, MIME, licença, atribuição, `sourceName`, `sourceBaseUrl`, `sourceRevisionId`, `sourceLastModified`, `sourceGameVersion`, atributos estruturados opcionais, `sourceStatus` e `syncedAt`.

O catálogo não é duplicado em inventários. Itens da wiki são somente leitura; informação interna usa `clanNotes`.

### `wikiSources`

`id`, `name`, `baseUrl`, `apiUrl`, `language`, `enabled`, `priority`, `lastCheckedAt`, `lastRecentChangeAt`, `currentVersionDetected`, `articleCount`, `fileCount`, `status` e score interno.

## Coleções do clã

- `users`: perfil, nickname, e-mail, clã atual e cargo informativo;
- `clans`: nome, tag, descrição, proprietário e código de convite;
- `clanInvites`: código exato, `clanId`, estado e criador;
- `clanMembers`: `clanId`, `userId`, nickname, cargo e datas;
- `items`: apenas itens próprios do clã, identificados por `sourceKind: "clan"`;
- `inventories`: `clanId`, `userId`, `itemId`, `quantity`, `reserved`, notas e atualização;
- `requests`: item, quantidade pedida/atendida, prioridade, motivo, status e datas;
- `requestContributions`: pedido, usuário, quantidade, status e data;
- `trades`: criador, aceitante, IDs e quantidades dos dois itens, status e datas;
- `exchangeRates`: itens/quantidades base e alvo, tipo, fonte e notas;
- `tutorials`: metadados, etapas estruturadas e requisitos por `itemId`;
- `activities`: usuário, tipo, entidade, mensagem e data;
- `notifications`: destinatário, mensagem, estado de leitura e data.

`available` não é persistido: é calculado como `quantity - reserved`.

## Índices

`firestore.indexes.json` inclui consultas compostas para pedidos, trocas, tutoriais, inventários e notificações. Novas consultas do Firebase podem exigir índices adicionais indicados pelo próprio console.
