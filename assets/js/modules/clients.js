/**
 * MAJDOUB Fer — Clients Module
 */

const ClientsModule = {
  searchQuery: '',

  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);
    let clients = db.getAll(DB_KEYS.CLIENTS).filter(c => c.actif !== false);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      clients = clients.filter(c =>
        (c.nom || '').toLowerCase().includes(q) ||
        (c.telephone || '').includes(q) ||
        (c.ville || '').toLowerCase().includes(q)
      );
    }
    // Sort by total purchases descending
    clients.sort((a, b) => (b.totalAchats || 0) - (a.totalAchats || 0));

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('clients')}</h2>
          <p class="page-subtitle">${clients.length} ${t('clients').toLowerCase()}</p>
        </div>
        <button class="btn btn-primary btn-ripple" onclick="ClientsModule.showForm()">+ ${t('add_client')}</button>
      </div>

      <div class="filter-bar">
        <div class="search-bar">
          <span class="search-bar-icon">🔍</span>
          <input type="text" placeholder="${t('search')}" value="${this.searchQuery}"
            oninput="ClientsModule.onSearch(this.value)" id="client-search">
        </div>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>${t('client_name')}</th>
              <th>${t('client_type')}</th>
              <th>${t('phone')}</th>
              <th>${t('city')}</th>
              <th>${t('total_purchases')}</th>
              <th>${t('order_count')}</th>
              <th>${t('last_purchase')}</th>
              <th>${t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${clients.length === 0 ? `<tr><td colspan="8" class="text-center text-muted" style="padding:40px">${t('no_data')}</td></tr>` :
              clients.map((c, idx) => `
                <tr>
                  <td>
                    <div class="flex items-center gap-sm">
                      ${idx < 3 && (c.totalAchats || 0) > 0 ? `<span style="font-size:0.9rem">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>` : ''}
                      <strong>${Utils.escapeHtml(c.nom)}</strong>
                    </div>
                  </td>
                  <td><span class="badge ${c.type === 'professionnel' ? 'badge-info' : 'badge-accent'}">${c.type === 'professionnel' ? t('professional') : t('individual')}</span></td>
                  <td class="font-mono">${Utils.escapeHtml(c.telephone || '-')}</td>
                  <td>${Utils.escapeHtml(c.ville || '-')}</td>
                  <td class="font-mono fw-600 text-gold">${Utils.formatMoney(c.totalAchats || 0)}</td>
                  <td class="font-mono">${c.nombreCommandes || 0}</td>
                  <td>${Utils.formatDate(c.dernierAchat)}</td>
                  <td>
                    <div class="flex gap-xs">
                      <button class="btn btn-ghost btn-sm" onclick="ClientsModule.showForm('${c.id}')">✏️</button>
                      <button class="btn btn-ghost btn-sm" onclick="ClientsModule.viewDetails('${c.id}')">👁</button>
                      <button class="btn btn-ghost btn-sm" onclick="ClientsModule.archiveClient('${c.id}')">🗄️</button>
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
    ClientsModule.searchQuery = val;
    ClientsModule.render();
    setTimeout(() => {
      const input = document.getElementById('client-search');
      if (input) { input.focus(); input.selectionStart = input.selectionEnd = val.length; }
    }, 50);
  }, 250),

  showForm(id) {
    const t = i18n.t.bind(i18n);
    const isEdit = !!id;
    const c = isEdit ? db.getById(DB_KEYS.CLIENTS, id) : {};

    Modal.show({
      title: isEdit ? t('edit_client') : t('add_client'),
      content: `
        <form id="client-form" onsubmit="ClientsModule.save(event, '${id || ''}')">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('client_name')} *</label>
              <input class="form-control" name="nom" value="${Utils.escapeHtml(c.nom || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">${t('client_type')}</label>
              <select class="form-control" name="type">
                <option value="particulier" ${c.type !== 'professionnel' ? 'selected' : ''}>${t('individual')}</option>
                <option value="professionnel" ${c.type === 'professionnel' ? 'selected' : ''}>${t('professional')}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('phone')}</label>
              <input class="form-control" name="telephone" value="${Utils.escapeHtml(c.telephone || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('phone2')}</label>
              <input class="form-control" name="telephone2" value="${Utils.escapeHtml(c.telephone2 || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('email')}</label>
              <input class="form-control" name="email" type="email" value="${Utils.escapeHtml(c.email || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('city')}</label>
              <input class="form-control" name="ville" value="${Utils.escapeHtml(c.ville || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('address')}</label>
            <input class="form-control" name="adresse" value="${Utils.escapeHtml(c.adresse || '')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('cin')}</label>
              <input class="form-control" name="cin" value="${Utils.escapeHtml(c.cin || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('ice')}</label>
              <input class="form-control" name="ice" value="${Utils.escapeHtml(c.ice || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">${t('notes')}</label>
            <textarea class="form-control" name="notes" rows="2">${Utils.escapeHtml(c.notes || '')}</textarea>
          </div>
        </form>
      `,
      size: 'lg',
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">${t('cancel')}</button>
        <button class="btn btn-primary btn-ripple" onclick="document.getElementById('client-form').requestSubmit()">${t('save')}</button>
      `
    });
  },

  save(e, id) {
    e.preventDefault();
    const t = i18n.t.bind(i18n);
    const form = e.target;
    const data = {
      nom: form.elements.nom.value.trim(),
      type: form.elements.type.value,
      telephone: form.elements.telephone.value.trim(),
      telephone2: form.elements.telephone2.value.trim(),
      email: form.elements.email.value.trim(),
      ville: form.elements.ville.value.trim(),
      adresse: form.elements.adresse.value.trim(),
      cin: form.elements.cin.value.trim(),
      ice: form.elements.ice.value.trim(),
      notes: form.elements.notes.value.trim(),
      actif: true,
    };
    if (!data.nom) { Toast.error(t('required_field')); return; }

    try {
      if (id) {
        db.update(DB_KEYS.CLIENTS, id, data);
        Toast.success(t('client_updated'));
      } else {
        db.create(DB_KEYS.CLIENTS, data);
        Toast.success(t('client_added'));
      }
      Modal.close();
      this.render();
    } catch (err) {
      Toast.error('Erreur', err.message);
    }
  },

  viewDetails(id) {
    const t = i18n.t.bind(i18n);
    const c = db.getById(DB_KEYS.CLIENTS, id);
    if (!c) return;
    const ventes = db.getAll(DB_KEYS.VENTES).filter(v => v.clientId === id);
    const totalAchats = ventes.reduce((sum, v) => sum + (v.totalNet || 0), 0);
    const avgBasket = ventes.length > 0 ? totalAchats / ventes.length : 0;

    Modal.show({
      title: `👤 ${Utils.escapeHtml(c.nom)}`,
      content: `
        <div class="kpi-grid mb-lg" style="grid-template-columns: repeat(3,1fr)">
          <div class="kpi-card" style="--kpi-color:var(--color-gold)">
            <div class="kpi-info">
              <div class="kpi-label">${t('total_purchases')}</div>
              <div class="kpi-value font-mono" style="font-size:1.4rem">${Utils.formatMoney(totalAchats)}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-info">
              <div class="kpi-label">${t('order_count')}</div>
              <div class="kpi-value font-mono" style="font-size:1.4rem">${ventes.length}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-info">
              <div class="kpi-label">${t('avg_basket')}</div>
              <div class="kpi-value font-mono" style="font-size:1.4rem">${Utils.formatMoney(avgBasket)}</div>
            </div>
          </div>
        </div>

        <h4 style="margin-bottom: var(--space-sm)">${t('purchase_history')}</h4>
        <table class="data-table">
          <thead><tr><th>${t('date')}</th><th>ID</th><th>${t('products')}</th><th>${t('total')}</th></tr></thead>
          <tbody>
            ${ventes.length === 0 ? `<tr><td colspan="4" class="text-center text-muted">${t('no_data')}</td></tr>` :
              ventes.sort((a,b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 15).map(v => `
                <tr>
                  <td>${Utils.formatDate(v.date)}</td>
                  <td class="font-mono" style="font-size:0.78rem">${v.id}</td>
                  <td>${(v.lignes || []).length} article(s)</td>
                  <td class="font-mono fw-600 text-gold">${Utils.formatMoney(v.totalNet)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      `,
      size: 'lg',
    });
  },

  archiveClient(id) {
    const t = i18n.t.bind(i18n);
    Confirm.show({
      title: t('confirm_archive'),
      message: t('confirm_archive_msg'),
      danger: true,
      onConfirm: () => {
        db.delete(DB_KEYS.CLIENTS, id);
        Toast.info(t('archived'));
        this.render();
      }
    });
  }
};
