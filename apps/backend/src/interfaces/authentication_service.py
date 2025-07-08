from abc import ABC, abstractmethod

from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.data_models.schemas import UserCreate, Token
from src.db import models


class AuthenticationService(ABC):
    @abstractmethod
    def register_user(self, db: Session, user_create: UserCreate) -> models.User:
        """
        Registers a new user.
        """
        pass

    @abstractmethod
    def login_user(self, db: Session, form_data: OAuth2PasswordRequestForm) -> Token:
        """
        Logs in a user and returns an access token.
        """
        pass

    @abstractmethod
    def get_current_user(self, db: Session, token: str) -> models.User:
        """
        Gets the current authenticated user from a token.
        """
        pass
