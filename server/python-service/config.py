import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Qualcomm AI Hub Configuration
QUALCOMM_MODEL_ID = os.getenv('QUALCOMM_MODEL_ID', 'mq885klzq')
QUALCOMM_API_KEY = os.getenv('QUALCOMM_API_KEY', 'bet3vrp7r5aysc09ypmmyf21suvmwn9nkgr7j80d')
FLASK_PORT = int(os.getenv('PYTHON_SERVICE_PORT', 5001))
FLASK_HOST = os.getenv('PYTHON_SERVICE_HOST', '127.0.0.1')
