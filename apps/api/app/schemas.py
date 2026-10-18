from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

ID_PATTERN = r"^[A-Za-z0-9_.:\-]{1,128}$"


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_.\-]+$")
    password: str = Field(min_length=8, max_length=256)
    device_name: str = Field(default="", max_length=120)


class TokenOut(BaseModel):
    token: str
    username: str
    expires_at: str


class Change(BaseModel):
    collection: str = Field(max_length=40)
    id: str = Field(pattern=ID_PATTERN)
    base_version: int = Field(ge=0)
    deleted: bool = False
    data: dict[str, Any] = Field(default_factory=dict)


class PushIn(BaseModel):
    device_id: str = Field(default="", max_length=64)
    changes: list[Change] = Field(max_length=500)


class RecordOut(BaseModel):
    collection: str
    id: str
    version: int
    deleted: bool
    seq: int
    data: dict[str, Any]
    updated_at: str
    device_id: str = ""


class PushResult(BaseModel):
    collection: str
    id: str
    status: Literal["ok", "conflict", "rejected"]
    version: int | None = None
    seq: int | None = None
    server: RecordOut | None = None
    error: str | None = None


class PushOut(BaseModel):
    results: list[PushResult]
    cursor: int


class PullOut(BaseModel):
    changes: list[RecordOut]
    cursor: int
    has_more: bool


class ImportIn(BaseModel):
    format: Literal["academy-export"]
    schema_version: int = 1
    records: list[dict[str, Any]]

    @field_validator("records")
    @classmethod
    def _limit(cls, v):
        if len(v) > 50_000:
            raise ValueError("çok fazla kayıt")
        return v
