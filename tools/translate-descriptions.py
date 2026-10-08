#!/usr/bin/env python3
"""Gera um cache incremental pt-BR para as descrições importadas da Day R Wiki.

Dependência de desenvolvimento: pip install argostranslate
Modelo: inglês -> português, instalado pelo gerenciador do Argos Translate.
O site publicado não depende de Python nem do modelo de tradução.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import argostranslate.translate


ROOT = Path(__file__).resolve().parents[1]
ITEMS_PATH = ROOT / "data" / "wiki-items.json"
OUTPUT_PATH = ROOT / "data" / "item-descriptions-pt-BR.json"

PT_BR_REPLACEMENTS = {
    "graças a este livro de referência instrucional": "graças a este manual",
    "lançar redes para fora na água": "lançar redes na água",
    "em breve, terás": "em breve, você terá",
    "não são necessárias reparações": "não precisa de reparos",
    "velocidade de movimento atravessar a área": "velocidade de deslocamento pela área",
    "recomendado para usar contra atiradores em seguida, deixe a zona de efeito": "recomendado contra atiradores; depois, saia da zona de efeito",
    "áreas mais intransponíveis de cidades superlotadas": "áreas de acesso mais difícil das cidades tomadas pela vegetação",
    "cidades em crescimento": "cidades tomadas pela vegetação",
    "prédios overgrown": "prédios tomados pela vegetação",
    "cartas mardkes": "cartas marcadas",
    "pisos de dança": "pistas de dança",
    "andares de dança": "pistas de dança",
    "virando em evidências": "entregando evidências",
    "chãos Bunker": "andares do Bunker",
    "rodas Jackpot gira": "giros da roleta Jackpot",
    "passou a progredir através do enredo do evento": "usado para avançar na história do evento",
    "completando a busca no mapa": "concluindo missões no mapa",
    "o progresso equipe a sua divisão": "a Progress equipa sua divisão",
    "rifle sniper": "rifle de precisão",
    "permite-lhe": "permite",
    "ajuda-o a": "ajuda a",
    "disse-me": "me disse",
    "pediu-me": "me pediu",
    "apanhar madeira": "coletar madeira",
    "apanhar vários peixes": "capturar vários peixes",
    "apanhar vários piques": "capturar vários lúcios",
    "conduzir negócios": "negociar",
    "recolher água": "coletar água",
    "toda a gente": "todos",
    "syndicate trader": "Comerciante do Sindicato",
    "battle fervor": "Fervor de Batalha",
    "crafting": "fabricação",
    "protecção": "proteção",
    "protecção": "proteção",
    "imunitário": "imunológico",
    "avariado": "danificado",
    "arma partida": "arma quebrada",
    "reparações": "reparos", "reparação": "reparo",
    "batoteiros": "trapaceiros",
    "terás": "terá", "podes": "pode",
    "apanhar": "pegar", "recolher": "coletar", "conduzir": "dirigir",
    "numa": "em uma", "num": "em um",
    "bens": "itens",
    "progresso": "Progress",
    "automóveis": "carros", "automóvel": "carro",
    "motociclos": "motocicletas", "motociclo": "motocicleta",
    "comboios": "trens", "comboio": "trem",
    "autocarros": "ônibus", "autocarro": "ônibus",
    "camiões": "caminhões", "camião": "caminhão",
    "ficheiros": "arquivos", "ficheiro": "arquivo",
    "ecrãs": "telas", "ecrã": "tela",
    "telemóveis": "celulares", "telemóvel": "celular",
    "utilizadores": "usuários", "utilizador": "usuário",
    "equipas": "equipes", "equipa": "equipe",
    "factos": "fatos", "facto": "fato",
    "objectos": "objetos", "objecto": "objeto",
    "óptimos": "ótimos", "óptimo": "ótimo",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def preserve_case(original: str, replacement: str) -> str:
    if original.isupper():
        return replacement.upper()
    if original[:1].isupper():
        return replacement[:1].upper() + replacement[1:]
    return replacement


def localize_pt_br(text: str) -> str:
    result = re.sub(r"\s+", " ", text).strip()
    for source, target in sorted(PT_BR_REPLACEMENTS.items(), key=lambda pair: len(pair[0]), reverse=True):
        result = re.sub(
            rf"\b{re.escape(source)}\b",
            lambda match: preserve_case(match.group(0), target),
            result,
            flags=re.IGNORECASE,
        )
    return result


def load_json(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return fallback


def main() -> int:
    parser = argparse.ArgumentParser(description="Traduz descrições do catálogo para pt-BR.")
    parser.add_argument("--force", action="store_true", help="Refaz traduções mesmo quando a revisão não mudou.")
    parser.add_argument("--limit", type=int, default=0, help="Limita o número de novas traduções para teste.")
    args = parser.parse_args()

    items = load_json(ITEMS_PATH, [])
    previous = load_json(OUTPUT_PATH, {})
    previous_entries = previous.get("entries", {}) if isinstance(previous, dict) else {}
    entries = {}
    translated = 0
    reused = 0

    candidates = [item for item in items if item.get("description")]
    for index, item in enumerate(candidates, start=1):
        item_id = item["id"]
        revision = item.get("sourceRevisionId")
        cached = previous_entries.get(item_id)
        if not args.force and cached and cached.get("sourceRevisionId") == revision and cached.get("translatedText"):
            entries[item_id] = cached
            reused += 1
            continue
        if args.limit and translated >= args.limit:
            if cached:
                entries[item_id] = cached
            continue
        translated_text = argostranslate.translate.translate(item["description"], "en", "pt")
        entries[item_id] = {
            "sourceRevisionId": revision,
            "translatedText": localize_pt_br(translated_text),
        }
        translated += 1
        if translated == 1 or translated % 25 == 0 or index == len(candidates):
            print(f"Traduzidas nesta execução: {translated} / {len(candidates)}")

    payload = {
        "schemaVersion": 1,
        "locale": "pt-BR",
        "sourceLocale": "en",
        "sourceName": "Day R Wiki",
        "generatedAt": utc_now(),
        "engine": "Argos Translate en→pt 1.9 + léxico pt-BR",
        "itemCount": len(entries),
        "entries": entries,
    }
    temporary = OUTPUT_PATH.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(OUTPUT_PATH)
    print(f"Cache salvo em {OUTPUT_PATH}")
    print(f"Traduções novas: {translated} · reaproveitadas: {reused} · total: {len(entries)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
