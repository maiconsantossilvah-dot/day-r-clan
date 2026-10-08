# Traduções das descrições

O catálogo mantém o texto original da Day R Wiki em `data/wiki-items.json` e carrega as traduções separadamente de `data/item-descriptions-pt-BR.json`.

Na interface, a descrição em pt-BR é exibida por padrão. No detalhe do item, o usuário pode abrir **Ver descrição original em inglês**. Traduções automáticas recebem identificação explícita e nunca sobrescrevem o snapshot da fonte.

## Atualização incremental

Depois de sincronizar a wiki, execute:

```bash
pip install argostranslate
python tools/translate-descriptions.py
```

Instale antes o modelo inglês → português pelo gerenciador do Argos Translate. O script reaproveita uma tradução enquanto `sourceRevisionId` não mudar. Use `--force` somente para refazer todo o cache.

O arquivo gerado registra localidade, mecanismo, data, revisão de origem e texto traduzido. A aplicação só usa uma entrada quando sua revisão corresponde à revisão atual do item.

## Escopo e revisão

- 436 descrições disponíveis na fonte estão traduzidas;
- 429 itens sem descrição na fonte continuam identificados como indisponíveis;
- nomes próprios e nomes canônicos dos itens permanecem como publicados pela wiki;
- o pós-processamento aplica um pequeno léxico pt-BR sobre a saída do modelo português;
- por ser tradução automática, textos importantes devem ser comparados com o original disponível no detalhe.
