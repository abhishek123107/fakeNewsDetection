from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Load the fixed model (pipeline that includes vectorizer)
try:
    model = joblib.load("fake_news_model_fixed.pkl")
    print("✅ Fixed model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Store prediction history (in production, use a database)
prediction_history = []

def classify_news(text):
    """Classify news text as REAL or FAKE"""
    if model is None:
        raise Exception("Model not loaded")
    
    try:
        # The model is a pipeline that includes vectorization
        prediction = model.predict([text])[0]
        confidence = model.predict_proba([text]).max() * 100
        
        return prediction, confidence
    except Exception as e:
        print(f"Error in classification: {e}")
        raise Exception("Classification failed")

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        if len(text) < 50:
            return jsonify({'error': 'Text too short for accurate analysis'}), 400
        
        # Classify the news
        prediction, confidence = classify_news(text)
        
        # Create result
        result = {
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'timestamp': datetime.now().isoformat(),
            'text_length': len(text)
        }
        
        # Add to history
        history_item = {
            'id': len(prediction_history) + 1,
            'text': text[:200] + ('...' if len(text) > 200 else ''),
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'timestamp': datetime.now().isoformat()
        }
        prediction_history.append(history_item)
        
        # Keep only last 100 items in memory
        if len(prediction_history) > 100:
            prediction_history.pop(0)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get prediction history"""
    return jsonify({
        'history': prediction_history[-20:],  # Return last 20 items
        'total': len(prediction_history)
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get statistics about predictions"""
    if not prediction_history:
        return jsonify({
            'total': 0,
            'fake': 0,
            'real': 0,
            'avg_confidence': 0
        })
    
    fake_count = sum(1 for item in prediction_history if item['prediction'] == 'FAKE')
    real_count = sum(1 for item in prediction_history if item['prediction'] == 'REAL')
    avg_confidence = sum(item['confidence'] for item in prediction_history) / len(prediction_history)
    
    return jsonify({
        'total': len(prediction_history),
        'fake': fake_count,
        'real': real_count,
        'avg_confidence': round(avg_confidence, 2)
    })

@app.route('/clear-history', methods=['POST'])
def clear_history():
    """Clear prediction history"""
    global prediction_history
    prediction_history = []
    return jsonify({'message': 'History cleared successfully'})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'vectorizer_loaded': vectorizer is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Check if model files exist
    if not os.path.exists("fake_news_model.pkl"):
        print("❌ Model file 'fake_news_model.pkl' not found!")
        print("Please ensure the model file is in the same directory as app_flask.py")
        exit(1)
    
    if not os.path.exists("vectorizer.pkl"):
        print("❌ Vectorizer file 'vectorizer.pkl' not found!")
        print("Please ensure the vectorizer file is in the same directory as app_flask.py")
        exit(1)
    
    print("🚀 Starting Truth Lens Flask Server...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("🔧 API Endpoints:")
    print("   GET  /           - Main application")
    print("   POST /predict    - Analyze text")
    print("   GET  /history    - Get prediction history")
    print("   GET  /stats      - Get statistics")
    print("   GET  /health     - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
