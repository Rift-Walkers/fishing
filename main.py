from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# PostgreSQL connection using Railway DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")  # Ensure this is set on Railway
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Pydantic models for request bodies
class User(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# SQLAlchemy model for user authentication
class UserModel(Base):
    __tablename__ = "user_auth"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)

# Create the tables if they don't exist
Base.metadata.create_all(bind=engine)

# FastAPI app instance
app = FastAPI()

# CORS configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Simple password verification (use a secure method in production)
def verify_password(plain_password, hashed_password):
    return plain_password == hashed_password

# Updated function to get user by email from the Railway PostgreSQL database
def get_user(db, email: str):
    return db.query(UserModel).filter(UserModel.email == email).first()

# Authenticate user using the email and password provided
def authenticate_user(db, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# Function to create a JWT access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "secret_key_here", algorithm="HS256")
    return encoded_jwt

# Login endpoint
@app.post("/login")
async def login(user: UserLogin, db: SessionLocal = Depends(get_db)):
    user_record = get_user(db, user.email)
    if not user_record:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(user.password, user_record.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Register endpoint
@app.post("/register")
async def register(user: User, db: SessionLocal = Depends(get_db)):
    existing_user = get_user(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = UserModel(email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

# Protected route to get current user info
@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme), db: SessionLocal = Depends(get_db)):
    try:
        payload = jwt.decode(token, "secret_key_here", algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        user = get_user(db, email)
        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Access token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"email": user.email}

# Basic root route for testing
@app.get("/")
def read_root():
    return {"message": "App is alive (DB disabled)"}

# Exception for credential issues
credentials_exception = HTTPException(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

# Entry point for Railway (only used when running `python main.py`)
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting FastAPI on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port)
