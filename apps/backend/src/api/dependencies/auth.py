from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.auth.service import ConcreteAuthenticationService
from src.data_models.schemas import User
from src.db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
auth_service = ConcreteAuthenticationService()


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current active user from a token.
    """
    db_user = auth_service.get_current_user(db, token)
    return User.model_validate(db_user)
