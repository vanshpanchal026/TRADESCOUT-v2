from app.core.config import Settings, _parse_cors_origins


def test_default_config_values():
    """Verify default configuration values match requirements."""
    cfg = Settings()
    assert cfg.PROJECT_NAME == "TRADESCOUT"
    assert cfg.VERSION == "1.0.0"
    assert cfg.DEBUG is False
    assert cfg.REDIS_URL == "redis://localhost:6379/0"
    assert "http://localhost:3000" in cfg.CORS_ORIGINS


def test_cors_origin_parser():
    """Verify CORS origins parsing handles list, JSON string, and comma-separated string."""
    assert _parse_cors_origins(["http://localhost:3000", "http://example.com"]) == [
        "http://localhost:3000",
        "http://example.com",
    ]
    assert _parse_cors_origins('["http://localhost:3000"]') == ["http://localhost:3000"]
    assert _parse_cors_origins("http://localhost:3000, https://tradescout.io") == [
        "http://localhost:3000",
        "https://tradescout.io",
    ]
    assert _parse_cors_origins(None) == ["http://localhost:3000"]
