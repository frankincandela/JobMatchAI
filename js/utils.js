// Utility functions for the Career Guidance application
class Utils {
    // Show loading overlay
    static showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    // Hide loading overlay
    static hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Show toast notification
    static showToast(message, type = 'info') {
        const toast = document.getElementById('mainToast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;

        // Set message
        toastMessage.textContent = message;
        
        // Set type-specific styling
        const toastHeader = toast.querySelector('.toast-header');
        const icon = toastHeader.querySelector('i');
        
        // Remove existing type classes
        toast.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info');
        icon.classList.remove('text-success', 'text-danger', 'text-warning', 'text-info', 'text-primary');
        
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle text-success me-2';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle text-danger me-2';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle text-warning me-2';
                break;
            default:
                icon.className = 'fas fa-info-circle text-primary me-2';
        }

        // Show toast
        const bootstrapToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: type === 'error' ? 5000 : 3000
        });
        bootstrapToast.show();
    }

    // Format date to Italian locale
    static formatDate(dateString, options = {}) {
        if (!dateString) return 'Non specificato';
        
        try {
            const date = new Date(dateString);
            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            
            return date.toLocaleDateString('it-IT', { ...defaultOptions, ...options });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    // Format currency to Euro
    static formatCurrency(amount) {
        if (amount == null || isNaN(amount)) return 'Non specificato';
        
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Truncate text with ellipsis
    static truncateText(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    // Validate email format
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate Italian phone number
    static validatePhone(phone) {
        const phoneRegex = /^(\+39|0039|39)?[\s]?([0-9]{2,3}[\s]?[0-9]{6,7}|[0-9]{3}[\s]?[0-9]{7}|3[0-9]{2}[\s]?[0-9]{7})$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Generate random ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Sanitize HTML to prevent XSS
    static sanitizeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get file extension
    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    // Check if file is valid CV format
    static isValidCVFile(file) {
        const validExtensions = ['pdf', 'doc', 'docx'];
        const extension = this.getFileExtension(file.name);
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        return validExtensions.includes(extension) && file.size <= maxSize;
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get sector color
    static getSectorColor(sector) {
        const colors = {
            'Informatica': '#2196F3',
            'Ristorazione': '#FF9800',
            'Accoglienza': '#4CAF50',
            'Agricoltura': '#8BC34A',
            'Imprenditoria': '#9C27B0'
        };
        return colors[sector] || '#6c757d';
    }

    // Get job type label in Italian
    static getJobTypeLabel(jobType) {
        const labels = {
            'full-time': 'Tempo pieno',
            'part-time': 'Part-time',
            'contract': 'Contratto',
            'internship': 'Stage',
            'training': 'Formazione',
            'freelance': 'Freelance'
        };
        return labels[jobType] || jobType;
    }

    // Get experience level label in Italian
    static getExperienceLevelLabel(level) {
        const labels = {
            'entry': 'Principiante',
            'junior': 'Junior',
            'mid': 'Intermedio',
            'senior': 'Senior',
            'lead': 'Lead',
            'manager': 'Manager'
        };
        return labels[level] || level;
    }

    // Calculate reading time for text
    static calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min di lettura`;
    }

    // Scroll to element smoothly
    static scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copiato negli appunti!', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copiato negli appunti!', 'success');
        }
    }

    // Create download link for file
    static downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    // Get query parameters from URL
    static getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    // Set query parameter in URL
    static setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }

    // Remove query parameter from URL
    static removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    }

    // Check if device is mobile
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Get device type
    static getDeviceType() {
        const width = window.innerWidth;
        if (width < 576) return 'mobile';
        if (width < 768) return 'tablet';
        if (width < 992) return 'laptop';
        return 'desktop';
    }

    // Local storage helpers with error handling
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting localStorage:', error);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting localStorage:', error);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage:', error);
            return false;
        }
    }

    // Session storage helpers
    static setSessionStorage(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting sessionStorage:', error);
            return false;
        }
    }

    static getSessionStorage(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting sessionStorage:', error);
            return defaultValue;
        }
    }

    // Create loading spinner element
    static createLoadingSpinner(size = 'normal') {
        const spinner = document.createElement('div');
        spinner.className = `spinner-border ${size === 'small' ? 'spinner-border-sm' : ''} text-primary`;
        spinner.setAttribute('role', 'status');
        
        const srText = document.createElement('span');
        srText.className = 'visually-hidden';
        srText.textContent = 'Caricamento...';
        spinner.appendChild(srText);
        
        return spinner;
    }

    // Animate number counting
    static animateNumber(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (difference * progress));
            
            element.textContent = current.toLocaleString('it-IT');
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    // Create modal dynamically
    static createModal(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = id;
        modal.setAttribute('tabindex', '-1');
        
        const sizeClass = options.size ? `modal-${options.size}` : '';
        
        modal.innerHTML = `
            <div class="modal-dialog ${sizeClass}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove modal from DOM when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
        
        return modal;
    }
}

// Global utility functions for inline use
function showLoading() {
    Utils.showLoading();
}

function hideLoading() {
    Utils.hideLoading();
}

function showToast(message, type) {
    Utils.showToast(message, type);
}

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
