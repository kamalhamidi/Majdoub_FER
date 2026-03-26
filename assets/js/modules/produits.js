/**
 * MAJDOUB Fer — Products Module (CRUD)
 */

const CATEGORIES = [
  'cat_fer_plat', 'cat_fer_rond', 'cat_fer_carre', 'cat_corniere',
  'cat_tube_carre', 'cat_tube_rond', 'cat_tole', 'cat_treillis',
  'cat_fer_beton', 'cat_profile_ipe', 'cat_autres'
];

const UNITS = ['unit_ml', 'unit_kg', 'unit_piece', 'unit_barre', 'unit_m2', 'unit_tonne'];

const ProduitsModule = {
  viewMode: 'list',
  searchQuery: '',
  categoryFilter: '',
  stockFilter: '',
  currentPage: 1,
  perPage: 15,

  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);
    const produits = this._getFiltered();
    const totalPages = Math.ceil(produits.length / this.perPage);
    const paged = produits.slice((this.currentPage - 1) * this.perPage, this.currentPage * this.perPage);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('products')}</h2>
          <p class="page-subtitle">${produits.length} ${t('products').toLowerCase()}</p>
        </div>
        <div class="flex gap-sm">
          <button class="btn btn-secondary" onclick="ProduitsModule.showImportCSV()">📁 ${t('import_csv')}</button>
          <button class="btn btn-primary btn-ripple" onclick="ProduitsModule.showForm()">+ ${t('add_product')}</button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="product-toolbar">
        <div class="product-toolbar-left">
          <div class="search-bar">
            <span class="search-bar-icon">🔍</span>
            <input type="text" placeholder="${t('search')}" value="${this.searchQuery}"
              oninput="ProduitsModule.onSearch(this.value)" id="product-search">
          </div>
          <select class="form-control" style="width:180px" onchange="ProduitsModule.onCategoryFilter(this.value)">
            <option value="">${t('all_categories')}</option>
            ${CATEGORIES.map(c => `<option value="${t(c)}" ${this.categoryFilter === t(c) ? 'selected' : ''}>${t(c)}</option>`).join('')}
          </select>
          <select class="form-control" style="width:140px" onchange="ProduitsModule.onStockFilter(this.value)">
            <option value="">${t('all')}</option>
            <option value="ok" ${this.stockFilter === 'ok' ? 'selected' : ''}>✅ OK</option>
            <option value="low" ${this.stockFilter === 'low' ? 'selected' : ''}>⚠️ ${t('low_stock_count')}</option>
            <option value="out" ${this.stockFilter === 'out' ? 'selected' : ''}>🔴 Rupture</option>
          </select>
        </div>
        <div class="product-toolbar-right">
          <div class="view-toggle">
            <button class="view-toggle-btn ${this.viewMode === 'list' ? 'active' : ''}"
              onclick="ProduitsModule.setView('list')">☰</button>
            <button class="view-toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}"
              onclick="ProduitsModule.setView('grid')">⊞</button>
          </div>
        </div>
      </div>

      <!-- Content -->
      ${this.viewMode === 'grid' ? this._renderGrid(paged) : this._renderTable(paged)}

      <!-- Pagination -->
      ${totalPages > 1 ? `
        <div class="data-table-pagination">
          <span>${(this.currentPage - 1) * this.perPage + 1}-${Math.min(this.currentPage * this.perPage, produits.length)} / ${produits.length}</span>
          <div class="pagination-buttons">
            <button class="pagination-btn" onclick="ProduitsModule.goPage(${this.currentPage - 1})" ${this.currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return `<button class="pagination-btn ${p === this.currentPage ? 'active' : ''}" onclick="ProduitsModule.goPage(${p})">${p}</button>`;
            }).join('')}
            <button class="pagination-btn" onclick="ProduitsModule.goPage(${this.currentPage + 1})" ${this.currentPage >= totalPages ? 'disabled' : ''}>›</button>
          </div>
        </div>
      ` : ''}
    `;
  },

  _getFiltered() {
    const settings = db.getSettings();
    let produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      produits = produits.filter(p =>
        (p.nom || '').toLowerCase().includes(q) ||
        (p.reference || '').toLowerCase().includes(q) ||
        (p.categorie || '').toLowerCase().includes(q)
      );
    }
    if (this.categoryFilter) {
      produits = produits.filter(p => p.categorie === this.categoryFilter);
    }
    if (this.stockFilter) {
      produits = produits.filter(p => {
        const s = Utils.getStockStatus(p.stockActuel || 0, p.stockMinimum || settings.seuilStockGlobal || 50);
        if (this.stockFilter === 'ok') return s.label === 'ok';
        if (this.stockFilter === 'low') return s.label === 'faible';
        if (this.stockFilter === 'out') return s.label === 'rupture';
        return true;
      });
    }
    return produits;
  },

  _renderTable(produits) {
    const t = i18n.t.bind(i18n);
    const settings = db.getSettings();
    if (produits.length === 0) {
      return `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-title">${t('no_results')}</div></div>`;
    }
    return `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>${t('reference')}</th>
              <th>${t('product_name')}</th>
              <th>${t('category')}</th>
              <th>${t('buy_price')}</th>
              <th>${t('sell_price')}</th>
              <th>${t('margin')}</th>
              <th>${t('current_stock')}</th>
              <th>${t('status')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${produits.map(p => {
              const margin = Utils.calcMargin(p.prixAchat, p.prixVente);
              const status = Utils.getStockStatus(p.stockActuel || 0, p.stockMinimum || settings.seuilStockGlobal || 50);
              const statusLabel = i18n.currentLang === 'ar' ? status.labelAr : status.label;
              return `
                <tr>
                  <td><span class="font-mono" style="font-size:0.8rem">${Utils.escapeHtml(p.reference || p.id)}</span></td>
                  <td><strong>${Utils.escapeHtml(p.nom)}</strong></td>
                  <td>${Utils.escapeHtml(p.categorie || '-')}</td>
                  <td class="font-mono">${Utils.formatMoney(p.prixAchat)}</td>
                  <td class="font-mono fw-600">${Utils.formatMoney(p.prixVente)}</td>
                  <td><span class="badge badge-${Utils.getMarginClass(margin)}">${margin.toFixed(1)}%</span></td>
                  <td class="font-mono">${p.stockActuel || 0} ${p.unite || ''}</td>
                  <td><span class="badge ${status.class}">${statusLabel}</span></td>
                  <td>
                    <div class="flex gap-xs">
                      <button class="btn btn-ghost btn-sm" onclick="ProduitsModule.showForm('${p.id}')" data-tooltip="${t('edit')}">✏️</button>
                      <button class="btn btn-ghost btn-sm" onclick="ProduitsModule.archiveProduct('${p.id}')" data-tooltip="${t('archive')}">🗄️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderGrid(produits) {
    const t = i18n.t.bind(i18n);
    const settings = db.getSettings();
    if (produits.length === 0) {
      return `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-title">${t('no_results')}</div></div>`;
    }
    return `
      <div class="products-grid stagger-children">
        ${produits.map(p => {
          const margin = Utils.calcMargin(p.prixAchat, p.prixVente);
          const status = Utils.getStockStatus(p.stockActuel || 0, p.stockMinimum || settings.seuilStockGlobal || 50);
          return `
            <div class="product-card" onclick="ProduitsModule.showForm('${p.id}')">
              <div class="product-card-actions">
                <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation(); ProduitsModule.archiveProduct('${p.id}')">🗄️</button>
              </div>
              <div class="product-card-header">
                <span class="product-card-name">${Utils.escapeHtml(p.nom)}</span>
                <span class="product-card-ref">${Utils.escapeHtml(p.reference || '')}</span>
              </div>
              <div class="product-card-category">${Utils.escapeHtml(p.categorie || '-')}</div>
              <div class="product-card-prices">
                <span class="product-card-price">${Utils.formatMoney(p.prixVente)}</span>
                <span class="product-card-buy-price">${t('buy_price')}: ${Utils.formatMoney(p.prixAchat)}</span>
              </div>
              <div class="margin-bar">
                <div class="margin-fill ${Utils.getMarginClass(margin)}" style="width: ${Math.min(margin, 100)}%"></div>
              </div>
              <div class="product-card-stock">
                <span class="product-card-stock-label">${t('current_stock')}</span>
                <span class="badge ${status.class}">${p.stockActuel || 0} ${p.unite || ''}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  onSearch: Utils.debounce(function(val) {
    ProduitsModule.searchQuery = val;
    ProduitsModule.currentPage = 1;
    ProduitsModule.render();
    // Refocus search
    setTimeout(() => {
      const input = document.getElementById('product-search');
      if (input) { input.focus(); input.selectionStart = input.selectionEnd = val.length; }
    }, 50);
  }, 250),

  onCategoryFilter(val) {
    this.categoryFilter = val;
    this.currentPage = 1;
    this.render();
  },

  onStockFilter(val) {
    this.stockFilter = val;
    this.currentPage = 1;
    this.render();
  },

  setView(mode) {
    this.viewMode = mode;
    this.render();
  },

  goPage(p) {
    const total = Math.ceil(this._getFiltered().length / this.perPage);
    if (p < 1 || p > total) return;
    this.currentPage = p;
    this.render();
  },

  showForm(id) {
    const t = i18n.t.bind(i18n);
    const isEdit = !!id;
    const prod = isEdit ? db.getById(DB_KEYS.PRODUITS, id) : {};
    const fournisseurs = db.getAll(DB_KEYS.FOURNISSEURS).filter(f => f.actif !== false);

    const formHtml = `
      <form id="product-form" onsubmit="ProduitsModule.saveProduct(event, '${id || ''}')">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('product_name')} *</label>
            <input class="form-control" name="nom" value="${Utils.escapeHtml(prod.nom || '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">${t('reference')}</label>
            <input class="form-control" name="reference" value="${Utils.escapeHtml(prod.reference || '')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('category')}</label>
            <select class="form-control" name="categorie">
              <option value="">--</option>
              ${CATEGORIES.map(c => `<option value="${t(c)}" ${prod.categorie === t(c) ? 'selected' : ''}>${t(c)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${t('unit')}</label>
            <select class="form-control" name="unite">
              ${UNITS.map(u => `<option value="${t(u)}" ${prod.unite === t(u) ? 'selected' : ''}>${t(u)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('buy_price')} (MAD) *</label>
            <input class="form-control" name="prixAchat" type="number" step="0.01" min="0" value="${prod.prixAchat || ''}" required
              oninput="ProduitsModule.updateMarginPreview()">
          </div>
          <div class="form-group">
            <label class="form-label">${t('sell_price')} (MAD) *</label>
            <input class="form-control" name="prixVente" type="number" step="0.01" min="0" value="${prod.prixVente || ''}" required
              oninput="ProduitsModule.updateMarginPreview()">
          </div>
          <div class="form-group">
            <label class="form-label">${t('margin')}</label>
            <div id="margin-preview" class="form-control" style="background:transparent;border:none;padding-top:0;font-weight:700;font-size:1.1rem">
              ${prod.prixAchat ? Utils.calcMargin(prod.prixAchat, prod.prixVente).toFixed(1) + '%' : '-'}
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('current_stock')}</label>
            <input class="form-control" name="stockActuel" type="number" min="0" value="${prod.stockActuel || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('min_stock')}</label>
            <input class="form-control" name="stockMinimum" type="number" min="0" value="${prod.stockMinimum || 50}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('max_stock')}</label>
            <input class="form-control" name="stockMaximum" type="number" min="0" value="${prod.stockMaximum || 2000}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('location')}</label>
            <input class="form-control" name="emplacement" value="${Utils.escapeHtml(prod.emplacement || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('main_supplier')}</label>
            <select class="form-control" name="fournisseurPrincipal">
              <option value="">--</option>
              ${fournisseurs.map(f => `<option value="${f.id}" ${prod.fournisseurPrincipal === f.id ? 'selected' : ''}>${Utils.escapeHtml(f.nom)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('weight')} (kg)</label>
            <input class="form-control" name="poids" type="number" step="0.01" min="0" value="${prod.poids || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('dimensions')}</label>
            <input class="form-control" name="dimensions" value="${Utils.escapeHtml(prod.dimensions || '')}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('notes')}</label>
          <textarea class="form-control" name="notes" rows="2">${Utils.escapeHtml(prod.notes || '')}</textarea>
        </div>
      </form>
    `;

    Modal.show({
      title: isEdit ? t('edit_product') : t('add_product'),
      content: formHtml,
      size: 'lg',
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">${t('cancel')}</button>
        <button class="btn btn-primary btn-ripple" onclick="document.getElementById('product-form').requestSubmit()">${t('save')}</button>
      `
    });
  },

  updateMarginPreview() {
    const form = document.getElementById('product-form');
    if (!form) return;
    const achat = parseFloat(form.elements.prixAchat.value) || 0;
    const vente = parseFloat(form.elements.prixVente.value) || 0;
    const margin = Utils.calcMargin(achat, vente);
    const el = document.getElementById('margin-preview');
    if (el) {
      el.textContent = margin.toFixed(1) + '%';
      el.style.color = `var(--color-${Utils.getMarginClass(margin)})`;
    }
  },

  saveProduct(e, id) {
    e.preventDefault();
    const t = i18n.t.bind(i18n);
    const form = e.target;
    const data = {
      nom: form.elements.nom.value.trim(),
      reference: form.elements.reference.value.trim(),
      categorie: form.elements.categorie.value,
      unite: form.elements.unite.value,
      prixAchat: parseFloat(form.elements.prixAchat.value) || 0,
      prixVente: parseFloat(form.elements.prixVente.value) || 0,
      stockActuel: parseInt(form.elements.stockActuel.value) || 0,
      stockMinimum: parseInt(form.elements.stockMinimum.value) || 50,
      stockMaximum: parseInt(form.elements.stockMaximum.value) || 2000,
      emplacement: form.elements.emplacement.value.trim(),
      fournisseurPrincipal: form.elements.fournisseurPrincipal.value,
      poids: parseFloat(form.elements.poids.value) || 0,
      dimensions: form.elements.dimensions.value.trim(),
      notes: form.elements.notes.value.trim(),
      actif: true,
    };
    data.margePercent = Utils.calcMargin(data.prixAchat, data.prixVente);

    if (!data.nom) {
      Toast.error(t('required_field'));
      return;
    }

    try {
      if (id) {
        db.update(DB_KEYS.PRODUITS, id, data);
        Toast.success(t('product_updated'));
      } else {
        db.create(DB_KEYS.PRODUITS, data);
        Toast.success(t('product_added'));
      }
      Modal.close();
      this.render();
    } catch (err) {
      Toast.error('Erreur', err.message);
    }
  },

  archiveProduct(id) {
    const t = i18n.t.bind(i18n);
    Confirm.show({
      title: t('confirm_archive'),
      message: t('confirm_archive_msg'),
      danger: true,
      onConfirm: () => {
        db.delete(DB_KEYS.PRODUITS, id);
        Toast.info(t('product_archived'));
        this.render();
      }
    });
  },

  showImportCSV() {
    const t = i18n.t.bind(i18n);
    Modal.show({
      title: t('import_csv'),
      content: `
        <p style="margin-bottom: var(--space-md); color: var(--color-text-muted);">
          CSV format: nom, reference, categorie, unite, prixAchat, prixVente, stockActuel, stockMinimum
        </p>
        <div class="form-group">
          <input type="file" accept=".csv" id="csv-file-input" class="form-control">
        </div>
      `,
      size: 'md',
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">${t('cancel')}</button>
        <button class="btn btn-primary" onclick="ProduitsModule.importCSV()">${t('import')}</button>
      `
    });
  },

  async importCSV() {
    const t = i18n.t.bind(i18n);
    const input = document.getElementById('csv-file-input');
    if (!input || !input.files.length) return;
    try {
      const text = await Utils.readFile(input.files[0]);
      const rows = Utils.parseCSV(text);
      let count = 0;
      rows.forEach(row => {
        if (row.nom) {
          db.create(DB_KEYS.PRODUITS, {
            nom: row.nom,
            reference: row.reference || '',
            categorie: row.categorie || '',
            unite: row.unite || 'ml',
            prixAchat: parseFloat(row.prixAchat) || 0,
            prixVente: parseFloat(row.prixVente) || 0,
            stockActuel: parseInt(row.stockActuel) || 0,
            stockMinimum: parseInt(row.stockMinimum) || 50,
            stockMaximum: 2000,
            actif: true,
          });
          count++;
        }
      });
      Modal.close();
      Toast.success(`${count} ${t('products').toLowerCase()} ${t('import').toLowerCase()}`);
      this.render();
    } catch (err) {
      Toast.error('Erreur CSV', err.message);
    }
  }
};
