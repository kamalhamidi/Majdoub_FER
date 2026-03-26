/**
 * MAJDOUB Fer — i18n (Internationalization)
 * Complete French / Arabic translations
 */

const translations = {
  fr: {
    // App
    app_name: "MAJDOUB Fer",
    app_subtitle: "Gestion de Magasin de Fer",

    // Navigation
    dashboard: "Tableau de Bord",
    products: "Produits",
    stock: "Stock",
    sales: "Ventes",
    suppliers: "Fournisseurs",
    clients: "Clients",
    reports: "Rapports",
    settings: "Paramètres",
    nav_management: "GESTION",
    nav_other: "AUTRE",

    // Common actions
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    archive: "Archiver",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    search: "Rechercher...",
    filter: "Filtrer",
    export: "Exporter",
    import: "Importer",
    print: "Imprimer",
    download: "Télécharger",
    confirm: "Confirmer",
    back: "Retour",
    view: "Voir",
    details: "Détails",
    actions: "Actions",
    all: "Tout",
    active: "Actif",
    archived: "Archivé",
    yes: "Oui",
    no: "Non",
    loading: "Chargement...",
    no_data: "Aucune donnée",
    no_results: "Aucun résultat trouvé",

    // Dashboard
    revenue_today: "CA du Jour",
    revenue_month: "CA du Mois",
    revenue_total: "CA Total",
    sales_today: "Ventes du Jour",
    stock_value: "Valeur du Stock",
    gross_profit: "Bénéfice Brut",
    low_stock_count: "Stock Faible",
    active_suppliers: "Fournisseurs Actifs",
    registered_clients: "Clients Enregistrés",
    sales_last_7_days: "Ventes des 7 derniers jours",
    top_categories: "Catégories les plus vendues",
    stock_alerts: "Alertes de Stock",
    recent_transactions: "Dernières Transactions",
    quick_actions: "Actions Rapides",
    new_sale: "Nouvelle Vente",
    stock_entry: "Entrée de Stock",
    new_client: "Nouveau Client",
    new_product: "Nouveau Produit",
    product_low_stock: "produit(s) en stock faible",
    no_movement_30d: "Sans mouvement depuis 30 jours",

    // Products
    product: "Produit",
    product_name: "Nom du Produit",
    reference: "Référence",
    category: "Catégorie",
    unit: "Unité",
    buy_price: "Prix d'Achat",
    sell_price: "Prix de Vente",
    margin: "Marge",
    current_stock: "Stock Actuel",
    min_stock: "Stock Minimum",
    max_stock: "Stock Maximum",
    location: "Emplacement",
    weight: "Poids",
    dimensions: "Dimensions",
    main_supplier: "Fournisseur Principal",
    notes: "Notes",
    status: "Statut",
    created_at: "Date de Création",
    updated_at: "Dernière Modification",
    price_history: "Historique des Prix",
    list_view: "Vue Liste",
    grid_view: "Vue Grille",
    import_csv: "Importer CSV",
    product_sheet: "Fiche Produit",
    add_product: "Ajouter un Produit",
    edit_product: "Modifier le Produit",
    product_added: "Produit ajouté avec succès",
    product_updated: "Produit modifié avec succès",
    product_archived: "Produit archivé",
    all_categories: "Toutes les catégories",

    // Categories
    cat_fer_plat: "Fer Plat",
    cat_fer_rond: "Fer Rond",
    cat_fer_carre: "Fer Carré",
    cat_corniere: "Cornière",
    cat_tube_carre: "Tube Carré",
    cat_tube_rond: "Tube Rond",
    cat_tole: "Tôle",
    cat_treillis: "Treillis Soudé",
    cat_fer_beton: "Fer à Béton",
    cat_profile_ipe: "Profilé IPE",
    cat_autres: "Autres",

    // Units
    unit_ml: "ml",
    unit_kg: "kg",
    unit_piece: "Pièce",
    unit_barre: "Barre",
    unit_m2: "m²",
    unit_tonne: "Tonne",

    // Stock
    stock_entry: "Entrée de Stock",
    stock_entries: "Entrées de Stock",
    entry_type: "Type d'entrée",
    entry: "Entrée",
    return: "Retour",
    adjustment: "Ajustement",
    supplier: "Fournisseur",
    supplier_invoice: "N° Facture Fournisseur",
    add_line: "Ajouter un produit",
    total_entry: "Total de l'entrée",
    payment_mode: "Mode de Paiement",
    payment_status: "Statut du Paiement",
    paid: "Payé",
    unpaid: "À payer",
    partial: "Partiel",
    reception_slip: "Bon de Réception",
    new_stock_entry: "Nouvelle Entrée de Stock",
    entry_saved: "Entrée de stock enregistrée",
    entry_history: "Historique des Entrées",

    // Sales / POS
    point_of_sale: "Point de Vente",
    cart: "Panier",
    catalog: "Catalogue",
    quantity: "Quantité",
    unit_price: "Prix Unitaire",
    line_total: "Total Ligne",
    subtotal: "Sous-total",
    discount: "Réduction",
    discount_pct: "Réduction %",
    discount_amount: "Réduction (MAD)",
    total_net: "Total Net",
    client: "Client",
    anonymous_client: "Client Anonyme",
    select_client: "Sélectionner un client",
    amount_received: "Montant Reçu",
    change: "Monnaie à rendre",
    validate_sale: "Valider la Vente",
    sale_completed: "Vente complétée avec succès !",
    invoice: "Facture",
    delivery_note: "Bon de Livraison",
    empty_cart: "Le panier est vide",
    add_to_cart: "Ajouter au panier",
    insufficient_stock: "Stock insuffisant",
    cash: "Espèces",
    check: "Chèque",
    transfer: "Virement",
    credit: "Crédit",

    // Suppliers
    supplier_name: "Nom du Fournisseur",
    contact_name: "Nom du Contact",
    phone: "Téléphone",
    phone2: "Téléphone 2",
    email: "Email",
    address: "Adresse",
    city: "Ville",
    ice: "ICE",
    rc: "RC",
    payment_terms: "Conditions de Paiement",
    balance: "Solde",
    purchase_history: "Historique des Achats",
    supplied_products: "Produits Fournis",
    add_supplier: "Ajouter un Fournisseur",
    edit_supplier: "Modifier le Fournisseur",
    supplier_added: "Fournisseur ajouté",
    supplier_updated: "Fournisseur modifié",
    supplier_statement: "Relevé Fournisseur",

    // Clients
    client_name: "Nom du Client",
    client_type: "Type",
    professional: "Professionnel",
    individual: "Particulier",
    cin: "CIN",
    total_purchases: "Total Achats",
    order_count: "Nbre Commandes",
    avg_basket: "Panier Moyen",
    last_purchase: "Dernier Achat",
    top_clients: "Top Clients",
    add_client: "Ajouter un Client",
    edit_client: "Modifier le Client",
    client_added: "Client ajouté",
    client_updated: "Client modifié",
    client_statement: "Relevé Client",

    // Reports
    sales_report: "Rapport des Ventes",
    stock_report: "Rapport de Stock",
    entries_report: "Rapport des Entrées",
    profit_report: "Rapport des Bénéfices",
    movement_report: "Mouvements de Stock",
    top_products: "Top Produits",
    top_clients_report: "Top Clients",
    top_suppliers_report: "Top Fournisseurs",
    period: "Période",
    today: "Aujourd'hui",
    this_week: "Cette Semaine",
    this_month: "Ce Mois",
    this_year: "Cette Année",
    custom: "Personnalisé",
    from: "Du",
    to: "Au",
    generate: "Générer",
    total_sales: "Total Ventes",
    total_cost: "Coût Total",
    gross_profit_label: "Bénéfice Brut",
    qty_sold: "Qté Vendue",
    revenue: "Chiffre d'Affaires",

    // Settings
    store_info: "Informations du Magasin",
    store_name: "Nom du Magasin",
    currency: "Devise",
    currency_symbol: "Symbole",
    tax_rate: "Taux TVA (%)",
    tax_enabled: "TVA activée",
    global_min_stock: "Seuil Stock Min. Global",
    numbering: "Numérotation",
    invoice_prefix: "Préfixe Facture",
    receipt_prefix: "Préfixe Bon Réception",
    backup_restore: "Sauvegarde / Restauration",
    export_data: "Exporter les Données",
    import_data: "Importer les Données",
    reset_data: "Réinitialiser",
    reset_confirm: "Êtes-vous sûr de vouloir tout supprimer ?",
    reset_warning: "Cette action est irréversible. Toutes les données seront perdues.",
    theme: "Thème",
    language: "Langue",
    settings_saved: "Paramètres enregistrés",
    data_exported: "Données exportées avec succès",
    data_imported: "Données importées avec succès",
    data_reset: "Données réinitialisées",
    upload_logo: "Télécharger un Logo",

    // Validation
    required_field: "Ce champ est obligatoire",
    invalid_number: "Veuillez entrer un nombre valide",
    invalid_email: "Email invalide",

    // Confirm
    confirm_delete: "Confirmer la suppression",
    confirm_delete_msg: "Voulez-vous vraiment supprimer cet élément ?",
    confirm_archive: "Confirmer l'archivage",
    confirm_archive_msg: "Cet élément sera archivé et n'apparaîtra plus dans les listes.",

    // PDF
    invoice_title: "FACTURE",
    delivery_note_title: "BON DE LIVRAISON",
    reception_slip_title: "BON DE RÉCEPTION",
    designation: "Désignation",
    qty: "Qté",
    unit_short: "Unité",
    unit_price_short: "P.U.",
    total: "Total",
    payment_method: "Mode de Paiement",
    signature: "Signature",
    store_subtitle: "Magasin de Fer & Matériaux Métalliques",
    page: "Page",

    // Date/time
    date: "Date",
    time: "Heure",
    date_time: "Date/Heure",
  },

  ar: {
    // App
    app_name: "مجدوب للحديد",
    app_subtitle: "إدارة متجر الحديد",

    // Navigation
    dashboard: "لوحة التحكم",
    products: "المنتجات",
    stock: "المخزون",
    sales: "المبيعات",
    suppliers: "الموردون",
    clients: "العملاء",
    reports: "التقارير",
    settings: "الإعدادات",
    nav_management: "الإدارة",
    nav_other: "أخرى",

    // Common actions
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    archive: "أرشفة",
    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
    search: "بحث...",
    filter: "تصفية",
    export: "تصدير",
    import: "استيراد",
    print: "طباعة",
    download: "تحميل",
    confirm: "تأكيد",
    back: "رجوع",
    view: "عرض",
    details: "تفاصيل",
    actions: "إجراءات",
    all: "الكل",
    active: "نشط",
    archived: "مؤرشف",
    yes: "نعم",
    no: "لا",
    loading: "جاري التحميل...",
    no_data: "لا توجد بيانات",
    no_results: "لم يتم العثور على نتائج",

    // Dashboard
    revenue_today: "إيرادات اليوم",
    revenue_month: "إيرادات الشهر",
    revenue_total: "إجمالي الإيرادات",
    sales_today: "مبيعات اليوم",
    stock_value: "قيمة المخزون",
    gross_profit: "الربح الإجمالي",
    low_stock_count: "مخزون منخفض",
    active_suppliers: "موردون نشطون",
    registered_clients: "عملاء مسجلون",
    sales_last_7_days: "مبيعات الأيام السبعة الأخيرة",
    top_categories: "الفئات الأكثر مبيعاً",
    stock_alerts: "تنبيهات المخزون",
    recent_transactions: "المعاملات الأخيرة",
    quick_actions: "إجراءات سريعة",
    new_sale: "عملية بيع جديدة",
    stock_entry: "إدخال مخزون",
    new_client: "عميل جديد",
    new_product: "منتج جديد",
    product_low_stock: "منتج(ات) بمخزون منخفض",
    no_movement_30d: "بدون حركة منذ 30 يوماً",

    // Products
    product: "المنتج",
    product_name: "اسم المنتج",
    reference: "المرجع",
    category: "الفئة",
    unit: "الوحدة",
    buy_price: "سعر الشراء",
    sell_price: "سعر البيع",
    margin: "الهامش",
    current_stock: "المخزون الحالي",
    min_stock: "الحد الأدنى",
    max_stock: "الحد الأقصى",
    location: "الموقع",
    weight: "الوزن",
    dimensions: "الأبعاد",
    main_supplier: "المورد الرئيسي",
    notes: "ملاحظات",
    status: "الحالة",
    created_at: "تاريخ الإنشاء",
    updated_at: "آخر تعديل",
    price_history: "تاريخ الأسعار",
    list_view: "عرض قائمة",
    grid_view: "عرض شبكة",
    import_csv: "استيراد CSV",
    product_sheet: "بطاقة المنتج",
    add_product: "إضافة منتج",
    edit_product: "تعديل المنتج",
    product_added: "تمت إضافة المنتج بنجاح",
    product_updated: "تم تعديل المنتج بنجاح",
    product_archived: "تمت أرشفة المنتج",
    all_categories: "جميع الفئات",

    // Categories
    cat_fer_plat: "حديد مسطح",
    cat_fer_rond: "حديد دائري",
    cat_fer_carre: "حديد مربع",
    cat_corniere: "زاوية",
    cat_tube_carre: "أنبوب مربع",
    cat_tube_rond: "أنبوب دائري",
    cat_tole: "صفيحة",
    cat_treillis: "شبكة ملحومة",
    cat_fer_beton: "حديد التسليح",
    cat_profile_ipe: "بروفيل IPE",
    cat_autres: "أخرى",

    // Units
    unit_ml: "م.ط",
    unit_kg: "كغ",
    unit_piece: "قطعة",
    unit_barre: "قضيب",
    unit_m2: "م²",
    unit_tonne: "طن",

    // Stock
    stock_entries: "إدخالات المخزون",
    entry_type: "نوع الإدخال",
    entry: "إدخال",
    return: "إرجاع",
    adjustment: "تعديل",
    supplier: "المورد",
    supplier_invoice: "رقم فاتورة المورد",
    add_line: "إضافة منتج",
    total_entry: "إجمالي الإدخال",
    payment_mode: "طريقة الدفع",
    payment_status: "حالة الدفع",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    partial: "جزئي",
    reception_slip: "وصل الاستلام",
    new_stock_entry: "إدخال مخزون جديد",
    entry_saved: "تم حفظ إدخال المخزون",
    entry_history: "سجل الإدخالات",

    // Sales / POS
    point_of_sale: "نقطة البيع",
    cart: "السلة",
    catalog: "الكتالوج",
    quantity: "الكمية",
    unit_price: "سعر الوحدة",
    line_total: "إجمالي السطر",
    subtotal: "المجموع الفرعي",
    discount: "تخفيض",
    discount_pct: "تخفيض %",
    discount_amount: "تخفيض (د.م)",
    total_net: "الصافي",
    client: "العميل",
    anonymous_client: "عميل مجهول",
    select_client: "اختر عميلاً",
    amount_received: "المبلغ المستلم",
    change: "الباقي",
    validate_sale: "تأكيد البيع",
    sale_completed: "تمت عملية البيع بنجاح!",
    invoice: "فاتورة",
    delivery_note: "وصل التسليم",
    empty_cart: "السلة فارغة",
    add_to_cart: "إضافة للسلة",
    insufficient_stock: "المخزون غير كافي",
    cash: "نقداً",
    check: "شيك",
    transfer: "تحويل",
    credit: "دين",

    // Suppliers
    supplier_name: "اسم المورد",
    contact_name: "اسم جهة الاتصال",
    phone: "الهاتف",
    phone2: "هاتف 2",
    email: "البريد الإلكتروني",
    address: "العنوان",
    city: "المدينة",
    ice: "ICE",
    rc: "السجل التجاري",
    payment_terms: "شروط الدفع",
    balance: "الرصيد",
    purchase_history: "سجل المشتريات",
    supplied_products: "المنتجات الموردة",
    add_supplier: "إضافة مورد",
    edit_supplier: "تعديل المورد",
    supplier_added: "تمت إضافة المورد",
    supplier_updated: "تم تعديل المورد",
    supplier_statement: "كشف حساب المورد",

    // Clients
    client_name: "اسم العميل",
    client_type: "النوع",
    professional: "محترف",
    individual: "فرد",
    cin: "بطاقة الهوية",
    total_purchases: "إجمالي المشتريات",
    order_count: "عدد الطلبات",
    avg_basket: "متوسط السلة",
    last_purchase: "آخر شراء",
    top_clients: "أفضل العملاء",
    add_client: "إضافة عميل",
    edit_client: "تعديل العميل",
    client_added: "تمت إضافة العميل",
    client_updated: "تم تعديل العميل",
    client_statement: "كشف حساب العميل",

    // Reports
    sales_report: "تقرير المبيعات",
    stock_report: "تقرير المخزون",
    entries_report: "تقرير الإدخالات",
    profit_report: "تقرير الأرباح",
    movement_report: "حركات المخزون",
    top_products: "أفضل المنتجات",
    top_clients_report: "أفضل العملاء",
    top_suppliers_report: "أفضل الموردين",
    period: "الفترة",
    today: "اليوم",
    this_week: "هذا الأسبوع",
    this_month: "هذا الشهر",
    this_year: "هذه السنة",
    custom: "مخصصة",
    from: "من",
    to: "إلى",
    generate: "إنشاء",
    total_sales: "إجمالي المبيعات",
    total_cost: "التكلفة الإجمالية",
    gross_profit_label: "الربح الإجمالي",
    qty_sold: "الكمية المباعة",
    revenue: "الإيرادات",

    // Settings
    store_info: "معلومات المتجر",
    store_name: "اسم المتجر",
    currency: "العملة",
    currency_symbol: "الرمز",
    tax_rate: "نسبة الضريبة (%)",
    tax_enabled: "الضريبة مفعلة",
    global_min_stock: "حد المخزون الأدنى العام",
    numbering: "الترقيم",
    invoice_prefix: "بادئة الفاتورة",
    receipt_prefix: "بادئة وصل الاستلام",
    backup_restore: "النسخ الاحتياطي / الاستعادة",
    export_data: "تصدير البيانات",
    import_data: "استيراد البيانات",
    reset_data: "إعادة تعيين",
    reset_confirm: "هل أنت متأكد من حذف جميع البيانات؟",
    reset_warning: "هذا الإجراء لا رجعة فيه. سيتم فقدان جميع البيانات.",
    theme: "المظهر",
    language: "اللغة",
    settings_saved: "تم حفظ الإعدادات",
    data_exported: "تم تصدير البيانات بنجاح",
    data_imported: "تم استيراد البيانات بنجاح",
    data_reset: "تم إعادة تعيين البيانات",
    upload_logo: "تحميل شعار",

    // Validation
    required_field: "هذا الحقل مطلوب",
    invalid_number: "يرجى إدخال رقم صحيح",
    invalid_email: "بريد إلكتروني غير صالح",

    // Confirm
    confirm_delete: "تأكيد الحذف",
    confirm_delete_msg: "هل تريد حقاً حذف هذا العنصر؟",
    confirm_archive: "تأكيد الأرشفة",
    confirm_archive_msg: "سيتم أرشفة هذا العنصر ولن يظهر في القوائم.",

    // PDF
    invoice_title: "فاتورة",
    delivery_note_title: "وصل التسليم",
    reception_slip_title: "وصل الاستلام",
    designation: "البيان",
    qty: "الكمية",
    unit_short: "الوحدة",
    unit_price_short: "س.و",
    total: "المجموع",
    payment_method: "طريقة الدفع",
    signature: "التوقيع",
    store_subtitle: "متجر الحديد والمواد المعدنية",
    page: "صفحة",

    // Date/time
    date: "التاريخ",
    time: "الوقت",
    date_time: "التاريخ/الوقت",
  }
};

/**
 * i18n Manager
 */
const i18n = {
  currentLang: 'fr',

  /** Initialize language from stored preference */
  init() {
    this.currentLang = db.getLang();
    this.applyDirection();
  },

  /** Get translation for a key */
  t(key) {
    return translations[this.currentLang]?.[key] || translations['fr']?.[key] || key;
  },

  /** Switch language */
  setLang(lang) {
    this.currentLang = lang;
    db.setLang(lang);
    this.applyDirection();
    this.updateAll();
  },

  /** Toggle between FR and AR */
  toggle() {
    this.setLang(this.currentLang === 'fr' ? 'ar' : 'fr');
  },

  /** Apply RTL/LTR direction */
  applyDirection() {
    const html = document.documentElement;
    if (this.currentLang === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      document.body.style.fontFamily = 'var(--font-arabic)';
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'fr');
      document.body.style.fontFamily = 'var(--font-body)';
    }
  },

  /** Update all translatable elements on the page */
  updateAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    // Update lang toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });
  },

  /** Check if current language is RTL */
  isRTL() {
    return this.currentLang === 'ar';
  }
};
