from typing import Optional
from pydantic import BaseModel


class ClubCreate(BaseModel):
    name: str
    country: Optional[str] = "Indonesia"
    league: Optional[str] = "Liga 1"
    instagram_handle: Optional[str] = None
