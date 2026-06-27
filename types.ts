
export type UserRole = 'admin' | 'lawyer' | 'client' | 'pending';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
}

export interface LawyerProfile {
  uid: string; // Links to User/Firebase ID
  fullName: string;
  fullNameLocal?: string; // Local language representation of the name (e.g. Urdu/Hindi)
  firstName?: string;
  lastName?: string;
  username?: string;
  title: string; // e.g., Advocate, Barrister
  specialty: string; // Main specialty
  specialtyLocal?: string; // Specialty in local language
  specialties?: string[]; // Array of all specialties
  services?: string[]; // Legacy/Additional services 
  experience?: string; // Years of experience
  country: string;
  city: string;
  officeName: string;
  officeAddress: string;
  contactMobile: string;
  contactWhatsapp: string;
  contactEmail: string;
  socialMediaLink?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  degreeName?: string;
  issuingAuthority?: string;
  education?: string[]; // Array of education strings
  licenseNumber?: string;
  aboutMe: string;
  aboutMeLocal?: string; // Bio in local language
  achievements: string;
  isVerified: boolean;
  isSuspended?: boolean; // For admin control over legacy profiles
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  picture?: string;
  rating?: number;
  reviewCount?: number;
  enrollmentOrRollNumber?: string;
  yearOfGraduation?: string;
  barCouncilName?: string;
  bloodGroup?: string;
  isBloodDonor: boolean;
  stateProvince?: string; // Soba/Province
  languagesSpoken?: string[]; // Languages understood/spoken
  officeTimingStart?: string; // E.g., "09:00"
  officeTimingEnd?: string; // E.g., "17:00"
  officeDays?: string[]; // E.g., ["Monday", "Tuesday"]
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  notes?: string;
}

export interface CaseFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string; // ISO string
}

export interface Case {
  id: string;
  lawyerId: string;
  clientName: string;
  caseTitle: string;
  courtName: string;
  nextHearingDate: string; // YYYY-MM-DD
  stage: string; // e.g., Filing, Hearing, Evidence, Verdict
  notes: string; // Existing notes field, now for general case notes
  // New fields for enhanced case management
  description?: string;
  opposingCounsel?: string;
  status: 'Open' | 'Closed' | 'On Hold'; // Overall case status
  importantDates: ImportantDate[];
  caseFiles: CaseFile[];
}

export interface LedgerEntry {
  id: string;
  caseId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  nextPaymentDueDate: string;
  description: string;
}

export interface VerificationRequest {
  id: string;
  lawyerId: string;
  lawyerName: string;
  lawyerEmail: string; // Added to match admin's need
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  // Textual details for verification (replacing document URLs)
  degreeName: string;
  issuingAuthority: string;
  licenseNumber: string;
  enrollmentOrRollNumber: string;
  yearOfGraduation: string;
  barCouncilName: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  description: string; // Added to match DB
  author: string;
  date: string; // Mapped from createdAt/updatedAt
  featuredImage?: string; // Changed from imageUrl to match DB
  slug: string; // New field for URL-friendly identifier
}

export interface Country {
  name: string;
  code: string;
  cities: string[];
}

export interface City {
  name: string;
}

export interface BloodAppeal {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  city: string;
  country: string;
  mobile: string;
  status: 'active' | 'fulfilled';
  createdAt: string;
  requesterId?: string;
}

export interface BloodDonor {
  id: string; // User UID if logged in, or random ID
  name: string;
  email: string;
  whatsapp: string;
  bloodGroup: string;
  country: string;
  city: string;
  registeredAt: string;
  isLoggedInUser: boolean;
}

export interface Review {
  id: string;
  lawyerId: string;
  clientId: string;
  clientName: string;
  rating: number;
  reviewContent: string;
  createdAt: string;
}

export interface LegalQuestion {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  category: string;
  country?: string;
  createdAt: string;
  answersCount?: number;
  views?: number;
  upvotes?: number;
  downvotes?: number;
}

export interface LegalAnswer {
  id: string;
  questionId: string;
  lawyerId: string;
  lawyerName: string;
  lawyerTitle: string;
  lawyerPicture?: string;
  content: string;
  createdAt: string;
  upvotes?: number;
  downvotes?: number;
}

export interface AppNotification {
  id: string;
  userId: string; // Target user's UID, or 'all', 'lawyers', 'clients'
  title: string;
  message: string;
  type: 'question' | 'hearing' | 'payment' | 'article' | 'job' | 'system';
  createdAt: string; // ISO string
  isRead: boolean;
  link?: string;
}

export interface BloodMessage {
  id: string;
  donorId: string;
  donorName: string;
  message: string;
  sentAt: string;
  sentBy: string;
}



