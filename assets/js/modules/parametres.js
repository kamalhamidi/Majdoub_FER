/**
 * MAJDOUB Fer — Settings Module
 */

const ParametresModule = {
  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);
    const settings = db.getSettings();

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('settings')}</h2>
        </div>
      </div>

      <!-- Store Info -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">🏪 ${t('store_info')}</h3>
        </div>
        <form id="settings-form" onsubmit="ParametresModule.save(event)">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('store_name')} (FR)</label>
              <input class="form-control" name="nomMagasin" value="${Utils.escapeHtml(settings.nomMagasin || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('store_name')} (AR)</label>
              <input class="form-control" name="nomMagasinAr" value="${Utils.escapeHtml(settings.nomMagasinAr || '')}" dir="rtl">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('address')}</label>
              <input class="form-control" name="adresse" value="${Utils.escapeHtml(settings.adresse || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('phone')}</label>
              <input class="form-control" name="telephone" value="${Utils.escapeHtml(settings.telephone || '')}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('ice')}</label>
              <input class="form-control" name="ice" value="${Utils.escapeHtml(settings.ice || '')}">
            </div>
          </div>

          <hr style="border-color: var(--color-border); margin: var(--space-lg) 0">

          <h3 class="card-title mb-md">💰 ${t('currency')} & ${t('tax_rate')}</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('currency')}</label>
              <input class="form-control" name="devise" value="${Utils.escapeHtml(settings.devise || 'MAD')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('currency_symbol')}</label>
              <input class="form-control" name="deviseSymbole" value="${Utils.escapeHtml(settings.deviseSymbole || 'د.م')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('tax_rate')}</label>
              <input class="form-control" name="tva" type="number" min="0" max="100" value="${settings.tva || 20}">
            </div>
          </div>

          <hr style="border-color: var(--color-border); margin: var(--space-lg) 0">

          <h3 class="card-title mb-md">📊 ${t('global_min_stock')}</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('global_min_stock')}</label>
              <input class="form-control" name="seuilStockGlobal" type="number" min="0" value="${settings.seuilStockGlobal || 50}">
            </div>
          </div>

          <hr style="border-color: var(--color-border); margin: var(--space-lg) 0">

          <h3 class="card-title mb-md">🔢 ${t('numbering')}</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('invoice_prefix')}</label>
              <input class="form-control" name="prefixFacture" value="${Utils.escapeHtml(settings.prefixFacture || 'VTE')}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('receipt_prefix')}</label>
              <input class="form-control" name="prefixBonReception" value="${Utils.escapeHtml(settings.prefixBonReception || 'ES')}">
            </div>
          </div>

          <div style="margin-top: var(--space-lg)">
            <button type="submit" class="btn btn-primary btn-ripple btn-lg">💾 ${t('save')}</button>
          </div>
        </form>
      </div>

      <!-- Language -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">🌐 ${t('language')}</h3>
        </div>
        <div class="flex gap-md">
          <button class="btn ${i18n.currentLang === 'fr' ? 'btn-primary' : 'btn-secondary'}" onclick="toggleLang('fr')">🇫🇷 Français</button>
          <button class="btn ${i18n.currentLang === 'ar' ? 'btn-primary' : 'btn-secondary'}" onclick="toggleLang('ar')">🇲🇦 العربية</button>
        </div>
      </div>

      <!-- Backup / Restore -->
      <div class="card mb-lg">
        <div class="card-header">
          <h3 class="card-title">💾 ${t('backup_restore')}</h3>
        </div>
        <div class="flex gap-md flex-col">
          <div class="flex gap-md">
            <button class="btn btn-success" onclick="ParametresModule.exportData()">📥 ${t('export_data')}</button>
            <div>
              <input type="file" id="import-file" accept=".json" style="display:none" onchange="ParametresModule.importData(this)">
              <button class="btn btn-secondary" onclick="document.getElementById('import-file').click()">📤 ${t('import_data')}</button>
            </div>
          </div>
          <div style="margin-top: var(--space-md)">
            <button class="btn btn-danger" onclick="ParametresModule.resetData()">⚠️ ${t('reset_data')}</button>
          </div>
        </div>
      </div>

      <!-- Data Stats -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📊 Statistiques des Données</h3>
        </div>
        <div class="form-row" style="text-align:center">
          <div>
            <div class="kpi-value font-mono" style="font-size:1.3rem">${db.getAll(DB_KEYS.PRODUITS).length}</div>
            <div class="text-muted" style="font-size:0.8rem">${t('products')}</div>
          </div>
          <div>
            <div class="kpi-value font-mono" style="font-size:1.3rem">${db.getAll(DB_KEYS.VENTES).length}</div>
            <div class="text-muted" style="font-size:0.8rem">${t('sales')}</div>
          </div>
          <div>
            <div class="kpi-value font-mono" style="font-size:1.3rem">${db.getAll(DB_KEYS.ENTREES_STOCK).length}</div>
            <div class="text-muted" style="font-size:0.8rem">${t('stock_entries')}</div>
          </div>
          <div>
            <div class="kpi-value font-mono" style="font-size:1.3rem">${db.getAll(DB_KEYS.FOURNISSEURS).length}</div>
            <div class="text-muted" style="font-size:0.8rem">${t('suppliers')}</div>
          </div>
          <div>
            <div class="kpi-value font-mono" style="font-size:1.3rem">${db.getAll(DB_KEYS.CLIENTS).length}</div>
            <div class="text-muted" style="font-size:0.8rem">${t('clients')}</div>
          </div>
        </div>
      </div>
    `;
  },

  save(e) {
    e.preventDefault();
    const t = i18n.t.bind(i18n);
    const form = e.target;
    const settings = db.getSettings();

    settings.nomMagasin = form.elements.nomMagasin.value.trim();
    settings.nomMagasinAr = form.elements.nomMagasinAr.value.trim();
    settings.adresse = form.elements.adresse.value.trim();
    settings.telephone = form.elements.telephone.value.trim();
    settings.ice = form.elements.ice.value.trim();
    settings.devise = form.elements.devise.value.trim();
    settings.deviseSymbole = form.elements.deviseSymbole.value.trim();
    settings.tva = parseFloat(form.elements.tva.value) || 20;
    settings.seuilStockGlobal = parseInt(form.elements.seuilStockGlobal.value) || 50;
    settings.prefixFacture = form.elements.prefixFacture.value.trim();
    settings.prefixBonReception = form.elements.prefixBonReception.value.trim();

    db.saveSettings(settings);
    Toast.success(t('settings_saved'));
  },

  exportData() {
    const t = i18n.t.bind(i18n);
    try {
      const data = db.exportAll();
      const date = new Date().toISOString().split('T')[0];
      Utils.downloadFile(data, `majdoub-fer-backup-${date}.json`, 'application/json');
      Toast.success(t('data_exported'));
    } catch (err) {
      Toast.error('Erreur', err.message);
    }
  },

  async importData(input) {
    const t = i18n.t.bind(i18n);
    if (!input.files.length) return;
    Confirm.show({
      title: t('import_data'),
      message: t('reset_warning'),
      danger: true,
      onConfirm: async () => {
        try {
          const text = await Utils.readFile(input.files[0]);
          if (db.importAll(text)) {
            Toast.success(t('data_imported'));
            this.render();
            // Refresh current view
            Router.navigate();
          } else {
            Toast.error('Erreur', 'Format invalide');
          }
        } catch (err) {
          Toast.error('Erreur', err.message);
        }
      }
    });
  },

  resetData() {
    const t = i18n.t.bind(i18n);
    Confirm.show({
      title: t('reset_data'),
      message: t('reset_warning'),
      danger: true,
      confirmText: t('reset_data'),
      onConfirm: () => {
        // Double confirm
        Confirm.show({
          title: '⚠️ ' + t('confirm'),
          message: t('reset_confirm'),
          danger: true,
          onConfirm: () => {
            db.resetAll();
            Toast.info(t('data_reset'));
            this.render();
            Router.navigate('dashboard');
          }
        });
      }
    });
  }
};
