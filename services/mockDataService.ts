

import { LawyerProfile, Case, LedgerEntry, VerificationRequest, Article, ImportantDate, CaseFile, Country, BloodAppeal, BloodDonor, Review, LegalQuestion, LegalAnswer, AppNotification } from '../types';
import { db, storage, auth } from './firebase'; // Added auth import
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy, limit, onSnapshot 
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { logService } from './logService';

// --- System Branding Helpers ---
export const getSystemBranding = async () => {
  try {
    const docRef = doc(db, 'system', 'branding');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching system branding:", error);
    return null;
  }
};

export const updateSystemBranding = async (data: any) => {
  try {
    const docRef = doc(db, 'system', 'branding');
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating system branding:", error);
    return false;
  }
};

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
  } catch (error: any) {
    if (error?.code === 'storage/unauthorized') {
      console.warn("Storage warning: Could not delete old file due to permission constraints (storage/unauthorized). Proceeding with upload.", fileUrl);
    } else {
      logService.error("Error deleting old file", error, 'Storage');
    }
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
    stateProvince: data.stateProvince || '',
    languagesSpoken: data.languagesSpoken || [],
    officeTimingStart: data.officeTimingStart || '',
    officeTimingEnd: data.officeTimingEnd || '',
    officeDays: data.officeDays || [],
  };
};

const mapToDbProfile = (profile: LawyerProfile) => {
    return {
        fullName: profile.fullName || '',
        fullNameLocal: profile.fullNameLocal || '',
        name: profile.fullName || '', // Keep legacy field
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        username: profile.username || '',
        title: profile.title || 'Advocate',
        specialty: profile.specialty || '',
        specialtyLocal: profile.specialtyLocal || '',
        specialties: profile.specialties || (profile.specialty ? [profile.specialty] : []),
        services: profile.services || [],
        experience: profile.experience || '',
        country: profile.country || '',
        city: profile.city || '',
        officeName: profile.officeName || '',
        officeAddress: profile.officeAddress || '',
        address: profile.officeAddress || '', // Keep legacy field
        contactMobile: profile.contactMobile || '',
        phone: profile.contactMobile || '', // Keep legacy field
        contactWhatsapp: profile.contactWhatsapp || '',
        whatsapp: profile.contactWhatsapp || '', // Keep legacy field
        contactEmail: profile.contactEmail || '',
        email: profile.contactEmail || '', // Keep legacy field
        socialMediaLink: profile.socialMediaLink || '',
        facebookUrl: profile.facebookUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        twitterUrl: profile.twitterUrl || '',
        degreeName: profile.degreeName || '',
        education: profile.education || [],
        issuingAuthority: profile.issuingAuthority || '',
        licenseNumber: profile.licenseNumber || '',
        aboutMe: profile.aboutMe || '',
        aboutMeLocal: profile.aboutMeLocal || '',
        about: profile.aboutMe || '', // Keep legacy field
        achievements: profile.achievements || '',
        isVerified: profile.isVerified || false,
        isSuspended: profile.isSuspended || false,
        verificationStatus: profile.verificationStatus || 'none',
        rejectionReason: profile.rejectionReason || null,
        picture: profile.picture || null,
        userId: profile.uid || '',
        id: profile.uid || '', 
        updatedAt: new Date().toISOString(),
        enrollmentOrRollNumber: profile.enrollmentOrRollNumber || '',
        yearOfGraduation: profile.yearOfGraduation || '',
        barCouncilName: profile.barCouncilName || '',
        stateProvince: profile.stateProvince || '',
        languagesSpoken: profile.languagesSpoken || [],
        officeTimingStart: profile.officeTimingStart || '',
        officeTimingEnd: profile.officeTimingEnd || '',
        officeDays: profile.officeDays || [],
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


// --- User & Profile (Lawyers Collection) ---

export const getLawyerProfile = async (uid: string): Promise<LawyerProfile | undefined> => {
  const path = `lawyers/${uid}`;
  try {
    const docRef = doc(db, 'lawyers', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapToAppProfile(docSnap.data(), uid);
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path, false);
    return undefined;
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
    console.log(`Fetched ${querySnapshot.size} lawyers from Firestore collection "${path}" in database "${(db as any)._databaseId?.database || 'default'}"`);
    const profiles: LawyerProfile[] = [];
    querySnapshot.forEach((doc) => {
      profiles.push(mapToAppProfile(doc.data(), doc.id));
    });
    // Fallback if collection is empty
    if (profiles.length === 0) {
      console.log("Lawyers collection is empty in Firestore.");
      return [];
    }
    return profiles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
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
        console.log(`Fetched ${querySnapshot.size} articles from Firestore collection "${path}"`);
        const articles: Article[] = [];
        querySnapshot.forEach((doc) => {
            articles.push(mapToAppArticle(doc.data(), doc.id));
        });
        if (articles.length === 0) {
            console.log("Articles collection is empty in Firestore.");
            return [];
        }
        return articles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
  }
}

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
    try {
        // First try query by slug
        const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return mapToAppArticle(doc.data(), doc.id);
        }

        // If not found by slug, try by ID, safely catching invalid path errors
        try {
            const docRef = doc(db, 'articles', slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return mapToAppArticle(docSnap.data(), docSnap.id);
            }
        } catch (idError) {
            // ignore invalid ID errors
        }

        return null;
    } catch (error) {
        console.warn("Error getting article by slug:", error);
        return null;
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
    handleFirestoreError(error, OperationType.WRITE, 'blood_donors', false);
    const donorId = auth.currentUser?.uid || `anon_${Date.now()}`;
    const newDonor: BloodDonor = {
      ...donor,
      id: donorId,
      registeredAt: new Date().toISOString(),
      isLoggedInUser: !!auth.currentUser
    };
    const saved = localStorage.getItem('localBloodDonors');
    const existing = saved ? JSON.parse(saved) : [];
    existing.push(newDonor);
    localStorage.setItem('localBloodDonors', JSON.stringify(existing));
    return donorId;
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
    handleFirestoreError(error, OperationType.WRITE, 'blood_appeals', false);
    const newAppeal: BloodAppeal = {
      ...appeal,
      id: `local_appeal_${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      requesterId: auth.currentUser?.uid || 'anonymous'
    };
    const saved = localStorage.getItem('localBloodAppeals');
    const existing = saved ? JSON.parse(saved) : [];
    existing.push(newAppeal);
    localStorage.setItem('localBloodAppeals', JSON.stringify(existing));
    return newAppeal.id;
  }
};

export const getActiveBloodAppeals = async (): Promise<BloodAppeal[]> => {
  const path = 'blood_appeals';
  let remoteAppeals: BloodAppeal[] = [];
  try {
    console.log("[getActiveBloodAppeals] Starting fetch (NO FILTER)...");
    console.log("[getActiveBloodAppeals] DB Project ID:", db.app.options.projectId);
    
    // Testing if we can reach the DB at all
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    
    console.log("[getActiveBloodAppeals] Snapshot received, size:", querySnapshot.size);
    const now = new Date().getTime();
    
    for (const document of querySnapshot.docs) {
      const data = document.data();
      const createdAtTime = data.createdAt ? new Date(data.createdAt).getTime() : 0;
      const isExpired = createdAtTime > 0 && (now - createdAtTime > 24 * 60 * 60 * 1000);
      
      if (isExpired) {
        // Only attempt deletion if authorized (requester or admin) to prevent throwing spurious permission errors in the browser console
        const currentUserId = auth.currentUser?.uid;
        const currentUserEmail = auth.currentUser?.email?.toLowerCase();
        const isAuthorized = currentUserId && (
          data.requesterId === currentUserId ||
          currentUserEmail === 'admin@jurisconnect.com' ||
          currentUserEmail === 'ashrafmahar4930@gmail.com'
        );

        if (isAuthorized) {
          try {
            await deleteDoc(doc(db, 'blood_appeals', document.id));
            console.log(`[getActiveBloodAppeals] Auto-deleted expired blood appeal: ${document.id}`);
          } catch (e) {
            console.error("Failed to delete expired blood appeal:", document.id, e);
          }
        } else {
          console.log(`[getActiveBloodAppeals] Skipping auto-deletion for expired appeal ${document.id} (not owner or admin)`);
        }
      } else if (data.status === 'active') {
        remoteAppeals.push(data as BloodAppeal);
      }
    }
  } catch (error: any) {
    // Follow skill instructions for error handling
    handleFirestoreError(error, OperationType.LIST, path, false);
  }

  // Load and merge local ones to be safe and robust
  const saved = localStorage.getItem('localBloodAppeals');
  const localAppeals: BloodAppeal[] = saved ? JSON.parse(saved) : [];
  
  // Exclude expired local ones
  const now = new Date().getTime();
  const validLocalAppeals = localAppeals.filter(appeal => {
    const createdAtTime = appeal.createdAt ? new Date(appeal.createdAt).getTime() : 0;
    const isExpired = createdAtTime > 0 && (now - createdAtTime > 24 * 60 * 60 * 1000);
    return !isExpired && appeal.status === 'active';
  });

  // Combine and remove duplicates by ID
  const allAppeals = [...remoteAppeals];
  for (const local of validLocalAppeals) {
    if (!allAppeals.some(a => a.id === local.id)) {
      allAppeals.push(local);
    }
  }

  return allAppeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getAllBloodDonors = async (): Promise<BloodDonor[]> => {
  let remoteDonors: BloodDonor[] = [];
  try {
    const q = query(collection(db, 'blood_donors'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      remoteDonors.push(doc.data() as BloodDonor);
    });
  } catch (error) {
    console.error("Error fetching remote blood donors:", error);
  }

  // Combine with local ones to be safe and robust
  const saved = localStorage.getItem('localBloodDonors');
  const localDonors: BloodDonor[] = saved ? JSON.parse(saved) : [];
  
  const allDonors = [...remoteDonors];
  for (const local of localDonors) {
    if (!allDonors.some(d => d.id === local.id)) {
      allDonors.push(local);
    }
  }
  return allDonors.sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime());
};

export const deleteBloodDonor = async (donorId: string) => {
  try {
    await deleteDoc(doc(db, 'blood_donors', donorId));
  } catch (error) {
    console.error("Error deleting remote blood donor:", error);
  }
  const saved = localStorage.getItem('localBloodDonors');
  if (saved) {
    const existing: BloodDonor[] = JSON.parse(saved);
    const filtered = existing.filter(d => d.id !== donorId);
    localStorage.setItem('localBloodDonors', JSON.stringify(filtered));
  }
};

export const deleteBloodAppeal = async (appealId: string) => {
  try {
    await deleteDoc(doc(db, 'blood_appeals', appealId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'blood_appeals', false);
    const saved = localStorage.getItem('localBloodAppeals');
    if (saved) {
      const existing: BloodAppeal[] = JSON.parse(saved);
      const filtered = existing.filter(a => a.id !== appealId);
      localStorage.setItem('localBloodAppeals', JSON.stringify(filtered));
    }
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
    const saved = localStorage.getItem('localBloodDonors');
    const allLocal: BloodDonor[] = saved ? JSON.parse(saved) : [];
    return allLocal.filter(data => {
      let isMatch = data.bloodGroup === bloodGroup && data.country === country;
      if (city) {
        isMatch = isMatch && data.city === city;
      }
      return isMatch;
    });
  }
};

export const sendBloodDonorMessage = async (donorId: string, donorName: string, messageText: string, sentBy: string) => {
  try {
    const msgRef = doc(collection(db, 'blood_messages'));
    const newMessage = {
      id: msgRef.id,
      donorId,
      donorName,
      message: messageText,
      sentAt: new Date().toISOString(),
      sentBy
    };
    await setDoc(msgRef, newMessage);
    return msgRef.id;
  } catch (error) {
    console.error("Error saving blood message online:", error);
    const newMessage = {
      id: `local_msg_${Date.now()}`,
      donorId,
      donorName,
      message: messageText,
      sentAt: new Date().toISOString(),
      sentBy
    };
    const saved = localStorage.getItem('localBloodMessages');
    const existing = saved ? JSON.parse(saved) : [];
    existing.push(newMessage);
    localStorage.setItem('localBloodMessages', JSON.stringify(existing));
    return newMessage.id;
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
import { Country as CSC_Country, City as CSC_City } from 'country-state-city';

export const getCountries = async (): Promise<Country[]> => {
    const allCountries = CSC_Country.getAllCountries();
    return allCountries.map(c => ({
        name: c.name,
        code: c.isoCode,
        cities: [] // Cities are loaded on demand via getCitiesByCountry
    }));
};

export const getCitiesByCountry = async (countryName: string): Promise<string[]> => {
    const allCountries = CSC_Country.getAllCountries();
    const country = allCountries.find(c => c.name === countryName);
    if (!country) return [];
    
    const cities = CSC_City.getCitiesOfCountry(country.isoCode);
    const cityNames = cities ? cities.map(city => city.name) : [];
    return Array.from(new Set(cityNames));
};

// --- Review & Ratings System ---

export const getLawyerReviews = async (lawyerId: string): Promise<Review[]> => {
  if (!lawyerId) return [];
  const path = 'reviews';
  try {
    const q = query(collection(db, path), where('lawyerId', '==', lawyerId), limit(50));
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
  let currentPath = `reviews/${reviewId}`;
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
    currentPath = `lawyers/${lawyerId}`;
    const lawyerRef = doc(db, 'lawyers', lawyerId);
    const lawyerSnap = await getDoc(lawyerRef);
    if (lawyerSnap.exists()) {
      await updateDoc(lawyerRef, {
        rating: avgRating,
        reviewCount: count
      });

      // Notify the lawyer of the new rating review
      try {
        await createNotification(
          lawyerId,
          'New Client Review! (نیا ریویو موصول ہوا)',
          `Client ${review.clientName} has posted a ${review.rating}★ rating and review of your services.`,
          'rating',
          '/dashboard/lawyer'
        );
      } catch (e) {
        console.warn("Could not handle notification for addReview:", e);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, currentPath);
    throw error;
  }
};

export const getAllReviews = async (): Promise<Review[]> => {
  const path = 'reviews';
  try {
    const q = query(collection(db, path), limit(100));
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push(doc.data() as Review);
    });
    return reviews;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, false);
    return [];
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
        
        // Notify the question owner
        if (qData.clientId && qData.clientId !== 'anonymous') {
          try {
            await createNotification(
              qData.clientId,
              'Question Upvoted! (سوال کو اپ ووٹ کیا گیا ہے)',
              `Your legal question "${qData.title.substring(0, 35)}..." has received a community upvote!`,
              'info',
              '/qa'
            );
          } catch (e) {
            console.warn("Could not handle upvote notification:", e);
          }
        }
      } else {
        const currentDownvotes = qData.downvotes || 0;
        await updateDoc(qRef, { downvotes: currentDownvotes + 1 });
        
        // Notify the question owner on feedback
        if (qData.clientId && qData.clientId !== 'anonymous') {
          try {
            await createNotification(
              qData.clientId,
              'Question Feedback (سوال پر فیڈ بیک)',
              `Your legal question "${qData.title.substring(0, 35)}..." has received new feedback rating.`,
              'info',
              '/qa'
            );
          } catch (e) {
            console.warn("Could not handle downvote notification:", e);
          }
        }
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
        
        // Notify the lawyer who wrote the answer
        if (aData.lawyerId && aData.lawyerId !== 'ai_admin_bot') {
          try {
            await createNotification(
              aData.lawyerId,
              'Response Upvoted! (جواب کو اپ ووٹ کیا گیا ہے)',
              `Your professional legal advisory on thread is upvoted by a community member!`,
              'info',
              '/qa'
            );
          } catch (e) {
            console.warn("Could not handle answer upvote notification:", e);
          }
        }
      } else {
        const currentDownvotes = aData.downvotes || 0;
        await updateDoc(aRef, { downvotes: currentDownvotes + 1 });
        
        // Notify lawyer of rating feedback
        if (aData.lawyerId && aData.lawyerId !== 'ai_admin_bot') {
          try {
            await createNotification(
              aData.lawyerId,
              'Response Feedback (جواب پر فیڈ بیک)',
              `Your professional legal advisory on thread received community feedback rating.`,
              'info',
              '/qa'
            );
          } catch (e) {
            console.warn("Could not handle answer downvote notification:", e);
          }
        }
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

    // Return notifications for the current user
    return allNotifs.filter(n => 
      n.userId === 'all' || 
      n.userId === userId || 
      (n.userId === 'lawyers' && role === 'lawyer') ||
      (n.userId === 'clients' && role === 'client')
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  } catch (error) {
    console.warn("Could not retrieve notifications from Firestore database:", error);
    return [];
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

export const getAuthorities = async (): Promise<any[]> => {
  try {
    const q = query(collection(db, 'authorities'));
    const querySnapshot = await getDocs(q);
    const authorities: any[] = [];
    querySnapshot.forEach((doc) => {
      authorities.push({ id: doc.id, ...doc.data() });
    });
    return authorities;
  } catch (error) {
    console.warn("Could not fetch authorities from Firestore:", error);
    return [];
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
