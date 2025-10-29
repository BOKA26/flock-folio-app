import { z } from 'zod';

// Member validation schema
export const memberSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est requis').max(100, 'Le nom ne peut dépasser 100 caractères'),
  prenom: z.string().trim().min(1, 'Le prénom est requis').max(100, 'Le prénom ne peut dépasser 100 caractères'),
  email: z.string().email('Email invalide').max(255, 'Email trop long').optional().or(z.literal('')),
  telephone: z.string().regex(/^[\d\s+\-()]*$/, 'Format de téléphone invalide').max(20, 'Téléphone trop long').optional().or(z.literal('')),
  sexe: z.enum(['M', 'F', '']).optional(),
});

// Announcement validation schema
export const announcementSchema = z.object({
  titre: z.string().trim().min(1, 'Le titre est requis').max(200, 'Le titre ne peut dépasser 200 caractères'),
  contenu: z.string().trim().min(1, 'Le contenu est requis').max(5000, 'Le contenu ne peut dépasser 5000 caractères'),
  type: z.enum(['annonce', 'culte']),
  image_url: z.string().url('URL invalide').max(500, 'URL trop longue').optional().or(z.literal('')),
});

// Prayer request validation schema
export const prayerSchema = z.object({
  texte: z.string().trim().min(1, 'Le texte est requis').max(2000, 'Le texte ne peut dépasser 2000 caractères'),
});

// Church settings validation schema
export const churchSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est requis').max(200, 'Le nom ne peut dépasser 200 caractères'),
  description: z.string().trim().max(2000, 'La description ne peut dépasser 2000 caractères').optional().or(z.literal('')),
  email: z.string().email('Email invalide').max(255, 'Email trop long').optional().or(z.literal('')),
  contact: z.string().max(20, 'Contact trop long').optional().or(z.literal('')),
  site_web: z.string().url('URL invalide').max(255, 'URL trop longue').optional().or(z.literal('')),
  adresse: z.string().max(500, 'Adresse trop longue').optional().or(z.literal('')),
  whatsapp: z.string().max(20, 'WhatsApp trop long').optional().or(z.literal('')),
  facebook: z.string().url('URL Facebook invalide').max(255, 'URL trop longue').optional().or(z.literal('')),
  verset_clef: z.string().max(500, 'Verset trop long').optional().or(z.literal('')),
});

// FAQ validation schema
export const faqSchema = z.object({
  question: z.string().trim().min(1, 'La question est requise').max(500, 'La question ne peut dépasser 500 caractères'),
  answer: z.string().trim().min(1, 'La réponse est requise').max(2000, 'La réponse ne peut dépasser 2000 caractères'),
});

// Donation validation schema
export const donationSchema = z.object({
  montant: z.number().min(1, 'Le montant doit être supérieur à 0').max(10000000, 'Montant trop élevé'),
  type_don: z.string().trim().min(1, 'Le type de don est requis').max(100, 'Type trop long'),
});
