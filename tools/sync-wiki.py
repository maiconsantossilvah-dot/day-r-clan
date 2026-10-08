#!/usr/bin/env python3
"""Sincroniza um catálogo moderado da Day R Wiki via MediaWiki API.

Usa somente a biblioteca padrão, pagina as consultas, aplica intervalo entre
requisições e guarda proveniência. Não baixa os arquivos de imagem.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

BASE_URL = "https://dayr.wiki.gg"
API_URL = f"{BASE_URL}/api.php"
SOURCE_NAME = "Day R Wiki"
ROOT_CATEGORIES = (
    "Items", "All Items", "Material", "Components", "Weapons",
    "Equipment", "Transport", "Food", "Medicine", "Ammunition", "Tools"
)
USER_AGENT = "DayRClanHub/0.1 (community catalog sync; GitHub Pages project)"
REQUEST_DELAY_SECONDS = 0.35
REQUEST_TIMEOUT_SECONDS = 30
PROJECT_ROOT = Path(__file__).resolve().parents[1]
ITEMS_PATH = PROJECT_ROOT / "data" / "wiki-items.json"
STATE_PATH = PROJECT_ROOT / "data" / "wiki-sync-state.json"

KNOWN_FIELDS = {
    "category": ("category",),
    "type": ("class type", "type", "class"),
    "weight": ("weight",),
    "durability": ("durability",),
    "effects": ("effect", "effects"),
    "damage": ("damage",),
    "range": ("range",),
    "capacity": ("capacity", "carry weight", "carrying capacity"),
    "fuel": ("fuel", "fuel consumption", "fuel type"),
    "tradeable": ("tradable", "tradeable"),
    "craftable": ("craftable", "crafted", "craft"),
    "image": ("image", "image1"),
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def request_json(params: dict[str, Any], retries: int = 3) -> dict[str, Any]:
    params = {"format": "json", "formatversion": "2", "origin": "*", **params}
    url = f"{API_URL}?{urllib.parse.urlencode(params, doseq=True)}"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                result = json.load(response)
            time.sleep(REQUEST_DELAY_SECONDS)
            if "error" in result:
                raise RuntimeError(result["error"].get("info", "Erro da MediaWiki API"))
            return result
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            if attempt + 1 == retries:
                raise RuntimeError(f"Falha ao consultar {API_URL}: {error}") from error
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("Falha inesperada na API")


def chunks(values: list[Any], size: int) -> Iterable[list[Any]]:
    for index in range(0, len(values), size):
        yield values[index : index + size]


def strip_markup(value: str | None) -> str | None:
    if not value:
        return None
    text = html.unescape(value)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"\[\[(?:[^\]|]+\|)?([^\]]+)\]\]", r"\1", text)
    text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"'{2,}", "", text)
    text = re.sub(r"\s+", " ", text).strip(" \n\t|-")
    return text or None


def first_template_value(wikitext: str, template: str) -> str | None:
    match = re.search(r"\{\{\s*" + re.escape(template) + r"\s*\|\s*([^}|]+)", wikitext, flags=re.I)
    if not match:
        return None
    value = strip_markup(match.group(1))
    return re.sub(r"^1\s*=\s*", "", value).strip() if value else None


def infobox_block(wikitext: str) -> str:
    start = re.search(r"\{\{\s*infobox\s+item\b", wikitext, flags=re.I)
    if not start:
        return ""
    depth = 0
    for index in range(start.start(), len(wikitext) - 1):
        token = wikitext[index : index + 2]
        if token == "{{":
            depth += 1
        elif token == "}}":
            depth -= 1
            if depth == 0:
                return wikitext[start.start() : index + 2]
    return wikitext[start.start() : start.start() + 6000]


def field_value(block: str, aliases: tuple[str, ...]) -> str | None:
    if not block:
        return None
    escaped = "|".join(re.escape(alias) for alias in aliases)
    match = re.search(r"\|\s*(?:" + escaped + r")\s*=\s*(.*?)(?=\|\s*[A-Za-z][A-Za-z0-9 _-]*\s*=|\}\})", block, flags=re.I | re.S)
    return strip_markup(match.group(1)) if match else None


def parse_bool(value: str | None) -> bool | None:
    if value is None:
        return None
    normalized = value.casefold().strip()
    if normalized in {"yes", "true", "allowed", "sim", "1"}:
        return True
    if normalized in {"no", "false", "forbidden", "não", "nao", "0"}:
        return False
    return None


def infer_category(categories: list[str]) -> str | None:
    ignored = {"items", "all items", "pages with broken file links", "see also template", "article stubs"}
    cleaned = [name.removeprefix("Category:") for name in categories]
    return next((name for name in cleaned if name.casefold() not in ignored and not name.casefold().startswith("image")), None)


def source_status(categories: list[str]) -> str:
    lowered = " ".join(categories).casefold()
    if "archive" in lowered or "removed" in lowered or "legacy" in lowered:
        return "legacy"
    if "event" in lowered or any(label in lowered for label in ("christmas", "halloween", "easter", "emba")):
        return "event"
    return "unknown"


def category_page_ids() -> dict[int, str]:
    pages: dict[int, str] = {}
    for category in ROOT_CATEGORIES:
        continuation: str | None = None
        while True:
            params: dict[str, Any] = {"action": "query", "list": "categorymembers", "cmtitle": f"Category:{category}", "cmnamespace": 0, "cmtype": "page", "cmlimit": "max"}
            if continuation:
                params["cmcontinue"] = continuation
            data = request_json(params)
            for page in data.get("query", {}).get("categorymembers", []):
                pages[int(page["pageid"])] = page["title"]
            continuation = data.get("continue", {}).get("cmcontinue")
            if not continuation:
                break
    return pages


def load_pages(page_ids: dict[int, str]) -> list[dict[str, Any]]:
    pages: list[dict[str, Any]] = []
    for batch in chunks(list(page_ids), 50):
        data = request_json({
            "action": "query", "pageids": "|".join(map(str, batch)), "redirects": 1,
            "prop": "info|revisions|pageimages|categories", "inprop": "url",
            "rvprop": "ids|timestamp|content", "rvslots": "main", "piprop": "name|thumbnail|original",
            "pithumbsize": 320, "cllimit": "max"
        })
        pages.extend(data.get("query", {}).get("pages", []))
    return pages


def load_image_metadata(file_names: list[str]) -> dict[str, dict[str, Any]]:
    metadata: dict[str, dict[str, Any]] = {}
    for batch in chunks(sorted(set(file_names)), 40):
        titles = "|".join(f"File:{name}" for name in batch)
        data = request_json({"action": "query", "titles": titles, "prop": "imageinfo|info", "inprop": "url", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 320})
        for page in data.get("query", {}).get("pages", []):
            if page.get("missing"):
                continue
            info = (page.get("imageinfo") or [{}])[0]
            ext = info.get("extmetadata") or {}
            key = page.get("title", "").removeprefix("File:")
            metadata[key] = {
                "imageUrl": info.get("url"), "thumbnailUrl": info.get("thumburl") or info.get("url"),
                "imageSourceUrl": page.get("fullurl"), "imageWidth": info.get("width"), "imageHeight": info.get("height"),
                "imageMime": info.get("mime"), "imageLicense": strip_markup((ext.get("LicenseShortName") or {}).get("value")),
                "imageLicenseUrl": (ext.get("LicenseUrl") or {}).get("value"),
                "imageAttribution": strip_markup((ext.get("Attribution") or ext.get("Artist") or {}).get("value")),
            }
    return metadata


def source_health() -> dict[str, Any]:
    data = request_json({"action": "query", "meta": "siteinfo", "siprop": "statistics", "list": "recentchanges", "rclimit": 50, "rcnamespace": "0|6", "rcprop": "title|timestamp|ids"})
    changes = data.get("query", {}).get("recentchanges", [])
    stats = data.get("query", {}).get("statistics", {})
    return {
        "lastRecentChangeAt": changes[0].get("timestamp") if changes else None,
        "latestRevisionSeen": max((change.get("revid", 0) for change in changes), default=0),
        "articleCount": stats.get("articles"), "fileCount": stats.get("images"), "recentChangeCount": len(changes)
    }


def load_existing() -> list[dict[str, Any]]:
    try:
        return json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def build_items(pages: list[dict[str, Any]], images: dict[str, dict[str, Any]], synced_at: str) -> list[dict[str, Any]]:
    result = []
    for page in pages:
        revisions = page.get("revisions") or []
        revision = revisions[0] if revisions else {}
        content = ((revision.get("slots") or {}).get("main") or {}).get("content", "")
        block = infobox_block(content)
        fields = {name: field_value(block, aliases) for name, aliases in KNOWN_FIELDS.items()}
        categories = [entry.get("title", "") for entry in page.get("categories", [])]
        image_name = page.get("pageimage") or fields.get("image")
        image = images.get(image_name or "", {})
        version = first_template_value(content, "Version")
        description = first_template_value(content, "gamequote")
        result.append({
            "id": f"wiki-{page['pageid']}", "wikiId": page["pageid"], "name": page.get("title"),
            "category": fields.get("category") or infer_category(categories), "type": fields.get("type"), "description": description,
            "imageUrl": image.get("imageUrl") or (page.get("original") or {}).get("source"),
            "thumbnailUrl": image.get("thumbnailUrl") or (page.get("thumbnail") or {}).get("source"),
            "wikiPageTitle": page.get("title"), "wikiPageUrl": page.get("fullurl"), "imageFileName": image_name,
            "imageSourceUrl": image.get("imageSourceUrl"), "imageWidth": image.get("imageWidth"), "imageHeight": image.get("imageHeight"),
            "imageMime": image.get("imageMime"), "imageLicense": image.get("imageLicense"), "imageLicenseUrl": image.get("imageLicenseUrl"), "imageAttribution": image.get("imageAttribution"),
            "sourceName": SOURCE_NAME, "sourceBaseUrl": BASE_URL, "sourceRevisionId": revision.get("revid"), "sourceLastModified": revision.get("timestamp"), "sourceGameVersion": version,
            "tradeable": parse_bool(fields.get("tradeable")), "craftable": parse_bool(fields.get("craftable")), "weight": fields.get("weight"),
            "durability": fields.get("durability"), "effects": fields.get("effects"), "damage": fields.get("damage"), "range": fields.get("range"),
            "capacity": fields.get("capacity"), "fuel": fields.get("fuel"), "notes": None, "clanNotes": "", "sourceStatus": source_status(categories),
            "sourceKind": "wiki", "syncedAt": synced_at
        })
    deduplicated = {item["id"]: item for item in result}
    return sorted(deduplicated.values(), key=lambda item: item["name"].casefold())


def freshness_score(health: dict[str, Any], items: list[dict[str, Any]]) -> dict[str, int]:
    last_change = health.get("lastRecentChangeAt")
    age_days = 9999
    if last_change:
        age_days = (datetime.now(timezone.utc) - datetime.fromisoformat(last_change.replace("Z", "+00:00"))).days
    recent = 40 if age_days <= 30 else 28 if age_days <= 90 else 15 if age_days <= 365 else 4
    version = min(20, round(sum(1 for item in items if item.get("sourceGameVersion")) / max(1, len(items)) * 20))
    coverage = min(20, round(len(items) / 300 * 20))
    images = min(20, round(sum(1 for item in items if item.get("thumbnailUrl")) / max(1, len(items)) * 20))
    return {"recentChangesScore": recent, "versionScore": version, "coverageScore": coverage, "imageScore": images, "sourceFreshnessScore": recent + version + coverage + images}


def main() -> int:
    parser = argparse.ArgumentParser(description="Sincroniza o catálogo da Day R Wiki.")
    parser.add_argument("--dry-run", action="store_true", help="Consulta e gera relatório sem gravar os arquivos.")
    args = parser.parse_args()
    ITEMS_PATH.parent.mkdir(parents=True, exist_ok=True)
    started = time.monotonic(); synced_at = utc_now(); existing = load_existing(); existing_by_id = {item.get("id"): item for item in existing}
    print("DAY R WIKI SYNC\nFonte: Day R Wiki (dayr.wiki.gg)")
    try:
        health = source_health(); page_ids = category_page_ids(); pages = load_pages(page_ids)
        image_names = [page.get("pageimage") for page in pages if page.get("pageimage")]
        images = load_image_metadata(image_names); items = build_items(pages, images, synced_at)
    except Exception as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1
    new_count = sum(item["id"] not in existing_by_id for item in items)
    updated_count = sum(item["id"] in existing_by_id and item.get("sourceRevisionId") != existing_by_id[item["id"]].get("sourceRevisionId") for item in items)
    unchanged_count = len(items) - new_count - updated_count
    current_ids = {item["id"] for item in items}
    missing = [{**item, "sourceStatus": "missing", "syncedAt": synced_at} for item in existing if item.get("sourceKind") == "wiki" and item.get("id") not in current_ids]
    items.extend(missing); items.sort(key=lambda item: item["name"].casefold())
    versions = Counter(item.get("sourceGameVersion") for item in items if item.get("sourceGameVersion"))
    detected_version = versions.most_common(1)[0][0] if versions else None
    scores = freshness_score(health, items)
    state = {
        "source": SOURCE_NAME, "sourceUrl": BASE_URL, "apiUrl": API_URL, "lastSync": synced_at,
        "itemCount": len(items), "imageCount": sum(1 for item in items if item.get("imageUrl")),
        "thumbnailCount": sum(1 for item in items if item.get("thumbnailUrl")),
        "latestRevisionSeen": max([health.get("latestRevisionSeen", 0), *[item.get("sourceRevisionId") or 0 for item in items]]),
        "gameVersionDetected": detected_version, "lastRecentChangeAt": health.get("lastRecentChangeAt"),
        "articleCount": health.get("articleCount"), "fileCount": health.get("fileCount"), "status": "active",
        "newCount": new_count, "updatedCount": updated_count, "unchangedCount": unchanged_count,
        "missingCount": len(missing), "errorCount": 0, "durationSeconds": round(time.monotonic() - started, 2), **scores
    }
    if not args.dry_run:
        ITEMS_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Itens encontrados: {len(items)}\nNovos: {new_count}\nAtualizados: {updated_count}\nSem alteração: {unchanged_count}\nIndisponíveis: {len(missing)}")
    print(f"Imagens encontradas: {state['imageCount']}\nMiniaturas: {state['thumbnailCount']}\nÚltima revisão: {state['latestRevisionSeen']}\nFinalizado: {synced_at}")
    if args.dry_run:
        print("Modo dry-run: nenhum arquivo foi alterado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
