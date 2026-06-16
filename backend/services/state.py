from typing import Optional
import pandas as pd
from fastapi import HTTPException

# In-memory application state
app_state: dict[str, Optional[pd.DataFrame]] = {
    "df": None
}

def get_app_df() -> pd.DataFrame:
    df = app_state.get("df")
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée chargée. Veuillez charger les données d'abord.")
    return df.copy()
