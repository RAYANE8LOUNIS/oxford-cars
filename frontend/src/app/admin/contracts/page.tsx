'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, FileText, Send } from 'lucide-react';
import { formatPrice } from '@/lib/api';

interface ContractData {
  // Loueur (Oxford Cars)
  loueur_representant: string;
  // Client
  client_nom: string;
  client_prenom: string;
  client_adresse: string;
  client_wilaya: string;
  client_cin: string;
  client_permis: string;
  client_telephone: string;
  client_email: string;
  // Véhicule
  vehicule_marque: string;
  vehicule_modele: string;
  vehicule_annee: string;
  vehicule_immatriculation: string;
  vehicule_couleur: string;
  vehicule_carburant: string;
  // Location
  date_depart: string;
  date_retour: string;
  lieu_depart: string;
  lieu_retour: string;
  nb_jours: string;
  prix_jour: string;
  caution: string;
  kilometrage_depart: string;
  carburant_depart: string;
  // Numéro
  numero_contrat: string;
  date_contrat: string;
}

const empty: ContractData = {
  loueur_representant: 'Oxford Cars',
  client_nom: '', client_prenom: '', client_adresse: '', client_wilaya: '',
  client_cin: '', client_permis: '', client_telephone: '', client_email: '',
  vehicule_marque: '', vehicule_modele: '', vehicule_annee: '',
  vehicule_immatriculation: '', vehicule_couleur: '', vehicule_carburant: 'Essence',
  date_depart: '', date_retour: '', lieu_depart: 'Tizi Ouzou – Centre-ville',
  lieu_retour: 'Tizi Ouzou – Centre-ville', nb_jours: '', prix_jour: '', caution: '',
  kilometrage_depart: '0', carburant_depart: 'Plein',
  numero_contrat: `OC-${Date.now().toString().slice(-6)}`,
  date_contrat: new Date().toISOString().split('T')[0],
};

function generateContractHTML(d: ContractData): string {
  const totalHT = parseFloat(d.prix_jour || '0') * parseInt(d.nb_jours || '0');
  const totalTTC = totalHT;
  const totalAvecCaution = totalTTC + parseFloat(d.caution || '0');

  const fmt = (n: number) => new Intl.NumberFormat('fr-DZ').format(n) + ' DA';
  const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' }) : '_______________';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Contrat de Location — ${d.numero_contrat}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #1a1a1a; background: white; padding: 20mm 20mm 20mm 20mm; }

  .header { text-align: center; border-bottom: 3px double #8B6914; padding-bottom: 16px; margin-bottom: 20px; }
  .header .company { font-size: 22pt; font-weight: bold; letter-spacing: 0.15em; color: #1a1a1a; }
  .header .slogan { font-size: 10pt; color: #8B6914; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 4px; }
  .header .heritage { font-size: 8pt; color: #666; letter-spacing: 0.2em; margin-top: 2px; }
  .header .contact { font-size: 9pt; color: #444; margin-top: 8px; }

  .contrat-title { text-align: center; margin: 20px 0; }
  .contrat-title h1 { font-size: 16pt; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; border: 2px solid #1a1a1a; display: inline-block; padding: 8px 30px; }
  .contrat-title .num { font-size: 10pt; color: #8B6914; margin-top: 8px; font-weight: bold; }
  .contrat-title .date { font-size: 9pt; color: #666; margin-top: 4px; }

  .section { margin: 16px 0; }
  .section-title { font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; border-left: 4px solid #8B6914; padding-left: 10px; margin-bottom: 10px; color: #1a1a1a; background: #f9f6f0; padding: 6px 10px; }

  table.info { width: 100%; border-collapse: collapse; }
  table.info td { padding: 5px 8px; font-size: 10pt; vertical-align: top; }
  table.info td:first-child { width: 40%; color: #555; font-weight: normal; }
  table.info td:last-child { font-weight: bold; border-bottom: 1px solid #ddd; }

  table.two-col { width: 100%; border-spacing: 0; border-collapse: separate; }
  table.two-col > tbody > tr > td { width: 50%; vertical-align: top; padding: 0 8px; }
  table.two-col > tbody > tr > td:first-child { padding-left: 0; border-right: 1px solid #ddd; padding-right: 16px; }
  table.two-col > tbody > tr > td:last-child { padding-left: 16px; }

  .prix-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .prix-table td, .prix-table th { padding: 7px 10px; border: 1px solid #ddd; font-size: 10pt; }
  .prix-table th { background: #f0ebe0; font-weight: bold; text-align: left; }
  .prix-table .total-row td { background: #f0ebe0; font-weight: bold; font-size: 11pt; }
  .prix-table .caution-row td { color: #666; font-style: italic; }
  .prix-table .grand-total td { background: #1a1a1a; color: white; font-weight: bold; font-size: 12pt; }

  .article { margin: 10px 0; font-size: 10pt; line-height: 1.7; text-align: justify; }
  .article strong { font-weight: bold; }

  .articles-section { margin: 16px 0; }
  .article-block { margin: 8px 0; padding: 8px 12px; border-left: 2px solid #ddd; }
  .article-title { font-weight: bold; font-size: 10pt; color: #1a1a1a; margin-bottom: 3px; }
  .article-body { font-size: 9.5pt; color: #333; line-height: 1.6; text-align: justify; }

  .signatures { margin-top: 30px; }
  .sig-row { display: flex; justify-content: space-between; gap: 40px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-box .sig-label { font-size: 9pt; color: #555; margin-bottom: 4px; }
  .sig-box .sig-name { font-weight: bold; font-size: 10pt; margin-bottom: 60px; }
  .sig-box .sig-line { border-top: 1px solid #1a1a1a; padding-top: 4px; font-size: 8pt; color: #666; }

  .footer { margin-top: 20px; padding-top: 12px; border-top: 2px double #8B6914; text-align: center; font-size: 8pt; color: #888; }
  .footer .brand { color: #8B6914; font-weight: bold; letter-spacing: 0.2em; }

  .etat-table { width: 100%; border-collapse: collapse; }
  .etat-table td, .etat-table th { border: 1px solid #ddd; padding: 6px 10px; font-size: 9.5pt; }
  .etat-table th { background: #f0ebe0; font-weight: bold; text-align: center; }
  .etat-table td { text-align: center; }
  .etat-table td:first-child { text-align: left; }

  @media print {
    body { padding: 10mm; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<!-- EN-TÊTE -->
<div class="header">
  <div class="company">OXFORD CARS</div>
  <div class="slogan">Drive Distinction</div>
  <div class="heritage">British Heritage · Timeless Prestige</div>
  <div class="contact">Boulevard Amyoud, Tizi Ouzou, Algérie &nbsp;|&nbsp; +213 770 12 37 71 &nbsp;|&nbsp; oxford-cars.vercel.app</div>
</div>

<!-- TITRE -->
<div class="contrat-title">
  <h1>Contrat de Location de Véhicule</h1>
  <div class="num">N° ${d.numero_contrat}</div>
  <div class="date">Établi le ${fmtDate(d.date_contrat)}</div>
</div>

<!-- PARTIES -->
<div class="section">
  <div class="section-title">Article 1 — Parties au Contrat</div>
  <table class="two-col"><tbody><tr>
    <td>
      <strong>LE LOUEUR :</strong><br/>
      <table class="info"><tbody>
        <tr><td>Société</td><td>Oxford Cars</td></tr>
        <tr><td>Adresse</td><td>Boulevard Amyoud, Tizi Ouzou</td></tr>
        <tr><td>Téléphone</td><td>+213 770 12 37 71</td></tr>
        <tr><td>Représenté par</td><td>${d.loueur_representant}</td></tr>
      </tbody></table>
    </td>
    <td>
      <strong>LE LOCATAIRE :</strong><br/>
      <table class="info"><tbody>
        <tr><td>Nom & Prénom</td><td>${d.client_nom.toUpperCase()} ${d.client_prenom}</td></tr>
        <tr><td>Adresse</td><td>${d.client_adresse}</td></tr>
        <tr><td>Wilaya</td><td>${d.client_wilaya}</td></tr>
        <tr><td>N° C.N.I.</td><td>${d.client_cin}</td></tr>
        <tr><td>Permis de conduire</td><td>${d.client_permis}</td></tr>
        <tr><td>Téléphone</td><td>${d.client_telephone}</td></tr>
        ${d.client_email ? `<tr><td>Email</td><td>${d.client_email}</td></tr>` : ''}
      </tbody></table>
    </td>
  </tr></tbody></table>
</div>

<!-- VÉHICULE -->
<div class="section">
  <div class="section-title">Article 2 — Désignation du Véhicule</div>
  <table class="two-col"><tbody><tr>
    <td>
      <table class="info"><tbody>
        <tr><td>Marque / Modèle</td><td>${d.vehicule_marque} ${d.vehicule_modele}</td></tr>
        <tr><td>Année</td><td>${d.vehicule_annee}</td></tr>
        <tr><td>Immatriculation</td><td>${d.vehicule_immatriculation}</td></tr>
      </tbody></table>
    </td>
    <td>
      <table class="info"><tbody>
        <tr><td>Couleur</td><td>${d.vehicule_couleur}</td></tr>
        <tr><td>Carburant</td><td>${d.vehicule_carburant}</td></tr>
        <tr><td>Kilométrage départ</td><td>${d.kilometrage_depart} km</td></tr>
      </tbody></table>
    </td>
  </tr></tbody></table>
</div>

<!-- DURÉE & LIEUX -->
<div class="section">
  <div class="section-title">Article 3 — Durée et Lieux de Location</div>
  <table class="two-col"><tbody><tr>
    <td>
      <table class="info"><tbody>
        <tr><td>Date de départ</td><td>${fmtDate(d.date_depart)}</td></tr>
        <tr><td>Date de retour</td><td>${fmtDate(d.date_retour)}</td></tr>
        <tr><td>Durée</td><td>${d.nb_jours} jour(s)</td></tr>
      </tbody></table>
    </td>
    <td>
      <table class="info"><tbody>
        <tr><td>Lieu de départ</td><td>${d.lieu_depart}</td></tr>
        <tr><td>Lieu de retour</td><td>${d.lieu_retour}</td></tr>
        <tr><td>Carburant départ</td><td>${d.carburant_depart}</td></tr>
      </tbody></table>
    </td>
  </tr></tbody></table>
</div>

<!-- TARIFS -->
<div class="section">
  <div class="section-title">Article 4 — Tarifs et Conditions Financières</div>
  <table class="prix-table">
    <thead><tr><th>Désignation</th><th style="text-align:right">Montant</th></tr></thead>
    <tbody>
      <tr><td>Prix journalier</td><td style="text-align:right">${fmt(parseFloat(d.prix_jour || '0'))}</td></tr>
      <tr><td>Nombre de jours</td><td style="text-align:right">${d.nb_jours} jour(s)</td></tr>
      <tr class="total-row"><td>Total de la location</td><td style="text-align:right">${fmt(totalTTC)}</td></tr>
      ${parseFloat(d.caution || '0') > 0 ? `<tr class="caution-row"><td>Caution (remboursable à la restitution)</td><td style="text-align:right">${fmt(parseFloat(d.caution))}</td></tr>` : ''}
      <tr class="grand-total"><td>TOTAL À RÉGLER (TTC)</td><td style="text-align:right">${fmt(totalAvecCaution)}</td></tr>
    </tbody>
  </table>
  <p style="font-size:9pt;color:#666;margin-top:6px;font-style:italic;">* Règlement en espèces à la prise en charge du véhicule. Aucun paiement en ligne requis.</p>
</div>

<!-- ÉTAT DES LIEUX -->
<div class="section">
  <div class="section-title">Article 5 — État du Véhicule à la Remise</div>
  <table class="etat-table">
    <thead><tr><th>Élément</th><th>État départ</th><th>Observations</th><th>État retour</th><th>Observations</th></tr></thead>
    <tbody>
      ${['Carrosserie avant', 'Carrosserie arrière', 'Côté conducteur', 'Côté passager', 'Toit', 'Intérieur / Sièges', 'Pare-brise', 'Roue de secours', 'Cric & Outillage', 'Carburant'].map(e => `
      <tr><td>${e}</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>`).join('')}
    </tbody>
  </table>
</div>

<!-- CONDITIONS GÉNÉRALES -->
<div class="articles-section">
  <div class="section-title">Article 6 — Conditions Générales de Location</div>

  <div class="article-block">
    <div class="article-title">6.1 — Obligations du Locataire</div>
    <div class="article-body">Le locataire s'engage à utiliser le véhicule conformément au Code de la Route algérien (Décret exécutif n° 04-381 du 28 novembre 2004). Il s'oblige à ne pas sous-louer le véhicule, à ne pas le conduire en état d'ivresse ou sous l'influence de stupéfiants, et à ne pas le faire conduire par une personne non mentionnée au présent contrat.</div>
  </div>

  <div class="article-block">
    <div class="article-title">6.2 — Restitution du Véhicule</div>
    <div class="article-body">Le véhicule doit être restitué à la date, à l'heure et au lieu convenus dans le présent contrat. Tout retard de restitution non signalé au loueur dans les 2 heures donnera lieu à la facturation d'une journée supplémentaire au tarif en vigueur. Le véhicule doit être rendu avec le même niveau de carburant qu'à la prise en charge.</div>
  </div>

  <div class="article-block">
    <div class="article-title">6.3 — Caution et Dépôt de Garantie</div>
    <div class="article-body">Une caution de <strong>${fmt(parseFloat(d.caution || '0'))}</strong> est perçue à la signature du présent contrat. Elle sera intégralement restituée au locataire dans un délai de 48 heures après la restitution du véhicule, sous réserve qu'aucun dommage, amende ou frais supplémentaire ne soit constaté.</div>
  </div>

  <div class="article-block">
    <div class="article-title">6.4 — Responsabilité en cas de Sinistre</div>
    <div class="article-body">En cas d'accident, le locataire est tenu d'informer immédiatement le loueur et de remplir un constat amiable. Le locataire est responsable de tout dommage causé au véhicule pendant la durée de la location, sauf en cas de force majeure dûment établie. Toute infraction au Code de la Route est à la charge exclusive du locataire.</div>
  </div>

  <div class="article-block">
    <div class="article-title">6.5 — Panne et Assistance</div>
    <div class="article-body">En cas de panne mécanique non imputable au locataire, Oxford Cars s'engage à assurer la dépannage ou le remplacement du véhicule dans les meilleurs délais. Le locataire ne peut en aucun cas faire réparer le véhicule sans l'accord préalable et écrit du loueur.</div>
  </div>

  <div class="article-block">
    <div class="article-title">6.6 — Utilisation du Véhicule</div>
    <div class="article-body">Le véhicule est destiné à un usage privé uniquement sur le territoire algérien. Toute sortie du territoire national est strictement interdite sans autorisation écrite préalable du loueur. L'utilisation du véhicule à des fins commerciales ou pour le transport rémunéré de personnes est interdite.</div>
  </div>

  <div class="article-block">
    <div class="article-title">6.7 — Juridiction Compétente</div>
    <div class="article-body">En cas de litige, les parties conviennent de rechercher une solution amiable. À défaut, le Tribunal de Commerce de Tizi Ouzou sera seul compétent, conformément à la législation algérienne en vigueur.</div>
  </div>
</div>

<!-- SIGNATURES -->
<div class="signatures">
  <div class="section-title">Signatures des Parties</div>
  <p style="font-size:9pt;color:#555;margin-bottom:20px;">Les parties reconnaissent avoir lu et accepté l'ensemble des clauses du présent contrat.</p>
  <div class="sig-row">
    <div class="sig-box">
      <div class="sig-label">Le Loueur</div>
      <div class="sig-name">Oxford Cars</div>
      <div class="sig-line">Signature & Cachet</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Le Locataire</div>
      <div class="sig-name">${d.client_nom.toUpperCase()} ${d.client_prenom}</div>
      <div class="sig-line">Signature (précédée de la mention « Lu et approuvé »)</div>
    </div>
  </div>
</div>

<!-- PIED DE PAGE -->
<div class="footer">
  <span class="brand">OXFORD CARS</span> &nbsp;·&nbsp; Drive Distinction &nbsp;·&nbsp; British Heritage · Timeless Prestige<br/>
  Boulevard Amyoud, Tizi Ouzou, Algérie &nbsp;|&nbsp; +213 770 12 37 71<br/>
  Contrat N° ${d.numero_contrat} — ${fmtDate(d.date_contrat)}
</div>

</body>
</html>`;
}

function Field({ label, k, type = 'text', placeholder = '', form, onChange }: {
  label: string; k: keyof ContractData; type?: string; placeholder?: string;
  form: ContractData; onChange: (k: keyof ContractData, v: string) => void;
}) {
  return (
    <div>
      <label className="text-ivory/40 text-xs tracking-wider block mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder}
        className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
        value={form[k]} onChange={e => onChange(k, e.target.value)} />
    </div>
  );
}

export default function ContractsPage() {
  const router = useRouter();
  const [form, setForm] = useState<ContractData>(empty);
  const [preview, setPreview] = useState(false);

  const set = (k: keyof ContractData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handlePrint = () => {
    const html = generateContractHTML(form);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handlePreview = () => {
    const html = generateContractHTML(form);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const handleSendWhatsApp = () => {
    const phone = form.client_telephone.replace(/\D/g, '');
    const total = parseFloat(form.prix_jour || '0') * parseInt(form.nb_jours || '0') + parseFloat(form.caution || '0');
    const fmt = (n: number) => new Intl.NumberFormat('fr-DZ').format(n) + ' DA';
    const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
    const msg = `Bonjour ${form.client_prenom} ${form.client_nom},

Oxford Cars vous confirme votre contrat de location N° *${form.numero_contrat}* :

🚗 *Véhicule :* ${form.vehicule_marque} ${form.vehicule_modele} ${form.vehicule_annee}
📅 *Départ :* ${fmtDate(form.date_depart)}
📅 *Retour :* ${fmtDate(form.date_retour)}
📍 *Lieu :* ${form.lieu_depart}
💰 *Total :* ${fmt(total)}

Pour toute question, contactez-nous au +213 770 12 37 71.

_Oxford Cars — Drive Distinction_`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };


  return (
    <div className="min-h-screen bg-oxford-black pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
        <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-ivory/40 hover:text-gold transition-colors text-sm mb-8">
          <ArrowLeft size={15} /> Retour au Panel Admin
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>
              Générer un Contrat
            </h1>
            <p className="text-ivory/40 text-sm mt-1">Contrat de location conforme à la législation algérienne</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs tracking-widest border border-green-500/40 text-green-400 hover:border-green-500 hover:text-green-300 transition-all">
              <Send size={14} /> Envoyer WhatsApp
            </button>
            <button onClick={handlePreview}
              className="flex items-center gap-2 btn-outline-gold px-5 py-2.5 rounded-sm text-xs tracking-widest">
              <FileText size={14} /> Aperçu
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 btn-gold px-5 py-2.5 rounded-sm text-xs tracking-widest">
              <Printer size={14} /> Imprimer / PDF
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contrat info */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Informations du Contrat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field form={form} onChange={set} label="Numéro de contrat" k="numero_contrat" />
              <Field form={form} onChange={set} label="Date du contrat" k="date_contrat" type="date" />
              <Field form={form} onChange={set} label="Représentant Oxford Cars" k="loueur_representant" />
            </div>
          </div>

          {/* Client */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Informations Client</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field form={form} onChange={set} label="Nom *" k="client_nom" placeholder="LOUNIS" />
              <Field form={form} onChange={set} label="Prénom *" k="client_prenom" placeholder="Rayane" />
              <Field form={form} onChange={set} label="Adresse *" k="client_adresse" placeholder="Rue des Martyrs, Tizi Ouzou" />
              <Field form={form} onChange={set} label="Wilaya *" k="client_wilaya" placeholder="Tizi Ouzou (15)" />
              <Field form={form} onChange={set} label="N° C.N.I. (Carte Nationale d'Identité) *" k="client_cin" placeholder="123456789" />
              <Field form={form} onChange={set} label="N° Permis de Conduire *" k="client_permis" placeholder="ABC123456" />
              <Field form={form} onChange={set} label="Téléphone *" k="client_telephone" placeholder="+213 770 000 000" />
              <Field form={form} onChange={set} label="Email" k="client_email" type="email" placeholder="client@email.com" />
            </div>
          </div>

          {/* Véhicule */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Véhicule Loué</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field form={form} onChange={set} label="Marque *" k="vehicule_marque" placeholder="Nissan" />
              <Field form={form} onChange={set} label="Modèle *" k="vehicule_modele" placeholder="Qashqai" />
              <Field form={form} onChange={set} label="Année *" k="vehicule_annee" placeholder="2025" />
              <Field form={form} onChange={set} label="Immatriculation *" k="vehicule_immatriculation" placeholder="123-456-16" />
              <Field form={form} onChange={set} label="Couleur" k="vehicule_couleur" placeholder="Blanc Nacré" />
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-1.5">Carburant</label>
                <select className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                  value={form.vehicule_carburant} onChange={e => set('vehicule_carburant', e.target.value)}>
                  {['Essence', 'Diesel', 'Hybride', 'Électrique'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <Field form={form} onChange={set} label="Kilométrage au départ" k="kilometrage_depart" placeholder="12500" />
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-1.5">Niveau carburant au départ</label>
                <select className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                  value={form.carburant_depart} onChange={e => set('carburant_depart', e.target.value)}>
                  {['Plein', '3/4', '1/2', '1/4', 'Réserve'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Détails de la Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field form={form} onChange={set} label="Date de départ *" k="date_depart" type="date" />
              <Field form={form} onChange={set} label="Date de retour *" k="date_retour" type="date" />
              <Field form={form} onChange={set} label="Lieu de départ *" k="lieu_depart" placeholder="Tizi Ouzou – Centre-ville" />
              <Field form={form} onChange={set} label="Lieu de retour *" k="lieu_retour" placeholder="Tizi Ouzou – Centre-ville" />
              <Field form={form} onChange={set} label="Nombre de jours *" k="nb_jours" type="number" placeholder="3" />
              <Field form={form} onChange={set} label="Prix par jour (DA) *" k="prix_jour" type="number" placeholder="6500" />
              <Field form={form} onChange={set} label="Caution (DA)" k="caution" type="number" placeholder="50000" />
            </div>

            {/* Price summary */}
            {form.prix_jour && form.nb_jours && (
              <div className="mt-6 p-4 bg-oxford-black border border-gold/20 rounded-sm">
                <p className="text-ivory/50 text-xs tracking-widest uppercase mb-3">Récapitulatif</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-ivory/70">
                    <span>{formatPrice(parseFloat(form.prix_jour))} × {form.nb_jours} jours</span>
                    <span>{formatPrice(parseFloat(form.prix_jour) * parseInt(form.nb_jours))}</span>
                  </div>
                  {parseFloat(form.caution || '0') > 0 && (
                    <div className="flex justify-between text-ivory/50 text-xs">
                      <span>Caution (remboursable)</span>
                      <span>{formatPrice(parseFloat(form.caution))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gold font-medium pt-2 border-t border-gold/20">
                    <span>Total à régler</span>
                    <span>{formatPrice(parseFloat(form.prix_jour) * parseInt(form.nb_jours) + parseFloat(form.caution || '0'))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button onClick={handlePrint}
              className="btn-gold flex-1 py-4 rounded-sm text-xs tracking-widest flex items-center justify-center gap-2">
              <Printer size={15} /> Imprimer / PDF
            </button>
            <button onClick={handleSendWhatsApp}
              className="flex-1 py-4 rounded-sm text-xs tracking-widest flex items-center justify-center gap-2 border border-green-500/40 text-green-400 hover:border-green-500 hover:text-green-300 transition-all">
              <Send size={15} /> Envoyer WhatsApp
            </button>
            <button onClick={handlePreview}
              className="btn-outline-gold px-8 py-4 rounded-sm text-xs tracking-widest flex items-center gap-2">
              <FileText size={15} /> Aperçu
            </button>
          </div>
          <p className="text-ivory/30 text-xs text-center">
            Pour enregistrer en PDF : après avoir cliqué sur Imprimer, choisissez "Enregistrer en PDF" comme imprimante dans la boîte de dialogue.
          </p>
        </div>
      </div>
    </div>
  );
}
