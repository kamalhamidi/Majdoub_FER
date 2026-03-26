/**
 * MAJDOUB Fer — Dashboard Module
 */

const DashboardModule = {
  render() {
    const content = document.getElementById('module-content');
    const t = i18n.t.bind(i18n);

    // Calculate KPIs
    const ventes = db.getAll(DB_KEYS.VENTES);
    const produits = db.getAll(DB_KEYS.PRODUITS).filter(p => p.actif !== false);
    const fournisseurs = db.getAll(DB_KEYS.FOURNISSEURS).filter(f => f.actif !== false);
    const clients = db.getAll(DB_KEYS.CLIENTS).filter(c => c.actif !== false);
    const entrees = db.getAll(DB_KEYS.ENTREES_STOCK);
    const settings = db.getSettings();

    const todayStr = Utils.today();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue today
    const ventesToday = ventes.filter(v => v.date === todayStr);
    const revenueToday = ventesToday.reduce((sum, v) => sum + (v.totalNet || 0), 0);

    // Revenue month
    const ventesMonth = ventes.filter(v => new Date(v.dateCreation) >= monthStart);
    const revenueMonth = ventesMonth.reduce((sum, v) => sum + (v.totalNet || 0), 0);

    // Revenue total
    const revenueTotal = ventes.reduce((sum, v) => sum + (v.totalNet || 0), 0);

    // Stock value
    const stockValue = produits.reduce((sum, p) => sum + ((p.prixAchat || 0) * (p.stockActuel || 0)), 0);

    // Gross profit estimate
    const grossProfit = ventes.reduce((sum, v) => {
      return sum + (v.lignes || []).reduce((ls, l) => {
        const prod = db.getById(DB_KEYS.PRODUITS, l.produitId);
        const cost = prod ? (prod.prixAchat || 0) * l.quantite : 0;
        return ls + (l.montantLigne || 0) - cost;
      }, 0);
    }, 0);

    // Low stock
    const lowStockProds = produits.filter(p => (p.stockActuel || 0) <= (p.stockMinimum || settings.seuilStockGlobal || 50));

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">${t('dashboard')}</h2>
          <p class="page-subtitle">${t('app_subtitle')}</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid stagger-children">
        <div class="kpi-card" style="--kpi-color: var(--color-gold)">
          <div class="kpi-info">
            <div class="kpi-label">${t('revenue_today')}</div>
            <div class="kpi-value" data-counter="${revenueToday}" data-money="true">0</div>
            <div class="kpi-sub">${ventesToday.length} ${t('sales').toLowerCase()}</div>
          </div>
          <div class="card-icon gold">💰</div>
        </div>

        <div class="kpi-card" style="--kpi-color: var(--color-accent)">
          <div class="kpi-info">
            <div class="kpi-label">${t('revenue_month')}</div>
            <div class="kpi-value" data-counter="${revenueMonth}" data-money="true">0</div>
          </div>
          <div class="card-icon accent">📊</div>
        </div>

        <div class="kpi-card" style="--kpi-color: var(--color-info)">
          <div class="kpi-info">
            <div class="kpi-label">${t('stock_value')}</div>
            <div class="kpi-value" data-counter="${stockValue}" data-money="true">0</div>
            <div class="kpi-sub">${produits.length} ${t('products').toLowerCase()}</div>
          </div>
          <div class="card-icon info">📦</div>
        </div>

        <div class="kpi-card" style="--kpi-color: var(--color-success)">
          <div class="kpi-info">
            <div class="kpi-label">${t('gross_profit')}</div>
            <div class="kpi-value" data-counter="${grossProfit}" data-money="true">0</div>
          </div>
          <div class="card-icon success">📈</div>
        </div>

        <div class="kpi-card" style="--kpi-color: ${lowStockProds.length > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">
          <div class="kpi-info">
            <div class="kpi-label">${t('low_stock_count')}</div>
            <div class="kpi-value" data-counter="${lowStockProds.length}">0</div>
            <div class="kpi-sub">${t('product_low_stock')}</div>
          </div>
          <div class="card-icon ${lowStockProds.length > 0 ? 'danger' : 'success'}">${lowStockProds.length > 0 ? '⚠️' : '✅'}</div>
        </div>

        <div class="kpi-card" style="--kpi-color: var(--color-info)">
          <div class="kpi-info">
            <div class="kpi-label">${t('active_suppliers')}</div>
            <div class="kpi-value" data-counter="${fournisseurs.length}">0</div>
          </div>
          <div class="card-icon info">🏭</div>
        </div>

        <div class="kpi-card" style="--kpi-color: var(--color-gold)">
          <div class="kpi-info">
            <div class="kpi-label">${t('registered_clients')}</div>
            <div class="kpi-value" data-counter="${clients.length}">0</div>
          </div>
          <div class="card-icon gold">👥</div>
        </div>
      </div>

      <!-- Charts & Alerts Row -->
      <div class="dashboard-grid">
        <!-- Sales Chart -->
        <div class="chart-card">
          <div class="chart-card-title">${t('sales_last_7_days')}</div>
          <div class="chart-container" id="sales-chart"></div>
        </div>

        <!-- Top Categories -->
        <div class="chart-card">
          <div class="chart-card-title">${t('top_categories')}</div>
          <div class="donut-chart-container" id="category-chart"></div>
        </div>

        <!-- Stock Alerts -->
        <div class="chart-card">
          <div class="chart-card-title">${t('stock_alerts')}</div>
          <div class="alert-list" id="stock-alerts">
            ${lowStockProds.length === 0 ? `
              <div class="empty-state" style="padding: 20px;">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-text">${t('no_data')}</div>
              </div>
            ` : lowStockProds.slice(0, 8).map(p => `
              <div class="alert-item ${p.stockActuel <= 0 ? '' : 'warning'}">
                <span class="alert-item-icon">${p.stockActuel <= 0 ? '🔴' : '🟡'}</span>
                <span class="alert-item-text">${Utils.escapeHtml(p.nom)}</span>
                <span class="alert-item-badge badge ${p.stockActuel <= 0 ? 'badge-danger' : 'badge-warning'}">${p.stockActuel} ${p.unite || ''}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="chart-card">
          <div class="chart-card-title">${t('recent_transactions')}</div>
          <div class="transaction-list" id="recent-transactions">
            ${this._renderRecentTransactions(ventes, entrees)}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="chart-card mt-lg">
        <div class="chart-card-title">${t('quick_actions')}</div>
        <div class="quick-actions stagger-children">
          <button class="quick-action-btn" onclick="Router.navigate('ventes')">
            <span class="quick-action-icon">🛒</span>
            <span>${t('new_sale')}</span>
          </button>
          <button class="quick-action-btn" onclick="Router.navigate('stock')">
            <span class="quick-action-icon">📥</span>
            <span>${t('stock_entry')}</span>
          </button>
          <button class="quick-action-btn" onclick="Router.navigate('clients')">
            <span class="quick-action-icon">👤</span>
            <span>${t('new_client')}</span>
          </button>
          <button class="quick-action-btn" onclick="Router.navigate('produits')">
            <span class="quick-action-icon">📦</span>
            <span>${t('new_product')}</span>
          </button>
        </div>
      </div>
    `;

    // Animate counters
    setTimeout(() => {
      document.querySelectorAll('[data-counter]').forEach(el => {
        const target = parseFloat(el.dataset.counter) || 0;
        const isMoney = el.dataset.money === 'true';
        Utils.animateCounter(el, target, 1200, isMoney);
      });
    }, 200);

    // Render charts
    this._renderSalesChart(ventes);
    this._renderCategoryChart(ventes, produits);
  },

  _renderRecentTransactions(ventes, entrees) {
    const t = i18n.t.bind(i18n);
    const all = [
      ...ventes.map(v => ({ ...v, _type: 'sale' })),
      ...entrees.map(e => ({ ...e, _type: 'entry' })),
    ].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 5);

    if (all.length === 0) {
      return `<div class="empty-state" style="padding:20px"><div class="empty-state-icon">📭</div><div class="empty-state-text">${t('no_data')}</div></div>`;
    }

    return all.map(item => {
      const isSale = item._type === 'sale';
      return `
        <div class="transaction-item">
          <div class="transaction-icon ${isSale ? 'sale' : 'entry'}">${isSale ? '🛒' : '📥'}</div>
          <div class="transaction-info">
            <div class="transaction-title">${isSale ? (item.clientNom || t('anonymous_client')) : (item.fournisseurNom || t('supplier'))}</div>
            <div class="transaction-date">${Utils.formatDateTime(item.dateCreation)}</div>
          </div>
          <div class="transaction-amount ${isSale ? 'positive' : 'negative'}">
            ${isSale ? '+' : '-'}${Utils.formatMoney(isSale ? item.totalNet : item.montantTotalEntree)}
          </div>
        </div>
      `;
    }).join('');
  },

  _renderSalesChart(ventes) {
    const container = document.getElementById('sales-chart');
    if (!container) return;

    // Build 7-day data
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayVentes = ventes.filter(v => v.date === dateStr);
      const total = dayVentes.reduce((sum, v) => sum + (v.totalNet || 0), 0);
      days.push({
        label: d.toLocaleDateString(i18n.currentLang === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'short' }),
        value: total,
      });
    }

    const maxVal = Math.max(...days.map(d => d.value), 1);
    const chartH = 150;
    const barW = 40;
    const gap = 15;
    const svgW = days.length * (barW + gap);

    container.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${chartH + 30}" style="height: ${chartH + 30}px;">
        ${days.map((d, i) => {
          const barH = (d.value / maxVal) * chartH || 2;
          const x = i * (barW + gap);
          const y = chartH - barH;
          return `
            <g class="chart-bar">
              <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4"
                fill="url(#barGrad)" opacity="0.85"/>
              <text x="${x + barW / 2}" y="${chartH + 18}" text-anchor="middle"
                fill="var(--color-text-muted)" font-size="10">${d.label}</text>
              ${d.value > 0 ? `<text x="${x + barW / 2}" y="${y - 5}" text-anchor="middle"
                fill="var(--color-text)" font-size="9" font-family="var(--font-mono)">${Utils.formatMoney(d.value, false)}</text>` : ''}
            </g>
          `;
        }).join('')}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--color-accent)"/>
            <stop offset="100%" stop-color="var(--color-gold)"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  },

  _renderCategoryChart(ventes, produits) {
    const container = document.getElementById('category-chart');
    if (!container) return;

    // Aggregate sales by category
    const catSales = {};
    ventes.forEach(v => {
      (v.lignes || []).forEach(l => {
        const prod = produits.find(p => p.id === l.produitId);
        const cat = prod ? (prod.categorie || 'Autres') : 'Autres';
        catSales[cat] = (catSales[cat] || 0) + (l.montantLigne || 0);
      });
    });

    const entries = Object.entries(catSales).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = entries.reduce((s, e) => s + e[1], 0) || 1;

    const colors = ['#e94560', '#f5a623', '#00b894', '#74b9ff', '#a29bfe', '#fd79a8'];

    if (entries.length === 0) {
      container.innerHTML = `<div class="empty-state" style="padding:20px"><div class="empty-state-icon">📊</div><div class="empty-state-text">${i18n.t('no_data')}</div></div>`;
      return;
    }

    // Simple donut with SVG
    let cumAngle = 0;
    const radius = 55;
    const cx = 70, cy = 70;

    const arcs = entries.map((entry, idx) => {
      const pct = entry[1] / total;
      const angle = pct * 360;
      const startAngle = cumAngle;
      cumAngle += angle;

      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (cumAngle - 90) * Math.PI / 180;
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z"
        fill="${colors[idx]}" opacity="0.85" stroke="var(--color-primary)" stroke-width="2"/>`;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 140 140" width="140" height="140">
        ${arcs}
        <circle cx="${cx}" cy="${cy}" r="30" fill="var(--color-primary)"/>
      </svg>
      <div class="donut-legend">
        ${entries.map((e, i) => `
          <div class="donut-legend-item">
            <span class="donut-legend-dot" style="background:${colors[i]}"></span>
            <span>${Utils.escapeHtml(e[0])} (${Math.round(e[1] / total * 100)}%)</span>
          </div>
        `).join('')}
      </div>
    `;
  }
};
