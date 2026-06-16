import pandas as pd
import numpy as np

def generate_demo_data(n_customers=300, n_rows=5000):
    np.random.seed(42)
    categories = ["Comptoir et Parapharm", "Hôpital", "Clinique Privée", "Grossiste", "Pharmacie"]
    regions    = ["Centre", "Est", "Ouest", "Kabylie", "Sud"]
    wilayas    = {
        "Centre":  ["Alger", "Blida", "Boumerdès", "Tipaza"],
        "Est":     ["Constantine", "Annaba", "Sétif", "Skikda"],
        "Ouest":   ["Oran", "Tlemcen", "Sidi Bel Abbès", "Mostaganem"],
        "Kabylie": ["Tizi Ouzou", "Béjaïa", "Bouira"],
        "Sud":     ["Ouargla", "Tamanrasset", "Ghardaïa"]
    }
    customer_ids     = np.arange(1, n_customers + 1)
    customer_codes   = customer_ids + 1000
    customer_names   = [f"CLIENT_{i:04d} SARL" for i in customer_ids]
    customer_cats    = np.random.choice(categories, n_customers)
    customer_regions = np.random.choice(regions, n_customers)
    customer_wilayas = [np.random.choice(wilayas[r]) for r in customer_regions]

    idx_arr   = np.random.randint(0, n_customers, n_rows)
    t_types   = np.random.choice([10, 12], n_rows, p=[0.88, 0.12])
    qtys      = np.random.randint(1, 50, n_rows)
    amounts   = np.round(np.random.exponential(5000, n_rows) + 500, 2)
    discounts = np.random.choice([0, 0, 0, 2, 5, 10], n_rows, p=[0.5, 0.2, 0.1, 0.1, 0.07, 0.03])
    dates     = [pd.Timestamp("2023-01-01") + pd.Timedelta(days=int(d))
                 for d in np.random.randint(0, 730, n_rows)]
    vwaps     = np.round(amounts / qtys * np.random.uniform(0.5, 0.9, n_rows), 2)
    marges    = np.round(amounts - vwaps * qtys, 2)
    cas       = np.where(t_types == 10, amounts, -amounts)

    df = pd.DataFrame({
        "Oid":            np.random.randint(10000, 99999, n_rows),
        "Quantity":       qtys,
        "Amount":         amounts,
        "CA":             cas,
        "MARGE":          marges.astype(str),
        "VWAP":           vwaps.astype(str),
        "DiscountPercent": discounts,
        "Date":           dates,
        "Type":           t_types,
        "Oid.2":          customer_ids[idx_arr],
        "Code.2":         customer_codes[idx_arr].astype(float),
        "Label1.2":       [customer_names[i] for i in idx_arr],
        "Label1.3":       [customer_cats[i]  for i in idx_arr],
        "Label1.4":       [customer_regions[i] for i in idx_arr],
        "Label1.5":       [customer_wilayas[i] for i in idx_arr],
    })
    df["Type"]            = df["Type"].astype("int8")
    df["DiscountPercent"] = df["DiscountPercent"].astype("float32")
    df["Amount"]          = df["Amount"].astype("float32")
    df["CA"]              = df["CA"].astype("float32")
    df["Quantity"]        = df["Quantity"].astype("int16")
    return df

def clean_numeric_col(series: pd.Series) -> pd.Series:
    excel_errors = {"#VALUE!", "#DIV/0!", "#N/A", "#REF!", "#NAME?", "#NULL!", "#NUM!"}
    s = series.astype(str).str.strip().replace(list(excel_errors), np.nan)
    s = s.str.replace("%", "", regex=False)
    return pd.to_numeric(s, errors="coerce")

def parse_dates_robustly(series: pd.Series) -> pd.Series:
    parsed   = pd.to_datetime(series, errors="coerce", dayfirst=False)
    mask_nat = parsed.isna()
    if mask_nat.any():
        parsed[mask_nat] = pd.to_datetime(series[mask_nat], errors="coerce", dayfirst=True)
    return parsed

def load_data(file=None, file_type=None):
    if file is None:
        return generate_demo_data()
    if file_type == "csv":
        return pd.read_csv(file)
    return pd.read_excel(file)
