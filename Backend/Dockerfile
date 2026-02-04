# Use Python 3.12 slim image for smaller size
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for audio processing
# Combine RUN commands to reduce layers and image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN useradd -m -u 1000 convoxai && \
    chown -R convoxai:convoxai /app

# Copy requirements first for better layer caching
# This layer will only rebuild if requirements.txt changes
COPY --chown=convoxai:convoxai requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=convoxai:convoxai . .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R convoxai:convoxai logs

# Switch to non-root user
USER convoxai

# Expose port (Railway will override with PORT env var)
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)" || exit 1

# Start the application
# Railway sets PORT env var, so we'll use it if available
CMD python main.py
