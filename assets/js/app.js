/**
 * MAJDOUB Fer — Main Application
 * SPA Router, Global State, Module Loader
 */

// ==========================================
// UI Components (Toast, Modal, Confirm)
// ==========================================

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(type, title, message = '', duration = 3000) {
    if (!this.container) this.init();
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <div class="toast-content">
        <div class="toast-title">${Utils.escapeHtml(title)}</div>
        ${message ? `<div class="toast-message">${Utils.escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
    `;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(title, msg) { this.show('success', title, msg); },
  error(title, msg) { this.show('error', title, msg); },
  warning(title, msg) { this.show('warning', title, msg); },
  info(title, msg) { this.show('info', title, msg); },
};

const Modal = {
  /** Show a modal dialog */
  show({ title, content, size = 'md', onClose, footer = '', id = '' }) {
    this.close(); // Close any existing modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = id || 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-container modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);

    // Close handlers
    const closeBtn = overlay.querySelector('#modal-close-btn');
    closeBtn.addEventListener('click', () => this.close(onClose));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(onClose);
    });
    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.close(onClose);
    });

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('active'));
  },

  /** Close the current modal */
  close(callback) {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;
    overlay.classList.add('closing');
    document.removeEventListener('keydown', this._escHandler);
    setTimeout(() => {
      overlay.remove();
      if (callback) callback();
    }, 200);
  },

  /** Update modal body content */
  updateBody(html) {
    const body = document.querySelector('.modal-body');
    if (body) body.innerHTML = html;
  }
};

const Confirm = {
  /** Show a confirmation dialog */
  show({ title, message, onConfirm, onCancel, danger = false, confirmText, cancelText }) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-icon">${danger ? '⚠️' : '❓'}</div>
        <div class="confirm-title">${title || i18n.t('confirm')}</div>
        <div class="confirm-message">${message || ''}</div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" id="confirm-cancel">${cancelText || i18n.t('cancel')}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${confirmText || i18n.t('confirm')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
    overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
      overlay.remove();
      if (onCancel) onCancel();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        if (onCancel) onCancel();
      }
    });
  }
};

// ==========================================
// SPA Router
// ==========================================

const Router = {
  currentModule: null,
  routes: {},

  init() {
    // Define routes
    this.routes = {
      'dashboard': () => DashboardModule.render(),
      'produits': () => ProduitsModule.render(),
      'stock': () => StockModule.render(),
      'ventes': () => VentesModule.render(),
      'fournisseurs': () => FournisseursModule.render(),
      'clients': () => ClientsModule.render(),
      'rapports': () => RapportsModule.render(),
      'parametres': () => ParametresModule.render(),
    };

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.navigate());

    // Navigate to initial route
    this.navigate();
  },

  navigate(route) {
    if (route) {
      window.location.hash = route;
      return;
    }

    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const renderFn = this.routes[hash];

    if (!renderFn) {
      window.location.hash = 'dashboard';
      return;
    }

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === hash);
    });

    // Animate page out then in
    const content = document.getElementById('module-content');
    if (content) {
      content.classList.remove('page-enter');
      content.classList.add('page-exit');

      setTimeout(() => {
        this.currentModule = hash;
        renderFn();
        content.classList.remove('page-exit');
        content.classList.add('page-enter');
        // Scroll to top
        document.querySelector('.app-main').scrollTop = 0;
      }, 150);
    } else {
      this.currentModule = hash;
      renderFn();
    }
  }
};

// ==========================================
// App Clock
// ==========================================

function updateClock() {
  const clock = document.getElementById('header-clock');
  if (clock) {
    const now = new Date();
    const date = now.toLocaleDateString(i18n.currentLang === 'ar' ? 'ar-MA' : 'fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const time = now.toLocaleTimeString(i18n.currentLang === 'ar' ? 'ar-MA' : 'fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    clock.textContent = `${date} • ${time}`;
  }
}

// ==========================================
// Button Ripple Effect (global)
// ==========================================

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (btn && !btn.disabled) {
    Utils.createRipple(e);
  }
});

// ==========================================
// Language Toggle
// ==========================================

function toggleLang(lang) {
  i18n.setLang(lang);
  // Re-render current module
  const renderFn = Router.routes[Router.currentModule];
  if (renderFn) renderFn();
  updateClock();
}

// ==========================================
// Sidebar Navigation
// ==========================================

function initSidebar() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const route = item.dataset.route;
      if (route) Router.navigate(route);
    });
  });
}

// ==========================================
// Demo / Seed Data
// ==========================================

function seedDemoData() {
  // Only seed if DB is empty
  if (db.getAll(DB_KEYS.PRODUITS).length > 0) return;

  // --- Suppliers ---
  const suppliers = [
    { nom: 'Acier Maroc SARL', nomContact: 'Mohamed Alaoui', telephone: '0522-334455', ville: 'Casablanca', ice: '001234567000089', conditionsPaiement: '30 jours', adresse: 'Zone Industrielle Ain Sebaâ', actif: true },
    { nom: 'Atlas Métal', nomContact: 'Youssef Bennani', telephone: '0535-667788', ville: 'Fès', ice: '002345678000012', conditionsPaiement: '15 jours', adresse: 'Route de Meknès KM 8', actif: true },
    { nom: 'Maghreb Steel', nomContact: 'Karim Tazi', telephone: '0523-112233', ville: 'El Jadida', ice: '003456789000034', conditionsPaiement: 'Comptant', adresse: 'Zone Portuaire', actif: true },
    { nom: 'Fer El Gharb', nomContact: 'Hassan Chraibi', telephone: '0537-445566', ville: 'Kénitra', ice: '004567890000056', conditionsPaiement: '60 jours', adresse: 'Quartier Industriel', actif: true },
    { nom: 'Sonasid Distribution', nomContact: 'Rachid Fassi', telephone: '0522-998877', ville: 'Casablanca', ice: '005678901000078', conditionsPaiement: '30 jours', adresse: 'Bd des FAR', actif: true },
  ];
  const supIds = suppliers.map(s => db.create(DB_KEYS.FOURNISSEURS, s).id);

  // --- Products ---
  const products = [
    { nom: 'Fer Plat 40x5mm', reference: 'FP-40-5', categorie: 'Fer Plat', unite: 'ml', prixAchat: 45, prixVente: 62, stockActuel: 520, stockMinimum: 50, stockMaximum: 2000, emplacement: 'Zone A - Rayon 1', poids: 1.57, dimensions: '40x5mm', fournisseurPrincipal: supIds[0] },
    { nom: 'Fer Plat 30x4mm', reference: 'FP-30-4', categorie: 'Fer Plat', unite: 'ml', prixAchat: 32, prixVente: 45, stockActuel: 380, stockMinimum: 40, stockMaximum: 1500, emplacement: 'Zone A - Rayon 1', poids: 0.94, dimensions: '30x4mm', fournisseurPrincipal: supIds[0] },
    { nom: 'Fer Rond Ø12mm', reference: 'FR-12', categorie: 'Fer Rond', unite: 'ml', prixAchat: 18, prixVente: 26, stockActuel: 1200, stockMinimum: 100, stockMaximum: 5000, emplacement: 'Zone B - Rayon 2', poids: 0.89, dimensions: 'Ø12mm', fournisseurPrincipal: supIds[1] },
    { nom: 'Fer Rond Ø8mm', reference: 'FR-8', categorie: 'Fer Rond', unite: 'ml', prixAchat: 10, prixVente: 15, stockActuel: 2500, stockMinimum: 200, stockMaximum: 8000, emplacement: 'Zone B - Rayon 2', poids: 0.395, dimensions: 'Ø8mm', fournisseurPrincipal: supIds[1] },
    { nom: 'Cornière 40x40x4', reference: 'CO-40-4', categorie: 'Cornière', unite: 'ml', prixAchat: 42, prixVente: 58, stockActuel: 300, stockMinimum: 30, stockMaximum: 1000, emplacement: 'Zone C - Rayon 3', poids: 2.42, dimensions: '40x40x4mm', fournisseurPrincipal: supIds[2] },
    { nom: 'Cornière 30x30x3', reference: 'CO-30-3', categorie: 'Cornière', unite: 'ml', prixAchat: 25, prixVente: 36, stockActuel: 450, stockMinimum: 40, stockMaximum: 1200, emplacement: 'Zone C - Rayon 3', poids: 1.36, dimensions: '30x30x3mm', fournisseurPrincipal: supIds[2] },
    { nom: 'Tube Carré 40x40x2', reference: 'TC-40-2', categorie: 'Tube Carré', unite: 'ml', prixAchat: 55, prixVente: 75, stockActuel: 180, stockMinimum: 20, stockMaximum: 800, emplacement: 'Zone D - Rayon 4', poids: 2.41, dimensions: '40x40x2mm', fournisseurPrincipal: supIds[3] },
    { nom: 'Tube Carré 20x20x1.5', reference: 'TC-20-1.5', categorie: 'Tube Carré', unite: 'ml', prixAchat: 22, prixVente: 32, stockActuel: 600, stockMinimum: 50, stockMaximum: 2000, emplacement: 'Zone D - Rayon 4', poids: 0.88, dimensions: '20x20x1.5mm', fournisseurPrincipal: supIds[3] },
    { nom: 'Tube Rond Ø42x2', reference: 'TR-42-2', categorie: 'Tube Rond', unite: 'ml', prixAchat: 48, prixVente: 65, stockActuel: 250, stockMinimum: 25, stockMaximum: 800, emplacement: 'Zone D - Rayon 5', poids: 1.97, dimensions: 'Ø42x2mm', fournisseurPrincipal: supIds[3] },
    { nom: 'Tôle 1.5mm 2x1m', reference: 'TO-1.5', categorie: 'Tôle', unite: 'Pièce', prixAchat: 280, prixVente: 380, stockActuel: 45, stockMinimum: 10, stockMaximum: 200, emplacement: 'Zone E - Rayon 6', poids: 23.5, dimensions: '2000x1000x1.5mm', fournisseurPrincipal: supIds[4] },
    { nom: 'Tôle 2mm 2x1m', reference: 'TO-2', categorie: 'Tôle', unite: 'Pièce', prixAchat: 370, prixVente: 490, stockActuel: 32, stockMinimum: 8, stockMaximum: 150, emplacement: 'Zone E - Rayon 6', poids: 31.4, dimensions: '2000x1000x2mm', fournisseurPrincipal: supIds[4] },
    { nom: 'Treillis Soudé ST25', reference: 'TS-25', categorie: 'Treillis Soudé', unite: 'Pièce', prixAchat: 120, prixVente: 165, stockActuel: 80, stockMinimum: 15, stockMaximum: 300, emplacement: 'Zone F - Rayon 7', poids: 18, dimensions: '2.40x6m', fournisseurPrincipal: supIds[4] },
    { nom: 'Fer à Béton Ø10', reference: 'FB-10', categorie: 'Fer à Béton', unite: 'Barre', prixAchat: 52, prixVente: 72, stockActuel: 400, stockMinimum: 50, stockMaximum: 2000, emplacement: 'Zone G - Rayon 8', poids: 6.17, dimensions: 'Ø10mm x 12m', fournisseurPrincipal: supIds[1] },
    { nom: 'Fer à Béton Ø14', reference: 'FB-14', categorie: 'Fer à Béton', unite: 'Barre', prixAchat: 98, prixVente: 132, stockActuel: 250, stockMinimum: 30, stockMaximum: 1000, emplacement: 'Zone G - Rayon 8', poids: 12.08, dimensions: 'Ø14mm x 12m', fournisseurPrincipal: supIds[1] },
    { nom: 'Profilé IPE 100', reference: 'IPE-100', categorie: 'Profilé IPE', unite: 'ml', prixAchat: 180, prixVente: 245, stockActuel: 60, stockMinimum: 10, stockMaximum: 200, emplacement: 'Zone H - Rayon 9', poids: 8.1, dimensions: 'IPE 100', fournisseurPrincipal: supIds[0] },
    { nom: 'Fer Carré 10x10mm', reference: 'FC-10', categorie: 'Fer Carré', unite: 'ml', prixAchat: 14, prixVente: 20, stockActuel: 800, stockMinimum: 80, stockMaximum: 3000, emplacement: 'Zone A - Rayon 10', poids: 0.79, dimensions: '10x10mm', fournisseurPrincipal: supIds[2] },
    { nom: 'Fer Carré 14x14mm', reference: 'FC-14', categorie: 'Fer Carré', unite: 'ml', prixAchat: 24, prixVente: 34, stockActuel: 550, stockMinimum: 50, stockMaximum: 2000, emplacement: 'Zone A - Rayon 10', poids: 1.54, dimensions: '14x14mm', fournisseurPrincipal: supIds[2] },
    { nom: 'Tôle Galvanisée 0.5mm', reference: 'TG-0.5', categorie: 'Tôle', unite: 'Pièce', prixAchat: 160, prixVente: 220, stockActuel: 25, stockMinimum: 5, stockMaximum: 100, emplacement: 'Zone E - Rayon 11', poids: 8, dimensions: '2000x1000x0.5mm', fournisseurPrincipal: supIds[4] },
    { nom: 'Cornière 50x50x5', reference: 'CO-50-5', categorie: 'Cornière', unite: 'ml', prixAchat: 65, prixVente: 88, stockActuel: 15, stockMinimum: 20, stockMaximum: 800, emplacement: 'Zone C - Rayon 3', poids: 3.77, dimensions: '50x50x5mm', fournisseurPrincipal: supIds[2] },
    { nom: 'Tube Rond Ø25x1.5', reference: 'TR-25-1.5', categorie: 'Tube Rond', unite: 'ml', prixAchat: 18, prixVente: 26, stockActuel: 700, stockMinimum: 60, stockMaximum: 2500, emplacement: 'Zone D - Rayon 5', poids: 0.87, dimensions: 'Ø25x1.5mm', fournisseurPrincipal: supIds[3] },
  ];
  const prodIds = products.map(p => {
    p.actif = true;
    p.margePercent = Utils.calcMargin(p.prixAchat, p.prixVente);
    return db.create(DB_KEYS.PRODUITS, p).id;
  });

  // --- Clients ---
  const clients = [
    { nom: 'Chantier Hassan II', type: 'professionnel', nomContact: 'Rachid Benali', telephone: '0661-234567', ville: 'Casablanca', adresse: 'Hay Mohammadi', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Entreprise Bâti-Plus', type: 'professionnel', nomContact: 'Ahmed Filali', telephone: '0662-345678', ville: 'Rabat', adresse: 'Agdal', ice: '006789012000090', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Atelier Soudure Karim', type: 'professionnel', nomContact: 'Karim Ouazzi', telephone: '0663-456789', ville: 'Casablanca', adresse: 'Derb Sultan', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Menuiserie Métallique Samir', type: 'professionnel', nomContact: 'Samir El Khadir', telephone: '0664-567890', ville: 'Mohammedia', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Omar Bouchaib', type: 'particulier', telephone: '0665-678901', ville: 'Casablanca', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Fatima Zahra Construction', type: 'professionnel', nomContact: 'Fatima Zahra', telephone: '0666-789012', ville: 'Marrakech', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Driss El Amrani', type: 'particulier', telephone: '0667-890123', ville: 'Fès', actif: true, totalAchats: 0, nombreCommandes: 0 },
    { nom: 'Société Inox & Fer', type: 'professionnel', nomContact: 'Nabil Kettani', telephone: '0668-901234', ville: 'Tanger', ice: '007890123000012', actif: true, totalAchats: 0, nombreCommandes: 0 },
  ];
  const cliIds = clients.map(c => db.create(DB_KEYS.CLIENTS, c).id);

  // --- Stock Entries (past 2 weeks) ---
  const stockEntries = [
    { fIdx: 0, date: _daysAgo(14), lignes: [{ pIdx: 0, qty: 200, prix: 45 }, { pIdx: 1, qty: 150, prix: 32 }] },
    { fIdx: 1, date: _daysAgo(12), lignes: [{ pIdx: 2, qty: 500, prix: 18 }, { pIdx: 3, qty: 800, prix: 10 }, { pIdx: 12, qty: 200, prix: 52 }] },
    { fIdx: 2, date: _daysAgo(10), lignes: [{ pIdx: 4, qty: 100, prix: 42 }, { pIdx: 5, qty: 150, prix: 25 }, { pIdx: 15, qty: 300, prix: 14 }] },
    { fIdx: 3, date: _daysAgo(7), lignes: [{ pIdx: 6, qty: 80, prix: 55 }, { pIdx: 7, qty: 200, prix: 22 }, { pIdx: 8, qty: 100, prix: 48 }] },
    { fIdx: 4, date: _daysAgo(5), lignes: [{ pIdx: 9, qty: 20, prix: 280 }, { pIdx: 10, qty: 15, prix: 370 }, { pIdx: 11, qty: 40, prix: 120 }] },
    { fIdx: 0, date: _daysAgo(2), lignes: [{ pIdx: 14, qty: 30, prix: 180 }, { pIdx: 0, qty: 100, prix: 45 }] },
  ];
  stockEntries.forEach(se => {
    const lignes = se.lignes.map(l => {
      const prod = db.getById(DB_KEYS.PRODUITS, prodIds[l.pIdx]);
      return {
        produitId: prodIds[l.pIdx],
        produitNom: prod ? prod.nom : '',
        quantite: l.qty,
        unite: prod ? prod.unite : '',
        prixAchatUnitaire: l.prix,
        montantTotal: l.qty * l.prix,
      };
    });
    db.create(DB_KEYS.ENTREES_STOCK, {
      type: 'entree',
      date: se.date,
      heure: `${8 + Math.floor(Math.random() * 8)}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
      fournisseurId: supIds[se.fIdx],
      fournisseurNom: suppliers[se.fIdx].nom,
      numeroFactureFournisseur: `F-2024-${800 + Math.floor(Math.random() * 200)}`,
      lignes,
      montantTotalEntree: lignes.reduce((s, l) => s + l.montantTotal, 0),
      modePaiement: ['especes', 'cheque', 'virement'][Math.floor(Math.random() * 3)],
      statut: ['payé', 'payé', 'payé', 'à payer'][Math.floor(Math.random() * 4)],
      notes: '',
    });
  });

  // --- Sales (past 7 days, ~15 sales) ---
  const saleDefs = [
    { cIdx: 0, day: 0, items: [{ pIdx: 0, qty: 20 }, { pIdx: 4, qty: 10 }], pmt: 'especes' },
    { cIdx: 1, day: 0, items: [{ pIdx: 2, qty: 50 }, { pIdx: 12, qty: 15 }], pmt: 'cheque' },
    { cIdx: null, day: 0, items: [{ pIdx: 7, qty: 30 }], pmt: 'especes' },
    { cIdx: 2, day: 1, items: [{ pIdx: 6, qty: 5 }, { pIdx: 8, qty: 8 }], pmt: 'virement' },
    { cIdx: 3, day: 1, items: [{ pIdx: 9, qty: 3 }, { pIdx: 17, qty: 5 }], pmt: 'credit' },
    { cIdx: null, day: 1, items: [{ pIdx: 3, qty: 100 }], pmt: 'especes' },
    { cIdx: 4, day: 2, items: [{ pIdx: 15, qty: 40 }, { pIdx: 16, qty: 25 }], pmt: 'especes' },
    { cIdx: 0, day: 2, items: [{ pIdx: 13, qty: 10 }, { pIdx: 2, qty: 30 }], pmt: 'cheque' },
    { cIdx: 5, day: 3, items: [{ pIdx: 14, qty: 8 }], pmt: 'virement' },
    { cIdx: null, day: 3, items: [{ pIdx: 1, qty: 15 }, { pIdx: 5, qty: 20 }], pmt: 'especes' },
    { cIdx: 6, day: 4, items: [{ pIdx: 10, qty: 2 }, { pIdx: 11, qty: 10 }], pmt: 'cheque' },
    { cIdx: 2, day: 5, items: [{ pIdx: 0, qty: 30 }, { pIdx: 7, qty: 50 }, { pIdx: 19, qty: 40 }], pmt: 'virement' },
    { cIdx: 7, day: 5, items: [{ pIdx: 18, qty: 5 }, { pIdx: 4, qty: 15 }], pmt: 'credit' },
    { cIdx: null, day: 6, items: [{ pIdx: 3, qty: 60 }, { pIdx: 15, qty: 20 }], pmt: 'especes' },
    { cIdx: 1, day: 6, items: [{ pIdx: 12, qty: 20 }, { pIdx: 13, qty: 8 }], pmt: 'cheque' },
  ];

  saleDefs.forEach(sd => {
    const dateStr = _daysAgo(sd.day);
    const lignes = sd.items.map(it => {
      const prod = db.getById(DB_KEYS.PRODUITS, prodIds[it.pIdx]);
      const pv = prod ? prod.prixVente : 0;
      return {
        produitId: prodIds[it.pIdx],
        produitNom: prod ? prod.nom : '',
        quantite: it.qty,
        unite: prod ? prod.unite : '',
        prixVenteUnitaire: pv,
        remisePct: 0,
        montantLigne: it.qty * pv,
      };
    });
    const sousTotal = lignes.reduce((s, l) => s + l.montantLigne, 0);
    const disc = Math.random() > 0.7 ? Math.round(sousTotal * 0.05) : 0;
    const totalNet = sousTotal - disc;

    const clientId = sd.cIdx !== null ? cliIds[sd.cIdx] : null;
    const clientNom = sd.cIdx !== null ? clients[sd.cIdx].nom : 'Client Anonyme';

    const sale = db.create(DB_KEYS.VENTES, {
      date: dateStr,
      heure: `${9 + Math.floor(Math.random() * 9)}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
      clientId,
      clientNom,
      lignes,
      sousTotal,
      remiseGlobale: disc,
      remiseGlobalePct: 0,
      totalNet,
      modePaiement: sd.pmt,
      montantRecu: sd.pmt === 'especes' ? totalNet + Math.ceil(Math.random() * 5) * 10 : totalNet,
      monnaie: 0,
      statut: 'completée',
    });

    // Update client stats
    if (clientId) {
      const cl = db.getById(DB_KEYS.CLIENTS, clientId);
      if (cl) {
        db.update(DB_KEYS.CLIENTS, clientId, {
          totalAchats: (cl.totalAchats || 0) + totalNet,
          nombreCommandes: (cl.nombreCommandes || 0) + 1,
          dernierAchat: dateStr,
        });
      }
    }

    // Decrease stock
    lignes.forEach(l => {
      const prod = db.getById(DB_KEYS.PRODUITS, l.produitId);
      if (prod) {
        db.update(DB_KEYS.PRODUITS, l.produitId, {
          stockActuel: Math.max(0, (prod.stockActuel || 0) - l.quantite),
        });
      }
    });
  });

  // Save settings with store info
  db.saveSettings({
    ...db.getSettings(),
    nomMagasin: 'MAJDOUB Fer',
    nomMagasinAr: 'مجدوب للحديد',
    adresse: 'Zone Industrielle, Casablanca',
    telephone: '0522-445566',
    ice: '001122334000055',
  });

  console.log('✅ Demo data seeded successfully');
}

function _daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ==========================================
// App Initialization
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Init database (ensure defaults)
  db.getSettings();

  // Seed demo data on first launch
  seedDemoData();

  // Init i18n
  i18n.init();
  i18n.updateAll();

  // Init Toast
  Toast.init();

  // Init sidebar
  initSidebar();

  // Init clock
  updateClock();
  setInterval(updateClock, 1000);

  // Init router (navigate to current hash or dashboard)
  Router.init();

  // Update lang toggle UI
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === i18n.currentLang);
  });
});
