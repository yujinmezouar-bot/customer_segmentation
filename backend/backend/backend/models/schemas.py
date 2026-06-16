from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict

class Customer(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    CustomerID: int
    CustomerCode: float
    CustomerName: str
    CustomerCatégorie: Optional[str] = None
    Region: Optional[str] = None
    Wilaya: Optional[str] = None
    CANet: float
    CAParMoisActif: float
    Fréquence: int
    FreqParMoisActif: float
    QteNette: int
    QteParMoisActif: float
    MoisActifs: int
    MoisDepuisDebut: int
    RatioMoisActifs: float
    TauxRetour: float
    RemiseMoyenne: float
    PartCAHauteMarge: float
    SegmentABC: str
    ScoreCA: int
    ScoreFréquence: int
    ScoreQuantité: int
    ScoreMoisActifs: int
    ScoreRetour: int
    ScoreRemise: int
    ScoreCAMois: int
    ScoreHauteMarge: int
    ScoreGlobal: float

class PaginatedCustomers(BaseModel):
    data: List[Customer]
    total: int
    page: int
    page_size: int

class MetaResponse(BaseModel):
    categories: List[str]
    regions: List[str]
    wilayas: List[str]

class KpiResponse(BaseModel):
    total_clients: int
    ca_total: float
    ca_moyen_mois: float
    score_global_moyen: float
    part_haute_marge_moy: float
    segment_a: int
    segment_b: int
    segment_c: int
