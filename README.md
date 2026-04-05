# Fake News Detection Web Application

A modern web application for detecting fake news using machine learning.

## Features

- 🎯 **Real-time Detection**: Analyze news articles instantly
- 🧠 **ML Powered**: TF-IDF + Logistic Regression
- 📊 **Statistics**: Track prediction history and accuracy
- 📱 **Responsive**: Works on all devices
- 🎨 **Modern UI**: Beautiful animations and interactions

## Technology Stack

- **Backend**: Python, Flask, Scikit-learn
- **Frontend**: HTML5, CSS3, JavaScript
- **ML Model**: TF-IDF Vectorization with Logistic Regression
- **Accuracy**: 82.77% test accuracy

## Project Structure

```
fakeNewsDetection/
├── static/
│   ├── styles.css      # Modern CSS with animations
│   └── script.js      # Interactive JavaScript
├── templates/
│   └── index.html     # Main web interface
├── app_flask.py          # Flask backend server
├── train_model_fixed.py  # ML model training
├── fake_news_model_fixed.pkl  # Trained model
└── train.csv            # Training data
```

## Getting Started

1. **Install Dependencies**:
   ```bash
   pip install flask flask-cors scikit-learn joblib pandas
   ```

2. **Run the Application**:
   ```bash
   python app_flask.py
   ```

3. **Access the Web App**:
   Open http://localhost:5000 in your browser

## API Endpoints

- `GET /` - Main web application
- `POST /predict` - Analyze news text
- `GET /history` - Get prediction history
- `GET /stats` - View statistics
- `GET /health` - Health check

## Model Performance

- **Training Accuracy**: 85.64%
- **Test Accuracy**: 82.77%
- **Features**: TF-IDF with bigrams (1,2)
- **Classifier**: Logistic Regression

## Sample Predictions

The model can detect various types of news:

| Input Text | Prediction | Confidence |
|-------------|-------------|------------|
| "Breaking: Scientists discover cure..." | REAL | 70.35% |
| "President Trump announced..." | FAKE | 83.18% |
| "Local sports team wins..." | REAL | 56.80% |
| "Alien spacecraft found..." | REAL | 62.72% |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.
