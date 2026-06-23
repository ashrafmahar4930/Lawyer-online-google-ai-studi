

import { LawyerProfile, Case, LedgerEntry, VerificationRequest, Article, ImportantDate, CaseFile, Country, BloodAppeal, BloodDonor, Review, LegalQuestion, LegalAnswer, AppNotification } from '../types';
import { db, storage, auth } from './firebase'; // Added auth import
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy, limit, onSnapshot 
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { logService } from './logService';

// --- Storage Helpers ---

export const deleteFile = async (fileUrl: string) => {
  if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) {
    // console.warn("Attempted to delete a non-Firebase Storage URL or empty URL:", fileUrl);
    return;
  }
  try {
    // Extract path from the full download URL
    const url = new URL(fileUrl);
    // Path typically looks like /o/folder%2Ffilename.ext?altMedia...
    // We need to decode the path segments and ignore query params
    const pathSegments = url.pathname.split('/o/')[1].split('?')[0];
    const path = decodeURIComponent(pathSegments);
    
    const fileRef = storageRef(storage as any, path);
    await deleteObject(fileRef);
    console.log("Old file deleted:", fileUrl);
  } catch (error) {
    logService.error("Error deleting old file", error, 'Storage');
    // Don't throw, as the new upload should still proceed even if old file deletion fails.
  }
};


export const uploadFile = async (file: File, path: string, oldFileUrl?: string): Promise<string> => {
  try {
    if (oldFileUrl) {
      await deleteFile(oldFileUrl);
    }
    const sRef = storageRef(storage as any, path);
    const snapshot = await uploadBytes(sRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    logService.error("Upload failed", error, 'Storage');
    throw error;
  }
};

// --- Helpers to Map DB Schema to App Schema ---

const mapToAppProfile = (data: any, uid: string): LawyerProfile => {
  return {
    uid: uid,
    fullName: data.fullName || data.name || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    username: data.username || '',
    title: data.title || 'Advocate',
    specialty: data.specialty || data.specialties?.[0] || '',
    specialties: data.specialties || [],
    services: data.services || [],
    experience: data.experience || '',
    country: data.country || '',
    city: data.city || '',
    officeName: data.officeName || '',
    officeAddress: data.officeAddress || data.address || '',
    contactMobile: data.contactMobile || data.phone || '',
    contactWhatsapp: data.contactWhatsapp || data.whatsapp || '',
    contactEmail: data.contactEmail || data.email || '',
    socialMediaLink: data.socialMediaLink || '',
    facebookUrl: data.facebookUrl || data.facebook || '',
    linkedinUrl: data.linkedinUrl || data.linkedin || '',
    twitterUrl: data.twitterUrl || data.twitter || '',
    degreeName: data.degreeName || data.education?.[0] || '',
    education: data.education || [],
    issuingAuthority: data.issuingAuthority || data.licenseAuthority || data.licenseIssuingAuthority || '',
    licenseNumber: data.licenseNumber || '',
    aboutMe: data.aboutMe || data.about || '',
    aboutMeLocal: data.aboutMeLocal || '',
    achievements: data.achievements || '',
    isVerified: data.isVerified || false,
    isSuspended: data.isSuspended || false,
    verificationStatus: data.verificationStatus || (data.isVerified ? 'approved' : 'none'),
    rejectionReason: data.rejectionReason || data.verificationRejectionReason,
    picture: data.picture,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    enrollmentOrRollNumber: data.enrollmentOrRollNumber || '',
    yearOfGraduation: data.yearOfGraduation || '',
    barCouncilName: data.barCouncilName || '',
    isBloodDonor: data.isBloodDonor || false,
    bloodGroup: data.bloodGroup || '',
    fullNameLocal: data.fullNameLocal || '',
    specialtyLocal: data.specialtyLocal || '',
  };
};

const mapToDbProfile = (profile: LawyerProfile) => {
    return {
        fullName: profile.fullName,
        fullNameLocal: profile.fullNameLocal || '',
        name: profile.fullName, // Keep legacy field
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        username: profile.username || '',
        title: profile.title,
        specialty: profile.specialty,
        specialtyLocal: profile.specialtyLocal || '',
        specialties: profile.specialties || [profile.specialty],
        services: profile.services || [],
        experience: profile.experience || '',
        country: profile.country,
        city: profile.city,
        officeName: profile.officeName,
        officeAddress: profile.officeAddress,
        address: profile.officeAddress, // Keep legacy field
        contactMobile: profile.contactMobile,
        phone: profile.contactMobile, // Keep legacy field
        contactWhatsapp: profile.contactWhatsapp,
        whatsapp: profile.contactWhatsapp, // Keep legacy field
        contactEmail: profile.contactEmail,
        email: profile.contactEmail, // Keep legacy field
        socialMediaLink: profile.socialMediaLink || '',
        facebookUrl: profile.facebookUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        twitterUrl: profile.twitterUrl || '',
        degreeName: profile.degreeName || '',
        education: profile.education || [],
        issuingAuthority: profile.issuingAuthority || '',
        licenseNumber: profile.licenseNumber || '',
        aboutMe: profile.aboutMe,
        aboutMeLocal: profile.aboutMeLocal || '',
        about: profile.aboutMe, // Keep legacy field
        achievements: profile.achievements || '',
        isVerified: profile.isVerified,
        isSuspended: profile.isSuspended || false,
        verificationStatus: profile.verificationStatus,
        rejectionReason: profile.rejectionReason || null,
        picture: profile.picture || null,
        userId: profile.uid,
        id: profile.uid, 
        updatedAt: new Date().toISOString(),
        enrollmentOrRollNumber: profile.enrollmentOrRollNumber || '',
        yearOfGraduation: profile.yearOfGraduation || '',
        barCouncilName: profile.barCouncilName || '',
    };
};

const mapToAppArticle = (data: any, id: string): Article => {
    let dateStr = 'Recently';
    
    // Check both createdAt and date fields for flexibility
    const dateSource = data.createdAt || data.date;
    
    if (dateSource) {
        // Handle Firestore Timestamp
        if (dateSource.toDate) {
            dateStr = dateSource.toDate().toLocaleDateString();
        } else if (typeof dateSource === 'string') {
            dateStr = new Date(dateSource).toLocaleDateString();
        } else if (dateSource instanceof Date) {
            dateStr = dateSource.toLocaleDateString();
        }
    }
    
    return {
        id: id,
        title: data.title || 'Untitled',
        content: data.content || '',
        description: data.description || '',
        author: data.author || 'Admin',
        date: dateStr,
        featuredImage: data.featuredImage || undefined,
        slug: data.slug || id // Ensure slug exists, fallback to id
    };
};

const mapToDbArticle = (article: Article) => {
    return {
        title: article.title,
        content: article.content,
        description: article.description,
        author: article.author,
        featuredImage: article.featuredImage || null,
        slug: article.slug,
        createdAt: new Date(), // Always set on creation
        updatedAt: new Date()
    };
}

const mapToAppCase = (data: any, id: string): Case => {
    // Handle potential Timestamp for nextHearingDate
    let nextHearingDate = data.nextHearingDate || '';
    if (nextHearingDate && typeof nextHearingDate !== 'string') {
        if ((nextHearingDate as any).toDate) {
            nextHearingDate = (nextHearingDate as any).toDate().toISOString().split('T')[0];
        } else {
            nextHearingDate = String(nextHearingDate);
        }
    }

    return {
        id: id,
        lawyerId: data.lawyerId || '',
        clientName: data.clientName || '',
        caseTitle: data.caseTitle || '',
        courtName: data.courtName || '',
        nextHearingDate: nextHearingDate,
        stage: data.stage || 'Filing',
        notes: data.notes || '',
        description: data.description || '',
        opposingCounsel: data.opposingCounsel || '',
        status: data.status || 'Open',
        importantDates: data.importantDates || [],
        caseFiles: data.caseFiles || [],
    };
};

const mapToDbCase = (c: Case) => {
    return {
        id: c.id,
        lawyerId: c.lawyerId,
        clientName: c.clientName,
        caseTitle: c.caseTitle,
        courtName: c.courtName,
        nextHearingDate: c.nextHearingDate,
        stage: c.stage,
        notes: c.notes,
        description: c.description || '',
        opposingCounsel: c.opposingCounsel || '',
        status: c.status || 'Open',
        importantDates: c.importantDates || [],
        caseFiles: c.caseFiles || [],
        updatedAt: new Date().toISOString(),
        createdAt: c.id.startsWith('case_') ? new Date(parseInt(c.id.substring(5))).toISOString() : new Date().toISOString() // Derive creation date if ID is `case_timestamp`
    };
};


// --- Fallback Static Data Seed (In case real cloud Firestore is empty on cold starts) ---

export const fallbackLawyers: LawyerProfile[] = [
  {
    uid: 'lawyer_1',
    fullName: 'Advocate Ahmed Khan',
    firstName: 'Ahmed',
    lastName: 'Khan',
    username: 'ahmed_khan',
    title: 'Senior Counsel',
    specialty: 'Criminal Law',
    specialties: ['Criminal Law', 'Civil Litigation'],
    services: ['Bail matters', 'Criminal Defence', 'Appellate Court appeals'],
    experience: '18 Years',
    country: 'United Kingdom',
    city: 'London',
    officeName: 'Khan & Associates',
    officeAddress: 'Office 402, High Holborn, London',
    contactMobile: '+44 20 7123 4567',
    contactWhatsapp: '+44 20 7123 4567',
    contactEmail: 'ahmed@lawyeronline.live',
    socialMediaLink: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    degreeName: 'LL.B (Hons)',
    education: ['LL.B (Hons) - King\'s College London', 'LL.M - University of London'],
    issuingAuthority: 'Bar Council of England and Wales',
    licenseNumber: 'BCEW-123456',
    aboutMe: 'Specializing in white-collar crimes, corporate defence, and appellate civil appeals with 18 years of experience.',
    achievements: 'Successfully defended 500+ criminal trials in higher courts.',
    isVerified: true,
    isSuspended: false,
    verificationStatus: 'approved',
    picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256',
    rating: 4.8,
    reviewCount: 24,
    enrollmentOrRollNumber: 'BCEW-100244',
    yearOfGraduation: '2008',
    barCouncilName: 'Bar Council of England and Wales',
    isBloodDonor: false,
    bloodGroup: ''
  },
  {
    uid: 'lawyer_2',
    fullName: 'Advocate Ayesha Malik',
    firstName: 'Ayesha',
    lastName: 'Malik',
    username: 'ayesha_malik',
    title: 'Senior Partner',
    specialty: 'Family Law',
    specialties: ['Family Law', 'Civil Litigation'],
    services: ['Divorce', 'Child Custody', 'Guardianship'],
    experience: '15 Years',
    country: 'United States',
    city: 'New York',
    officeName: 'Malik Legal Chambers',
    officeAddress: '72-B, Madison Avenue, New York',
    contactMobile: '+1 212 555 1234',
    contactWhatsapp: '+1 212 555 1234',
    contactEmail: 'ayesha@lawyeronline.live',
    socialMediaLink: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    degreeName: 'LL.B',
    education: ['JD - Harvard Law School'],
    issuingAuthority: 'New York State Bar Association',
    licenseNumber: 'NYSBA-654321',
    aboutMe: 'Highly focused on child custody, divorce proceedings, guardianship litigations, and human rights advocacy.',
    achievements: 'Recognized as leading family law expert by New York State Bar Association; published author in major defense legal reviews.',
    isVerified: true,
    isSuspended: false,
    verificationStatus: 'approved',
    picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256',
    rating: 4.9,
    reviewCount: 42,
    enrollmentOrRollNumber: 'NYSBA-201554',
    yearOfGraduation: '2011',
    barCouncilName: 'New York State Bar Association',
    isBloodDonor: false,
    bloodGroup: ''
  },
  {
    uid: 'lawyer_3',
    fullName: 'Barrister Bilal Shah',
    firstName: 'Bilal',
    lastName: 'Shah',
    username: 'bilal_shah',
    title: 'Managing Director',
    specialty: 'Corporate Law',
    specialties: ['Corporate Law', 'Real Estate'],
    services: ['Company registration', 'IP Litigation', 'Property transfer'],
    experience: '12 Years',
    country: 'Canada',
    city: 'Toronto',
    officeName: 'Shah & Co. Legal Advisors',
    officeAddress: 'Level 12, Executive Tower, Toronto',
    contactMobile: '+1 416 555 9876',
    contactWhatsapp: '+1 416 555 9876',
    contactEmail: 'bilal@lawyeronline.live',
    socialMediaLink: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    degreeName: 'LL.B (Hons)',
    education: ['University of Toronto Faculty of Law'],
    issuingAuthority: 'Law Society of Ontario',
    licenseNumber: 'LSO-98765',
    aboutMe: 'Providing top-tier corporate structuring advisory, intellectual property litigation, and complex property transaction services.',
    achievements: 'Advisory counsel for various commercial tech unicorns and property mega-projects in Toronto.',
    isVerified: true,
    isSuspended: false,
    verificationStatus: 'approved',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256',
    rating: 4.7,
    reviewCount: 19,
    enrollmentOrRollNumber: 'LSO-98765',
    yearOfGraduation: '2014',
    barCouncilName: 'Law Society of Ontario',
    isBloodDonor: false,
    bloodGroup: ''
  },
  {
    uid: 'lawyer_4',
    fullName: 'Advocate Fatima Lodhi',
    firstName: 'Fatima',
    lastName: 'Lodhi',
    username: 'fatima_lodhi',
    title: 'Principal Advocate',
    specialty: 'Tax Law',
    specialties: ['Tax Law', 'Civil Litigation'],
    services: ['Tax filing', 'Tax Audits representation', 'Custom appeals'],
    experience: '12 Years',
    country: 'Australia',
    city: 'Sydney',
    officeName: 'Lodhi & Lodhi Associates',
    officeAddress: 'Office 3, Mall Plaza, Sydney',
    contactMobile: '+61 2 5550 1234',
    contactWhatsapp: '+61 2 5550 1234',
    contactEmail: 'fatima@lawyeronline.live',
    socialMediaLink: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    degreeName: 'LL.B',
    education: ['University of Sydney'],
    issuingAuthority: 'New South Wales Bar Association',
    licenseNumber: 'NSW-77665',
    aboutMe: 'Over 12 years representing high-net-worth clients, SMEs, and corporate entities in custom appeals and tax audit disputes.',
    achievements: 'Former legal consultant for state regulatory authorities. High filing rate with tax relief tribunal approvals.',
    isVerified: true,
    isSuspended: false,
    verificationStatus: 'approved',
    picture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256',
    rating: 4.9,
    reviewCount: 31,
    enrollmentOrRollNumber: 'NSW-77665',
    yearOfGraduation: '2014',
    barCouncilName: 'New South Wales Bar Association',
    isBloodDonor: false,
    bloodGroup: ''
  },
  {
    uid: 'lawyer_5',
    fullName: 'Advocate Zainab Jatoi',
    firstName: 'Zainab',
    lastName: 'Jatoi',
    username: 'zainab_jatoi',
    title: 'Immigration Counsel',
    specialty: 'Immigration',
    specialties: ['Immigration', 'Family Law'],
    services: ['Visa appeals', 'Overseas immigration claims', 'US/UK Immigration rules'],
    experience: '9 Years',
    country: 'United Kingdom',
    city: 'London',
    officeName: 'Jatoi Law Chambers',
    officeAddress: '15 High Street, London',
    contactMobile: '+44 20 7946 0958',
    contactWhatsapp: '+44 20 7946 0958',
    contactEmail: 'zainab@lawyeronline.live',
    socialMediaLink: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    degreeName: 'LL.B',
    education: ['LL.B - International University'],
    issuingAuthority: 'London Bar Council',
    licenseNumber: 'LBC-55443',
    aboutMe: 'Specialist in visa appeals, overseas citizenship matters, and international child custody, with an emphasis on UK/US immigration rules.',
    achievements: 'Successfully processed over 800 overseas resident status appeals and settlement cases.',
    isVerified: true,
    isSuspended: false,
    verificationStatus: 'approved',
    picture: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256',
    rating: 4.6,
    reviewCount: 15,
    enrollmentOrRollNumber: 'PBC-55443',
    yearOfGraduation: '2017',
    barCouncilName: 'Punjab Bar Council',
    isBloodDonor: false,
    bloodGroup: ''
  }
];

export const fallbackArticles: Article[] = [
  {
    id: 'article_1',
    title: 'Understanding Child Custody Laws Internationally',
    description: 'A comprehensive guide to child custody acts and application in modern family courts globally.',
    content: 'Child custody laws generally prioritize the "welfare of the minor" across the globe. The courts usually assess the primary caregiver, environment, and moral guidance. The primary caregiver may lose custody rights under certain circumstances, e.g., if they do not provide proper moral guidance or safety.',
    author: 'Advocate Ayesha Malik',
    slug: 'understanding-child-custody-global',
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800',
    date: 'Recently'
  },
  {
    id: 'article_2',
    title: 'Registration of Marriages & Divorce Procedural Guide',
    description: 'Understanding the legal requirements for marriage registration, the arbitration process, and official certificates.',
    content: 'Most jurisdictions mandate registration of all marriages in respective courts. Failure to register can lead to complications during inheritance or visa applications. Issuance of marriage certificates relies on verified details. In case of dissolution, the legal process of divorce requires notification procedures handled in local councils to finalize and receive an official Divorce Certificate.',
    author: 'Advocate Zainab Jatoi',
    slug: 'marriage-divorce-registration-global',
    featuredImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800',
    date: 'Recently'
  },
  {
    id: 'article_3',
    title: 'Company Registration & Compliance Handbook',
    description: 'A step-by-step roadmap for registering a Private Limited Company, obtaining tax IDs, and complying with local tax laws.',
    content: 'Setting up a business entity requires following the state and federal regulations. First, secure name approval online through government eServices portals. Submit memorandum and articles of association along with digital copies of National IDs. Once registered, apply for National Tax Number through tax portals and establish a commercial bank account for regulatory audits.',
    author: 'Barrister Bilal Shah',
    slug: 'how-to-start-business-global',
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800',
    date: 'Recently'
  },
  {
    id: 'article_4',
    title: 'Income Tax Filing Guide: Active Taxpayer Benefits',
    description: 'A critical guide for active tax filers, detailing timelines, penalties, and online portal procedures.',
    content: 'Filing income tax returns through official online government websites is crucial for registering on the Active Taxpayer List. Active filers enjoy massive withholding tax reductions on banking activities, land acquisition, registering luxury cars, and commercial contracts. Ensure your tax return, asset updates, and wealth statement declarations are finalized before the yearly deadline to avoid statutory cash penalties.',
    author: 'Advocate Fatima Lodhi',
    slug: 'important-tax-filing-rules',
    featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800',
    date: 'Recently'
  }
];

// --- User & Profile (Lawyers Collection) ---

export const getLawyerProfile = async (uid: string): Promise<LawyerProfile | undefined> => {
  const path = `lawyers/${uid}`;
  try {
    const docRef = doc(db, 'lawyers', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapToAppProfile(docSnap.data(), uid);
    }
    // Fallback to static seed
    return fallbackLawyers.find(l => l.uid === uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path, false);
    return fallbackLawyers.find(l => l.uid === uid);
  }
};

export const updateLawyerProfile = async (profile: LawyerProfile) => {
  const path = `lawyers/${profile.uid}`;
  try {
    const oldProfile = await getLawyerProfile(profile.uid);
    let updatedProfile = { ...profile };
    
    // Reset verification if critical info changes
    if (oldProfile) {
        // Check for specific fields that trigger re-verification
        const changedCriticalInfo = 
            oldProfile.fullName !== profile.fullName || 
            oldProfile.title !== profile.title || 
            oldProfile.specialty !== profile.specialty ||
            oldProfile.country !== profile.country ||
            oldProfile.city !== profile.city ||
            oldProfile.officeName !== profile.officeName ||
            oldProfile.officeAddress !== profile.officeAddress ||
            oldProfile.contactMobile !== profile.contactMobile ||
            oldProfile.contactWhatsapp !== profile.contactWhatsapp ||
            oldProfile.socialMediaLink !== profile.socialMediaLink ||
            oldProfile.degreeName !== profile.degreeName ||
            oldProfile.issuingAuthority !== profile.issuingAuthority ||
            oldProfile.licenseNumber !== profile.licenseNumber ||
            oldProfile.aboutMe !== profile.aboutMe ||
            oldProfile.achievements !== profile.achievements ||
            // Also check new textual verification fields
            oldProfile.enrollmentOrRollNumber !== profile.enrollmentOrRollNumber ||
            oldProfile.yearOfGraduation !== profile.yearOfGraduation ||
            oldProfile.barCouncilName !== profile.barCouncilName;


        if (changedCriticalInfo) {
            if (oldProfile.isVerified) {
                updatedProfile.isVerified = false;
                updatedProfile.verificationStatus = 'none'; // Set to 'none' to require re-application
                updatedProfile.rejectionReason = "Profile information changed, re-verification required.";
            }
        }
    }

    const dbData = mapToDbProfile(updatedProfile);
    await setDoc(doc(db, 'lawyers', profile.uid), dbData, { merge: true });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getAllLawyers = async (): Promise<LawyerProfile[]> => {
  const path = 'lawyers';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const profiles: LawyerProfile[] = [];
    querySnapshot.forEach((doc) => {
      profiles.push(mapToAppProfile(doc.data(), doc.id));
    });
    // Fallback if collection is empty
    if (profiles.length === 0) {
      console.log("[Firebase client fallback] Loading local static lawyer profiles.");
      return fallbackLawyers;
    }
    return profiles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return fallbackLawyers;
  }
};

export const deleteLawyerProfile = async (uid: string) => {
  try {
    // Delete associated files from storage (e.g., profile picture)
    const lawyerProfile = await getLawyerProfile(uid);
    if (lawyerProfile?.picture) {
        try {
            await deleteFile(lawyerProfile.picture);
        } catch (e) {
            console.warn("Storage profile pic delete failed:", e);
        }
    }

    // Delete verification requests linked to this lawyer
    try {
        const verQuery = query(collection(db, 'verifications'), where('lawyerId', '==', uid));
        const verSnapshot = await getDocs(verQuery);
        for (const docSnap of verSnapshot.docs) {
            await deleteDoc(doc(db, 'verifications', docSnap.id));
        }
    } catch (err) {
        console.warn("Failed to delete associated verifications:", err);
    }

    // Delete cases and their ledger entries linked to this lawyer
    try {
        const casesQuery = query(collection(db, 'cases'), where('lawyerId', '==', uid));
        const casesSnapshot = await getDocs(casesQuery);
        for (const caseSnap of casesSnapshot.docs) {
            const caseId = caseSnap.id;
            
            // Delete accompanying ledger entries for this case ID
            try {
                const ledgerQuery = query(collection(db, 'ledger'), where('caseId', '==', caseId));
                const ledgerSnapshot = await getDocs(ledgerQuery);
                for (const ledgerSnap of ledgerSnapshot.docs) {
                    await deleteDoc(doc(db, 'ledger', ledgerSnap.id));
                }
            } catch (err) {
                console.warn(`Failed to delete ledger entries for case ${caseId}:`, err);
            }

            // Delete the case itself
            await deleteDoc(doc(db, 'cases', caseId));
        }
    } catch (err) {
        console.warn("Failed to delete associated cases and ledger entries:", err);
    }

    await deleteDoc(doc(db, 'lawyers', uid));
    try {
        await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
        console.log("User doc not found or permission denied/already deleted", e);
    }
  } catch (error) {
    logService.error("Error deleting lawyer completely", error, 'Profile');
    throw error;
  }
};

export const setLawyerSuspended = async (uid: string, isSuspended: boolean) => {
    try {
        const profile = await getLawyerProfile(uid);
        if (profile) {
            const updated = { ...profile, isSuspended };
            const dbData = mapToDbProfile(updated);
            await setDoc(doc(db, 'lawyers', uid), dbData, { merge: true });
        } else {
            await setDoc(doc(db, 'lawyers', uid), { isSuspended }, { merge: true });
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `lawyers/${uid}/isSuspended`);
        throw error;
    }
};

export const setLawyerVerified = async (uid: string, isVerified: boolean) => {
    try {
        const profile = await getLawyerProfile(uid);
        if (profile) {
            const updated = { 
                ...profile, 
                isVerified,
                verificationStatus: (isVerified ? 'approved' : 'none') as any
            };
            const dbData = mapToDbProfile(updated);
            await setDoc(doc(db, 'lawyers', uid), dbData, { merge: true });
        } else {
            await setDoc(doc(db, 'lawyers', uid), {
                isVerified,
                verificationStatus: isVerified ? 'approved' : 'none'
            }, { merge: true });
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `lawyers/${uid}/isVerified`);
        throw error;
    }
};

// --- Cases ---

export const getLawyerCases = async (lawyerId: string): Promise<Case[]> => {
  const path = 'cases';
  try {
    const q = query(collection(db, path), where('lawyerId', '==', lawyerId));
    const querySnapshot = await getDocs(q);
    const cases: Case[] = [];
    querySnapshot.forEach((doc) => {
      cases.push(mapToAppCase(doc.data(), doc.id));
    });
    return cases;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getClientCases = async (clientId: string): Promise<Case[]> => {
  const path = 'cases';
  try {
    const q = query(collection(db, path), where('clientId', '==', clientId));
    const querySnapshot = await getDocs(q);
    const cases: Case[] = [];
    querySnapshot.forEach((doc) => {
      cases.push(mapToAppCase(doc.data(), doc.id));
    });
    return cases;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addCase = async (newCase: Case) => {
  const path = `cases/${newCase.id}`;
  try {
    await setDoc(doc(db, 'cases', newCase.id), mapToDbCase(newCase));

    // Auto-Notify of new case and set hearing date
    try {
      await createNotification(
        newCase.lawyerId, 
        'Hearing Notice: ' + newCase.caseTitle,
        `Case "${newCase.caseTitle}" create ho chuka hai. Agli peshi ki tareekh ${newCase.nextHearingDate} muqarar hui hai.`,
        'hearing',
        '/dashboard/lawyer/cases'
      );
      if (newCase.clientId) {
        await createNotification(
          newCase.clientId, 
          'Hearing Notice: ' + newCase.caseTitle,
          `Aap ka Case "${newCase.caseTitle}" create ho chuka hai. Agli peshi ki tareekh ${newCase.nextHearingDate} muqarar hui hai.`,
          'hearing',
          '/dashboard/client'
        );
      }
    } catch (e) {
      console.warn("Could not handle notification for addCase", e);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateCase = async (updatedCase: Case) => {
    const path = `cases/${updatedCase.id}`;
    try {
        await updateDoc(doc(db, 'cases', updatedCase.id), mapToDbCase(updatedCase));

        // Auto-Notify of updated hearing date
        try {
          await createNotification(
            updatedCase.lawyerId, 
            'Hearing Date Update: ' + updatedCase.caseTitle,
            `The hearing date for "${updatedCase.caseTitle}" has been updated to ${updatedCase.nextHearingDate}.`,
            'hearing',
            '/dashboard/lawyer/cases'
          );
          if (updatedCase.clientId) {
            await createNotification(
              updatedCase.clientId, 
              'Hearing Date Update: ' + updatedCase.caseTitle,
              `The hearing date for your case "${updatedCase.caseTitle}" has been updated to ${updatedCase.nextHearingDate}.`,
              'hearing',
              '/dashboard/client'
            );
          }
        } catch (e) {
          console.warn("Could not handle notification for updateCase", e);
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
    }
};

export const deleteCase = async (caseId: string) => {
    try {
        const caseRef = doc(db, 'cases', caseId);
        const caseSnap = await getDoc(caseRef);

        if (caseSnap.exists()) {
            const caseData = mapToAppCase(caseSnap.data(), caseId);
            // Delete associated case files from storage
            if (caseData.caseFiles && caseData.caseFiles.length > 0) {
                for (const file of caseData.caseFiles) {
                    await deleteFile(file.url);
                }
            }
        }
        
        // Delete all associated ledger entries
        const qLedger = query(collection(db, 'ledger'), where('caseId', '==', caseId));
        const ledgerSnap = await getDocs(qLedger);
        const deleteLedgerPromises = ledgerSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deleteLedgerPromises);

        await deleteDoc(caseRef);
    } catch (error) {
    logService.error("Error deleting case", error, 'Cases');
    throw error;
  }
};

// --- Ledger ---

const mapToAppLedger = (data: any, id: string): LedgerEntry => {
    let nextPaymentDueDate = data.nextPaymentDueDate || '';
    if (nextPaymentDueDate && typeof nextPaymentDueDate !== 'string') {
        if ((nextPaymentDueDate as any).toDate) {
            nextPaymentDueDate = (nextPaymentDueDate as any).toDate().toISOString().split('T')[0];
        } else {
            nextPaymentDueDate = String(nextPaymentDueDate);
        }
    }

    return {
        id: id,
        caseId: data.caseId,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        remainingAmount: data.remainingAmount,
        nextPaymentDueDate: nextPaymentDueDate,
        description: data.description
    };
};

export const getCaseLedger = async (caseId: string): Promise<LedgerEntry[]> => {
    try {
      const q = query(collection(db, 'ledger'), where('caseId', '==', caseId));
      const querySnapshot = await getDocs(q);
      const ledger: LedgerEntry[] = [];
      querySnapshot.forEach((doc) => {
        ledger.push(mapToAppLedger(doc.data(), doc.id));
      });
      return ledger;
    } catch (error) {
      logService.warn("Error getting ledger", error, 'Ledger');
      return [];
    }
}

export const addLedgerEntry = async (entry: LedgerEntry) => {
    const path = `ledger/${entry.id}`;
    try {
      await setDoc(doc(db, 'ledger', entry.id), entry);

      // Auto-Notify regarding payment date notice
      try {
        // Fetch the corresponding case to get the required IDs
        const caseDoc = await getDoc(doc(db, 'cases', entry.caseId));
        if (caseDoc.exists()) {
          const caseData = mapToAppCase(caseDoc.data(), caseDoc.id);
          
          await createNotification(
            caseData.lawyerId,
            'Payment Date Notice: ' + (entry.description || 'Fees'),
            `Ledger update for ${caseData.caseTitle}. Next payment Rs. ${entry.remainingAmount} ki aakhri tareekh ${entry.nextPaymentDueDate || '30th June, 2026'} hai.`,
            'payment',
            '/dashboard/lawyer/ledger'
          );

          if (caseData.clientId) {
            await createNotification(
              caseData.clientId,
              'Payment Date Notice: ' + (entry.description || 'Fees'),
              `Ledger update for ${caseData.caseTitle}. Next payment Rs. ${entry.remainingAmount} ki aakhri tareekh ${entry.nextPaymentDueDate || '30th June, 2026'} hai.`,
              'payment',
              '/dashboard/client'
            );
          }
        }
      } catch (e) {
        console.warn("Could not handle notification for addLedgerEntry", e);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
}

export const deleteLedgerEntry = async (entryId: string) => {
    try {
        await deleteDoc(doc(db, 'ledger', entryId));
    } catch (error) {
    logService.error("Error deleting ledger entry", error, 'Ledger');
    throw error;
  }
};

// --- Verification ---

export const submitVerification = async (req: VerificationRequest) => {
    try {
      // Store all textual details provided by the lawyer
      await setDoc(doc(db, 'verifications', req.id), req);
    } catch (error) {
      logService.error("Error submitting verification", error, 'Verification');
      throw error;
    }
}

const mapToAppVerification = (data: any, id: string): VerificationRequest => {
    let submittedAt = data.submittedAt || '';
    if (submittedAt && typeof submittedAt !== 'string') {
        if ((submittedAt as any).toDate) {
            submittedAt = (submittedAt as any).toDate().toISOString();
        } else {
            submittedAt = String(submittedAt);
        }
    }

    return {
        id: id,
        lawyerId: data.lawyerId,
        lawyerName: data.lawyerName,
        lawyerEmail: data.lawyerEmail,
        submittedAt: submittedAt,
        status: data.status,
        degreeName: data.degreeName,
        issuingAuthority: data.issuingAuthority,
        licenseNumber: data.licenseNumber,
        enrollmentOrRollNumber: data.enrollmentOrRollNumber,
        yearOfGraduation: data.yearOfGraduation,
        barCouncilName: data.barCouncilName,
    };
};

export const getPendingVerifications = async (): Promise<VerificationRequest[]> => {
    try {
      const q = query(collection(db, 'verifications'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const reqs: VerificationRequest[] = [];
      querySnapshot.forEach((doc) => {
        reqs.push(mapToAppVerification(doc.data(), doc.id));
      });
      return reqs;
    } catch (error) {
      logService.warn("Error getting verifications", error, 'Verification');
      return [];
    }
}

export const processVerification = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
        const reqRef = doc(db, 'verifications', id);
        const reqSnap = await getDoc(reqRef);
        
        if (reqSnap.exists()) {
            const reqData = reqSnap.data() as VerificationRequest;
            await updateDoc(reqRef, { status });

            const profileRef = doc(db, 'lawyers', reqData.lawyerId);
            const updates: any = {
                verificationStatus: status,
                isVerified: status === 'approved'
            };
            if (status === 'rejected' && reason) {
                updates.rejectionReason = reason;
            } else if (status === 'approved') {
                updates.rejectionReason = null; // Clear rejection reason on approval
            }
            await updateDoc(profileRef, updates);
        }
    } catch (error) {
        logService.error("Error processing verification", error, 'Verification');
        throw error;
    }
}

// --- Articles ---

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};


export const addArticle = async (article: Article) => {
    try {
        // Map App Article to DB Article Schema
        const dbArticle = {
            title: article.title,
            content: article.content,
            description: article.description,
            author: article.author,
            featuredImage: article.featuredImage || null,
            slug: generateSlug(article.title), // Generate slug on add
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await setDoc(doc(db, 'articles', article.id), dbArticle);
    } catch (error) {
        logService.error("Error adding article", error, 'Articles');
        throw error;
    }
}

export const updateArticle = async (article: Article) => {
    try {
        const dbArticle = {
            title: article.title,
            content: article.content,
            description: article.description,
            author: article.author, // Keep author
            featuredImage: article.featuredImage || null,
            slug: generateSlug(article.title), // Re-generate slug on update in case title changed
            updatedAt: new Date()
        };
        await updateDoc(doc(db, 'articles', article.id), dbArticle);
    } catch (error) {
        logService.error("Error updating article", error, 'Articles');
        throw error;
    }
}

export const deleteArticle = async (articleId: string) => {
    try {
        const articleRef = doc(db, 'articles', articleId);
        const articleSnap = await getDoc(articleRef);

        if (articleSnap.exists()) {
            const articleData = mapToAppArticle(articleSnap.data(), articleId);
            if (articleData.featuredImage) {
                await deleteFile(articleData.featuredImage);
            }
        }
        await deleteDoc(articleRef);
    } catch (error) {
        logService.error("Error deleting article", error, 'Articles');
        throw error;
    }
}


export const getArticles = async (): Promise<Article[]> => {
    const path = 'articles';
    try {
        const querySnapshot = await getDocs(collection(db, path));
        const articles: Article[] = [];
        querySnapshot.forEach((doc) => {
            articles.push(mapToAppArticle(doc.data(), doc.id));
        });
        if (articles.length === 0) {
            console.log("[Firebase client fallback] Loading local static articles.");
            return fallbackArticles;
        }
        return articles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return fallbackArticles;
  }
}

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
    try {
        // Query by slug
        const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return mapToAppArticle(doc.data(), doc.id);
        }
        // Fallback to static seed
        const fallback = fallbackArticles.find(a => a.slug === slug);
        return fallback || null;
    } catch (error) {
        console.warn("Error getting article by slug:", error);
        const fallback = fallbackArticles.find(a => a.slug === slug);
        return fallback || null;
    }
}

// Helper for Auth
export const getUserRole = async (uid: string, quiet: boolean = false): Promise<string | null> => {
    if (!uid) return null;
    const path = `users/${uid}`;
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().role;
        }
        
        // Fallback: check if they exist as a lawyer profile directly
        const lawyerRef = doc(db, 'lawyers', uid);
        const lawyerSnap = await getDoc(lawyerRef);
        if (lawyerSnap.exists()) {
            return 'lawyer';
        }

        return null;
    } catch (error) {
        if (!quiet) {
          handleFirestoreError(error, OperationType.GET, path);
        } else {
          console.log(`[getUserRole] Quietly failing for ${uid}`);
        }
        return null;
    }
}

export const setUserRole = async (uid: string, role: string, email: string, displayName?: string) => {
    try {
        await setDoc(doc(db, 'users', uid), { role, email });
        
        // Ensure Lawyer Profile exists for Lawyers AND Admins
        if (role === 'lawyer' || role === 'admin') {
             const lawyerRef = doc(db, 'lawyers', uid);
             const snap = await getDoc(lawyerRef);
             if (!snap.exists()) {
                 await setDoc(lawyerRef, {
                     id: uid,
                     userId: uid,
                     createdAt: new Date().toISOString(),
                     updatedAt: new Date().toISOString(),
                     fullName: displayName || '',
                     name: displayName || '',
                     contactEmail: email,
                     email: email,
                     title: 'Advocate',
                     specialty: 'General Practice',
                     specialties: ['General Practice'],
                     services: [],
                     experience: '',
                     country: 'Pakistan',
                     city: '',
                     officeName: '',
                     officeAddress: '',
                     contactMobile: '',
                     phone: '',
                     contactWhatsapp: '',
                     whatsapp: '',
                     socialMediaLink: '',
                     facebookUrl: '',
                     linkedinUrl: '',
                     twitterUrl: '',
                     aboutMe: '',
                     about: '',
                     achievements: '',
                     isVerified: false,
                     isSuspended: false,
                     verificationStatus: 'none',
                     picture: null,
                     rating: 0,
                     reviewCount: 0,
                     licenseNumber: '',
                     degreeName: '',
                     education: [],
                     issuingAuthority: '',
                     enrollmentOrRollNumber: '',
                     yearOfGraduation: '',
                     barCouncilName: '',
                 });
             }
        }
    } catch (error) {
        logService.error("Error setting role", error, 'Auth');
    }
}

// --- Blood Donation ---

export const registerBloodDonor = async (donor: Omit<BloodDonor, 'id' | 'registeredAt'>) => {
  try {
    const donorId = auth.currentUser?.uid || `anon_${Date.now()}`;
    const newDonor: BloodDonor = {
      ...donor,
      id: donorId,
      registeredAt: new Date().toISOString(),
      isLoggedInUser: !!auth.currentUser
    };
    await setDoc(doc(db, 'blood_donors', donorId), newDonor);
    
    // If it's a logged in lawyer, sync their profile
    if (auth.currentUser) {
      const lawyerDoc = await getDoc(doc(db, 'lawyers', auth.currentUser.uid));
      if (lawyerDoc.exists()) {
        await updateDoc(doc(db, 'lawyers', auth.currentUser.uid), {
          isBloodDonor: true,
          bloodGroup: donor.bloodGroup
        });
      }
    }
    return donorId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'blood_donors');
    throw error;
  }
};

export const submitBloodAppeal = async (appeal: Omit<BloodAppeal, 'id' | 'status' | 'createdAt'>) => {
  try {
    const appealRef = doc(collection(db, 'blood_appeals'));
    const newAppeal: BloodAppeal = {
      ...appeal,
      id: appealRef.id,
      status: 'active',
      createdAt: new Date().toISOString(),
      requesterId: auth.currentUser?.uid || 'anonymous'
    };
    await setDoc(appealRef, newAppeal);
    return appealRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'blood_appeals');
    throw error;
  }
};

export const getActiveBloodAppeals = async (): Promise<BloodAppeal[]> => {
  const path = 'blood_appeals';
  try {
    console.log("[getActiveBloodAppeals] Starting fetch (NO FILTER)...");
    console.log("[getActiveBloodAppeals] DB Project ID:", db.app.options.projectId);
    
    // Testing if we can reach the DB at all
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    
    console.log("[getActiveBloodAppeals] Snapshot received, size:", querySnapshot.size);
    const appeals: BloodAppeal[] = [];
    const now = new Date().getTime();
    
    for (const document of querySnapshot.docs) {
      const data = document.data();
      const createdAtTime = data.createdAt ? new Date(data.createdAt).getTime() : 0;
      const isExpired = createdAtTime > 0 && (now - createdAtTime > 24 * 60 * 60 * 1000);
      
      if (isExpired) {
        // Automatically delete the expired appeal from Firestore to recycle database storage
        try {
          deleteDoc(doc(db, 'blood_appeals', document.id));
          console.log(`[getActiveBloodAppeals] Auto-deleted expired blood appeal: ${document.id}`);
        } catch (e) {
          console.error("Failed to delete expired blood appeal:", document.id, e);
        }
      } else if (data.status === 'active') {
        appeals.push(data as BloodAppeal);
      }
    }
    
    return appeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    // Follow skill instructions for error handling
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
  }
};

export const deleteBloodAppeal = async (appealId: string) => {
  try {
    await deleteDoc(doc(db, 'blood_appeals', appealId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'blood_appeals');
    throw error;
  }
};

export const getMatchingDonors = async (bloodGroup: string, country: string, city?: string): Promise<BloodDonor[]> => {
  try {
    const q = query(collection(db, 'blood_donors'));
    const querySnapshot = await getDocs(q);
    const donors: BloodDonor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as BloodDonor;
      let isMatch = data.bloodGroup === bloodGroup && data.country === country;
      if (city) {
        isMatch = isMatch && data.city === city;
      }
      if (isMatch) {
        donors.push(data);
      }
    });
    return donors;
  } catch (error) {
    console.error("Error matching donors:", error);
    // In dev, if index is missing, firestore will give a link. We catch and return empty.
    return [];
  }
};

export const getBloodDonorProfile = async (uid: string): Promise<BloodDonor | undefined> => {
  if (!uid) return undefined;
  try {
    const docRef = doc(db, 'blood_donors', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as BloodDonor;
    }
    return undefined;
  } catch (error) {
    console.warn("Could not fetch blood donor profile:", error);
    return undefined;
  }
};

// --- Mock Data Helpers for Dropdowns ---

export const getCountries = async (): Promise<Country[]> => {
    // In a real app, this would be an API call or DB fetch
    return [
        { name: "Afghanistan", code: "AF", cities: ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif"] },
        { name: "Albania", code: "AL", cities: ["Tirana", "Durrës", "Vlorë", "Shkodër"] },
        { name: "Algeria", code: "DZ", cities: ["Algiers", "Oran", "Constantine", "Annaba"] },
        { name: "Argentina", code: "AR", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán"] },
        { name: "Australia", code: "AU", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Gold Coast", "Darwin", "Newcastle"] },
        { name: "Austria", code: "AT", cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"] },
        { name: "Bahrain", code: "BH", cities: ["Manama", "Riffa", "Muharraq", "Hamad Town"] },
        { name: "Bangladesh", code: "BD", cities: ["Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Barisal", "Comilla", "Rangpur"] },
        { name: "Belgium", code: "BE", cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège"] },
        { name: "Brazil", code: "BR", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte"] },
        { name: "Canada", code: "CA", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Quebec City", "Halifax", "Victoria"] },
        { name: "China", code: "CN", cities: ["Beijing", "Shanghai", "Shenzhen", "Guangzhou", "Chengdu", "Chongqing", "Hangzhou"] },
        { name: "Colombia", code: "CO", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"] },
        { name: "Denmark", code: "DK", cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg"] },
        { name: "Egypt", code: "EG", cities: ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said"] },
        { name: "Finland", code: "FI", cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu"] },
        { name: "France", code: "FR", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"] },
        { name: "Germany", code: "DE", cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart", "Dusseldorf", "Leipzig", "Dresden", "Nuremberg"] },
        { name: "Greece", code: "GR", cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"] },
        { name: "India", code: "IN", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Surat", "Jaipur", "Lucknow", "Nagpur"] },
        { name: "Indonesia", code: "ID", cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar"] },
        { name: "Iran", code: "IR", cities: ["Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz"] },
        { name: "Iraq", code: "IQ", cities: ["Baghdad", "Basra", "Mosul", "Erbil", "Najaf"] },
        { name: "Ireland", code: "IE", cities: ["Dublin", "Cork", "Limerick", "Galway", "Waterford"] },
        { name: "Italy", code: "IT", cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence"] },
        { name: "Japan", code: "JP", cities: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto"] },
        { name: "Kenya", code: "KE", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] },
        { name: "Kuwait", code: "KW", cities: ["Kuwait City", "Al Ahmadi", "Hawalli", "Farwaniya"] },
        { name: "Lebanon", code: "LB", cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Baalbek"] },
        { name: "Malaysia", code: "MY", cities: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Malacca City", "Shah Alam", "Kota Kinabalu", "Kuching"] },
        { name: "Mexico", code: "MX", cities: ["New Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Mérida"] },
        { name: "Morocco", code: "MA", cities: ["Casablanca", "Rabat", "Fes", "Marrakesh", "Tangier", "Agadir"] },
        { name: "Netherlands", code: "NL", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"] },
        { name: "New Zealand", code: "NZ", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga"] },
        { name: "Nigeria", code: "NG", cities: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt"] },
        { name: "Norway", code: "NO", cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Bærum"] },
        { name: "Oman", code: "OM", cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"] },
        { name: "Pakistan", code: "PK", cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Sargodha", "Bahawalpur", "Sukkur", "Hyderabad", "Gujrat", "Jhelum", "Sahiwal"] },
        { name: "Philippines", code: "PH", cities: ["Manila", "Quezon City", "Davao City", "Cebu City", "Zamboanga City"] },
        { name: "Poland", code: "PL", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk"] },
        { name: "Portugal", code: "PT", cities: ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga"] },
        { name: "Qatar", code: "QA", cities: ["Doha", "Al Wakrah", "Al Khor", "Dukhan", "Al Rayyan"] },
        { name: "Russia", code: "RU", cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"] },
        { name: "Saudi Arabia", code: "SA", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha", "Taif", "Jubail"] },
        { name: "Singapore", code: "SG", cities: ["Singapore City"] },
        { name: "South Africa", code: "ZA", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London"] },
        { name: "South Korea", code: "KR", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"] },
        { name: "Spain", code: "ES", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga"] },
        { name: "Sri Lanka", code: "LK", cities: ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo"] },
        { name: "Sweden", code: "SE", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås"] },
        { name: "Switzerland", code: "CH", cities: ["Zurich", "Geneva", "Basel", "Lausanne", "Bern"] },
        { name: "Thailand", code: "TH", cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Nakhon Ratchasima"] },
        { name: "Turkey", code: "TR", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya", "Mersin", "Trabzon"] },
        { name: "UAE", code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"] },
        { name: "United Kingdom", code: "UK", cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Newcastle", "Sheffield", "Bristol", "Edinburgh", "Cardiff", "Belfast"] },
        { name: "United States", code: "US", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Miami", "Boston", "San Francisco"] },
        { name: "Vietnam", code: "VN", cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho"] }
    ];
};

export const getCitiesByCountry = async (countryName: string): Promise<string[]> => {
    const countries = await getCountries();
    const country = countries.find(c => c.name === countryName);
    return country ? country.cities : [];
};

// --- Review & Ratings System ---

export const getLawyerReviews = async (lawyerId: string): Promise<Review[]> => {
  const path = 'reviews';
  try {
    const q = query(collection(db, path), where('lawyerId', '==', lawyerId));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((docSnap) => {
      reviews.push(docSnap.data() as Review);
    });
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
  }
};

export const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
  const reviewId = `review_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const path = `reviews/${reviewId}`;
  try {
    const newReview: Review = {
      ...review,
      id: reviewId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'reviews', reviewId), newReview);

    // Recalculate lawyer rating average and count
    const lawyerId = review.lawyerId;
    const allReviews = await getLawyerReviews(lawyerId);
    const count = allReviews.length;
    const avgRating = count > 0 
      ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 5.0;

    // Update lawyer profile
    const lawyerRef = doc(db, 'lawyers', lawyerId);
    await updateDoc(lawyerRef, {
      rating: avgRating,
      reviewCount: count
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

// --- Ask Legal Questions Q&A Community System (For SEO & Public Content) ---

export const addLegalQuestion = async (title: string, description: string, category: string, clientName: string) => {
  const qId = `question_${Date.now()}`;
  const path = `questions/${qId}`;
  try {
    const newQuestion: LegalQuestion = {
      id: qId,
      title,
      description,
      clientId: auth.currentUser?.uid || 'anonymous',
      clientName: clientName || auth.currentUser?.displayName || 'Anonymous Client',
      category,
      createdAt: new Date().toISOString(),
      answersCount: 0,
      views: Math.floor(10 + Math.random() * 50), // seed initial realistic views for SEO look
      upvotes: 0,
      downvotes: 0
    };
    await setDoc(doc(db, 'questions', qId), newQuestion);

    // Auto-Notify lawyers about a new question!
    try {
      await createNotification(
        'lawyers',
        'New Question: ' + title.substring(0, 40) + (title.length > 40 ? '...' : ''),
        `${clientName || 'A client'} has posted a new question in the "${category}" area: "${title.substring(0, 75)}...". Click here to read and answer!`,
        'question',
        '/qa'
      );
    } catch (e) {
      console.warn("Could not handle notification for addLegalQuestion", e);
    }

    return qId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const getLegalQuestions = async (): Promise<LegalQuestion[]> => {
  const path = 'questions';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const questions: LegalQuestion[] = [];
    querySnapshot.forEach((docSnap) => {
      questions.push(docSnap.data() as LegalQuestion);
    });
    
    // Seed standard fallback starter questions to boost SEO and public visual layout immediately
    if (questions.length === 0) {
      return [
        {
          id: 'q_1',
          title: 'What are the legal standards of child welfare and custody determinations across jurisdictions?',
          description: 'I need to understand what the standard custody codes look like regarding child welfare. How do family court arbiters weigh parental resources versus historical caretaker stability globally?',
          clientId: 'static_client_1',
          clientName: 'Julian Rivers',
          category: 'Family Law',
          createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          answersCount: 1,
          views: 142,
          upvotes: 18,
          downvotes: 1
        },
        {
          id: 'q_2',
          title: 'How can a private SaaS company register and protect an international Trademark?',
          description: 'We are launching a software startup and want to secure our brand name and digital assets internationally under relevant treaties (Madrid Protocol, WIPO). What is the best step-by-step roadmap?',
          clientId: 'static_client_2',
          clientName: 'TechVibe Group',
          category: 'Corporate Law',
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          answersCount: 0,
          views: 95,
          upvotes: 15,
          downvotes: 0
        }
      ];
    }
    
    return questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
  }
};

export const addLegalAnswer = async (questionId: string, content: string, lawyerId: string, lawyerName: string, lawyerTitle: string, lawyerPicture?: string) => {
  const answerId = `answer_${Date.now()}`;
  const path = `answers/${answerId}`;
  try {
    const newAnswer: LegalAnswer = {
      id: answerId,
      questionId,
      lawyerId,
      lawyerName,
      lawyerTitle,
      lawyerPicture: lawyerPicture || undefined,
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0
    };
    await setDoc(doc(db, 'answers', answerId), newAnswer);

    // Increment answers count on question and notify the client
    const qRef = doc(db, 'questions', questionId);
    const qSnap = await getDoc(qRef);
    let clientId = '';
    let questionTitle = '';
    if (qSnap.exists()) {
      const qData = qSnap.data();
      const currentVal = qData.answersCount || 0;
      clientId = qData.clientId || '';
      questionTitle = qData.title || '';
      await updateDoc(qRef, { answersCount: currentVal + 1 });
    }

    if (clientId && clientId !== 'anonymous') {
      try {
        await createNotification(
          clientId,
          'Legal Answer Added',
          `Advocate ${lawyerName} has provided a professional answer to your question "${questionTitle.substring(0, 30)}...". Click here to read now!`,
          'question',
          '/qa'
        );
      } catch (e) {
        console.warn("Could not handle notification for addLegalAnswer", e);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const getQuestionAnswers = async (questionId: string): Promise<LegalAnswer[]> => {
  const path = 'answers';
  try {
    const q = query(collection(db, path), where('questionId', '==', questionId));
    const querySnapshot = await getDocs(q);
    const answers: LegalAnswer[] = [];
    querySnapshot.forEach((docSnap) => {
      answers.push(docSnap.data() as LegalAnswer);
    });

    if (answers.length === 0 && questionId === 'q_1') {
      return [{
        id: 'ans_1',
        questionId: 'q_1',
        lawyerId: 'lawyer_2',
        lawyerName: 'Advocate Ayesha Malik',
        lawyerTitle: 'Senior Partner',
        lawyerPicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256',
        content: 'Under Muslim Personal Law and judicial precedent in family courts, a mother has the right of Hizanat (custody) of her male child until he reaches 7 years of age, and her female child until she attains puberty. However, remember that the "Welfare of the Minor" is the overriding condition. If any proof of neglect, poor moral upbringing, or unsafe environment is demonstrated, the court can deviate and transfer custody. You should file an application in the Family Court under Section 25 of the Guardians and Wards Act 1890.',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        upvotes: 12,
        downvotes: 1
      }];
    }

    return answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
  }
};

export const voteLegalQuestion = async (questionId: string, voteType: 'up' | 'down'): Promise<void> => {
  const path = `questions/${questionId}`;
  try {
    const qRef = doc(db, 'questions', questionId);
    const qSnap = await getDoc(qRef);
    if (qSnap.exists()) {
      const qData = qSnap.data() as LegalQuestion;
      if (voteType === 'up') {
        const currentUpvotes = qData.upvotes || 0;
        await updateDoc(qRef, { upvotes: currentUpvotes + 1 });
      } else {
        const currentDownvotes = qData.downvotes || 0;
        await updateDoc(qRef, { downvotes: currentDownvotes + 1 });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
};

export const voteLegalAnswer = async (answerId: string, voteType: 'up' | 'down'): Promise<void> => {
  const path = `answers/${answerId}`;
  try {
    const aRef = doc(db, 'answers', answerId);
    const aSnap = await getDoc(aRef);
    if (aSnap.exists()) {
      const aData = aSnap.data() as LegalAnswer;
      if (voteType === 'up') {
        const currentUpvotes = aData.upvotes || 0;
        await updateDoc(aRef, { upvotes: currentUpvotes + 1 });
      } else {
        const currentDownvotes = aData.downvotes || 0;
        await updateDoc(aRef, { downvotes: currentDownvotes + 1 });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, false);
  }
};

// --- Notifications System ---

export const getNotifications = async (userId: string, role?: string): Promise<AppNotification[]> => {
  const path = 'notifications';
  try {
    const qSnapshot = await getDocs(collection(db, path));
    const allNotifs: AppNotification[] = [];
    qSnapshot.forEach((docSnap) => {
      allNotifs.push(docSnap.data() as AppNotification);
    });

    // Seed initial notifications if empty using the requested notification categories:
    // "new sawal ka notice next hearing ka notice next payment date ka notice new article ka notice legal job ka notice"
    if (allNotifs.length === 0) {
      const defaultNotifs: AppNotification[] = [
        {
          id: 'notif_seed_1',
          userId: 'all',
          title: 'New Legal Article Published',
          message: 'Our new article has been published: "Fundamental Laws of Child Visitation Rights". Share it with your network!',
          type: 'article',
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4h ago
          isRead: false,
          link: '/qa'
        },
        {
          id: 'notif_seed_2',
          userId: 'lawyers',
          title: 'New Legal Question Asked',
          message: 'A user has asked a new question regarding child custody. Provide a quick answer to attract potential clients!',
          type: 'question',
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
          isRead: false,
          link: '/qa'
        },
        {
          id: 'notif_seed_3',
          userId: 'lawyers',
          title: 'New Legal Job Opportunity / Corporate Legal Assistant Needed',
          message: 'A prominent law firm is looking for a Legal Associate with 2 years of experience. Competitive salary offered. Apply now!',
          type: 'job',
          createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6h ago
          isRead: false,
          link: '/qa'
        }
      ];

      // Add user-specific hearing and payment notifications if user is logged in
      if (userId && userId !== 'anonymous') {
        const isClient = role === 'client';
        defaultNotifs.push({
          id: 'notif_seed_4',
          userId: userId,
          title: isClient ? 'Case Hearing Notice' : 'Client Case Hearing Due',
          message: 'The next hearing for the case State vs. John Doe is scheduled for June 25th, 2026 at the High Court. Please be prepared!',
          type: 'hearing',
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), // 1h ago
          isRead: false,
          link: isClient ? '/dashboard/client' : '/dashboard/lawyer/cases'
        });

        defaultNotifs.push({
          id: 'notif_seed_5',
          userId: userId,
          title: isClient ? 'Ledger Payment Date Notice' : 'Ledger Payment Due',
          message: `The deadline for the remaining payment ($500) for Case ID #C-501 is June 30th, 2026. Please update the ledger accordingly.`,
          type: 'payment',
          createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8h ago
          isRead: false,
          link: isClient ? '/dashboard/client' : '/dashboard/lawyer/ledger'
        });
      }

      // Write them to firestore so that they are persisted!
      try {
        for (const notif of defaultNotifs) {
          await setDoc(doc(db, path, notif.id), notif);
        }
      } catch (writeErr) {
        console.warn("Could not persist initial notification seeds to Firestore (running with local fallbacks):", writeErr);
      }

      // Return the generated ones that match our filters
      return defaultNotifs.filter(n => 
        n.userId === 'all' || 
        n.userId === userId || 
        (n.userId === 'lawyers' && role === 'lawyer') ||
        (n.userId === 'clients' && role === 'client')
      ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Filter relevant notifications for the current user
    return allNotifs.filter(n => 
      n.userId === 'all' || 
      n.userId === userId || 
      (n.userId === 'lawyers' && role === 'lawyer') ||
      (n.userId === 'clients' && role === 'client')
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  } catch (error) {
    console.warn("Could not retrieve notifications from Firestore database, using local notifications fallback:", error);
    // Return standard fallback notifications so that NotificationCenter always works beautifully!
    const isClient = role === 'client';
    const defaultNotifs: AppNotification[] = [
      {
        id: 'notif_fallback_1',
        userId: 'all',
        title: 'New Legal Article Published',
        message: 'Our new article has been published: "Fundamental Laws of Child Visitation Rights". Share it with your network!',
        type: 'article',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        isRead: false,
        link: '/qa'
      },
      {
        id: 'notif_fallback_2',
        userId: 'lawyers',
        title: 'New Legal Question Asked',
        message: 'A user has asked a new question regarding child custody. Provide a quick answer to attract potential clients!',
        type: 'question',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        isRead: false,
        link: '/qa'
      },
      {
        id: 'notif_fallback_3',
        userId: 'lawyers',
        title: 'New Legal Job Opportunity / Corporate Legal Assistant Needed',
        message: 'A prominent law firm is looking for a Legal Associate with 2 years of experience. Competitive salary offered. Apply now!',
        type: 'job',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        isRead: false,
        link: '/qa'
      }
    ];

    if (userId && userId !== 'anonymous') {
      defaultNotifs.push({
        id: 'notif_fallback_4',
        userId: userId,
        title: isClient ? 'Case Hearing Notice' : 'Client Case Hearing Due',
        message: 'The next hearing for the case State vs. John Doe is scheduled for June 25th, 2026 at the High Court. Please be prepared!',
        type: 'hearing',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        isRead: false,
        link: isClient ? '/dashboard/client' : '/dashboard/lawyer/cases'
      });

      defaultNotifs.push({
        id: 'notif_fallback_5',
        userId: userId,
        title: isClient ? 'Ledger Payment Date Notice' : 'Ledger Payment Due',
        message: `The deadline for the remaining payment ($500) for Case ID #C-501 is June 30th, 2026. Please update the ledger accordingly.`,
        type: 'payment',
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        isRead: false,
        link: isClient ? '/dashboard/client' : '/dashboard/lawyer/ledger'
      });
    }

    return defaultNotifs.filter(n => 
      n.userId === 'all' || 
      n.userId === userId || 
      (n.userId === 'lawyers' && role === 'lawyer') ||
      (n.userId === 'clients' && role === 'client')
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'question' | 'hearing' | 'payment' | 'article' | 'job' | 'system',
  link?: string
) => {
  const notifId = `notif_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  const path = `notifications/${notifId}`;
  try {
    const newNotif: AppNotification = {
      id: notifId,
      userId,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      isRead: false,
      link
    };
    await setDoc(doc(db, 'notifications', notifId), newNotif);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const markNotificationAsRead = async (id: string) => {
  const path = `notifications/${id}`;
  try {
    await setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const markAllNotificationsAsRead = async (userId: string, role?: string) => {
  const path = 'notifications';
  try {
    const list = await getNotifications(userId, role);
    const unread = list.filter(n => !n.isRead);
    for (const notif of unread) {
      await setDoc(doc(db, 'notifications', notif.id), { isRead: true }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
