/**
 * MAJDOUB Fer — Suppliers Module
 */

const FournisseursModule = {
  searchQuery: '',

  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);
    let fournisseurs = db.getAll(DB_KEYS.FOURNISSEURS).filter(f => f.actif !== false);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      fournisseurs = fournisseurs.filter(f =>
        (f.nom || '').toLowerCase().includes(q) ||
        (f.nomContact || '').toLowerCase().includes(q) ||
        (f.telephone || '').includes(q)
      );
    }

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('suppliers')}</h2>
          <p class="page-subtitle">${fournisseurs.length} ${t('suppliers').toLowerCase()}</p>
        </div>
        <button class="btn btn-primary btn-ripple" onclick="FournisseursModule.showForm()">+ ${t('add_supplier')}</button>
      </div>

      <div class="filter-bar">
        <div class="search-bar">
          <span class="search-bar-icon">🔍</span>
          <input type="text" placeholder="${t('search')}" value="${this.searchQuery}"
            oninput="FournisseursModule.onSearch(this.value)" id="supplier-search">
        </div>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>${t('supplier_name')}</th>
              <th>${t('contact_name')}</th>
              <th>${t('phone')}</th>
              <th>${t('city')}</th>
              <th>${t('ice')}</th>
              <th>${t('payment_terms')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${fournisseurs.length === 0 ? `<tr><td colspan="7" class="text-center text-muted" style="padding:40px">${t('no_data')}</td></tr>` :
              fournisseurs.map(f => `
                <tr>
                  <td><strong>${Utils.escapeHtml(f.nom)}</strong></td>
                  <td>${Utils.escapeHtml(f.nomContact || '-')}</td>
                  <td class="font-mono">${Utils.escapeHtml(f.telephone || '-')}</td>
                  <td>${Utils.escapeHtml(f.ville || '-')}</td>
                  <td class="font-mono" style="font-size:0.78rem">${Utils.escapeHtml(f.ice || '-')}</td>
                  <td>${Utils.escapeHtml(f.conditionsPaiement || '-')}</td>
                  <td>
                    <div class="flex gap-xs">
                      <button class="btn btn-ghost btn-sm" onclick="FournisseursModule.showForm('${f.id}')" data-tooltip="${t('edit')}">✏️</button>
                      <button class="btn btn-ghost btn-sm" onclick="FournisseursModule.viewDetails('${f.id}')" data-tooltip="${t('details')}">👁</button>
                      <button class="btn btn-ghost btn-sm" onclick="FournisseursModule.archiveSupplier('${f.id}')" data-tooltip="${t('archive')}">🗄️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  onSearch: Utils.debounce(function(val) {
    FournisseursModule.searchQuery = val;
    FournisseursModule.render();
    setTimeout(() => {
      const input = document.getElementById('supplier-search');
      if (input) { input.focus(); input.selectionStart = input.selectionEnd = val.length; }
    }, 50);
  }, 250),

  showForm(id) {
    const t = i18n.t.bind(i18n);
    const isEdit = !!id;
    const f = isEdit ? db.getById(DB_KEYS.FOURNISSEURS, id) : {};

    Modal.show({
      title: isEdit ? t('edit_supplier') : t('add_supplier'),
      content: `
        <form id="supplier-form" onsubmit="FournisseursModule.save(event, '${id || ''}')">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('supplier_name')} *</label>
              <input class="form-control" name="nom" value="${Utils.escapeHtml(f.nom || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t('contact_name')}</label>
              <input class="form-control" name="nomContact" value="${Utils.escapeHtml(f.nomContact || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('phone')}</label>
              <input class="form-control" name="telephone" value="${Utils.escapeHtml(f.telephone || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('phone2')}</label>
              <input class="form-control" name="telephone2" value="${Utils.escapeHtml(f.telephone2 || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('email')}</label>
              <input class="form-control" name="email" type="email" value="${Utils.escapeHtml(f.email || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('city')}</label>
              <input class="form-control" name="ville" value="${Utils.escapeHtml(f.ville || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('address')}</label>
            <input class="form-control" name="adresse" value="${Utils.escapeHtml(f.adresse || '')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('ice')}</label>
              <input class="form-control" name="ice" value="${Utils.escapeHtml(f.ice || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('rc')}</label>
              <input class="form-control" name="rc" value="${Utils.escapeHtml(f.rc || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('payment_terms')}</label>
              <input class="form-control" name="conditionsPaiement" value="${Utils.escapeHtml(f.conditionsPaiement || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('notes')}</label>
            <textarea class="form-control" name="notes" rows="2">${Utils.escapeHtml(f.notes || '')}</textarea>
          </div>
        </form>
      `,
      size: 'lg',
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">${t('cancel')}</button>
        <button class="btn btn-primary btn-ripple" onclick="document.getElementById('supplier-form').requestSubmit()">${t('save')}</button>
      `
    });
  },

  save(e, id) {
    e.preventDefault();
    const t = i18n.t.bind(i18n);
    const form = e.target;
    const data = {
      nom: form.elements.nom.value.trim(),
      nomContact: form.elements.nomContact.value.trim(),
      telephone: form.elements.telephone.value.trim(),
      telephone2: form.elements.telephone2.value.trim(),
      email: form.elements.email.value.trim(),
      ville: form.elements.ville.value.trim(),
      adresse: form.elements.adresse.value.trim(),
      ice: form.elements.ice.value.trim(),
      rc: form.elements.rc.value.trim(),
      conditionsPaiement: form.elements.conditionsPaiement.value.trim(),
      notes: form.elements.notes.value.trim(),
      actif: true,
    };
    if (!data.nom) { Toast.error(t('required_field')); return; }

    try {
      if (id) {
        db.update(DB_KEYS.FOURNISSEURS, id, data);
        Toast.success(t('supplier_updated'));
      } else {
        db.create(DB_KEYS.FOURNISSEURS, data);
        Toast.success(t('supplier_added'));
      }
      Modal.close();
      this.render();
    } catch (err) {
      Toast.error('Erreur', err.message);
    }
  },

  viewDetails(id) {
    const t = i18n.t.bind(i18n);
    const f = db.getById(DB_KEYS.FOURNISSEURS, id);
    if (!f) return;
    const entrees = db.getAll(DB_KEYS.ENTREES_STOCK).filter(e => e.fournisseurId === id);
    const totalAchats = entrees.reduce((sum, e) => sum + (e.montantTotalEntree || 0), 0);

    Modal.show({
      title: `🏭 ${Utils.escapeHtml(f.nom)}`,
      content: `
        <div class="form-row mb-md">
          <div><strong>${t('contact_name')}:</strong> ${Utils.escapeHtml(f.nomContact || '-')}</div>
          <div><strong>${t('phone')}:</strong> ${Utils.escapeHtml(f.telephone || '-')}</div>
          <div><strong>${t('city')}:</strong> ${Utils.escapeHtml(f.ville || '-')}</div>
        </div>
        <div class="form-row mb-lg">
          <div><strong>${t('ice')}:</strong> ${Utils.escapeHtml(f.ice || '-')}</div>
          <div><strong>${t('payment_terms')}:</strong> ${Utils.escapeHtml(f.conditionsPaiement || '-')}</div>
        </div>

        <div class="kpi-grid mb-lg" style="grid-template-columns: repeat(2,1fr)">
          <div class="kpi-card">
            <div class="kpi-info">
              <div class="kpi-label">${t('total_purchases')}</div>
              <div class="kpi-value font-mono">${Utils.formatMoney(totalAchats)}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-info">
              <div class="kpi-label">${t('stock_entries')}</div>
              <div class="kpi-value font-mono">${entrees.length}</div>
            </div>
          </div>
        </div>

        <h4 style="margin-bottom: var(--space-sm)">${t('purchase_history')}</h4>
        <table class="data-table">
          <thead><tr><th>${t('date')}</th><th>ID</th><th>${t('total')}</th><th>${t('payment_status')}</th></tr></thead>
          <tbody>
            ${entrees.length === 0 ? `<tr><td colspan="4" class="text-center text-muted">${t('no_data')}</td></tr>` :
              entrees.slice(0, 10).map(e => `
                <tr>
                  <td>${Utils.formatDate(e.date)}</td>
                  <td class="font-mono" style="font-size:0.78rem">${e.id}</td>
                  <td class="font-mono fw-600">${Utils.formatMoney(e.montantTotalEntree)}</td>
                  <td><span class="badge ${e.statut === 'payé' ? 'badge-success' : 'badge-warning'}">${e.statut || '-'}</span></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      `,
      size: 'lg',
    });
  },

  archiveSupplier(id) {
    const t = i18n.t.bind(i18n);
    Confirm.show({
      title: t('confirm_archive'),
      message: t('confirm_archive_msg'),
      danger: true,
      onConfirm: () => {
        db.delete(DB_KEYS.FOURNISSEURS, id);
        Toast.info(t('archived'));
        this.render();
      }
    });
  }
};
