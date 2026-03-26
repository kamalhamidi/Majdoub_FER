/**
 * MAJDOUB Fer — Point of Sale (POS) Module
 */

const VentesModule = {
  cart: [],
  selectedClient: null,
  paymentMode: 'especes',
  discountAmount: 0,
  discountIsPercent: false,
  searchQuery: '',
  categoryFilter: '',
  amountReceived: 0,

  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);
    const produits = this._getFilteredProducts();

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('point_of_sale')}</h2>
        </div>
        <button class="btn btn-secondary" onclick="VentesModule.showSalesHistory()">📋 ${t('sales')} (${db.getAll(DB_KEYS.VENTES).length})</button>
      </div>

      <div class="pos-layout">
        <!-- Catalog -->
        <div class="pos-catalog">
          <div class="pos-catalog-header">
            <div class="search-bar" style="flex:1;max-width:none">
              <span class="search-bar-icon">🔍</span>
              <input type="text" placeholder="${t('search')}" value="${this.searchQuery}"
                oninput="VentesModule.onSearch(this.value)" id="pos-search">
            </div>
          </div>
          <div class="pos-categories chip-group">
            <button class="chip ${!this.categoryFilter ? 'active' : ''}" onclick="VentesModule.filterCategory('')">${t('all')}</button>
            ${CATEGORIES.map(c => `<button class="chip ${this.categoryFilter === t(c) ? 'active' : ''}" onclick="VentesModule.filterCategory('${t(c)}')">${t(c)}</button>`).join('')}
          </div>
          <div class="pos-product-grid">
            ${produits.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-text">${t('no_results')}</div></div>` :
              produits.map(p => {
                const status = Utils.getStockStatus(p.stockActuel || 0, p.stockMinimum || 50);
                return `
                  <div class="pos-product-item ${(p.stockActuel || 0) <= 0 ? 'out-of-stock' : ''}"
                    onclick="VentesModule.addToCart('${p.id}')">
                    <span class="pos-product-stock-badge badge ${status.class}">${p.stockActuel || 0}</span>
                    <div class="pos-product-name">${Utils.escapeHtml(p.nom)}</div>
                    <div class="pos-product-price">${Utils.formatMoney(p.prixVente)}</div>
                    <div class="pos-product-stock">${p.unite || ''}</div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>

        <!-- Cart -->
        <div class="pos-cart">
          <div class="pos-cart-header">
            <span>🛒 ${t('cart')} (${this.cart.reduce((s, c) => s + c.quantite, 0)})</span>
            ${this.cart.length > 0 ? `<button class="btn btn-ghost btn-sm" onclick="VentesModule.clearCart()" style="color:var(--color-danger)">✕ Clear</button>` : ''}
          </div>

          ${this.cart.length === 0 ? `
            <div class="pos-cart-empty">
              <div class="pos-cart-empty-icon">🛒</div>
              <p>${t('empty_cart')}</p>
            </div>
          ` : `
            <div class="pos-cart-items">
              ${this.cart.map((item, idx) => `
                <div class="pos-cart-item">
                  <div class="pos-cart-item-info">
                    <div class="pos-cart-item-name">${Utils.escapeHtml(item.produitNom)}</div>
                    <div class="pos-cart-item-price">${Utils.formatMoney(item.prixVenteUnitaire)} / ${item.unite || ''}</div>
                  </div>
                  <div class="pos-cart-item-qty">
                    <button onclick="VentesModule.updateQty(${idx}, -1)">−</button>
                    <input type="number" value="${item.quantite}" min="1"
                      onchange="VentesModule.setQty(${idx}, this.value)" style="width:45px">
                    <button onclick="VentesModule.updateQty(${idx}, 1)">+</button>
                  </div>
                  <div class="pos-cart-item-total">${Utils.formatMoney(item.montantLigne)}</div>
                  <button class="pos-cart-item-remove" onclick="VentesModule.removeFromCart(${idx})">✕</button>
                </div>
              `).join('')}
            </div>
          `}

          ${this.cart.length > 0 ? `
            <!-- Totals -->
            <div class="pos-cart-footer">
              <div class="pos-cart-row">
                <span>${t('subtotal')}</span>
                <span class="value">${Utils.formatMoney(this._getSubtotal())}</span>
              </div>
              <div class="pos-cart-row">
                <span>${t('discount')}</span>
                <div class="pos-discount-input">
                  <input type="number" min="0" step="0.01" value="${this.discountAmount}"
                    onchange="VentesModule.setDiscount(this.value)" id="pos-discount">
                  <button class="pos-discount-toggle ${this.discountIsPercent ? 'active' : ''}"
                    onclick="VentesModule.toggleDiscountMode()">
                    ${this.discountIsPercent ? '%' : 'MAD'}
                  </button>
                </div>
              </div>
              <div class="pos-cart-row total">
                <span>${t('total_net')}</span>
                <span class="value">${Utils.formatMoney(this._getTotal())}</span>
              </div>
            </div>

            <!-- Client -->
            <div class="pos-client-section">
              <div class="form-group" style="margin-bottom: var(--space-sm)">
                <label class="form-label">${t('client')}</label>
                <div class="flex gap-xs">
                  <select class="form-control" id="pos-client-select" onchange="VentesModule.selectClient(this.value)" style="flex:1">
                    <option value="">${t('anonymous_client')}</option>
                    ${db.getAll(DB_KEYS.CLIENTS).filter(c => c.actif !== false).map(c =>
                      `<option value="${c.id}" ${this.selectedClient === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.nom)}</option>`
                    ).join('')}
                  </select>
                  <button class="btn btn-secondary btn-sm" onclick="VentesModule.quickAddClient()">+</button>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="pos-payment-section">
              <label class="form-label">${t('payment_mode')}</label>
              <div class="payment-options">
                <button class="payment-option ${this.paymentMode === 'especes' ? 'active' : ''}" onclick="VentesModule.setPayment('especes')">💵 ${t('cash')}</button>
                <button class="payment-option ${this.paymentMode === 'cheque' ? 'active' : ''}" onclick="VentesModule.setPayment('cheque')">📄 ${t('check')}</button>
                <button class="payment-option ${this.paymentMode === 'virement' ? 'active' : ''}" onclick="VentesModule.setPayment('virement')">🏦 ${t('transfer')}</button>
                <button class="payment-option ${this.paymentMode === 'credit' ? 'active' : ''}" onclick="VentesModule.setPayment('credit')">📝 ${t('credit')}</button>
              </div>

              ${this.paymentMode === 'especes' ? `
                <div class="pos-cash-section">
                  <div class="form-group">
                    <label class="form-label">${t('amount_received')}</label>
                    <input class="form-control font-mono" type="number" step="0.01" min="0"
                      value="${this.amountReceived}" oninput="VentesModule.updateChange(this.value)">
                  </div>
                  <div class="form-group">
                    <label class="form-label">${t('change')}</label>
                    <div class="pos-change">${Utils.formatMoney(Math.max(0, this.amountReceived - this._getTotal()))}</div>
                  </div>
                </div>
              ` : ''}

              <button class="btn btn-success btn-xl pos-validate-btn btn-ripple" onclick="VentesModule.validateSale()">
                ✓ ${t('validate_sale')}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  _getFilteredProducts() {
    let produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      produits = produits.filter(p =>
        (p.nom || '').toLowerCase().includes(q) ||
        (p.reference || '').toLowerCase().includes(q)
      );
    }
    if (this.categoryFilter) {
      produits = produits.filter(p => p.categorie === this.categoryFilter);
    }
    return produits;
  },

  _getSubtotal() {
    return this.cart.reduce((sum, item) => sum + item.montantLigne, 0);
  },

  _getTotal() {
    const sub = this._getSubtotal();
    let discount = this.discountAmount || 0;
    if (this.discountIsPercent) {
      discount = sub * (discount / 100);
    }
    return Math.max(0, sub - discount);
  },

  onSearch: Utils.debounce(function(val) {
    VentesModule.searchQuery = val;
    VentesModule.render();
    setTimeout(() => {
      const input = document.getElementById('pos-search');
      if (input) { input.focus(); input.selectionStart = input.selectionEnd = val.length; }
    }, 50);
  }, 200),

  filterCategory(cat) {
    this.categoryFilter = cat;
    this.render();
  },

  addToCart(produitId) {
    const t = i18n.t.bind(i18n);
    const prod = db.getById(DB_KEYS.PRODUITS, produitId);
    if (!prod) return;
    if ((prod.stockActuel || 0) <= 0) {
      Toast.warning(t('insufficient_stock'));
      return;
    }

    const existing = this.cart.find(c => c.produitId === produitId);
    if (existing) {
      if (existing.quantite >= (prod.stockActuel || 0)) {
        Toast.warning(t('insufficient_stock'));
        return;
      }
      existing.quantite++;
      existing.montantLigne = existing.quantite * existing.prixVenteUnitaire;
    } else {
      this.cart.push({
        produitId,
        produitNom: prod.nom,
        quantite: 1,
        unite: prod.unite || '',
        prixVenteUnitaire: prod.prixVente || 0,
        remisePct: 0,
        montantLigne: prod.prixVente || 0,
      });
    }
    this.render();
  },

  updateQty(idx, delta) {
    const item = this.cart[idx];
    if (!item) return;
    const prod = db.getById(DB_KEYS.PRODUITS, item.produitId);
    const newQty = item.quantite + delta;
    if (newQty <= 0) {
      this.removeFromCart(idx);
      return;
    }
    if (prod && newQty > (prod.stockActuel || 0)) {
      Toast.warning(i18n.t('insufficient_stock'));
      return;
    }
    item.quantite = newQty;
    item.montantLigne = newQty * item.prixVenteUnitaire;
    this.render();
  },

  setQty(idx, val) {
    const qty = parseInt(val) || 1;
    const item = this.cart[idx];
    if (!item) return;
    const prod = db.getById(DB_KEYS.PRODUITS, item.produitId);
    if (prod && qty > (prod.stockActuel || 0)) {
      Toast.warning(i18n.t('insufficient_stock'));
      return;
    }
    item.quantite = Math.max(1, qty);
    item.montantLigne = item.quantite * item.prixVenteUnitaire;
    this.render();
  },

  removeFromCart(idx) {
    this.cart.splice(idx, 1);
    this.render();
  },

  clearCart() {
    this.cart = [];
    this.discountAmount = 0;
    this.selectedClient = null;
    this.amountReceived = 0;
    this.render();
  },

  setDiscount(val) {
    this.discountAmount = parseFloat(val) || 0;
    this.render();
  },

  toggleDiscountMode() {
    this.discountIsPercent = !this.discountIsPercent;
    this.render();
  },

  selectClient(clientId) {
    this.selectedClient = clientId || null;
  },

  setPayment(mode) {
    this.paymentMode = mode;
    this.render();
  },

  updateChange(val) {
    this.amountReceived = parseFloat(val) || 0;
    const change = Math.max(0, this.amountReceived - this._getTotal());
    const el = document.querySelector('.pos-change');
    if (el) el.textContent = Utils.formatMoney(change);
  },

  quickAddClient() {
    const t = i18n.t.bind(i18n);
    // Simple inline modal to add a client fast
    const existingModal = document.querySelector('.modal-overlay');
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box" style="text-align: left; max-width: 450px;">
        <h3 class="confirm-title">${t('add_client')}</h3>
        <form id="quick-client-form" onsubmit="VentesModule.saveQuickClient(event)">
          <div class="form-group">
            <label class="form-label">${t('client_name')} *</label>
            <input class="form-control" name="nom" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">${t('phone')}</label>
            <input class="form-control" name="telephone">
          </div>
          <div class="form-group">
            <label class="form-label">${t('address')}</label>
            <input class="form-control" name="adresse">
          </div>
          <div class="confirm-actions" style="margin-top: var(--space-md)">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.confirm-overlay').remove()">${t('cancel')}</button>
            <button type="submit" class="btn btn-primary">${t('save')}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveQuickClient(e) {
    e.preventDefault();
    const t = i18n.t.bind(i18n);
    const form = e.target;
    const data = {
      nom: form.elements.nom.value.trim(),
      telephone: form.elements.telephone.value.trim(),
      adresse: form.elements.adresse.value.trim(),
      type: 'particulier',
      actif: true,
    };
    if (!data.nom) return;
    const client = db.create(DB_KEYS.CLIENTS, data);
    this.selectedClient = client.id;
    Toast.success(t('client_added'));
    document.querySelector('.confirm-overlay')?.remove();
    this.render();
  },

  validateSale() {
    const t = i18n.t.bind(i18n);
    if (this.cart.length === 0) {
      Toast.warning(t('empty_cart'));
      return;
    }

    const total = this._getTotal();
    const subtotal = this._getSubtotal();
    let discountVal = this.discountAmount || 0;
    if (this.discountIsPercent) {
      discountVal = subtotal * (discountVal / 100);
    }

    const client = this.selectedClient ? db.getById(DB_KEYS.CLIENTS, this.selectedClient) : null;

    const saleData = {
      date: Utils.today(),
      heure: Utils.now(),
      clientId: this.selectedClient || null,
      clientNom: client ? client.nom : i18n.t('anonymous_client'),
      lignes: Utils.clone(this.cart),
      sousTotal: subtotal,
      remiseGlobale: discountVal,
      remiseGlobalePct: this.discountIsPercent ? this.discountAmount : 0,
      totalNet: total,
      modePaiement: this.paymentMode,
      montantRecu: this.paymentMode === 'especes' ? this.amountReceived : total,
      monnaie: this.paymentMode === 'especes' ? Math.max(0, this.amountReceived - total) : 0,
      statut: 'completée',
    };

    try {
      const sale = db.create(DB_KEYS.VENTES, saleData);

      // Decrease stock for each item
      this.cart.forEach(item => {
        const prod = db.getById(DB_KEYS.PRODUITS, item.produitId);
        if (prod) {
          db.update(DB_KEYS.PRODUITS, item.produitId, {
            stockActuel: Math.max(0, (prod.stockActuel || 0) - item.quantite),
          });
          db.logMovement({
            type: 'sortie',
            produitId: item.produitId,
            produitNom: item.produitNom,
            quantite: -item.quantite,
            prixUnitaire: item.prixVenteUnitaire,
            reference: sale.id,
          });
        }
      });

      // Update client stats
      if (client) {
        db.update(DB_KEYS.CLIENTS, client.id, {
          totalAchats: (client.totalAchats || 0) + total,
          nombreCommandes: (client.nombreCommandes || 0) + 1,
          dernierAchat: Utils.today(),
        });
      }

      // Show success
      Utils.showConfetti();
      Toast.success(t('sale_completed'));

      // Generate invoice PDF
      setTimeout(() => {
        try { PDFGenerator.facture(sale.id); } catch(e) { console.warn('PDF gen failed:', e); }
      }, 500);

      // Reset cart
      this.cart = [];
      this.discountAmount = 0;
      this.selectedClient = null;
      this.amountReceived = 0;
      this.paymentMode = 'especes';
      this.render();
    } catch (err) {
      Toast.error('Erreur', err.message);
    }
  },

  showSalesHistory() {
    const t = i18n.t.bind(i18n);
    const ventes = db.getAll(DB_KEYS.VENTES).sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));

    Modal.show({
      title: t('sales'),
      content: `
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>${t('date')}</th>
                <th>${t('client')}</th>
                <th>${t('products')}</th>
                <th>${t('total')}</th>
                <th>${t('payment_mode')}</th>
                <th>${t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${ventes.length === 0 ? `<tr><td colspan="7" class="text-center text-muted" style="padding:40px">${t('no_data')}</td></tr>` :
                ventes.map(v => `
                  <tr>
                    <td class="font-mono" style="font-size:0.78rem">${v.id}</td>
                    <td>${Utils.formatDate(v.date)} ${v.heure || ''}</td>
                    <td>${Utils.escapeHtml(v.clientNom || '-')}</td>
                    <td>${(v.lignes || []).length} article(s)</td>
                    <td class="font-mono fw-600 text-gold">${Utils.formatMoney(v.totalNet)}</td>
                    <td>${v.modePaiement === 'especes' ? t('cash') : v.modePaiement === 'cheque' ? t('check') : v.modePaiement === 'virement' ? t('transfer') : t('credit')}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" onclick="PDFGenerator.facture('${v.id}')">🖨️</button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      `,
      size: 'xl',
    });
  }
};
