"""
ConvoxAI - Main Entry Point
Run the FastAPI application server
"""
import uvicorn
from api.app import app
from utils.logger_config import setup_logging, get_log_level_from_env
import logging

def main():
    """
    Start the ConvoxAI FastAPI server
    """
    # Initialize logging first
    log_level = get_log_level_from_env()
    setup_logging(log_level=log_level, log_to_file=True)
    
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info("🚀 Starting ConvoxAI Backend Server")
    logger.info(f"📊 Log Level: {log_level}")
    logger.info(f"🌐 Server: http://0.0.0.0:8000")
    logger.info(f"📚 API Docs: http://localhost:8000/docs")
    logger.info("=" * 60)
    
    uvicorn.run(
        "api.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
