"""
Qualcomm AI Hub Flask Microservice
Purpose: Serve as bridge between Node.js backend and Qualcomm AI Hub
Model: Compliance Classification (mq885klzq)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback
import logging
import numpy as np
import config

# Try to import Qualcomm AI Hub SDK
try:
    import qai_hub as hub
    QAIHUB_AVAILABLE = True
except ImportError:
    QAIHUB_AVAILABLE = False
    print("⚠️  Warning: qai-hub not installed. Using mock predictions.")

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Qualcomm AI Hub model
qualcomm_model_id = None

def initialize_qualcomm_model():
    """Initialize connection to Qualcomm AI Hub model"""
    global qualcomm_model_id
    
    if not QAIHUB_AVAILABLE:
        logger.warning("Qualcomm AI Hub SDK not available")
        return False
    
    try:
        logger.info(f"🔗 Connecting to Qualcomm AI Hub...")
        logger.info(f"📦 Model ID: {config.QUALCOMM_MODEL_ID}")
        
        # Configuration is done via CLI: qai-hub configure
        # No need to call hub.configure() in Python
        
        # Set the model ID for inference
        qualcomm_model_id = config.QUALCOMM_MODEL_ID
        
        logger.info(f"✅ Successfully configured Qualcomm AI Hub")
        logger.info(f"✅ Model ID ready: {qualcomm_model_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Qualcomm AI Hub: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def fallback_classification(data):
    """Rule-based fallback classification when Qualcomm AI is unavailable"""
    logger.info("⚠️  Using fallback rule-based classification")
    
    aksi = data.get('aksi', '')
    waktu_seharusnya = datetime.fromisoformat(data.get('waktu_konsumsi_seharusnya', '').replace('Z', '+00:00'))
    waktu_aktual = datetime.fromisoformat(data.get('timestamp_konsumsi_aktual', '').replace('Z', '+00:00'))
    
    # Rule 1: If rejected, not compliant
    if aksi == 'Tolak':
        return {
            'kepatuhan': 'Tidak Patuh',
            'confidence': 1.0,
            'method': 'fallback',
            'reason': 'Patient rejected medication'
        }
    
    # Rule 2: Check delay
    delay_minutes = (waktu_aktual - waktu_seharusnya).total_seconds() / 60
    
    if abs(delay_minutes) <= 30:
        return {
            'kepatuhan': 'Patuh',
            'confidence': 0.8,
            'method': 'fallback',
            'delayMinutes': round(delay_minutes, 1),
            'reason': 'Within acceptable time window (±30 minutes)'
        }
    else:
        return {
            'kepatuhan': 'Tidak Patuh',
            'confidence': 0.8,
            'method': 'fallback',
            'delayMinutes': round(delay_minutes, 1),
            'reason': f'Delay exceeds threshold ({round(delay_minutes, 1)} minutes)'
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Qualcomm AI Hub Compliance Service',
        'model_id': config.QUALCOMM_MODEL_ID,
        'qualcomm_configured': qualcomm_model_id is not None,
        'qai_hub_installed': QAIHUB_AVAILABLE
    })

@app.route('/predict', methods=['POST'])
def predict_compliance():
    """
    Predict medication compliance using Qualcomm AI Hub model
    
    Expected input:
    {
        "waktu_konsumsi_seharusnya": "2025-01-13T10:00:00.000Z",
        "timestamp_konsumsi_aktual": "2025-01-13T10:05:00.000Z",
        "aksi": "Terima" | "Tolak"
    }
    
    Response:
    {
        "success": true,
        "kepatuhan": "Patuh" | "Tidak Patuh",
        "confidence": 0.95,
        "method": "qualcomm-ai" | "fallback"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['waktu_konsumsi_seharusnya', 'timestamp_konsumsi_aktual', 'aksi']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        logger.info(f"📥 Received prediction request: {data}")
        
        # Try Qualcomm AI Hub prediction first
        if qualcomm_model_id is not None and QAIHUB_AVAILABLE:
            try:
                logger.info("🤖 Calling Qualcomm AI Hub model...")
                
                # Prepare input data for the model
                # Convert datetime strings to calculate delay
                waktu_seharusnya = datetime.fromisoformat(data['waktu_konsumsi_seharusnya'].replace('Z', '+00:00'))
                waktu_aktual = datetime.fromisoformat(data['timestamp_konsumsi_aktual'].replace('Z', '+00:00'))
                delay_minutes = (waktu_aktual - waktu_seharusnya).total_seconds() / 60
                aksi = data['aksi']
                
                # If action is "Tolak" (reject), automatically classify as Tidak Patuh
                if aksi == 'Tolak':
                    return jsonify({
                        'success': True,
                        'kepatuhan': 'Tidak Patuh',
                        'confidence': 1.0,
                        'method': 'rule-based',
                        'delayMinutes': round(delay_minutes, 1),
                        'reason': 'Medication rejected by patient'
                    })
                
                # Create feature array for the model - expects shape (1, 1) with delay_minutes only
                # Model: DeepSleep_Model expects single input: delay in minutes
                model_input = np.array([[delay_minutes]], dtype=np.float32)
                
                logger.info(f"🔢 Model input - Delay: {delay_minutes} min, Aksi: {aksi}, Shape: {model_input.shape}")
                
                # Get the model object
                model = hub.get_model(qualcomm_model_id)
                
                # Get a suitable device (using first available device)
                devices = hub.get_devices()
                device = devices[0] if devices else None
                
                if not device:
                    raise Exception("No devices available for inference")
                
                logger.info(f"🎯 Using device: {device.name}")
                
                # Submit inference job to Qualcomm AI Hub
                job = hub.submit_inference_job(
                    model=model,
                    device=device,
                    inputs={"serving_default_keras_tensor:0": [model_input]}  # Correct tensor name for Keras model
                )
                
                logger.info(f"⏳ Job submitted: {job.job_id}, waiting for result...")
                
                # Wait for job completion and get the result
                job.wait()
                result = job.download_output_data()
                
                logger.info(f"✅ Qualcomm AI prediction: {result}")
                
                # Parse prediction result
                # Adjust this based on your model's output format
                if result is None:
                    raise Exception("Inference job failed - result is None")
                
                if isinstance(result, dict):
                    output = result.get('output', result.get('prediction', result.get('StatefulPartitionedCall:0', [])))
                else:
                    output = result
                
                # Assuming binary classification: 0=Tidak Patuh, 1=Patuh
                if isinstance(output, (list, np.ndarray)):
                    if len(output) > 0:
                        prediction_value = float(output[0][0]) if isinstance(output[0], (list, np.ndarray)) else float(output[0])
                    else:
                        prediction_value = 0.5
                else:
                    prediction_value = float(output)
                
                kepatuhan = 'Patuh' if prediction_value > 0.5 else 'Tidak Patuh'
                confidence = prediction_value if prediction_value > 0.5 else (1 - prediction_value)
                
                return jsonify({
                    'success': True,
                    'kepatuhan': kepatuhan,
                    'confidence': float(confidence),
                    'method': 'qualcomm-ai',
                    'delayMinutes': round(delay_minutes, 1),
                    'raw_prediction': str(result),
                    'job_id': job.job_id
                })
                
            except Exception as e:
                logger.error(f"❌ Qualcomm AI prediction failed: {str(e)}")
                logger.error(traceback.format_exc())
                # Fall through to fallback
        
        # Use fallback classification
        result = fallback_classification(data)
        return jsonify({
            'success': True,
            **result
        })
        
    except Exception as e:
        logger.error(f"❌ Error in predict_compliance: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Batch prediction endpoint"""
    try:
        data = request.get_json()
        logs = data.get('logs', [])
        
        if not logs:
            return jsonify({
                'success': False,
                'error': 'No logs provided'
            }), 400
        
        results = []
        for log in logs:
            # Use the predict_compliance logic
            app_context = app.test_request_context(
                '/predict',
                method='POST',
                json=log
            )
            with app_context:
                response = predict_compliance()
                if response[1] == 200:  # Success
                    results.append(response[0].get_json())
                else:
                    results.append({
                        'success': False,
                        'error': 'Prediction failed'
                    })
        
        return jsonify({
            'success': True,
            'results': results,
            'total': len(results)
        })
        
    except Exception as e:
        logger.error(f"❌ Error in batch_predict: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("🐍 Starting Qualcomm AI Hub Flask Service")
    logger.info("=" * 50)
    
    # Initialize Qualcomm model
    initialize_qualcomm_model()
    
    logger.info(f"🚀 Flask server starting on http://{config.FLASK_HOST}:{config.FLASK_PORT}")
    logger.info(f"📍 Endpoints:")
    logger.info(f"   GET  /health       - Health check")
    logger.info(f"   POST /predict      - Single prediction")
    logger.info(f"   POST /batch-predict - Batch predictions")
    logger.info("=" * 50)
    
    # Start Flask server
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=True
    )
