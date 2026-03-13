"""
Reset password for a user
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.security import hash_password
from app.models.user import User

# SQLite database
DATABASE_URL = "sqlite:///./reconflow.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

def reset_password(email: str, new_password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email {email} not found!")
            return
        
        # Update password
        user.password_hash = hash_password(new_password)
        user.is_active = True  # Ensure user is active
        db.commit()
        
        print(f"\n✅ Password reset successful!")
        print(f"Email: {email}")
        print(f"New password: {new_password}")
        print(f"\nYou can now login with these credentials.")
        
    finally:
        db.close()

if __name__ == "__main__":
    # Reset password for your user
    email = "antimayadav3102002@gmail.com"
    new_password = "admin123"  # Change this to whatever you want
    
    print("\n" + "="*60)
    print("ReconFlow Password Reset")
    print("="*60 + "\n")
    
    reset_password(email, new_password)
