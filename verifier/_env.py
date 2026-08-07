"""Minimal .env loader (no python-dotenv dependency).

Loads KEY=VALUE lines into os.environ without overriding anything already set.
Called by modules that make API calls, so ANTHROPIC_API_KEY from .env is available.
"""
import os
from pathlib import Path


def load_dotenv(path: str = ".env") -> None:
    p = Path(path)
    if not p.exists():
        return
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))
