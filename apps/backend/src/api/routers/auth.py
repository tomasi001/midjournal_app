from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.auth.service import ConcreteAuthenticationService
from src.data_models.schemas import User, UserCreate, Token
from src.api.dependencies.auth import get_current_user
from src.db.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
)

auth_service = ConcreteAuthenticationService()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    db_user = auth_service.register_user(db, user_create)
    return User.model_validate(db_user)


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Log in a user to get an access token.
    """
    return auth_service.login_user(db, form_data)


@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Returns the current authenticated user's details.
    """
    return current_user
