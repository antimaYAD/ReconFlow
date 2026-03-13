"""
Quick script to check user status and reset password if needed
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.security import hash_password, verify_password
from app.models.user import User

# SQLite database
DATABASE_URL = "sqlite:///./reconflow.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\n=== Found {len(users)} user(s) ===\n")
        
        for user in users:
            print(f"Email: {user.email}")
            print(f"ID: {user.id}")
            print(f"Active: {user.is_active}")
            print(f"Role: {user.role}")
            print(f"Org ID: {user.organization_id}")
            print(f"Password hash (first 20 chars): {user.password_hash[:20]}...")
            print("-" * 50)
    finally:
        db.close()

def reset_password(email: str, new_password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found!")
            return
        
        # Update password
        user.password_hash = hash_password(new_password)
        user.is_active = True  # Ensure user is active
        db.commit()
        
        print(f"\n✅ Password reset successful for {email}")
        print(f"New password: {new_password}")
        print(f"User is now active: {user.is_active}")
        
    finally:
        db.close()

def test_login(email: str, password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User {email} not found")
            return
        
        if not user.is_active:
            print(f"❌ User {email} is not active")
            return
        
        if verify_password(password, user.password_hash):
            print(f"✅ Login successful for {email}")
        else:
            print(f"❌ Invalid password for {email}")
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("ReconFlow User Management")
    print("="*60)
    
    # Check all users
    check_users()
    
    # Example: Reset password for a user
    # Uncomment and modify these lines to reset password:
    # reset_password("your-email@example.com", "newpassword123")
    # test_login("your-email@example.com", "newpassword123")
