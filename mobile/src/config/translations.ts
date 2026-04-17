/**
 * Translation strings for internationalization
 * Organized by screen/component
 */

import { SupportedLocale } from '../config/i18n';

export type TranslationKey = keyof typeof translations.en;

const translations = {
  // English (UK/US)
  en: {
    // Common
    'common.welcome': 'Welcome',
    'common.continue': 'Continue',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.done': 'Done',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Welcome Screen
    'welcome.title': 'Find Trusted Tradespeople',
    'welcome.subtitle': 'Get instant estimates and connect with verified professionals',
    'welcome.customer': "I'm a Customer",
    'welcome.professional': "I'm a Professional",
    
    // Estimate
    'estimate.title': 'Get Your Estimate',
    'estimate.subtitle': 'Tell us about your painting project',
    'estimate.propertyType': 'Property Type',
    'estimate.postcode': 'Postcode',
    'estimate.rooms': 'Room Measurements',
    'estimate.addRoom': 'Add Room',
    'estimate.squareMeters': 'square meters',
    'estimate.continue': 'Continue to Payment',
    
    // Payment
    'payment.title': 'Payment',
    'payment.estimate': 'Your Estimate',
    'payment.cost': 'Estimate Cost',
    'payment.pay': 'Pay {amount} for Detailed Estimate',
    'payment.skipFree': 'Skip & Post Job FREE',
    'payment.secure': 'Secure payment processing',
    
    // Credits
    'credits.title': 'Buy Credits',
    'credits.balance': 'Current Balance',
    'credits.available': 'credits available',
    'credits.purchase': 'Purchase Package',
    'credits.premium': 'Upgrade to Premium',
    
    // Professional
    'professional.dashboard': 'Dashboard',
    'professional.credits': 'Credits',
    'professional.profile': 'My Profile',
    'professional.logout': 'Logout',
    
    // Job Posting
    'job.postTitle': 'Post Your Job',
    'job.postFree': 'Post Job for FREE',
    'job.contactInfo': 'Contact Information',
    'job.description': 'Project Description',
    'job.photos': 'Room Photos',
    
    // Premium
    'premium.title': 'Premium Membership',
    'premium.monthly': 'per month',
    'premium.annual': 'per year',
    'premium.save': 'Save {amount}',
    'premium.benefits': 'Premium Benefits',
    'premium.upgrade': 'Upgrade to Premium',
  },
  
  // German
  de: {
    'common.welcome': 'Willkommen',
    'common.continue': 'Weiter',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.done': 'Fertig',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    
    'welcome.title': 'Finden Sie vertrauenswürdige Handwerker',
    'welcome.subtitle': 'Erhalten Sie sofortige Kostenvoranschläge',
    'welcome.customer': 'Ich bin Kunde',
    'welcome.professional': 'Ich bin Handwerker',
    
    'estimate.title': 'Kostenvoranschlag erhalten',
    'estimate.subtitle': 'Erzählen Sie uns von Ihrem Malprojekt',
    'estimate.propertyType': 'Objekttyp',
    'estimate.postcode': 'Postleitzahl',
    'estimate.rooms': 'Raummessungen',
    'estimate.addRoom': 'Raum hinzufügen',
    'estimate.squareMeters': 'Quadratmeter',
    'estimate.continue': 'Weiter zur Zahlung',
    
    'payment.title': 'Zahlung',
    'payment.estimate': 'Ihr Kostenvoranschlag',
    'payment.cost': 'Kosten',
    'payment.pay': 'Zahlen Sie {amount} für detaillierten Kostenvoranschlag',
    'payment.skipFree': 'Überspringen & Job KOSTENLOS posten',
    'payment.secure': 'Sichere Zahlungsabwicklung',
    
    'credits.title': 'Credits kaufen',
    'credits.balance': 'Aktuelles Guthaben',
    'credits.available': 'Credits verfügbar',
    'credits.purchase': 'Paket kaufen',
    'credits.premium': 'Auf Premium upgraden',
    
    'professional.dashboard': 'Dashboard',
    'professional.credits': 'Credits',
    'professional.profile': 'Mein Profil',
    'professional.logout': 'Abmelden',
    
    'job.postTitle': 'Job posten',
    'job.postFree': 'Job KOSTENLOS posten',
    'job.contactInfo': 'Kontaktinformationen',
    'job.description': 'Projektbeschreibung',
    'job.photos': 'Raumfotos',
    
    'premium.title': 'Premium-Mitgliedschaft',
    'premium.monthly': 'pro Monat',
    'premium.annual': 'pro Jahr',
    'premium.save': 'Sparen Sie {amount}',
    'premium.benefits': 'Premium-Vorteile',
    'premium.upgrade': 'Auf Premium upgraden',
  },
  
  // French
  fr: {
    'common.welcome': 'Bienvenue',
    'common.continue': 'Continuer',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.done': 'Terminé',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    
    'welcome.title': 'Trouvez des artisans de confiance',
    'welcome.subtitle': 'Obtenez des devis instantanés',
    'welcome.customer': 'Je suis client',
    'welcome.professional': 'Je suis artisan',
    
    'estimate.title': 'Obtenez votre devis',
    'estimate.subtitle': 'Parlez-nous de votre projet de peinture',
    'estimate.propertyType': 'Type de propriété',
    'estimate.postcode': 'Code postal',
    'estimate.rooms': 'Mesures des pièces',
    'estimate.addRoom': 'Ajouter une pièce',
    'estimate.squareMeters': 'mètres carrés',
    'estimate.continue': 'Continuer vers le paiement',
    
    'payment.title': 'Paiement',
    'payment.estimate': 'Votre devis',
    'payment.cost': 'Coût du devis',
    'payment.pay': 'Payer {amount} pour devis détaillé',
    'payment.skipFree': 'Passer et publier GRATUITEMENT',
    'payment.secure': 'Traitement des paiements sécurisé',
    
    'credits.title': 'Acheter des crédits',
    'credits.balance': 'Solde actuel',
    'credits.available': 'crédits disponibles',
    'credits.purchase': 'Acheter le forfait',
    'credits.premium': 'Passer à Premium',
    
    'professional.dashboard': 'Tableau de bord',
    'professional.credits': 'Crédits',
    'professional.profile': 'Mon profil',
    'professional.logout': 'Déconnexion',
    
    'job.postTitle': 'Publier votre annonce',
    'job.postFree': 'Publier GRATUITEMENT',
    'job.contactInfo': 'Informations de contact',
    'job.description': 'Description du projet',
    'job.photos': 'Photos des pièces',
    
    'premium.title': 'Adhésion Premium',
    'premium.monthly': 'par mois',
    'premium.annual': 'par an',
    'premium.save': 'Économisez {amount}',
    'premium.benefits': 'Avantages Premium',
    'premium.upgrade': 'Passer à Premium',
  },
  
  // Spanish
  es: {
    'common.welcome': 'Bienvenido',
    'common.continue': 'Continuar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.done': 'Hecho',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    
    'welcome.title': 'Encuentra profesionales de confianza',
    'welcome.subtitle': 'Obtén presupuestos instantáneos',
    'welcome.customer': 'Soy cliente',
    'welcome.professional': 'Soy profesional',
    
    'estimate.title': 'Obtén tu presupuesto',
    'estimate.subtitle': 'Cuéntanos sobre tu proyecto de pintura',
    'estimate.propertyType': 'Tipo de propiedad',
    'estimate.postcode': 'Código postal',
    'estimate.rooms': 'Medidas de habitaciones',
    'estimate.addRoom': 'Añadir habitación',
    'estimate.squareMeters': 'metros cuadrados',
    'estimate.continue': 'Continuar al pago',
    
    'payment.title': 'Pago',
    'payment.estimate': 'Tu presupuesto',
    'payment.cost': 'Coste del presupuesto',
    'payment.pay': 'Pagar {amount} por presupuesto detallado',
    'payment.skipFree': 'Saltar y publicar GRATIS',
    'payment.secure': 'Procesamiento de pagos seguro',
    
    'credits.title': 'Comprar créditos',
    'credits.balance': 'Saldo actual',
    'credits.available': 'créditos disponibles',
    'credits.purchase': 'Comprar paquete',
    'credits.premium': 'Actualizar a Premium',
    
    'professional.dashboard': 'Panel',
    'professional.credits': 'Créditos',
    'professional.profile': 'Mi perfil',
    'professional.logout': 'Cerrar sesión',
    
    'job.postTitle': 'Publicar tu trabajo',
    'job.postFree': 'Publicar GRATIS',
    'job.contactInfo': 'Información de contacto',
    'job.description': 'Descripción del proyecto',
    'job.photos': 'Fotos de habitaciones',
    
    'premium.title': 'Membresía Premium',
    'premium.monthly': 'por mes',
    'premium.annual': 'por año',
    'premium.save': 'Ahorra {amount}',
    'premium.benefits': 'Beneficios Premium',
    'premium.upgrade': 'Actualizar a Premium',
  },
};

/**
 * Get translation for a key
 */
export function t(
  key: TranslationKey,
  locale: SupportedLocale = 'en-GB',
  replacements?: Record<string, string>
): string {
  // Get language code (e.g., 'en' from 'en-GB')
  const language = locale.split('-')[0] as keyof typeof translations;
  
  // Get translation from language pack, fallback to English
  const translation = 
    (translations[language]?.[key] as string) || 
    (translations.en[key] as string) || 
    key;
  
  // Replace placeholders if provided
  if (replacements) {
    let result = translation;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      result = result.replace(`{${placeholder}}`, value);
    });
    return result;
  }
  
  return translation;
}

export { translations };
