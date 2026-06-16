import pandas as pd
import numpy as np
from .data_loader import clean_numeric_col, parse_dates_robustly

def prepare_customer_metrics(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    rename_map = {
        "Oid.2": "CustomerID",    "Oid-2": "CustomerID",
        "Code.2": "CustomerCode", "Code-2": "CustomerCode",
        "Label1.2": "CustomerName",       "Label1-2": "CustomerName",
        "Label1.3": "CustomerCatégorie",  "Label1-3": "CustomerCatégorie",
        "Label1.4": "Region",             "Label1-4": "Region",
        "Label1.5": "Wilaya",             "Label1-5": "Wilaya",
    }
    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    required = ["CustomerID", "Amount", "Quantity", "Type", "Oid", "DiscountPercent", "Date"]
    missing  = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes : {missing}")

    df["Date"]            = parse_dates_robustly(df["Date"])
    df["YearMonth"]       = df["Date"].dt.to_period("M")
    df["DiscountPercent"] = pd.to_numeric(df["DiscountPercent"], errors="coerce").fillna(0)
    df["Amount"]          = pd.to_numeric(df["Amount"],          errors="coerce").fillna(0)
    df["Quantity"]        = pd.to_numeric(df["Quantity"],        errors="coerce").fillna(0)

    ca_fallback = pd.Series(
        np.where(df["Type"] == 12, -df["Amount"], df["Amount"]),
        index=df.index
    )
    df["CA"] = clean_numeric_col(df["CA"]).fillna(ca_fallback) if "CA" in df.columns else ca_fallback

    if "VWAP"  in df.columns: df["VWAP"]  = clean_numeric_col(df["VWAP"])
    else:                      df["VWAP"]  = np.nan
    if "MARGE" in df.columns: df["MARGE"] = clean_numeric_col(df["MARGE"])
    else:                      df["MARGE"] = df["Amount"] - df["VWAP"] * df["Quantity"]

    df["MARGE_PCT"]    = np.where(df["CA"].abs() > 0, df["MARGE"] / df["CA"].abs(), np.nan)
    df["IsHighMargin"] = df["MARGE_PCT"] > 0.20

    sales   = df[df["Type"] == 10]
    returns = df[df["Type"] == 12]

    g_sales = sales.groupby("CustomerID", sort=False)
    g_ret   = returns.groupby("CustomerID", sort=False)
    g_all   = df.groupby("CustomerID", sort=False)

    agg_sales = g_sales.agg(
        MontantVendu   =("Amount",          "sum"),
        QteVendue      =("Quantity",        "sum"),
        Fréquence      =("Oid",             "count"),
        RemiseMoyenne  =("DiscountPercent", "mean"),
        MoisActifs     =("YearMonth",       "nunique"),
        PremierAchat   =("Date",            "min"),
    )
    agg_ret = g_ret.agg(
        MontantRetourné=("Amount",   "sum"),
        QteRetournée   =("Quantity", "sum"),
    )
    agg_ca = g_all.agg(CATotal=("CA", lambda x: x.abs().sum()))

    hm_ca = (
        df[df["IsHighMargin"]]
        .groupby("CustomerID", sort=False)["CA"]
        .apply(lambda x: x.abs().sum())
        .rename("CAHauteMarge")
    )

    desc_cols      = ["CustomerCode", "CustomerName", "CustomerCatégorie", "Region", "Wilaya"]
    available_desc = [c for c in desc_cols if c in df.columns]
    desc           = df.groupby("CustomerID", sort=False)[available_desc].first()

    metrics = desc.join(agg_sales).join(agg_ret).join(agg_ca).join(hm_ca).fillna(0)

    metrics["CANet"]      = metrics["MontantVendu"]  - metrics["MontantRetourné"]
    metrics["QteNette"]   = metrics["QteVendue"]     - metrics["QteRetournée"]
    metrics["TauxRetour"] = np.where(
        metrics["MontantVendu"] > 0,
        metrics["MontantRetourné"] / metrics["MontantVendu"], 0.0
    )

    today = pd.Timestamp("today").normalize()
    metrics["PremierAchat"]    = pd.to_datetime(metrics["PremierAchat"], errors="coerce")
    metrics["MoisDepuisDebut"] = (
        (today.year  - metrics["PremierAchat"].dt.year)  * 12
        + (today.month - metrics["PremierAchat"].dt.month)
    ).clip(lower=1)
    metrics["RatioMoisActifs"] = (metrics["MoisActifs"] / metrics["MoisDepuisDebut"]).clip(upper=1.0).round(4)

    mois_safe = metrics["MoisActifs"].replace(0, np.nan)
    metrics["CAParMoisActif"]   = (metrics["CANet"]     / mois_safe).fillna(0).round(2)
    metrics["FreqParMoisActif"] = (metrics["Fréquence"] / mois_safe).fillna(0).round(2)
    metrics["QteParMoisActif"]  = (metrics["QteNette"]  / mois_safe).fillna(0).round(2)

    ca_total_safe = metrics["CATotal"].replace(0, np.nan)
    metrics["PartCAHauteMarge"] = (metrics["CAHauteMarge"] / ca_total_safe).fillna(0).clip(0, 1).round(4)

    drop = ["MontantVendu", "MontantRetourné", "QteVendue", "QteRetournée", "CAHauteMarge", "CATotal"]
    metrics.drop(columns=[c for c in drop if c in metrics.columns], inplace=True)

    for col in ["CANet", "CAParMoisActif", "FreqParMoisActif", "QteParMoisActif",
                "TauxRetour", "RemiseMoyenne", "RatioMoisActifs", "PartCAHauteMarge"]:
        metrics[col] = metrics[col].astype("float32")
    metrics["Fréquence"] = metrics["Fréquence"].astype("int32")
    metrics["QteNette"]  = metrics["QteNette"].astype("int32")

    return metrics.reset_index()
