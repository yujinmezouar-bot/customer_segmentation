import pandas as pd
import numpy as np
from .metrics import prepare_customer_metrics

def assign_segment(series: pd.Series) -> np.ndarray:
    q80 = series.quantile(0.80)
    q50 = series.quantile(0.50)
    return np.select([series >= q80, (series >= q50) & (series < q80)], ["A", "B"], default="C")

def score_metric(series: pd.Series) -> pd.Series:
    scores    = pd.Series(1, index=series.index, dtype="int8")
    quantiles = [series.quantile(q) for q in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]]
    for score in range(1, 6):
        lo, hi = quantiles[score - 1], quantiles[score]
        mask = (series >= lo) & (series < hi) if score < 5 else (series >= lo)
        scores[mask] = score
    return scores

def score_return_rate(series: pd.Series) -> pd.Series:
    s = pd.Series(1, index=series.index, dtype="int8")
    s[series <= 0.10] = 2
    s[series <= 0.05] = 3
    s[series <= 0.03] = 4
    s[series <= 0.01] = 5
    return s

def score_discount(series: pd.Series) -> pd.Series:
    scores    = pd.Series(5, index=series.index, dtype="int8")
    quantiles = [series.quantile(q) for q in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]]
    for score in range(1, 6):
        lo = quantiles[5 - score]
        hi = quantiles[6 - score]
        mask = (series >= lo) if score == 1 else (series >= lo) & (series < hi)
        scores[mask] = score
    return scores

def build_scored_df(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = prepare_customer_metrics(raw_df)
    df["SegmentABC"]      = assign_segment(df["CANet"])
    df["ScoreCA"]         = score_metric(df["CANet"])
    df["ScoreFréquence"]  = score_metric(df["Fréquence"])
    df["ScoreQuantité"]   = score_metric(df["QteNette"])
    df["ScoreMoisActifs"] = score_metric(df["RatioMoisActifs"])
    df["ScoreRetour"]     = score_return_rate(df["TauxRetour"])
    df["ScoreRemise"]     = score_discount(df["RemiseMoyenne"])
    df["ScoreCAMois"]     = score_metric(df["CAParMoisActif"])
    df["ScoreHauteMarge"] = score_metric(df["PartCAHauteMarge"])
    df["ScoreGlobal"]     = (
        0.30 * df["ScoreCA"]         +
        0.15 * df["ScoreFréquence"]  +
        0.10 * df["ScoreQuantité"]   +
        0.10 * df["ScoreMoisActifs"] +
        0.10 * df["ScoreRetour"]     +
        0.05 * df["ScoreRemise"]     +
        0.10 * df["ScoreCAMois"]     +
        0.10 * df["ScoreHauteMarge"]
    ).round(2).astype("float32")

    col_order = [
        "CustomerID", "CustomerCode", "CustomerName", "CustomerCatégorie", "Region", "Wilaya",
        "CANet", "CAParMoisActif", "Fréquence", "FreqParMoisActif",
        "QteNette", "QteParMoisActif", "MoisActifs", "MoisDepuisDebut",
        "RatioMoisActifs", "TauxRetour", "RemiseMoyenne", "PartCAHauteMarge", "SegmentABC",
        "ScoreCA", "ScoreFréquence", "ScoreQuantité", "ScoreMoisActifs",
        "ScoreRetour", "ScoreRemise", "ScoreCAMois", "ScoreHauteMarge", "ScoreGlobal"
    ]
    return df[[c for c in col_order if c in df.columns]]
