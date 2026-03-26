/**
 * MAJDOUB Fer — Database Layer (localStorage abstraction)
 * Provides CRUD operations, sequential IDs, search, and backup/restore.
 */

const DB_KEYS = {
  PRODUITS: 'majdoub_produits',
  FOURNISSEURS: 'majdoub_fournisseurs',
  CLIENTS: 'majdoub_clients',
  VENTES: 'majdoub_ventes',
  ENTREES_STOCK: 'majdoub_entrees_stock',
  MOUVEMENTS: 'majdoub_mouvements',
  PARAMETRES: 'majdoub_parametres',
  COMPTEURS: 'majdoub_compteurs',
  LANGUE: 'majdoub_langue',
};

class Database {
  /** Get all records from a collection */
  getAll(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`DB getAll error for ${key}:`, e);
      return [];
    }
  }

  /** Get a single record by ID */
  getById(key, id) {
    const all = this.getAll(key);
    return all.find(item => item.id === id) || null;
  }

  /** Create a new record with auto-generated ID and timestamps */
  create(key, data) {
    const all = this.getAll(key);
    const prefix = this._getPrefix(key);
    const record = {
      ...data,
      id: data.id || this.nextId(prefix),
      dateCreation: data.dateCreation || new Date().toISOString(),
      dateModification: new Date().toISOString(),
    };
    all.push(record);
    this._save(key, all);
    return record;
  }

  /** Update a record by ID */
  update(key, id, data) {
    const all = this.getAll(key);
    const index = all.findIndex(item => item.id === id);
    if (index === -1) return null;
    all[index] = {
      ...all[index],
      ...data,
      id, // Preserve ID
      dateModification: new Date().toISOString(),
    };
    this._save(key, all);
    return all[index];
  }

  /** Soft delete (set actif: false) */
  delete(key, id) {
    return this.update(key, id, { actif: false });
  }

  /** Hard delete — remove record completely */
  hardDelete(key, id) {
    const all = this.getAll(key);
    const filtered = all.filter(item => item.id !== id);
    this._save(key, filtered);
    return filtered.length < all.length;
  }

  /** Search records by query across multiple fields */
  search(key, query, fields) {
    if (!query || !query.trim()) return this.getAll(key);
    const q = query.toLowerCase().trim();
    return this.getAll(key).filter(item =>
      fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }

  /** Filter records with a callback function */
  filter(key, filterFn) {
    return this.getAll(key).filter(filterFn);
  }

  /** Generate next sequential ID with prefix */
  nextId(prefix) {
    const counters = this._getCounters();
    const current = counters[prefix] || 0;
    const next = current + 1;
    counters[prefix] = next;
    localStorage.setItem(DB_KEYS.COMPTEURS, JSON.stringify(counters));
    return `${prefix}-${String(next).padStart(4, '0')}`;
  }

  /** Get current counter value */
  getCounter(prefix) {
    const counters = this._getCounters();
    return counters[prefix] || 0;
  }

  /** Export all data as JSON string */
  exportAll() {
    const data = {};
    Object.values(DB_KEYS).forEach(key => {
      const val = localStorage.getItem(key);
      data[key] = val ? JSON.parse(val) : (key === DB_KEYS.COMPTEURS || key === DB_KEYS.PARAMETRES ? {} : []);
    });
    return JSON.stringify(data, null, 2);
  }

  /** Import data from JSON string — replaces everything */
  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
      });
      return true;
    } catch (e) {
      console.error('DB import error:', e);
      return false;
    }
  }

  /** Reset all data */
  resetAll() {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  }

  /** Get settings */
  getSettings() {
    try {
      const data = localStorage.getItem(DB_KEYS.PARAMETRES);
      return data ? JSON.parse(data) : this._defaultSettings();
    } catch {
      return this._defaultSettings();
    }
  }

  /** Save settings */
  saveSettings(settings) {
    localStorage.setItem(DB_KEYS.PARAMETRES, JSON.stringify(settings));
  }

  /** Get language */
  getLang() {
    return localStorage.getItem(DB_KEYS.LANGUE) || 'fr';
  }

  /** Set language */
  setLang(lang) {
    localStorage.setItem(DB_KEYS.LANGUE, lang);
  }

  /** Log a stock movement */
  logMovement(data) {
    const movements = this.getAll(DB_KEYS.MOUVEMENTS);
    movements.push({
      ...data,
      id: this.nextId('MVT'),
      date: new Date().toISOString(),
    });
    this._save(DB_KEYS.MOUVEMENTS, movements);
  }

  // === Private helpers ===

  _save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`DB save error for ${key}:`, e);
      throw new Error('Storage full or unavailable');
    }
  }

  _getCounters() {
    try {
      const data = localStorage.getItem(DB_KEYS.COMPTEURS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _getPrefix(key) {
    const prefixes = {
      [DB_KEYS.PRODUITS]: 'PROD',
      [DB_KEYS.FOURNISSEURS]: 'FOUR',
      [DB_KEYS.CLIENTS]: 'CLI',
      [DB_KEYS.VENTES]: 'VTE',
      [DB_KEYS.ENTREES_STOCK]: 'ES',
      [DB_KEYS.MOUVEMENTS]: 'MVT',
    };
    return prefixes[key] || 'REC';
  }

  _defaultSettings() {
    return {
      nomMagasin: 'MAJDOUB Fer',
      nomMagasinAr: 'مجدوب للحديد',
      adresse: '',
      telephone: '',
      ice: '',
      logo: null,
      devise: 'MAD',
      deviseSymbole: 'د.م',
      tva: 20,
      tvActive: false,
      seuilStockGlobal: 50,
      prefixFacture: 'VTE',
      prefixBonReception: 'ES',
      theme: 'dark',
    };
  }
}

// Global singleton
const db = new Database();
