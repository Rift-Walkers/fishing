from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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

# PostgreSQL connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Define the User model
class User(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserModel(Base):
    __tablename__ = "user_auth"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)

# Create the tables if they don't exist
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

# CORS configuration
origins = [
    "http://127.0.0.1:5500",  # Allow requests from this origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to verify password
def verify_password(plain_password, hashed_password):
    # For simplicity, this example uses plain text passwords.
    # In a real application, use a secure method like bcrypt.
    return plain_password == hashed_password

# Function to get user by username
def get_user(db, username):
    return db.query(User).filter(User.username == username).first()

# Function to authenticate user
def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# Function to create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)  # Default expiration
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "secret_key_here", algorithm="HS256")
    return encoded_jwt

# Login endpoint
@app.post("/login")
async def login(user: UserLogin, db: SessionLocal = Depends(get_db)):
    user_record = db.query(UserModel).filter(UserModel.email == user.email).first()
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
    access_token_expires = timedelta(minutes=60)  # Token expires in 1 hour
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
    
# Register endpoint
@app.post("/register")
async def register(user: User, db: SessionLocal = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = UserModel(email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

# Protected route example
@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme), db: SessionLocal = Depends(get_db)):
    try:
        payload = jwt.decode(token, "secret_key_here", algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = get_user(db, username)
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
    return {"username": user.username}
