import sqlite3
import json
import os

DB_PATH = "./neurolens.db"

def analyze_database():
    print("=" * 75)
    print(" 🧠 NEUROLENS AI — SQLITE DATABASE AUDIT & TELEMETRY INSPECTOR ")
    print("=" * 75)

    if not os.path.exists(DB_PATH):
        print(f"❌ Database file not found at: {DB_PATH}")
        print("💡 Tip: The database is automatically created when you submit your first vision test from the frontend.")
        return

    print(f"✅ Successfully connected to SQLite database: {DB_PATH}")
    print(f"📁 Database file size: {os.path.getsize(DB_PATH) / 1024:.2f} KB\n")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Discover all tables in the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row["name"] for row in cursor.fetchall()]
    
    print(f"📌 FOUND {len(tables)} TABLES IN DATABASE:")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) AS count FROM {table};")
        count = cursor.fetchone()["count"]
        print(f"   ➔ [Table: {table}] — {count} rows stored.")

    # 2. Dedicated Audit Log Table Inspection
    if "vision_test_audit_log" in tables:
        print("\n" + "=" * 75)
        print(" 🟢 LIVE AUDIT: WHAT EXACTLY HAPPENED IN THE DATABASE (EXPLICIT COLUMNS) ")
        print("=" * 75)
        
        cursor.execute("SELECT * FROM vision_test_audit_log ORDER BY id DESC LIMIT 5;")
        audit_rows = cursor.fetchall()
        
        if not audit_rows:
            print("   (Audit log table exists but is waiting for your first test submission)")
        else:
            for idx, row in enumerate(audit_rows, 1):
                print(f"\n⚡ AUDIT RECORD #{row['id']} (User: {row['user_id']} | Time: {row['timestamp']})")
                print("-" * 65)
                print(f"   ➔ 📊 Deficiency Detected : {row['deficiency_type']} ({row['percent_accuracy']}% Accuracy)")
                print(f"   ➔ 🎯 Color Confusion     : {row['color_confusion_detected']}")
                print(f"   ➔ 🎨 Transformations     : {row['transformations_applied']}")
                print(f"   ➔ 🧠 AI Diagnosis        : {row['ai_explanation'][:120]}...")

    print("\n" + "=" * 75)
    print(" 📊 DEEP DIVE: INSPECTING RAW JSON TABLES ")
    print("=" * 75)

    for table in tables:
        if table == "vision_test_audit_log":
            continue
        print(f"\n🔵 TABLE: {table.upper()}")
        print("-" * 50)
        
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [col["name"] for col in cursor.fetchall()]
        print(f"Columns: {', '.join(columns)}")

        cursor.execute(f"SELECT * FROM {table} LIMIT 5;")
        rows = cursor.fetchall()

        if not rows:
            print("   (Table is currently empty)")
        else:
            for idx, row in enumerate(rows, 1):
                row_dict = dict(row)
                for k, v in row_dict.items():
                    if isinstance(v, str) and (v.startswith("{") or v.startswith("[")):
                        try:
                            row_dict[k] = json.loads(v)
                        except:
                            pass
                print(f"   Row {idx}: {json.dumps(row_dict, indent=2)}")

    conn.close()
    print("\n" + "=" * 75)
    print(" 🚀 ANALYSIS COMPLETE ")
    print("=" * 75)
    print("💡 Tip: You can also view this database visually using 'DB Browser for SQLite' or the VS Code SQLite extension!")

if __name__ == "__main__":
    analyze_database()
