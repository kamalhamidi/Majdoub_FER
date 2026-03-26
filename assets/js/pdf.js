/**
 * MAJDOUB Fer — PDF Generator (using jsPDF)
 */

const PDFGenerator = {
  /**
   * Generate an invoice PDF for a sale
   */
  facture(saleId) {
    const sale = db.getById(DB_KEYS.VENTES, saleId);
    if (!sale) { Toast.error('Vente non trouvée'); return; }
    const settings = db.getSettings();
    const t = i18n.t.bind(i18n);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      this._addHeader(doc, settings, t);

      // Invoice title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(t('invoice_title'), 105, 55, { align: 'center' });

      // Invoice info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`N°: ${sale.id}`, 15, 65);
      doc.text(`${t('date')}: ${Utils.formatDate(sale.date)} ${sale.heure || ''}`, 15, 72);
      doc.text(`${t('client')}: ${sale.clientNom || t('anonymous_client')}`, 15, 79);
      doc.text(`${t('payment_method')}: ${sale.modePaiement || '-'}`, 140, 65);

      // Table header
      let y = 92;
      doc.setFillColor(26, 26, 46);
      doc.rect(15, y - 6, 180, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t('designation'), 17, y);
      doc.text(t('qty'), 100, y, { align: 'center' });
      doc.text(t('unit_short'), 118, y, { align: 'center' });
      doc.text(t('unit_price_short'), 142, y, { align: 'center' });
      doc.text(t('total'), 175, y, { align: 'center' });

      // Table rows
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      y += 10;
      (sale.lignes || []).forEach((l, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 250);
          doc.rect(15, y - 5, 180, 8, 'F');
        }
        doc.setFontSize(9);
        doc.text(String(l.produitNom || '').substring(0, 40), 17, y);
        doc.text(String(l.quantite), 100, y, { align: 'center' });
        doc.text(String(l.unite || ''), 118, y, { align: 'center' });
        doc.text(this._formatNum(l.prixVenteUnitaire), 142, y, { align: 'center' });
        doc.text(this._formatNum(l.montantLigne), 175, y, { align: 'center' });
        y += 8;
      });

      // Totals
      y += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(120, y - 3, 195, y - 3);

      doc.setFontSize(10);
      doc.text(`${t('subtotal')}:`, 130, y);
      doc.text(this._formatNum(sale.sousTotal) + ` ${settings.devise || 'MAD'}`, 195, y, { align: 'right' });
      y += 7;

      if (sale.remiseGlobale > 0) {
        doc.text(`${t('discount')}:`, 130, y);
        doc.text(`-${this._formatNum(sale.remiseGlobale)} ${settings.devise || 'MAD'}`, 195, y, { align: 'right' });
        y += 7;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${t('total_net')}:`, 130, y);
      doc.text(`${this._formatNum(sale.totalNet)} ${settings.devise || 'MAD'}`, 195, y, { align: 'right' });

      // Footer
      this._addFooter(doc, settings);

      doc.save(`Facture-${sale.id}.pdf`);
      Toast.success(t('invoice') + ' PDF');
    } catch (err) {
      console.error('PDF generation error:', err);
      Toast.error('Erreur PDF', err.message);
    }
  },

  /**
   * Generate a reception slip PDF for a stock entry
   */
  bonReception(entryId) {
    const entry = db.getById(DB_KEYS.ENTREES_STOCK, entryId);
    if (!entry) { Toast.error('Entrée non trouvée'); return; }
    const settings = db.getSettings();
    const t = i18n.t.bind(i18n);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      this._addHeader(doc, settings, t);

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(t('reception_slip_title'), 105, 55, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`N°: ${entry.id}`, 15, 65);
      doc.text(`${t('date')}: ${Utils.formatDate(entry.date)} ${entry.heure || ''}`, 15, 72);
      doc.text(`${t('supplier')}: ${entry.fournisseurNom || '-'}`, 15, 79);
      if (entry.numeroFactureFournisseur) {
        doc.text(`${t('supplier_invoice')}: ${entry.numeroFactureFournisseur}`, 140, 65);
      }

      // Table
      let y = 92;
      doc.setFillColor(26, 26, 46);
      doc.rect(15, y - 6, 180, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t('designation'), 17, y);
      doc.text(t('qty'), 100, y, { align: 'center' });
      doc.text(t('unit_short'), 120, y, { align: 'center' });
      doc.text(t('unit_price_short'), 145, y, { align: 'center' });
      doc.text(t('total'), 175, y, { align: 'center' });

      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      y += 10;
      (entry.lignes || []).forEach((l, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 250);
          doc.rect(15, y - 5, 180, 8, 'F');
        }
        doc.text(String(l.produitNom || '').substring(0, 40), 17, y);
        doc.text(String(l.quantite), 100, y, { align: 'center' });
        doc.text(String(l.unite || ''), 120, y, { align: 'center' });
        doc.text(this._formatNum(l.prixAchatUnitaire), 145, y, { align: 'center' });
        doc.text(this._formatNum(l.montantTotal), 175, y, { align: 'center' });
        y += 8;
      });

      // Total
      y += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(120, y - 3, 195, y - 3);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${t('total')}:`, 130, y);
      doc.text(`${this._formatNum(entry.montantTotalEntree)} ${settings.devise || 'MAD'}`, 195, y, { align: 'right' });

      // Signatures
      y += 25;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Réceptionniste: _______________', 15, y);
      doc.text(`${t('supplier')}: _______________`, 120, y);

      this._addFooter(doc, settings);

      doc.save(`BonReception-${entry.id}.pdf`);
      Toast.success(t('reception_slip') + ' PDF');
    } catch (err) {
      console.error('PDF generation error:', err);
      Toast.error('Erreur PDF', err.message);
    }
  },

  // === Private helpers ===

  _addHeader(doc, settings, t) {
    // Header bar
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, 210, 40, 'F');

    // Store name
    doc.setTextColor(245, 166, 35);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.nomMagasin || 'MAJDOUB Fer', 15, 18);

    // Subtitle
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(t('store_subtitle'), 15, 26);

    // Contact info
    const contactParts = [];
    if (settings.adresse) contactParts.push(settings.adresse);
    if (settings.telephone) contactParts.push(`Tél: ${settings.telephone}`);
    if (settings.ice) contactParts.push(`ICE: ${settings.ice}`);
    if (contactParts.length > 0) {
      doc.setFontSize(8);
      doc.text(contactParts.join(' | '), 15, 34);
    }

    // Reset text color
    doc.setTextColor(60, 60, 60);
  },

  _addFooter(doc, settings) {
    const pageH = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`${settings.nomMagasin || 'MAJDOUB Fer'} — ${new Date().toLocaleDateString('fr-FR')}`, 105, pageH - 10, { align: 'center' });
  },

  _formatNum(n) {
    return (parseFloat(n) || 0).toFixed(2);
  }
};
