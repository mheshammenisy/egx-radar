import json
import os
from typing import Any

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini").strip()


def _extract_sources(response: Any) -> list[dict]:
    data = response.model_dump() if hasattr(response, "model_dump") else {}
    found: dict[str, str] = {}

    def walk(value):
        if isinstance(value, dict):
            if value.get("type") == "url_citation":
                url = value.get("url")
                if url:
                    found[url] = value.get("title") or url
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    return [{"title": title, "url": url} for url, title in found.items()]


def analyze_stock_with_ai(stock: Any, language: str = "en") -> dict:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("AI analysis is not configured. Set OPENAI_API_KEY on the backend.")

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError(
            "OpenAI SDK is not installed. Run pip install -r requirements.txt."
        ) from exc

    language_instruction = (
        "Write the JSON values in Arabic, using clear Egyptian-market terminology."
        if language == "ar"
        else "Write the JSON values in clear English."
    )

    prompt = f"""
You are the research layer inside CaptoX, an Egyptian-equities scanner.
Analyze {stock.symbol} ({stock.company}) using BOTH the supplied deterministic CaptoX metrics and fresh web research.
Prioritize official EGX/company disclosures and reputable financial reporting. Distinguish sourced facts from inference.
Do not invent prices, financial results, news, or events. Do not change CaptoX's deterministic score or state.
Do not give personalized financial advice or claim certainty.

CaptoX snapshot:
- State: {stock.state}
- Opportunity score: {stock.score}/100 (ranking score, NOT probability of profit)
- Last stored close: EGP {stock.price:.2f}
- Daily change: {stock.change:.2f}%
- Relative volume: {stock.volumeRatio:.2f}x
- Trend: {stock.metrics.trend}
- Support: EGP {stock.metrics.support:.2f}
- Resistance: EGP {stock.metrics.resistance:.2f}
- Setup summary: {stock.setupSummary}
- Trigger: {stock.trigger}
- Invalidation: {stock.invalidation}
- Target plan: {stock.tradePlan.model_dump()}

Return ONLY valid JSON with exactly these keys:
summary: string
technicalView: string
newsContext: string
catalysts: array of short strings
risks: array of short strings
conclusion: string

The conclusion must say whether the setup is watch, wait for confirmation, confirmed but extended, or risk warning, with a short reason.
{language_instruction}
"""

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=OPENAI_MODEL,
        tools=[{"type": "web_search"}],
        input=prompt,
    )

    raw = (response.output_text or "").strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start < 0 or end < start:
        raise RuntimeError("AI returned an unreadable analysis format.")

    try:
        parsed = json.loads(raw[start : end + 1])
    except json.JSONDecodeError as exc:
        raise RuntimeError("AI returned an unreadable analysis format.") from exc

    return {
        "model": OPENAI_MODEL,
        "summary": str(parsed.get("summary", "")),
        "technicalView": str(parsed.get("technicalView", "")),
        "newsContext": str(parsed.get("newsContext", "")),
        "catalysts": [str(item) for item in parsed.get("catalysts", [])],
        "risks": [str(item) for item in parsed.get("risks", [])],
        "conclusion": str(parsed.get("conclusion", "")),
        "sources": _extract_sources(response),
    }
