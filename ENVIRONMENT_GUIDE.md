# Environment Variables Setup Guide

## 🚀 Environment Variables for Different Platforms

### **Local Development**

1. **Create `.env` file:**
```bash
cp .env.example .env
```

2. **Edit `.env` file:**
```env
FLASK_APP=app_flask.py
FLASK_ENV=development
SECRET_KEY=dev-secret-key
PORT=5000
HOST=127.0.0.1
MODEL_PATH=fake_news_model_fixed.pkl
```

3. **Run the app:**
```bash
python app_flask.py
```

### **Render Deployment**

Render automatically sets these variables:
- `PORT` - Automatically assigned port
- `FLASK_ENV` - Set to 'production'

**Set these in Render Dashboard:**

1. Go to your Render service → Settings → Environment
2. Add these variables:

```env
FLASK_APP=app_flask.py
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
MODEL_PATH=fake_news_model_fixed.pkl
CORS_ORIGINS=*
MAX_CONTENT_LENGTH=16777216
API_RATE_LIMIT=100
```

### **Heroku Deployment**

1. **Install Heroku CLI**
2. **Set environment variables:**
```bash
heroku config:set FLASK_APP=app_flask.py
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set MODEL_PATH=fake_news_model_fixed.pkl
```

### **Vercel Deployment**

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app_flask.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app_flask.py"
    }
  ],
  "env": {
    "FLASK_APP": "app_flask.py",
    "FLASK_ENV": "production"
  }
}
```

### **Docker Deployment**

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV FLASK_APP=app_flask.py
ENV FLASK_ENV=production
ENV MODEL_PATH=fake_news_model_fixed.pkl

EXPOSE 5000

CMD ["gunicorn", "app_flask:app"]
```

## 🔧 Available Environment Variables

| Variable | Default | Description |
|-----------|----------|-------------|
| `FLASK_APP` | `app_flask.py` | Flask application file |
| `FLASK_ENV` | `development` | Environment (development/production) |
| `SECRET_KEY` | `dev-secret-key` | Flask secret key |
| `PORT` | `5000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `MODEL_PATH` | `fake_news_model_fixed.pkl` | ML model file path |
| `DATABASE_URL` | `sqlite:///predictions.db` | Database connection |
| `CORS_ORIGINS` | `*` | CORS allowed origins |
| `MAX_CONTENT_LENGTH` | `16777216` | Max request size (16MB) |
| `API_RATE_LIMIT` | `100` | API rate limit |
| `LOG_LEVEL` | `INFO` | Logging level |

## 🛡️ Security Notes

1. **Always use strong `SECRET_KEY` in production**
2. **Limit `CORS_ORIGINS` to specific domains**
3. **Set appropriate `MAX_CONTENT_LENGTH`**
4. **Use `FLASK_ENV=production` in production**
5. **Never commit `.env` file to version control**

## 🔍 Debugging Environment Issues

### **Check current environment:**
```python
import os
from config import Config

print("Current environment variables:")
for key in ['FLASK_ENV', 'PORT', 'HOST', 'MODEL_PATH']:
    print(f"{key}: {os.environ.get(key, 'Not set')}")
```

### **Common Issues:**

1. **Model not found**: Check `MODEL_PATH` variable
2. **Port already in use**: Change `PORT` variable
3. **CORS errors**: Update `CORS_ORIGINS` variable
4. **Permission denied**: Check file permissions for model file

## 📱 Platform-Specific Tips

### **Render:**
- Automatically sets `PORT` variable
- Uses `gunicorn` from Procfile
- Supports automatic deployments from GitHub

### **Heroku:**
- Requires `Procfile` for web process
- Uses `gunicorn` as web server
- Supports add-ons for databases

### **Vercel:**
- Serverless platform
- Requires `vercel.json` configuration
- Auto-scales based on traffic

### **Docker:**
- Portable deployment
- Requires `Dockerfile`
- Can run on any cloud platform
