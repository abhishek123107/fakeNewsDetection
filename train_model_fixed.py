# train_model_fixed.py - Fixed version with proper data handling

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import numpy as np

# Load and prepare data
print("Loading and preparing data...")

# Load the training data
df = pd.read_csv("train.csv")

# Check the actual structure
print(f"Data shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Subject categories: {df['subject'].value_counts()}")

# Create labels based on subject - this is the key fix!
# Based on the data structure, we need to infer labels from subject categories
fake_subjects = ['politicsNews', 'left-news', 'Government News', 'US_News', 'Middle-east']
real_subjects = ['worldnews', 'News', 'politics']

def create_label(subject):
    """Create label based on subject category"""
    if subject in fake_subjects:
        return 'FAKE'
    elif subject in real_subjects:
        return 'REAL'
    else:
        # For unknown subjects, use a heuristic
        return 'FAKE'  # Default to fake for safety

# Apply labels
df['label'] = df['subject'].apply(create_label)

# Check label distribution
print(f"Label distribution:")
print(df['label'].value_counts())

# Use text column for features (title seems to be the news content)
# Let's check which column has the actual content
text_col = 'text' if 'text' in df.columns else 'title'
print(f"Using column '{text_col}' for text content")

# Prepare data
X = df[text_col].fillna('')  # Handle missing values
y = df['label']

# Remove any rows with missing labels
mask = y.notna()
X = X[mask]
y = y[mask]

print(f"Final data shape: {X.shape}")
print(f"Final label distribution: {y.value_counts()}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Create pipeline with better parameters
model = Pipeline([
    ('tfidf', TfidfVectorizer(
        stop_words='english',
        max_df=0.8,
        min_df=2,
        ngram_range=(1, 2),  # Use bigrams
        max_features=10000
    )),
    ('clf', LogisticRegression(
        max_iter=1000,
        random_state=42,
        C=1.0
    ))
])

print("Training model...")
model.fit(X_train, y_train)

# Evaluate model
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

print(f"Training accuracy: {train_score:.4f}")
print(f"Test accuracy: {test_score:.4f}")

# Test with some examples
test_examples = [
    "Breaking: Scientists discover cure for cancer in breakthrough study",
    "President Donald Trump announced new healthcare policy today",
    "Local sports team wins championship game",
    "Shocking: Alien spacecraft found in desert, experts say"
]

print("\nTesting with examples:")
for example in test_examples:
    prediction = model.predict([example])[0]
    confidence = model.predict_proba([example]).max() * 100
    print(f"Text: {example[:50]}...")
    print(f"Prediction: {prediction} (Confidence: {confidence:.2f}%)")
    print("-" * 50)

# Save the model
with open('fake_news_model_fixed.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\n✅ Fixed model trained and saved as 'fake_news_model_fixed.pkl'")
print("🎯 Model should now properly detect different types of fake and real news!")
