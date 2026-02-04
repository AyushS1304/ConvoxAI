import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
import os


def setup_logging(
    log_level: str = "INFO",
    log_to_file: bool = True,
    log_dir: str = "logs",
    log_filename: str = "convoxai.log",
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 5
) -> None:
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    formatter = logging.Formatter(log_format, datefmt=date_format)
    
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    root_logger.handlers.clear()
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    if log_to_file:
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)
        
        file_path = log_path / log_filename
        file_handler = RotatingFileHandler(
            filename=str(file_path),
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8"
        )
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
        
        root_logger.info(f"Logging to file: {file_path}")
    
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("multipart").setLevel(logging.WARNING)
    
    root_logger.info(f"Logging initialized at {log_level} level")


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def get_log_level_from_env() -> str:
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return os.getenv("LOG_LEVEL", "INFO")
    elif env == "development":
        return os.getenv("LOG_LEVEL", "DEBUG")
    else:
        return os.getenv("LOG_LEVEL", "INFO")
