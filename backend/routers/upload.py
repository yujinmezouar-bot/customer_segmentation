import io
from fastapi import APIRouter, UploadFile, File
from services.data_loader import load_data
from services.scoring import build_scored_df
from services.state import app_state

router = APIRouter(prefix="/api")

@router.get("/data/demo")
def generate_demo():
    raw_df = load_data()
    app_state["df"] = build_scored_df(raw_df)
    return {"message": "Demo data loaded successfully"}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    file_type = "csv" if file.filename.lower().endswith(".csv") else "excel"
    raw_df = load_data(io.BytesIO(contents), file_type)
    app_state["df"] = build_scored_df(raw_df)
    return {"message": "File uploaded and processed successfully"}
