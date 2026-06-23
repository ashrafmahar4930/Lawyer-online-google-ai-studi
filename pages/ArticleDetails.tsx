
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getArticleBySlug } from '../services/mockDataService';
import { Article } from '../types';

export default function ArticleDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (slug) {
        const foundArticle = await getArticleBySlug(slug);
        setArticle(foundArticle);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  // Helper to parse simple markdown (Bold)
  const parseFormatting = (text: string) => {
    // Split by bold syntax **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-900">{part.substring(2, part.length - 2)}</strong>;
        }
        return part;
    });
  };

  // Render logic for headers and paragraphs
  const renderContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={idx} />;

        // H3 (### Heading)
        if (trimmed.startsWith('### ')) {
            return <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-slate-800">{parseFormatting(trimmed.substring(4))}</h3>;
        }
        // H2 (## Heading)
        if (trimmed.startsWith('## ')) {
            return <h2 key={idx} className="text-2xl font-bold mt-8 mb-4 text-slate-900 border-b pb-2">{parseFormatting(trimmed.substring(3))}</h2>;
        }
        // H1 (# Heading)
        if (trimmed.startsWith('# ')) {
            return <h1 key={idx} className="text-3xl font-bold mt-10 mb-5 text-slate-900">{parseFormatting(trimmed.substring(2))}</h1>;
        }
        // Bullet points (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             return <li key={idx} className="ml-6 list-disc mb-2 pl-2 marker:text-blue-500">{parseFormatting(trimmed.substring(2))}</li>
        }
        // Numbered lists (1. )
        if (/^\d+\.\s/.test(trimmed)) {
            const content = trimmed.replace(/^\d+\.\s/, '');
            return <li key={idx} className="ml-6 list-decimal mb-2 pl-2 marker:font-bold">{parseFormatting(content)}</li>
        }

        // Standard Paragraph
        return <p key={idx} className="mb-4 text-slate-700 leading-7">{parseFormatting(trimmed)}</p>;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Article Not Found</h2>
        <p className="text-slate-600 mb-8">Sorry, the article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">← Back to Home</Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description || article.title,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.date ? new Date(article.date).toISOString() : new Date().toISOString(),
    "image": article.featuredImage || `https://picsum.photos/800/600?random=${article.id}`
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Helmet>
        <title>{article.title} | lawyeronline.live Legal Insights</title>
        <meta name="description" content={article.description || article.title} />
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>
      
      <Link to="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center font-medium transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </Link>
      
      <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Featured Image */}
        <div className="w-full h-64 md:h-[400px] bg-slate-100 relative group">
             <img 
                src={article.featuredImage || `https://picsum.photos/800/600?random=${article.id}`} 
                alt={article.title} 
                className="w-full h-full object-cover transition duration-700"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/800/600?random=${article.id}`;
                }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
                  <div className="flex items-center space-x-4 mb-3 text-sm font-medium opacity-90">
                      <span className="bg-blue-600 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Legal Insight</span>
                      <span>{article.date}</span>
                      <span>&bull;</span>
                      <span>By {article.author}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold font-serif leading-tight drop-shadow-lg">{article.title}</h1>
             </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-12">
            <div className="prose prose-lg prose-slate max-w-none font-serif text-slate-800">
                 {renderContent(article.content)}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                <div className="italic">
                    Disclaimer: This article is for informational purposes only and does not constitute legal advice.
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center hover:text-blue-600 transition">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Share
                    </button>
                    <button className="flex items-center hover:text-blue-600 transition" onClick={() => window.print()}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                    </button>
                </div>
            </div>
        </div>
      </article>
    </div>
  );
}
