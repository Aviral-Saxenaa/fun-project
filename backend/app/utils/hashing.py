import hashlib


def hash_anonymous_id(anonymous_id: str) -> str:
    return hashlib.sha256(anonymous_id.encode()).hexdigest()
