# Pesquisa de itens em português

O catálogo preserva o nome canônico e os demais dados importados da Day R Wiki. A pesquisa acrescenta um índice local de aliases pt-BR; ela não altera nem grava traduções nos registros da fonte.

## Onde funciona

- catálogo de itens;
- busca global;
- seletores de item em estoque, pedidos, trocas e tutoriais;
- ferramenta WebMCP `search_clan_hub`.

Exemplos verificados: `gasolina` → `Gasoline`, `aço` → `Steel`, `fita isolante` → `Insulating Tape`, `água limpa` → `Clean Water` e `munição de pistola` → `Pistol Ammo`.

## Manutenção

Os aliases ficam em `assets/js/utils/search.js`. O índice remove acentos e diferença entre maiúsculas e minúsculas. Novos termos devem ser adicionados à lista `PORTUGUESE_TO_WIKI`, apontando para o termo canônico usado pela wiki.

Para reduzir falsos positivos, os aliases são inferidos apenas a partir de nome, categoria e tipo. A descrição continua pesquisável no idioma original.
