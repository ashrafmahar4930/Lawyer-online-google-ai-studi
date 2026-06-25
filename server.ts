
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// High robust environment/production detection (compatible with both CommonJS and ESM)
let isProduction = process.env.NODE_ENV === "production" || !process.argv[1]?.endsWith("server.ts");

// Initialize Firebase Admin with high robustness and fallbacks
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } else {
    console.warn("firebase-applet-config.json not found! Falling back to env variables.");
  }
} catch (error) {
  console.error("Error reading firebase-applet-config.json:", error);
}

const projectId = isProduction 
  ? (process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT) 
  : (process.env.FIREBASE_PROJECT_ID || firebaseConfig?.projectId || "jurisconnect-wwep2");

const firestoreDatabaseId = isProduction
  ? process.env.FIRESTORE_DATABASE_ID 
  : (process.env.FIRESTORE_DATABASE_ID || firebaseConfig?.firestoreDatabaseId || "ai-studio-58027f49-f4cb-4d2f-bb1b-006e0f11be95");

let _db: any = null;

function getDb() {
  if (!_db) {
    try {
      const appInstance = !admin.apps.length
        ? (isProduction 
            ? admin.initializeApp() 
            : admin.initializeApp({ projectId: projectId }))
        : admin.app();

      if (firestoreDatabaseId && firestoreDatabaseId !== "(default)") {
        _db = getFirestore(appInstance, firestoreDatabaseId);
      } else {
        _db = getFirestore(appInstance);
      }
      console.log("Firebase Admin & Firestore initialized successfully with project ID:", projectId || "Default ADC Project", "database:", firestoreDatabaseId || "(default)");
    } catch (error) {
      console.error("Error initializing Firebase/Firestore. Using safe mock fallback:", error);
      // Fallback object to prevent crashing of the server
      _db = {
        collection: (name: string) => {
          console.warn(`Firestore is not initialized. Mock collection '${name}' accessed.`);
          return {
            get: async () => ({ empty: true, docs: [] }),
            doc: (id: string) => ({
              set: async (data: any) => console.warn(`Firestore is not initialized. Mock set on '${name}/${id}' called.`),
              get: async () => ({ exists: false, data: () => null })
            })
          };
        }
      };
    }
  }
  return _db;
}

async function seedDatabase() {
  try {
    console.log("Checking database seeds...");
    const lawyersRef = getDb().collection("lawyers");
    const lawyersSnap = await lawyersRef.get();
    
    // Seed lawyers if collection is empty
    if (lawyersSnap.empty) {
      console.log("Seeding lawyers info to database...");
      const lawyersList = [
        {
          uid: 'lawyer_1',
          fullName: 'Alexander Bennett, Esq.',
          name: 'Alexander Bennett, Esq.',
          title: 'Senior Litigation Partner',
          specialty: 'Criminal Law',
          specialties: ['Criminal Law', 'Civil Litigation'],
          country: 'United States',
          city: 'New York',
          officeName: 'Bennett & Associate Counsels',
          officeAddress: 'Suite 1400, Broadway, New York, NY',
          contactMobile: '+1 212 555 0199',
          phone: '+1 212 555 0199',
          contactWhatsapp: '+1 212 555 0199',
          whatsapp: '+1 212 555 0199',
          contactEmail: 'alexander@lawyeronline.live',
          email: 'alexander@lawyeronline.live',
          aboutMe: 'Specializing in federal trial defense, corporate compliance investigation, and appellate civil advocacy with over 18 years of experience.',
          about: 'Specializing in federal trial defense, corporate compliance investigation, and appellate civil advocacy with over 18 years of experience.',
          achievements: 'Defended complex corporate trials in regional high-level appellate courts; recognized as a distinguished trial advisor.',
          isVerified: true,
          verificationStatus: 'approved',
          rating: 4.8,
          reviewCount: 38,
          isBloodDonor: false,
          bloodGroup: '',
          picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256'
        },
        {
          uid: 'lawyer_2',
          fullName: 'Ayesha Malik, Solicitor',
          name: 'Ayesha Malik, Solicitor',
          title: 'Senior Family Law Counsel',
          specialty: 'Family Law',
          specialties: ['Family Law', 'Immigration'],
          country: 'United Kingdom',
          city: 'London',
          officeName: 'Malik Cross-Border Legal Chambers',
          officeAddress: '72 Fleet Street, London, EC4Y 1HY',
          contactMobile: '+44 20 7946 0192',
          phone: '+44 20 7946 0192',
          contactWhatsapp: '+44 20 7946 0192',
          whatsapp: '+44 20 7946 0192',
          contactEmail: 'ayesha@lawyeronline.live',
          email: 'ayesha@lawyeronline.live',
          aboutMe: 'Specialist in child custody dispute resolution, international guardianship, separation agreements, and human rights representation.',
          about: 'Specialist in child custody dispute resolution, international guardianship, separation agreements, and human rights representation.',
          achievements: 'Award-winning global family mediator with publication credentials in high-impact legal journals.',
          isVerified: true,
          verificationStatus: 'approved',
          rating: 4.9,
          reviewCount: 42,
          isBloodDonor: false,
          bloodGroup: '',
          picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256'
        },
        {
          uid: 'lawyer_3',
          fullName: 'Barrister Bilal Shah',
          name: 'Barrister Bilal Shah',
          title: 'International Business Consultant',
          specialty: 'Corporate Law',
          specialties: ['Corporate Law', 'Property & Rent'],
          country: 'United Arab Emirates',
          city: 'Dubai',
          officeName: 'Shah Gulf Legal Advisory Group',
          officeAddress: 'Level 12, Executive Tower, Sheikh Zayed Road, Dubai',
          contactMobile: '+971 4 555 6789',
          phone: '+971 4 555 6789',
          contactWhatsapp: '+971 4 555 6789',
          whatsapp: '+971 4 555 6789',
          contactEmail: 'bilal@lawyeronline.live',
          email: 'bilal@lawyeronline.live',
          aboutMe: 'Handling corporate structures, multinational joint-venture agreements, property title disputes, and custom licensing processes.',
          about: 'Handling corporate structures, multinational joint-venture agreements, property title disputes, and custom licensing processes.',
          achievements: 'Acting lead advisor for technology entities and large-scale real estate portfolios across the Middle East.',
          isVerified: true,
          verificationStatus: 'approved',
          rating: 4.7,
          reviewCount: 29,
          isBloodDonor: false,
          bloodGroup: '',
          picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256'
        }
      ];
      for (const lawyer of lawyersList) {
        await lawyersRef.doc(lawyer.uid).set(lawyer);
      }
      console.log("Seeded 3 global lawyer profiles.");
    }

    const articlesRef = getDb().collection("articles");
    const articlesSnap = await articlesRef.get();
    
    // Seed articles if empty
    if (articlesSnap.empty) {
      console.log("Seeding articles info to database...");
      const articlesList = [
        {
          id: 'article_1',
          title: 'Global Guidelines on Custody Laws and Child Welfare',
          description: 'A comprehensive handbook outlining global best practices for guardianship disputes and children custody tribunals.',
          content: 'Child custody rules globally prioritize the absolute welfare of minors. Courts look at primary caretaker records, educational stability, emotional bonding, and financial resources rather than absolute historical parent rights. International treaties such as the Hague Convention also regulate cross-border child abduction situations, providing standardized legal frameworks for swift resolution.',
          author: 'Ayesha Malik, Solicitor',
          slug: 'global-child-custody-guideline',
          featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'article_2',
          title: 'Foundational Corporate Incorporation Guide',
          description: 'Understanding corporate licensing, stakeholder registry procedures, and brand protection compliance on an international stage.',
          content: 'Registering a limited liability entity is the most secure step for cross-border businesses. Ensure you file proper Articles of Incorporation with certified registry bodies. Define share asset allocations, execute explicit partnership deeds, protect trademarks via modern Intellectual Property registries, and establish verified corporate audit accounts to avoid cross-jurisdiction regulatory penalties.',
          author: 'Barrister Bilal Shah',
          slug: 'global-business-incorporation-guide',
          featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      for (const article of articlesList) {
        await articlesRef.doc(article.id).set(article);
      }
      console.log("Seeded 4 articles.");
    }
  } catch (error) {
    console.log("Database seeding finished or was run with fallback (this is normal if running in local container/offline environment):", error instanceof Error ? error.message : error);
  }
}

async function startServer() {
  const app = express();
  const distPath = path.join(process.cwd(), 'dist');
  // Safe port binding: In development/AI Studio preview, we must strictly bind to port 3000.
  // In production (Cloud Run / App Hosting), we honor process.env.PORT.
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Gemini Setup (lazy initialized to prevent startup crashes if key is missing)
  let _ai: any = null;
  function getAi() {
    if (!_ai) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      _ai = new GoogleGenAI({
        apiKey: apiKey || "MOCK_KEY_FOR_STARTUP",
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return _ai;
  }

  // API routes
  app.post("/api/qa/moderate-and-reply", async (req, res) => {
    const { title, description, category, clientName, clientId, country } = req.body;

    if (!title || !title.trim() || !description || !description.trim()) {
      return res.status(400).json({ error: "Title and description are required." });
    }

    try {
      console.log(`Analyzing Q&A community post: "${title.substring(0, 50)}..."`);

      const systemInstruction = `You are a high-performance content safety administrator and expert legal adviser for a professional digital legal platform.
Your task is to analyze legal Q&A submissions for:
1. Community Guidelines check:
   - Identify abusive words, hate speech, vulgarity, or insults (Urdu, English, Roman Urdu).
   - Identify scams, direct fraud, malicious links, phishing, or fake document offers.
   - Identify prostitution, escort, hookups, or inappropriate solicitation messaging (e.g., "night girl", "call girl", "body massage", "rabta krain" for non-legal/indecent reasons).
   - Identify financial beggary, emotional/monetary aid requests unrelated to seeking legal advice (e.g., "mere Bache Bhole Hain Mali madad help money kro", or general begging for money).
   - Identify non-legal advertisements, promotional spam.

2. If the submission violates guidelines OR is completely unrelated to legal matters:
   - Mark approved as false.
   - Provide a clear, polite explanation in English AND auto-translated Urdu as rejectionReason (e.g. "We detected content that violates our guidelines: foul language, spam, prostitution solicitation, or financial assistance begging requests are not allowed." / "ہمیں ایسی تحریر ملی ہے جو ہماری پالیسی کے خلاف ہے۔ گالی گلوچ، مالی امداد کی بھیک، جسم فروشی کے غیر اخلاقی اشتہارات یا غیر متعلقہ لنکس کی اجازت نہیں ہے۔")

3. If the submission is safe and represents a legitimate legal inquiry:
   - Mark approved as true.
   - Generate a comprehensive, highly-structured preliminary advice answer (autoAnswer) as the "AI Legal Assistant Bot". 
   - Ensure the answer format is extremely helpful, citing general legal steps, potential legal codes/remedies, and include an Urdu translation of the core advice so the inquirer always gets instant, valuable assistance right on the spot.
   - Keep it informative: divide into sections "Preliminary AI Analysis (ابتدائی تجزیہ)", "Key Steps (اہم اقدامات)", and "Urdu Summary (خلاصہ)".
   - Must be output in valid JSON matching the exact schema specified. Do not include markdown wraps or quotes. You must respond with the JSON object itself.`;

      const prompt = `Please moderate and respond to this user-submitted question.
Title: "${title}"
Description: "${description}"
Category: "${category || 'General Practice'}"`;

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              approved: {
                type: Type.BOOLEAN,
                description: "True if content is safe and legally-relevant; False if it violates guidelines or is unrelated spam/scams/prostitution/begging."
              },
              rejectionReason: {
                type: Type.STRING,
                description: "The explanation in both English and Urdu of why the post was rejected, or empty if approved."
              },
              autoAnswer: {
                type: Type.STRING,
                description: "A professional, extremely helpful legal reply as an instant draft, split into paragraphs. Should offer clear guidance. Empty if rejected."
              }
            },
            required: ["approved", "rejectionReason", "autoAnswer"]
          }
        }
      });

      const jsonText = response.text?.trim() || "{}";
      const result = JSON.parse(jsonText);

      if (result.approved) {
        // Create actual question in Firestore
        const qId = `question_${Date.now()}`;
        const newQuestion = {
          id: qId,
          title: title.trim(),
          description: description.trim(),
          clientId: clientId || 'anonymous',
          clientName: clientName || 'Anonymous Client',
          category: category || 'Family Law',
          country: country || undefined,
          createdAt: new Date().toISOString(),
          answersCount: 1, // Automatically includes the AI response page draft
          views: Math.floor(10 + Math.random() * 50),
          upvotes: 0,
          downvotes: 0
        };

        await getDb().collection("questions").doc(qId).set(newQuestion);

        // Save AI Auto-answer
        const ansId = `answer_ai_${Date.now()}`;
        const newAnswer = {
          id: ansId,
          questionId: qId,
          lawyerId: "ai_admin_bot",
          lawyerName: "AI Legal Assistant Bot (اے آئی اسسٹنٹ بوٹ)",
          lawyerTitle: "AI Admin Bot - Instant Legal Evaluation Draft",
          lawyerPicture: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128", 
          content: result.autoAnswer,
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0
        };

        await getDb().collection("answers").doc(ansId).set(newAnswer);

        // Save notification to lawyers about new question
        try {
          const notifId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const newNotif = {
            id: notifId,
            userId: "lawyers",
            title: "New Question: " + title.substring(0, 40) + (title.length > 40 ? "..." : ""),
            message: `${clientName || 'A client'} has posted a new question in the "${category || 'General'}" area: "${title.substring(0, 75)}...". Click here to read and answer!`,
            type: "question",
            createdAt: new Date().toISOString(),
            isRead: false,
            link: "/qa"
          };
          await getDb().collection("notifications").doc(notifId).set(newNotif);
        } catch (warnNotif) {
          console.warn("Could not handle notify for question:", warnNotif);
        }

        return res.json({
          success: true,
          approved: true,
          questionId: qId,
          message: "Legal question posted and preliminary AI guidance generated instantly!"
        });
      } else {
        return res.json({
          success: false,
          approved: false,
          rejectionReason: result.rejectionReason || "Opposing platform community protection guidelines. Post contains vulgarity, scams, prostitution solicitation, or other policy violations."
        });
      }

    } catch (error) {
      console.error("AI Moderation/Advisory failed:", error);
      res.status(500).json({ error: "Failed to process question via AI safety administrator." });
    }
  });

  app.post("/api/gemini/generate-article", async (req, res) => {
    const { topic } = req.body;
    try {
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a professional legal article about: ${topic}. Format it with Markdown headers and paragraphs. Keep it under 500 words.`,
      });
      res.json({ text: response.text || "No content generated." });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate article." });
    }
  });

  app.post("/api/gemini/generate-document", async (req, res) => {
    const { docType, details } = req.body;
    try {
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Draft a legal document of type: "${docType}". 
        Here are the specific details: "${details}".
        
        Ensure the language is formal, legally sound, and formatted correctly for a legal document. 
        Do not include placeholders, fill in the provided details.`,
      });
      res.json({ text: response.text || "No document generated." });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate document." });
    }
  });

  app.post("/api/gemini/generate-bio", async (req, res) => {
    const { fullName, title, experience, specialties, achievements } = req.body;
    try {
      const specText = Array.isArray(specialties) && specialties.length > 0 
        ? specialties.join(", ") 
        : "General Legal Practice";
      const prompt = `Write a professional, eye-catching, and SEO-optimized attorney biography/about-me description for:
      - Name: ${fullName}
      - Title: ${title || "Advocate"}
      - Experience: ${experience || "Experienced Lawyer"}
      - Specialties: ${specText}
      - Core Achievements: ${achievements || "Committed to delivering outstanding legal solutions."}
      
      Requirements:
      1. Write in clear, formal, and authoritative English that inspires trust in potential clients.
      2. Ensure it highlights relevant legal keywords naturally to improve search engine optimization (SEO) ranking.
      3. Focus on professionalism, accessibility, and depth of legal expertise.
      4. Avoid generic fluff or cliches; make it read authentic, highly polished, and convincing.
      5. Keep it to approximately 100 to 150 words. Write a single cohesive, high-impact paragraph. Do not include placeholders, template brackets, formatting headers, or markdown wrappers.`;

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text || "No bio generated." });
    } catch (error) {
      console.error("Gemini Bio Generation Error:", error);
      res.status(500).json({ error: "Failed to generate SEO biography with AI." });
    }
  });

  app.post("/api/gemini/translate", async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text || !text.trim()) {
      return res.json({ text: "" });
    }
    try {
      let prompt = "";
      if (targetLang && targetLang !== "Auto") {
        prompt = `Translate the following text into clear, polished, and legally appropriate ${targetLang}. 
        If the input text is already in ${targetLang}, translate it into standard, formal English. 
        Return ONLY the translation itself. Do not add comments, explanations, quotes, or conversational introductions like "Here is the translation:" — output the translated text directly:
        
        "${text}"`;
      } else {
        prompt = `You are a high-performance legal translator. Analyze the input text and detect its language. 
        If the input is in English, translate it into standard, easy-to-understand Urdu. 
        If it is in Roman Urdu, Urdu standard script, Arabic, Spanish, French, Hindi, or any other global language, translate it into polished, formal legal English. 
        Return ONLY the translation itself. Do not add comments, explanations, quotes, or conversational introductions — output the translated text directly:
        
        "${text}"`;
      }

      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text?.trim() || text });
    } catch (error) {
      console.error("Gemini Translation Error:", error);
      res.status(500).json({ error: "Failed to perform AI translation." });
    }
  });

  // Serve built client files in production, or mount Vite middleware in development
  let viteLoaded = false;
  if (!isProduction) {
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      viteLoaded = true;
      console.log("Vite dev server middleware mounted successfully.");
    } catch (viteError) {
      console.warn("Could not load Vite dev server middleware (falling back to production mode):", viteError);
      isProduction = true;
    }
  }

  if (isProduction || !viteLoaded) {
    app.use(express.static(distPath));
    // Correct catch-all pattern compatible with Express 5 / path-to-regexp 8.x
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Seed the database asynchronously after the server starts listening.
    // This prevents the Cloud Run container health checks from failing
    // if Firestore database operations hang or take time during startup.
    seedDatabase().catch((err) => {
      console.error("Async database seeding encountered an error:", err);
    });
  });
}

startServer();
