from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClubBase(BaseModel):
    name: str
    country: Optional[str] = None
    league: Optional[str] = None
    instagram_handle: Optional[str] = None

class ClubCreate(ClubBase):
    pass

class Club(ClubBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    club_id: int
    post_type: str
    caption: Optional[str] = None
    post_url: Optional[str] = None
    post_date: str
    source_filename: Optional[str] = None

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    post_id: int
    comment_id: str
    text: str
    username: Optional[str] = None
    user_id: Optional[str] = None
    profile_pic_url: Optional[str] = None
    comment_created_at: Optional[datetime] = None

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class IngestionJobBase(BaseModel):
    status: str = "pending"
    total_files: int = 0
    total_rows: int = 0
    inserted_rows: int = 0
    duplicate_rows: int = 0
    failed_rows: int = 0

class IngestionJobCreate(IngestionJobBase):
    metadata: Optional[dict] = None

class IngestionJob(IngestionJobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UploadMetadata(BaseModel):
    club_id: int
    post_type: str
    caption: Optional[str] = None
    post_url: Optional[str] = None
    post_date: str

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None