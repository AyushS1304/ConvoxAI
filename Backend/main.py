"""
ConvoxAI - Main Entry Point
Run the FastAPI application server
"""
import uvicorn
import os
from app.app import app  
from utils.logger_config import setup_logging, get_log_level_from_env
import logging

def main():
    """
    Start the ConvoxAI FastAPI server
    """
    log_level = get_log_level_from_env()
    setup_logging(log_level=log_level, log_to_file=True)
    
    logger = logging.getLogger(__name__)
    
    port = int(os.getenv("PORT", 8000))
    
    logger.info("=" * 60)
    logger.info(" Starting ConvoxAI Backend Server")
    logger.info(f" Log Level: {log_level}")
    logger.info(f" Server: http://0.0.0.0:{port}")
    logger.info(f" API Docs: http://localhost:{port}/docs")
    logger.info("=" * 60)
    
    uvicorn.run(
        "app.app:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
