from pydantic import BaseModel
from typing import Literal


CheckoutTier = Literal["Pro", "Max"]


class CheckoutRequest(BaseModel):
    tier: CheckoutTier


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str
