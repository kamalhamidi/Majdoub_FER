/**
 * MAJDOUB Fer — Utility Functions
 */

const Utils = {
  /**
   * Format number as currency (MAD)
   */
  formatMoney(amount, showSymbol = true) {
    const num = parseFloat(amount) || 0;
    const formatted = num.toLocaleString('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (!showSymbol) return formatted;
    const settings = db.getSettings();
    return `${formatted} ${settings.deviseSymbole || 'د.م'}`;
  },

  /**
   * Format date for display
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  /**
   * Format date and time
   */
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Get today's date as YYYY-MM-DD
   */
  today() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get current time as HH:MM
   */
  now() {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  },

  /**
   * Calculate margin percentage
   */
  calcMargin(prixAchat, prixVente) {
    const achat = parseFloat(prixAchat) || 0;
    const vente = parseFloat(prixVente) || 0;
    if (achat <= 0) return 0;
    return ((vente - achat) / achat * 100);
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Generate a simple unique ID
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Deep clone an object
   */
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Parse CSV text into array of objects
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      results.push(obj);
    }
    return results;
  },

  /**
   * Animated counter for KPIs
   */
  animateCounter(element, target, duration = 1000, isMoney = false) {
    const start = 0;
    const startTime = performance.now();
    target = parseFloat(target) || 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = start + (target - start) * eased;

      if (isMoney) {
        element.textContent = Utils.formatMoney(current);
      } else {
        element.textContent = Math.round(current).toLocaleString('fr-FR');
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  },

  /**
   * Create ripple effect on button click
   */
  createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-effect');

    const ripple = button.getElementsByClassName('ripple-effect')[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  },

  /**
   * Show confetti animation
   */
  showConfetti() {
    const colors = ['#e94560', '#f5a623', '#00b894', '#74b9ff', '#fdcb6e', '#a29bfe'];
    const container = document.body;
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${2 + Math.random() * 2}s`;
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      piece.style.width = `${6 + Math.random() * 8}px`;
      piece.style.height = `${6 + Math.random() * 8}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  },

  /**
   * Stock status helper
   */
  getStockStatus(current, minimum) {
    if (current <= 0) return { label: 'rupture', class: 'badge-danger', labelAr: 'نفاذ' };
    if (current <= minimum) return { label: 'faible', class: 'badge-warning', labelAr: 'منخفض' };
    return { label: 'ok', class: 'badge-success', labelAr: 'متوفر' };
  },

  /**
   * Margin color class
   */
  getMarginClass(margin) {
    if (margin < 10) return 'danger';
    if (margin < 25) return 'warning';
    return 'success';
  },

  /**
   * Download file helper
   */
  downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Read file as text
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * Read file as base64
   */
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Get date range helpers
   */
  getDateRange(period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (period) {
      case 'today':
        return { start: today, end: now };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        return { start: weekStart, end: now };
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: now };
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { start: yearStart, end: now };
      }
      default:
        return { start: new Date(0), end: now };
    }
  },

  /**
   * Check if date is within range
   */
  isInDateRange(dateStr, start, end) {
    const d = new Date(dateStr);
    return d >= start && d <= end;
  },
};
