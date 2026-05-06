/**
 * MAJDOUB Fer — Reports Module
 */

const RapportsModule = {
  currentReport: 'sales',
  period: 'month',
  dateFrom: '',
  dateTo: '',
  perPage: 20,
  pages: {
    sales: 1,
    stock: 1,
    top_products: 1,
    top_clients: 1,
  },

  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('reports')}</h2>
        </div>
      </div>

      <div class="tabs">
        <button class="tab ${this.currentReport === 'sales' ? 'active' : ''}" onclick="RapportsModule.setReport('sales')">${t('sales_report')}</button>
        <button class="tab ${this.currentReport === 'stock' ? 'active' : ''}" onclick="RapportsModule.setReport('stock')">${t('stock_report')}</button>
        <button class="tab ${this.currentReport === 'profit' ? 'active' : ''}" onclick="RapportsModule.setReport('profit')">${t('profit_report')}</button>
        <button class="tab ${this.currentReport === 'top_products' ? 'active' : ''}" onclick="RapportsModule.setReport('top_products')">${t('top_products')}</button>
        <button class="tab ${this.currentReport === 'top_clients' ? 'active' : ''}" onclick="RapportsModule.setReport('top_clients')">${t('top_clients_report')}</button>
      </div>

      <!-- Period filter (except for stock) -->
      ${this.currentReport !== 'stock' ? `
        <div class="filter-bar">
          <div class="chip-group">
            <button class="chip ${this.period === 'today' ? 'active' : ''}" onclick="RapportsModule.setPeriod('today')">${t('today')}</button>
            <button class="chip ${this.period === 'week' ? 'active' : ''}" onclick="RapportsModule.setPeriod('week')">${t('this_week')}</button>
            <button class="chip ${this.period === 'month' ? 'active' : ''}" onclick="RapportsModule.setPeriod('month')">${t('this_month')}</button>
            <button class="chip ${this.period === 'year' ? 'active' : ''}" onclick="RapportsModule.setPeriod('year')">${t('this_year')}</button>
            <button class="chip ${this.period === 'all' ? 'active' : ''}" onclick="RapportsModule.setPeriod('all')">${t('all')}</button>
          </div>
        </div>
      ` : ''}

      <div id="report-content"></div>
    `;

    this._renderReport();
  },

  setReport(r) {
    this.currentReport = r;
    if (this.pages[r] == null) this.pages[r] = 1;
    this.render();
  },

  setPeriod(p) {
    this.period = p;
    this.pages.sales = 1;
    this.pages.top_products = 1;
    this.pages.top_clients = 1;
    this.render();
  },

  goPage(reportKey, p) {
    if (!this.pages.hasOwnProperty(reportKey)) this.pages[reportKey] = 1;
    if (p < 1) return;
    this.pages[reportKey] = p;
    this._renderReport();
  },

  _getDateRange() {
    return Utils.getDateRange(this.period);
  },

  _recordDate(rec) {
    return rec?.date || rec?.dateCreation || null;
  },

  _renderReport() {
    const container = document.getElementById('report-content');
    if (!container) return;

    const t = i18n.t.bind(i18n);
    const range = this._getDateRange();
    const startTxt = Utils.formatDate(range.start);
    const endTxt = Utils.formatDate(range.end);

    container.innerHTML = `
      <div class="card mb-md" style="padding:10px 14px">
        <div class="stat-inline">
          <span class="stat-dot yellow"></span>
          <strong>${t('period')}:</strong>
          <span class="text-muted">${startTxt} → ${endTxt}</span>
        </div>
      </div>
      <div id="report-body"></div>
    `;

    const body = container.querySelector('#report-body');
    if (!body) return;

    switch(this.currentReport) {
      case 'sales': this._renderSalesReport(body); break;
      case 'stock': this._renderStockReport(body); break;
      case 'profit': this._renderProfitReport(body); break;
      case 'top_products': this._renderTopProducts(body); break;
      case 'top_clients': this._renderTopClients(body); break;
    }
  },

  _renderSalesReport(container) {
    const t = i18n.t.bind(i18n);
    const range = this._getDateRange();
    const ventes = db.getAll(DB_KEYS.VENTES).filter(v => Utils.isInDateRange(this._recordDate(v), range.start, range.end));
    const salesPage = this.pages.sales || 1;
    const totalPages = Math.max(1, Math.ceil(ventes.length / this.perPage));
    if (salesPage > totalPages) this.pages.sales = totalPages;
    const currentPage = this.pages.sales;
    const sortedVentes = ventes.sort((a,b) => new Date(this._recordDate(b)) - new Date(this._recordDate(a)));
    const paged = sortedVentes.slice((currentPage - 1) * this.perPage, currentPage * this.perPage);
    const totalSales = ventes.reduce((s, v) => s + (v.totalNet || 0), 0);
    const totalItems = ventes.reduce((s, v) => s + (v.lignes || []).reduce((ls, l) => ls + l.quantite, 0), 0);

    container.innerHTML = `
      <div class="kpi-grid mb-lg" style="grid-template-columns: repeat(3, 1fr)">
        <div class="kpi-card" style="--kpi-color:var(--color-gold)">
          <div class="kpi-info">
            <div class="kpi-label">${t('total_sales')}</div>
            <div class="kpi-value font-mono">${Utils.formatMoney(totalSales)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-info">
            <div class="kpi-label">${t('order_count')}</div>
            <div class="kpi-value font-mono">${ventes.length}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-info">
            <div class="kpi-label">${t('qty_sold')}</div>
            <div class="kpi-value font-mono">${totalItems}</div>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>${t('date')}</th><th>ID</th><th>${t('client')}</th><th>${t('products')}</th><th>${t('total')}</th><th>${t('payment_mode')}</th></tr>
          </thead>
          <tbody>
            ${ventes.length === 0 ? `<tr><td colspan="6" class="text-center text-muted" style="padding:30px">${t('no_data')}</td></tr>` :
              paged.map(v => `
                <tr>
                  <td>${Utils.formatDate(v.date)}</td>
                  <td class="font-mono" style="font-size:0.78rem">${v.id}</td>
                  <td>${Utils.escapeHtml(v.clientNom || '-')}</td>
                  <td>${(v.lignes||[]).length}</td>
                  <td class="font-mono fw-600 text-gold">${Utils.formatMoney(v.totalNet)}</td>
                  <td>${v.modePaiement || '-'}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      ${ventes.length > this.perPage ? `
        <div class="data-table-pagination">
          <span>${(currentPage - 1) * this.perPage + 1}-${Math.min(currentPage * this.perPage, ventes.length)} / ${ventes.length}</span>
          <div class="pagination-buttons">
            <button class="pagination-btn" onclick="RapportsModule.goPage('sales', ${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2).map(p =>
              `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="RapportsModule.goPage('sales', ${p})">${p}</button>`
            ).join('')}
            <button class="pagination-btn" onclick="RapportsModule.goPage('sales', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
          </div>
        </div>
      ` : ''}
    `;
  },

  _renderStockReport(container) {
    const t = i18n.t.bind(i18n);
    const produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);
    const sortedProduits = produits.sort((a,b) => (b.stockActuel||0) - (a.stockActuel||0));
    const stockPage = this.pages.stock || 1;
    const totalPages = Math.max(1, Math.ceil(sortedProduits.length / this.perPage));
    if (stockPage > totalPages) this.pages.stock = totalPages;
    const currentPage = this.pages.stock;
    const paged = sortedProduits.slice((currentPage - 1) * this.perPage, currentPage * this.perPage);
    const totalValueAchat = produits.reduce((s, p) => s + ((p.prixAchat || 0) * (p.stockActuel || 0)), 0);
    const totalValueVente = produits.reduce((s, p) => s + ((p.prixVente || 0) * (p.stockActuel || 0)), 0);

    container.innerHTML = `
      <div class="kpi-grid mb-lg" style="grid-template-columns: repeat(3, 1fr)">
        <div class="kpi-card">
          <div class="kpi-info">
            <div class="kpi-label">${t('products')}</div>
            <div class="kpi-value font-mono">${produits.length}</div>
          </div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--color-info)">
          <div class="kpi-info">
            <div class="kpi-label">${t('stock_value')} (${t('buy_price')})</div>
            <div class="kpi-value font-mono">${Utils.formatMoney(totalValueAchat)}</div>
          </div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--color-gold)">
          <div class="kpi-info">
            <div class="kpi-label">${t('stock_value')} (${t('sell_price')})</div>
            <div class="kpi-value font-mono">${Utils.formatMoney(totalValueVente)}</div>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>${t('product_name')}</th><th>${t('reference')}</th><th>${t('category')}</th><th>${t('current_stock')}</th><th>${t('buy_price')}</th><th>${t('sell_price')}</th><th>${t('stock_value')}</th><th>${t('status')}</th></tr>
          </thead>
          <tbody>
            ${paged.map(p => {
              const status = Utils.getStockStatus(p.stockActuel || 0, p.stockMinimum || 50);
              const val = (p.prixAchat || 0) * (p.stockActuel || 0);
              return `
                <tr>
                  <td><strong>${Utils.escapeHtml(p.nom)}</strong></td>
                  <td class="font-mono" style="font-size:0.78rem">${Utils.escapeHtml(p.reference || '-')}</td>
                  <td>${Utils.escapeHtml(p.categorie || '-')}</td>
                  <td class="font-mono">${p.stockActuel || 0} ${p.unite || ''}</td>
                  <td class="font-mono">${Utils.formatMoney(p.prixAchat)}</td>
                  <td class="font-mono">${Utils.formatMoney(p.prixVente)}</td>
                  <td class="font-mono fw-600">${Utils.formatMoney(val)}</td>
                  <td><span class="badge ${status.class}">${i18n.currentLang === 'ar' ? status.labelAr : status.label}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${produits.length > this.perPage ? `
        <div class="data-table-pagination">
          <span>${(currentPage - 1) * this.perPage + 1}-${Math.min(currentPage * this.perPage, produits.length)} / ${produits.length}</span>
          <div class="pagination-buttons">
            <button class="pagination-btn" onclick="RapportsModule.goPage('stock', ${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2).map(p =>
              `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="RapportsModule.goPage('stock', ${p})">${p}</button>`
            ).join('')}
            <button class="pagination-btn" onclick="RapportsModule.goPage('stock', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
          </div>
        </div>
      ` : ''}
    `;
  },

  _renderProfitReport(container) {
    const t = i18n.t.bind(i18n);
    const range = this._getDateRange();
    const ventes = db.getAll(DB_KEYS.VENTES).filter(v => Utils.isInDateRange(this._recordDate(v), range.start, range.end));
    const produits = db.getAll(DB_KEYS.PRODUITS);

    const totalRevenue = ventes.reduce((s, v) => s + (v.totalNet || 0), 0);
    let totalCost = 0;
    ventes.forEach(v => {
      (v.lignes || []).forEach(l => {
        const prod = produits.find(p => p.id === l.produitId);
        totalCost += (prod ? prod.prixAchat : 0) * l.quantite;
      });
    });
    const profit = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

    container.innerHTML = `
      <div class="kpi-grid mb-lg" style="grid-template-columns: repeat(4, 1fr)">
        <div class="kpi-card" style="--kpi-color:var(--color-gold)">
          <div class="kpi-info">
            <div class="kpi-label">${t('revenue')}</div>
            <div class="kpi-value font-mono">${Utils.formatMoney(totalRevenue)}</div>
          </div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--color-danger)">
          <div class="kpi-info">
            <div class="kpi-label">${t('total_cost')}</div>
            <div class="kpi-value font-mono">${Utils.formatMoney(totalCost)}</div>
          </div>
        </div>
        <div class="kpi-card" style="--kpi-color:var(--color-success)">
          <div class="kpi-info">
            <div class="kpi-label">${t('gross_profit_label')}</div>
            <div class="kpi-value font-mono" style="color:var(--color-success)">${Utils.formatMoney(profit)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-info">
            <div class="kpi-label">${t('margin')}</div>
            <div class="kpi-value font-mono">${marginPct.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    `;
  },

  _renderTopProducts(container) {
    const t = i18n.t.bind(i18n);
    const range = this._getDateRange();
    const ventes = db.getAll(DB_KEYS.VENTES).filter(v => Utils.isInDateRange(this._recordDate(v), range.start, range.end));
    const prodStats = {};
    ventes.forEach(v => {
      (v.lignes || []).forEach(l => {
        if (!prodStats[l.produitId]) {
          prodStats[l.produitId] = { nom: l.produitNom, qty: 0, revenue: 0 };
        }
        prodStats[l.produitId].qty += l.quantite;
        prodStats[l.produitId].revenue += l.montantLigne || 0;
      });
    });
    const sorted = Object.entries(prodStats).sort((a, b) => b[1].revenue - a[1].revenue);
    const topPage = this.pages.top_products || 1;
    const totalPages = Math.max(1, Math.ceil(sorted.length / this.perPage));
    if (topPage > totalPages) this.pages.top_products = totalPages;
    const currentPage = this.pages.top_products;
    const paged = sorted.slice((currentPage - 1) * this.perPage, currentPage * this.perPage);

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>#</th><th>${t('product_name')}</th><th>${t('qty_sold')}</th><th>${t('revenue')}</th></tr></thead>
          <tbody>
            ${sorted.length === 0 ? `<tr><td colspan="4" class="text-center text-muted" style="padding:30px">${t('no_data')}</td></tr>` :
              paged.map(([id, s], i) => `
                <tr>
                  <td>${((currentPage - 1) * this.perPage + i) < 3 ? ['🥇','🥈','🥉'][(currentPage - 1) * this.perPage + i] : ((currentPage - 1) * this.perPage + i + 1)}</td>
                  <td><strong>${Utils.escapeHtml(s.nom)}</strong></td>
                  <td class="font-mono">${s.qty}</td>
                  <td class="font-mono fw-600 text-gold">${Utils.formatMoney(s.revenue)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      ${sorted.length > this.perPage ? `
        <div class="data-table-pagination">
          <span>${(currentPage - 1) * this.perPage + 1}-${Math.min(currentPage * this.perPage, sorted.length)} / ${sorted.length}</span>
          <div class="pagination-buttons">
            <button class="pagination-btn" onclick="RapportsModule.goPage('top_products', ${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2).map(p =>
              `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="RapportsModule.goPage('top_products', ${p})">${p}</button>`
            ).join('')}
            <button class="pagination-btn" onclick="RapportsModule.goPage('top_products', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
          </div>
        </div>
      ` : ''}
    `;
  },

  _renderTopClients(container) {
    const t = i18n.t.bind(i18n);
    const range = this._getDateRange();
    const ventes = db.getAll(DB_KEYS.VENTES).filter(v => Utils.isInDateRange(this._recordDate(v), range.start, range.end));
    const cliStats = {};
    ventes.forEach(v => {
      const key = v.clientId || 'anon';
      if (!cliStats[key]) {
        cliStats[key] = { nom: v.clientNom || t('anonymous_client'), count: 0, total: 0 };
      }
      cliStats[key].count++;
      cliStats[key].total += v.totalNet || 0;
    });
    const sorted = Object.entries(cliStats).sort((a, b) => b[1].total - a[1].total);
    const topPage = this.pages.top_clients || 1;
    const totalPages = Math.max(1, Math.ceil(sorted.length / this.perPage));
    if (topPage > totalPages) this.pages.top_clients = totalPages;
    const currentPage = this.pages.top_clients;
    const paged = sorted.slice((currentPage - 1) * this.perPage, currentPage * this.perPage);

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>#</th><th>${t('client_name')}</th><th>${t('order_count')}</th><th>${t('revenue')}</th></tr></thead>
          <tbody>
            ${sorted.length === 0 ? `<tr><td colspan="4" class="text-center text-muted" style="padding:30px">${t('no_data')}</td></tr>` :
              paged.map(([id, s], i) => `
                <tr>
                  <td>${((currentPage - 1) * this.perPage + i) < 3 ? ['🥇','🥈','🥉'][(currentPage - 1) * this.perPage + i] : ((currentPage - 1) * this.perPage + i + 1)}</td>
                  <td><strong>${Utils.escapeHtml(s.nom)}</strong></td>
                  <td class="font-mono">${s.count}</td>
                  <td class="font-mono fw-600 text-gold">${Utils.formatMoney(s.total)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      ${sorted.length > this.perPage ? `
        <div class="data-table-pagination">
          <span>${(currentPage - 1) * this.perPage + 1}-${Math.min(currentPage * this.perPage, sorted.length)} / ${sorted.length}</span>
          <div class="pagination-buttons">
            <button class="pagination-btn" onclick="RapportsModule.goPage('top_clients', ${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2).map(p =>
              `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="RapportsModule.goPage('top_clients', ${p})">${p}</button>`
            ).join('')}
            <button class="pagination-btn" onclick="RapportsModule.goPage('top_clients', ${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
          </div>
        </div>
      ` : ''}
    `;
  }
};
