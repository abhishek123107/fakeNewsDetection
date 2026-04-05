import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    
    # Server Configuration
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    
    # Model Configuration
    MODEL_PATH = os.environ.get('MODEL_PATH', 'fake_news_model_fixed.pkl')
    
    # Database Configuration
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///predictions.db')
    
    # API Configuration
    API_RATE_LIMIT = int(os.environ.get('API_RATE_LIMIT', 100))
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    
    # Security Configuration
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))  # 16MB
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'app.log')
    
    # Production vs Development
    DEBUG = FLASK_ENV == 'development'
    
    @staticmethod
    def init_app(app):
        """Initialize app with configuration"""
        app.config.from_object(__class__)
        
        # Override config for production
        if os.environ.get('FLASK_ENV') == 'production':
            app.config['DEBUG'] = False
            app.config['TESTING'] = False
