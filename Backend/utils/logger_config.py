"""
Centralized Logging Configuration Module
Provides consistent logging across the entire ConvoxAI backend application.
"""

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
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5
) -> None:
    """
    Configure application-wide logging with both console and file handlers.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Whether to write logs to file
        log_dir: Directory for log files
        log_filename: Name of the log file
        max_bytes: Maximum size of each log file before rotation
        backup_count: Number of backup files to keep
    """
    # Convert log level string to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Create custom formatter with colors for console
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Create formatters
    formatter = logging.Formatter(log_format, datefmt=date_format)
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File Handler with rotation (if enabled)
    if log_to_file:
        # Create log directory if it doesn't exist
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
    
    # Suppress noisy third-party loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("multipart").setLevel(logging.WARNING)
    
    root_logger.info(f"Logging initialized at {log_level} level")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the specified module.
    
    Args:
        name: Name of the module (typically __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


# Environment-based configuration
def get_log_level_from_env() -> str:
    """Get log level from environment variable or default to INFO."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return os.getenv("LOG_LEVEL", "INFO")
    elif env == "development":
        return os.getenv("LOG_LEVEL", "DEBUG")
    else:
        return os.getenv("LOG_LEVEL", "INFO")
