import sqlite3, os

DB_PATH = os.getenv("FAQ_DB_PATH", "faqs.sqlite3")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        '''CREATE TABLE IF NOT EXISTS faqs (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               question TEXT,
               answer TEXT,
               approved INTEGER DEFAULT 0,
               created_at DATETIME DEFAULT CURRENT_TIMESTAMP
           )'''
    )
    conn.commit()
    conn.close()

init_db()
