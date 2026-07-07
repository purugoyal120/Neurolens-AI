import os
from sqlalchemy import create_engine
from app.db.session import Base
from app.models import simple_vision_profile, vision_profile, user

def main():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Please set DATABASE_URL environment variable.")
        return
        
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

    print(f"Connecting to database...")
    engine = create_engine(db_url)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    main()
