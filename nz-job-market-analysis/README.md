# NZ Job Market Data Analysis (Tech Roles)

A reproducible **Python data analysis project** exploring New Zealand's tech job market (example dataset + notebook). 
Use this as a real portfolio piece: it demonstrates data cleaning, exploratory analysis, visualization, and reporting.

> Replace the sample CSV with your real scraped/collected data later.

## ✨ Highlights
- Clear project structure (`data/`, `notebooks/`, `src/`)
- Jupyter Notebook with **EDA → Cleaning → Insights → Charts**
- Pure **matplotlib** charts (no seaborn), easy to run anywhere
- Ready-made **report outline** for your PDF/website portfolio

## 🚀 Quick Start
```bash
# 1) Create and activate a virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2) Install dependencies
pip install -r requirements.txt

# 3) Launch Jupyter
jupyter lab  # or: jupyter notebook

# 4) Open notebooks/analysis.ipynb and run all cells
```

## 🗂 Structure
```
nz-job-market-analysis/
├─ data/
│  └─ jobs_sample.csv
├─ notebooks/
│  └─ analysis.ipynb
├─ src/
│  └─ utils.py
├─ report_outline.md
├─ requirements.txt
└─ README.md
```

## 🔁 Replace Sample Data
- Keep the columns consistent if possible: `date_posted, role, company, city, salary_min, salary_max, seniority, skills`
- You can expand with more fields (e.g., `employment_type`, `industry`, `remote`, `source`). Update the notebook accordingly.

## 🧭 Suggested Questions
- Which **roles** are most in-demand?
- How do **salary ranges** compare by **role / city / seniority**?
- What **skills** appear most frequently?
- Are there seasonal trends (by `date_posted`)?

## 📄 Export
In the notebook, you can export cleaned datasets and figures to `data/processed/` and `figures/` (created automatically when needed).

## 🧪 Next Steps
- Add a scraper notebook (`notebooks/scrape.ipynb`) or Python scripts in `src/`
- Enrich with real data from job boards' APIs or CSVs you download
- Write a short PDF report from `report_outline.md` (use Pandoc/Typora/Notion/Word)

MIT © 2025 Edison Zhang
