// Truth Lens - Fake News Detection Web App
class TruthLens {
    constructor() {
        this.history = this.loadHistory();
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateHistoryStats();
        this.renderHistory();
        this.setupCharCounter();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Hero buttons
        document.querySelectorAll('.hero-buttons .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = button.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Analyze button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeNews();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearInput();
        });

        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Enter key in textarea
        document.getElementById('newsInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.analyzeNews();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    setupCharCounter() {
        const textarea = document.getElementById('newsInput');
        const charCount = document.getElementById('charCount');
        
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            charCount.textContent = count;
            
            // Change color based on length
            if (count > 1000) {
                charCount.style.color = 'var(--danger-color)';
            } else if (count > 500) {
                charCount.style.color = 'var(--warning-color)';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }

        // Close mobile menu
        document.querySelector('.nav-menu').classList.remove('active');
    }

    async analyzeNews() {
        const input = document.getElementById('newsInput');
        const text = input.value.trim();

        if (!text) {
            this.showNotification('Please enter some text to analyze.', 'warning');
            return;
        }

        if (text.length < 50) {
            this.showNotification('Please enter at least 50 characters for better analysis.', 'warning');
            return;
        }

        // Show loading
        this.showLoading();

        try {
            const startTime = Date.now();
            
            // Call the API
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                throw new Error('Analysis failed. Please try again.');
            }

            const result = await response.json();
            const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

            // Display result
            this.displayResult(result, processingTime, text);

            // Add to history
            this.addToHistory(result, text, processingTime);

        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message || 'An error occurred during analysis.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayResult(result, processingTime, text) {
        const resultSection = document.getElementById('resultSection');
        const resultContent = document.getElementById('resultContent');
        const confidenceScore = document.getElementById('confidenceScore');
        const textLength = document.getElementById('textLength');
        const processingTimeEl = document.getElementById('processingTime');

        const isFake = result.prediction === 'FAKE';
        const confidence = result.confidence;

        // Update confidence badge
        confidenceScore.textContent = `${confidence}%`;
        textLength.textContent = `${text.length} chars`;
        processingTimeEl.textContent = `${processingTime}s`;

        // Create result content
        const resultHTML = `
            <div class="result-icon">
                <i class="fas ${isFake ? 'fa-times-circle' : 'fa-check-circle'}"></i>
            </div>
            <h2 class="result-title">
                ${isFake ? 'Fake News Detected' : 'Real News Detected'}
            </h2>
            <p class="result-message">
                ${isFake 
                    ? 'This article appears to contain misinformation or false claims.' 
                    : 'This article appears to be credible and fact-based.'
                }
            </p>
            <div class="confidence-indicator">
                <div class="confidence-bar">
                    <div class="confidence-fill ${isFake ? 'fake' : 'real'}" 
                         style="width: ${confidence}%"></div>
                </div>
                <p>Confidence: ${confidence}%</p>
            </div>
        `;

        resultContent.innerHTML = resultHTML;

        // Update result card styling
        const resultCard = document.querySelector('.result-card');
        resultCard.className = `result-card ${isFake ? 'result-fake' : 'result-real'}`;

        // Show result section
        resultSection.classList.remove('hidden');

        // Scroll to result
        setTimeout(() => {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    addToHistory(result, text, processingTime) {
        const historyItem = {
            id: Date.now(),
            text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
            fullText: text,
            prediction: result.prediction,
            confidence: result.confidence,
            timestamp: new Date().toISOString(),
            processingTime: processingTime
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.updateHistoryStats();
        this.renderHistory();
    }

    updateHistoryStats() {
        const totalPredictions = this.history.length;
        const fakeCount = this.history.filter(item => item.prediction === 'FAKE').length;
        const realCount = this.history.filter(item => item.prediction === 'REAL').length;

        document.getElementById('totalPredictions').textContent = totalPredictions;
        document.getElementById('fakeCount').textContent = fakeCount;
        document.getElementById('realCount').textContent = realCount;
    }

    renderHistory() {
        const historyItems = document.getElementById('historyItems');
        
        if (this.history.length === 0) {
            historyItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No analysis history yet. Start detecting fake news!</p>
                </div>
            `;
            return;
        }

        const historyHTML = this.history.map(item => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            const isFake = item.prediction === 'FAKE';

            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-prediction ${isFake ? 'fake' : 'real'}">
                            <i class="fas ${isFake ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                            ${isFake ? 'Fake' : 'Real'} News
                        </div>
                        <div class="history-time">${formattedDate}</div>
                    </div>
                    <div class="history-text">${item.text}</div>
                    <div class="history-confidence">
                        Confidence: ${item.confidence}% | Processing time: ${item.processingTime}s
                    </div>
                </div>
            `;
        }).join('');

        historyItems.innerHTML = historyHTML;
    }

    clearInput() {
        document.getElementById('newsInput').value = '';
        document.getElementById('charCount').textContent = '0';
        document.getElementById('resultSection').classList.add('hidden');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
            this.history = [];
            this.saveHistory();
            this.updateHistoryStats();
            this.renderHistory();
            this.showNotification('History cleared successfully.', 'success');
        }
    }

    saveHistory() {
        localStorage.setItem('truthlens_history', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('truthlens_history');
        return saved ? JSON.parse(saved) : [];
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            max-width: 400px;
            border-left: 4px solid ${this.getNotificationColor(type)};
            animation: slideInRight 0.3s ease-out;
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#6A5ACD'
        };
        return colors[type] || colors.info;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .confidence-indicator {
        margin-top: 1.5rem;
    }

    .confidence-bar {
        width: 100%;
        height: 8px;
        background: #E5E7EB;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .confidence-fill {
        height: 100%;
        transition: width 0.5s ease-out;
    }

    .confidence-fill.fake {
        background: linear-gradient(90deg, #EF4444, #DC2626);
    }

    .confidence-fill.real {
        background: linear-gradient(90deg, #10B981, #059669);
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        color: var(--text-secondary);
    }

    .notification-close:hover {
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
let truthLensApp;

document.addEventListener('DOMContentLoaded', () => {
    truthLensApp = new TruthLens();
    
    // Make showSection globally accessible for any inline handlers
    window.showSection = (section) => {
        if (truthLensApp) {
            truthLensApp.showSection(section);
        }
    };
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = 'var(--shadow-md)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});
