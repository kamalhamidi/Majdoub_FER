/**
 * MAJDOUB Fer — Stock Entry Module
 */

const StockModule = {
  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);
    const entrees = db.getAll(DB_KEYS.ENTREES_STOCK).sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('stock_entries')}</h2>
          <p class="page-subtitle">${entrees.length} ${t('entry').toLowerCase()}(s)</p>
        </div>
        <button class="btn btn-primary btn-ripple" onclick="StockModule.showForm()">+ ${t('new_stock_entry')}</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>${t('date')}</th>
              <th>${t('supplier')}</th>
              <th>${t('supplier_invoice')}</th>
              <th>${t('products')}</th>
              <th>${t('total')}</th>
              <th>${t('payment_status')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${entrees.length === 0 ? `<tr><td colspan="8" class="text-center text-muted" style="padding:40px">${t('no_data')}</td></tr>` :
              entrees.map(e => `
                <tr>
                  <td class="font-mono" style="font-size:0.8rem">${e.id}</td>
                  <td>${Utils.formatDate(e.date)}</td>
                  <td>${Utils.escapeHtml(e.fournisseurNom || '-')}</td>
                  <td class="font-mono">${Utils.escapeHtml(e.numeroFactureFournisseur || '-')}</td>
                  <td>${(e.lignes || []).length} ${t('product').toLowerCase()}(s)</td>
                  <td class="font-mono fw-600">${Utils.formatMoney(e.montantTotalEntree)}</td>
                  <td><span class="badge ${e.statut === 'payé' ? 'badge-success' : e.statut === 'partiel' ? 'badge-warning' : 'badge-danger'}">
                    ${e.statut === 'payé' ? t('paid') : e.statut === 'partiel' ? t('partial') : t('unpaid')}
                  </span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" onclick="StockModule.viewEntry('${e.id}')">👁</button>
                    <button class="btn btn-ghost btn-sm" onclick="PDFGenerator.bonReception('${e.id}')">🖨️</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  showForm() {
    const t = i18n.t.bind(i18n);
    const fournisseurs = db.getAll(DB_KEYS.FOURNISSEURS).filter(f => f.actif !== false);
    const produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);

    const formHtml = `
      <form id="stock-entry-form" onsubmit="StockModule.saveEntry(event)">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('supplier')} *</label>
            <select class="form-control" name="fournisseurId" required>
              <option value="">-- ${t('select_client')} --</option>
              ${fournisseurs.map(f => `<option value="${f.id}">${Utils.escapeHtml(f.nom)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${t('supplier_invoice')}</label>
            <input class="form-control" name="numeroFactureFournisseur">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${t('date')}</label>
            <input class="form-control" name="date" type="date" value="${Utils.today()}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('time')}</label>
            <input class="form-control" name="heure" type="time" value="${Utils.now()}">
          </div>
          <div class="form-group">
            <label class="form-label">${t('payment_mode')}</label>
            <select class="form-control" name="modePaiement">
              <option value="especes">${t('cash')}</option>
              <option value="cheque">${t('check')}</option>
              <option value="virement">${t('transfer')}</option>
              <option value="credit">${t('credit')}</option>
            </select>
          </div>
        </div>

        <h4 style="margin: var(--space-md) 0 var(--space-sm); font-size: 0.9rem; color: var(--color-text-muted)">${t('products')}</h4>
        <div id="entry-lines">
          ${this._lineRowHtml(produits, 0)}
        </div>
        <button type="button" class="btn btn-secondary btn-sm mt-sm" onclick="StockModule.addLine()">+ ${t('add_line')}</button>

        <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border)">
          <div class="flex justify-between items-center">
            <strong style="font-size:1.1rem">${t('total_entry')}</strong>
            <strong class="font-mono" style="font-size:1.3rem; color:var(--color-gold)" id="entry-total">0.00 د.م</strong>
          </div>
        </div>

        <div class="form-row mt-md">
          <div class="form-group">
            <label class="form-label">${t('payment_status')}</label>
            <select class="form-control" name="statut">
              <option value="payé">${t('paid')}</option>
              <option value="à payer">${t('unpaid')}</option>
              <option value="partiel">${t('partial')}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${t('notes')}</label>
            <input class="form-control" name="notes">
          </div>
        </div>
      </form>
    `;

    Modal.show({
      title: t('new_stock_entry'),
      content: formHtml,
      size: 'xl',
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">${t('cancel')}</button>
        <button class="btn btn-success btn-ripple" onclick="document.getElementById('stock-entry-form').requestSubmit()">✓ ${t('save')}</button>
      `
    });

    this._lineCount = 1;
  },

  _lineCount: 1,

  _lineRowHtml(produits, index) {
    if (!produits) produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);
    return `
      <div class="form-row items-center" data-line="${index}" style="margin-bottom: var(--space-sm); background: var(--color-glass); padding: var(--space-sm); border-radius: var(--radius-md);">
        <div class="form-group" style="flex:3; margin-bottom:0">
          <select class="form-control" name="produit_${index}" onchange="StockModule.onProductSelect(${index})">
            <option value="">-- ${i18n.t('product')} --</option>
            ${produits.map(p => `<option value="${p.id}" data-prix="${p.prixAchat}">${Utils.escapeHtml(p.nom)} (${Utils.escapeHtml(p.reference || '')})</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="flex:1; margin-bottom:0">
          <input class="form-control" name="qty_${index}" type="number" min="1" value="1" placeholder="${i18n.t('quantity')}"
            oninput="StockModule.updateLineTotal(${index})">
        </div>
        <div class="form-group" style="flex:1; margin-bottom:0">
          <input class="form-control" name="prix_${index}" type="number" step="0.01" min="0" placeholder="${i18n.t('buy_price')}"
            oninput="StockModule.updateLineTotal(${index})">
        </div>
        <div class="form-group" style="flex:1; margin-bottom:0">
          <span class="font-mono fw-600" id="line-total-${index}" style="display:block;padding:11px 0">0.00</span>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="StockModule.removeLine(${index})" style="color:var(--color-danger)">✕</button>
      </div>
    `;
  },

  addLine() {
    const container = document.getElementById('entry-lines');
    if (!container) return;
    const produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);
    container.insertAdjacentHTML('beforeend', this._lineRowHtml(produits, this._lineCount));
    this._lineCount++;
  },

  removeLine(index) {
    const row = document.querySelector(`[data-line="${index}"]`);
    if (row) {
      row.remove();
      this.updateEntryTotal();
    }
  },

  onProductSelect(index) {
    const select = document.querySelector(`[name="produit_${index}"]`);
    if (!select) return;
    const option = select.selectedOptions[0];
    const prix = option ? option.dataset.prix : 0;
    const prixInput = document.querySelector(`[name="prix_${index}"]`);
    if (prixInput && prix) prixInput.value = prix;
    this.updateLineTotal(index);
  },

  updateLineTotal(index) {
    const qty = parseFloat(document.querySelector(`[name="qty_${index}"]`)?.value) || 0;
    const prix = parseFloat(document.querySelector(`[name="prix_${index}"]`)?.value) || 0;
    const totalEl = document.getElementById(`line-total-${index}`);
    if (totalEl) totalEl.textContent = Utils.formatMoney(qty * prix);
    this.updateEntryTotal();
  },

  updateEntryTotal() {
    let total = 0;
    document.querySelectorAll('[data-line]').forEach(line => {
      const idx = line.dataset.line;
      const qty = parseFloat(document.querySelector(`[name="qty_${idx}"]`)?.value) || 0;
      const prix = parseFloat(document.querySelector(`[name="prix_${idx}"]`)?.value) || 0;
      total += qty * prix;
    });
    const el = document.getElementById('entry-total');
    if (el) el.textContent = Utils.formatMoney(total);
  },

  saveEntry(e) {
    e.preventDefault();
    const t = i18n.t.bind(i18n);
    const form = e.target;
    const fournisseurId = form.elements.fournisseurId.value;
    if (!fournisseurId) {
      Toast.error(t('required_field'));
      return;
    }

    const fournisseur = db.getById(DB_KEYS.FOURNISSEURS, fournisseurId);
    const lignes = [];

    document.querySelectorAll('[data-line]').forEach(line => {
      const idx = line.dataset.line;
      const produitId = document.querySelector(`[name="produit_${idx}"]`)?.value;
      const qty = parseFloat(document.querySelector(`[name="qty_${idx}"]`)?.value) || 0;
      const prix = parseFloat(document.querySelector(`[name="prix_${idx}"]`)?.value) || 0;
      if (produitId && qty > 0) {
        const prod = db.getById(DB_KEYS.PRODUITS, produitId);
        lignes.push({
          produitId,
          produitNom: prod ? prod.nom : '',
          quantite: qty,
          unite: prod ? prod.unite : '',
          prixAchatUnitaire: prix,
          montantTotal: qty * prix,
        });
      }
    });

    if (lignes.length === 0) {
      Toast.error(t('required_field'), t('add_line'));
      return;
    }

    const entryData = {
      type: 'entree',
      date: form.elements.date.value || Utils.today(),
      heure: form.elements.heure.value || Utils.now(),
      fournisseurId,
      fournisseurNom: fournisseur ? fournisseur.nom : '',
      numeroFactureFournisseur: form.elements.numeroFactureFournisseur.value.trim(),
      lignes,
      montantTotalEntree: lignes.reduce((sum, l) => sum + l.montantTotal, 0),
      modePaiement: form.elements.modePaiement.value,
      statut: form.elements.statut.value,
      notes: form.elements.notes.value.trim(),
    };

    try {
      db.create(DB_KEYS.ENTREES_STOCK, entryData);

      // Update stock for each product
      lignes.forEach(l => {
        const prod = db.getById(DB_KEYS.PRODUITS, l.produitId);
        if (prod) {
          db.update(DB_KEYS.PRODUITS, l.produitId, {
            stockActuel: (prod.stockActuel || 0) + l.quantite,
            prixAchat: l.prixAchatUnitaire, // Update last known buy price
          });
          // Log movement
          db.logMovement({
            type: 'entree',
            produitId: l.produitId,
            produitNom: l.produitNom,
            quantite: l.quantite,
            prixUnitaire: l.prixAchatUnitaire,
            reference: entryData.id,
          });
        }
      });

      Modal.close();
      Toast.success(t('entry_saved'));
      this.render();
    } catch (err) {
      Toast.error('Erreur', err.message);
    }
  },

  viewEntry(id) {
    const t = i18n.t.bind(i18n);
    const entry = db.getById(DB_KEYS.ENTREES_STOCK, id);
    if (!entry) return;

    Modal.show({
      title: `${t('reception_slip')} — ${entry.id}`,
      content: `
        <div class="form-row mb-md">
          <div><strong>${t('supplier')}:</strong> ${Utils.escapeHtml(entry.fournisseurNom || '-')}</div>
          <div><strong>${t('date')}:</strong> ${Utils.formatDate(entry.date)}</div>
          <div><strong>${t('supplier_invoice')}:</strong> ${Utils.escapeHtml(entry.numeroFactureFournisseur || '-')}</div>
        </div>
        <table class="data-table" style="margin-bottom:var(--space-md)">
          <thead>
            <tr>
              <th>${t('product')}</th>
              <th>${t('quantity')}</th>
              <th>${t('unit_price')}</th>
              <th>${t('total')}</th>
            </tr>
          </thead>
          <tbody>
            ${(entry.lignes || []).map(l => `
              <tr>
                <td>${Utils.escapeHtml(l.produitNom)}</td>
                <td class="font-mono">${l.quantite} ${l.unite || ''}</td>
                <td class="font-mono">${Utils.formatMoney(l.prixAchatUnitaire)}</td>
                <td class="font-mono fw-600">${Utils.formatMoney(l.montantTotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="flex justify-between items-center" style="font-size:1.1rem">
          <strong>${t('total')}</strong>
          <strong class="font-mono text-gold">${Utils.formatMoney(entry.montantTotalEntree)}</strong>
        </div>
      `,
      size: 'lg',
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">${t('close')}</button>
        <button class="btn btn-primary" onclick="PDFGenerator.bonReception('${id}')">🖨️ ${t('print')}</button>
      `
    });
  }
};
