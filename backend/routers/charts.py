from fastapi import APIRouter
import numpy as np
import pandas as pd
from services.state import get_app_df
from routers.customers import apply_filters
from models.schemas import KpiResponse

router = APIRouter(prefix="/api/charts")

def bin_histogram(df, col, bins=20, color_col=None):
    if df.empty or col not in df.columns: return []
    if color_col:
        min_val, max_val = df[col].min(), df[col].max()
        if pd.isna(min_val): return []
        edges = np.linspace(min_val, max_val, bins+1)
        cats = df[color_col].unique()
        binned = []
        for i in range(bins):
            b_min, b_max = edges[i], edges[i+1]
            row = {"bin": f"{b_min:.2f}-{b_max:.2f}"}
            for c in cats:
                mask = (df[color_col] == c) & (df[col] >= b_min) & (df[col] <= b_max)
                row[c] = int(mask.sum())
            binned.append(row)
        return binned
    else:
        series = df[col].dropna()
        if series.empty: return []
        counts, edges = np.histogram(series, bins=bins)
        return [{"bin": f"{edges[i]:.2f}-{edges[i+1]:.2f}", "count": int(c)} for i, c in enumerate(counts)]

@router.get("/kpis", response_model=KpiResponse)
def get_kpis(cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous"):
    fdf = apply_filters(get_app_df(), cat, region, wilaya, segment)
    avg_hm = float(fdf["PartCAHauteMarge"].mean()) * 100 if not fdf.empty else 0
    return {
        "total_clients": len(fdf),
        "ca_total": float(fdf["CANet"].sum()),
        "ca_moyen_mois": float(fdf["CAParMoisActif"].mean()) if not fdf.empty else 0,
        "score_global_moyen": float(fdf["ScoreGlobal"].mean()) if not fdf.empty else 0,
        "part_haute_marge_moy": avg_hm,
        "segment_a": int((fdf["SegmentABC"] == "A").sum()),
        "segment_b": int((fdf["SegmentABC"] == "B").sum()),
        "segment_c": int((fdf["SegmentABC"] == "C").sum()),
    }

@router.get("/segmentation")
def get_segmentation(cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous"):
    fdf = apply_filters(get_app_df(), cat, region, wilaya, segment)
    pie = fdf["SegmentABC"].value_counts().reset_index()
    pie.columns = ["Segment", "Nombre"]
    
    seg_rev = fdf.groupby("SegmentABC", sort=False)["CANet"].sum().reset_index()
    seg_hm = fdf.groupby("SegmentABC", sort=False)["PartCAHauteMarge"].mean().reset_index()
    
    return {
        "pie": pie.to_dict(orient="records"),
        "bar_ca": seg_rev.to_dict(orient="records"),
        "bar_hm": seg_hm.to_dict(orient="records"),
        "box_data": fdf[["SegmentABC", "CANet"]].replace({np.nan: None}).to_dict(orient="records")
    }

@router.get("/revenue")
def get_revenue(view: str = "CA Net", cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous"):
    fdf = apply_filters(get_app_df(), cat, region, wilaya, segment)
    mcol = "CANet" if view == "CA Net" else "CAParMoisActif"
    top20 = fdf.nlargest(20, mcol)[["CustomerName", "SegmentABC", mcol]].replace({np.nan: None}).to_dict(orient="records")
    reg_rev = fdf.groupby("Region", sort=False)[mcol].sum().sort_values(ascending=False).reset_index().to_dict(orient="records")
    wil_rev = fdf.groupby("Wilaya", sort=False)[mcol].sum().nlargest(15).reset_index().to_dict(orient="records")
    
    return {"top20": top20, "by_region": reg_rev, "by_wilaya": wil_rev, "mcol": mcol}

@router.get("/scores")
def get_scores(cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous"):
    fdf = apply_filters(get_app_df(), cat, region, wilaya, segment)
    hist_global = bin_histogram(fdf, "ScoreGlobal", 20)
    seg_sc = fdf.groupby("SegmentABC", sort=False)["ScoreGlobal"].mean().reset_index().to_dict(orient="records")
    reg_sc = fdf.groupby("Region", sort=False)["ScoreGlobal"].mean().sort_values(ascending=False).reset_index().to_dict(orient="records")
    
    score_cols = ["ScoreCA","ScoreFréquence","ScoreQuantité","ScoreMoisActifs","ScoreRetour","ScoreRemise","ScoreCAMois","ScoreHauteMarge"]
    labels_fr  = ["CA","Fréquence","Quantité","Mois Actifs","Retour","Remise","CA/Mois","Haute Marge"]
    avg_sc = []
    if not fdf.empty:
        means = fdf[score_cols].mean().tolist()
        avg_sc = [{"Score": l, "Moyenne": m} for l, m in zip(labels_fr, means)]
        
    return {"hist_global": hist_global, "seg_sc": seg_sc, "reg_sc": reg_sc, "avg_sc": avg_sc}

@router.get("/advanced")
def get_advanced(cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous"):
    fdf = apply_filters(get_app_df(), cat, region, wilaya, segment)
    scatter1 = fdf[["Fréquence", "CANet", "QteNette", "SegmentABC", "CustomerName", "PartCAHauteMarge"]].replace({np.nan: None}).to_dict(orient="records")
    scatter2 = fdf[["RatioMoisActifs", "CAParMoisActif", "SegmentABC", "CustomerName"]].replace({np.nan: None}).to_dict(orient="records")
    
    heat = fdf.groupby(["Region","SegmentABC"], sort=False).size().reset_index(name="Nombre")
    hist_hm = bin_histogram(fdf, "PartCAHauteMarge", 30, color_col="SegmentABC")
    hist_ret = bin_histogram(fdf, "TauxRetour", 30)
    
    return {
        "scatter1": scatter1,
        "scatter2": scatter2,
        "heatmap": heat.to_dict(orient="records"),
        "hist_hm": hist_hm,
        "hist_ret": hist_ret
    }
