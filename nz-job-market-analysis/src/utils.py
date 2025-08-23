from __future__ import annotations
import pandas as pd

def normalize_city(s: str) -> str:
    if not isinstance(s, str):
        return s
    s = s.strip().title()
    aliases = {
        'Akl': 'Auckland',
        'Akld': 'Auckland',
        'Wgtn': 'Wellington',
        'Chch': 'Christchurch',
    }
    return aliases.get(s, s)

def salary_midpoint(row: pd.Series) -> float | None:
    lo, hi = row.get('salary_min'), row.get('salary_max')
    try:
        lo = float(lo) if lo is not None else None
        hi = float(hi) if hi is not None else None
    except Exception:
        return None
    if lo is None and hi is None:
        return None
    if lo is None: return hi
    if hi is None: return lo
    return (lo + hi) / 2.0
