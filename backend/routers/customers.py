from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import pandas as pd
import numpy as np
from services.state import get_app_df
from services.export import to_excel_bytes
from models.schemas import MetaResponse, PaginatedCustomers

router = APIRouter(prefix="/api")

def apply_filters(df, cat, region, wilaya, segment):
    mask = pd.Series(True, index=df.index)
    if cat != "Tous": mask &= df["CustomerCatégorie"] == cat
    if region != "Tous": mask &= df["Region"] == region
    if wilaya != "Tous": mask &= df["Wilaya"] == wilaya
    if segment != "Tous": mask &= df["SegmentABC"] == segment
    return df[mask]

@router.get("/meta", response_model=MetaResponse)
def get_meta():
    df = get_app_df()
    categories = ["Tous"] + sorted(df["CustomerCatégorie"].dropna().unique().tolist())
    regions = ["Tous"] + sorted(df["Region"].dropna().unique().tolist())
    wilayas = ["Tous"] + sorted(df["Wilaya"].dropna().unique().tolist())
    return {"categories": categories, "regions": regions, "wilayas": wilayas}

@router.get("/customers", response_model=PaginatedCustomers)
def get_customers(
    cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous",
    sort_by: str = "CANet", sort_asc: bool = False,
    page: int = 0, page_size: int = 25, search: str = ""
):
    df = get_app_df()
    df = apply_filters(df, cat, region, wilaya, segment)
    
    if search:
        q = search.lower()
        mask = df["CustomerName"].str.lower().str.contains(q, na=False) | \
               df["CustomerCode"].astype(str).str.contains(q, na=False)
        df = df[mask]
        
    df = df.sort_values(sort_by, ascending=sort_asc).reset_index(drop=True)
    total = len(df)
    
    page_start = page * page_size
    page_end = page_start + page_size
    page_df = df.iloc[page_start:page_end].replace({np.nan: None})
    
    return {
        "data": page_df.to_dict(orient="records"),
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/customers/{id}")
def get_customer(id: int):
    df = get_app_df()
    match = df[df["CustomerID"] == id]
    if match.empty:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    row = match.replace({np.nan: None}).iloc[0].to_dict()
    seg = row["SegmentABC"]
    seg_data = df[df["SegmentABC"] == seg][["CustomerID", "CustomerName", "CANet", "ScoreGlobal"]]
    seg_data = seg_data.replace({np.nan: None}).to_dict(orient="records")
    
    return {"customer": row, "segment_data": seg_data}

@router.get("/export")
def export_data(
    format: str = "csv",
    cat: str = "Tous", region: str = "Tous", wilaya: str = "Tous", segment: str = "Tous"
):
    df = get_app_df()
    fdf = apply_filters(df, cat, region, wilaya, segment)
    
    if format == "csv":
        csv_data = fdf.to_csv(index=False).encode("utf-8")
        return Response(
            content=csv_data, 
            media_type="text/csv", 
            headers={"Content-Disposition": "attachment; filename=clients_filtre.csv"}
        )
    elif format == "xlsx":
        xlsx_data = to_excel_bytes(fdf)
        return Response(
            content=xlsx_data, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            headers={"Content-Disposition": "attachment; filename=clients_filtre.xlsx"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format")
