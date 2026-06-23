
export const generateArticle = async (topic: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/generate-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await response.json();
    return data.text || "No content generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate article.";
  }
};

export const generateLegalDocument = async (docType: string, details: string): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/generate-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docType, details }),
    });
    const data = await response.json();
    return data.text || "No document generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate document.";
  }
};
