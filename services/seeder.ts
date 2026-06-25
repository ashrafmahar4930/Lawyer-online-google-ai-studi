
import { db } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

const ARTICLES = [
  {
    id: 'article_1',
    title: 'Understanding Child Custody Laws',
    description: 'A comprehensive guide to the Guardian and Wards Act and its application in modern family courts.',
    content: 'Child custody laws are primarily governed by international principles emphasizing the "welfare of the minor". The courts usually lean towards the primary caregiver for younger children, but this can be challenged if the welfare of the child is at stake...',
    author: 'Admin',
    date: new Date().toLocaleDateString(),
    slug: 'understanding-child-custody-global',
    featuredImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800'
  }
];

const LAWYERS = [
  {
    uid: 'lawyer_1',
    fullName: 'Advocate Ahmed Khan',
    name: 'Advocate Ahmed Khan',
    title: 'Senior Counsel',
    specialties: ['Criminal Law', 'Civil Litigation'],
    country: 'United Kingdom',
    city: 'London',
    officeName: 'Khan & Associates',
    officeAddress: 'Office 402, High Holborn, London',
    contactMobile: '+44 20 7123 4567',
    contactWhatsapp: '+44 20 7123 4567',
    contactEmail: 'ahmed@lawyeronline.live',
    aboutMe: 'Over 20 years of experience in the High Court.',
    isVerified: true,
    verificationStatus: 'approved',
    rating: 4.8,
    reviewCount: 24,
    picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256'
  }
];

export const seedDataIfEmpty = async () => {
  try {
    const articlesSnap = await getDocs(collection(db, 'articles'));
    if (articlesSnap.empty) {
      console.log("Seeding articles...");
      for (const art of ARTICLES) {
        await setDoc(doc(db, 'articles', art.id), art);
      }
    }

    const lawyersSnap = await getDocs(collection(db, 'lawyers'));
    if (lawyersSnap.empty) {
      console.log("Seeding lawyers...");
      for (const lawyer of LAWYERS) {
        await setDoc(doc(db, 'lawyers', lawyer.uid), lawyer);
      }
    }
    console.log("Seeding check complete.");
  } catch (error) {
    console.warn("Seeding failed (this is expected if databases are locked/propagating, running on standard in-memory fallback models):", error);
  }
};
