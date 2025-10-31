import { GoogleGenAI, Modality } from "@google/genai";
import type { FlyerOptions, CanvasFormat, FlyerType, StyleTheme } from '../types';

const getCanvasDimensions = (format: CanvasFormat): { width: number, height: number } => {
    switch (format) {
        case 'Instagram Post (Square 1080x1080)': return { width: 1080, height: 1080 };
        case 'Instagram Post (Portrait 1080x1350)': return { width: 1080, height: 1350 };
        case 'Instagram Story (1080x1920)': return { width: 1080, height: 1920 };
        case 'Landscape (1920x1080)': return { width: 1920, height: 1080 };
        case 'A4 Document (2480x3508)': return { width: 2480, height: 3508 };
        default: return { width: 1080, height: 1080 };
    }
}

const getStyleThemeDescription = (theme: StyleTheme): string => {
    switch (theme) {
        case 'Minimalist & Clean':
            return "Prioritize ample whitespace, a simple grid-based layout, sans-serif fonts (like Inter, Helvetica), and a limited color palette. Use thin lines and avoid heavy shadows, gradients, or complex shapes.";
        case 'Bold & Modern':
            return "Use strong, bold typography (heavy weights), vibrant colors from the palette, geometric shapes, and a dynamic, asymmetrical layout. High contrast is key. Feel free to use large font sizes.";
        case 'Elegant & Corporate':
            return "Employ a sophisticated and formal design. Use classic serif or clean sans-serif fonts, a structured and balanced layout, and use the provided colors in a refined, understated way. Aim for professionalism and clarity.";
        case 'Fun & Playful':
            return "Create a friendly and energetic design. Use rounded fonts, playful icons or shapes, bright colors, and a more informal or organic layout. The design should feel approachable and cheerful.";
        case 'AI Choice':
        default:
            return "You have creative freedom to choose the most appropriate and effective design style based on the flyer's content (type, topic, text) and purpose.";
    }
};

export const generateFlyerHtml = async (
  flyerOptions: FlyerOptions,
  hasLogo: boolean,
  hasSpeakerImage: boolean,
  hasBackgroundImage: boolean,
  hasQrCode: boolean,
  variationInstruction: string = ''
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { width, height } = getCanvasDimensions(flyerOptions.canvasFormat);
    const [title, subtitle, sup1, sup2] = flyerOptions.primaryText.split(';').map(s => s.trim());
    const detailsList = flyerOptions.detailsBlock.split('|').map(s => s.trim()).filter(s => s);

    const prompt = `
      You are an expert graphic designer creating professional event flyers using ONLY HTML and Tailwind CSS.

      **CRITICAL INSTRUCTIONS:**
      1.  **Output Format:** Respond with ONLY the raw HTML code for the flyer's content. Do NOT include \`<html>\`, \`<head>\`, \`<body>\`, or markdown fences like \`\`\`html.
      2.  **Styling:** Use ONLY Tailwind CSS classes. DO NOT use \`<style>\` blocks or inline \`style="..."\` attributes.
      3.  **Dimensions:** The root element must be a \`div\` with classes that ensure it fits the container perfectly: \`relative w-[${width}px] h-[${height}px] overflow-hidden\`. All content must be inside this div.
      4.  **Fonts:** Use common web-safe fonts. Emphasize text using Tailwind's font size (e.g., \`text-6xl\`, \`text-8xl\`) and weight utilities (e.g., \`font-bold\`).
      5.  **Text Handling:** Use the exact text provided by the user. Do not rewrite, alter, or add any text. Ensure all provided text is included.
      6.  **Image Placeholders:**
          *   Logo: If requested, use this exact placeholder in an \`<img>\` tag's src: \`[LOGO_IMAGE_URL]\`.
          *   Speaker/Promo Image: If requested, use this exact placeholder in an \`<img>\` tag's src: \`[SPEAKER_IMAGE_URL]\`.
          *   Background Image: If requested, use this exact placeholder in the \`style\` attribute of a background div: \`background-image: url('[BACKGROUND_IMAGE_URL]')\`.
          *   QR Code: If requested, use this exact placeholder in an \`<img>\` tag's src: \`[QR_CODE_IMAGE_URL]\`.

      **BRANDING & DESIGN RULES:**
      1.  **Art Direction / Style:** The design MUST adhere to a '${flyerOptions.styleTheme}' theme. ${getStyleThemeDescription(flyerOptions.styleTheme)}
      2.  **Color Palette:**
          *   Primary Color: \`${flyerOptions.primaryColor}\`
          *   Accent Color: \`${flyerOptions.accentColor}\`
          *   Use these colors creatively for text, shapes, backgrounds, and highlights.
      3.  **Background:**
          *   **If a background image is provided (\`hasBackgroundImage: true\`):**
              *   Create a \`div\` with \`absolute inset-0 bg-cover bg-center\` and the \`background-image\` style mentioned above.
              *   **CRITICAL:** Place a semi-transparent overlay on top of the image to ensure text is readable. Example: \`<div class="absolute inset-0 bg-black/50"></div>\`. The overlay color can also be a darkened version of the primary color.
              *   All text on top of the image must be light-colored (\`text-white\`, \`text-gray-200\`).
          *   **If NO background image, but a speaker image IS present:** Use a light/white background (\`bg-white\` or \`bg-gray-50\`) and use the Primary Color for text, borders, and shapes.
          *   **If NO background image and NO speaker image:** Use the Primary Color (\`bg-[${flyerOptions.primaryColor}]\`) as the main background. Text should be white (\`text-white\` or light gray), and highlights should use the Accent Color.

      **LAYOUT & CONTENT LOGIC:**
      1.  **Hierarchy:** The Title must be the most prominent element. The CTA should be a clear, clickable-looking button.
      2.  **Details Block & AI Icons:**
          *   Format the 'Details Block' items as a visually appealing list.
          *   **CRITICAL:** For each item (e.g., 'Date: [Date]'), you MUST generate a simple, modern, monochrome SVG icon that visually represents the detail (calendar for date, clock for time, pin for location, etc.).
          *   The SVG icon should be placed immediately before the text. Use these attributes for the SVG: \`width="24" height="24" class="inline-block mr-2 align-middle stroke-current"\` with other relevant SVG attributes like \`fill="none"\` and \`stroke-width="1.5"\`. Ensure the icon style is consistent and matches the overall theme.
          *   Do NOT use emojis.
      3.  **QR Code:**
          *   If a QR Code is requested (\`hasQrCode: true\`), place the \`[QR_CODE_IMAGE_URL]\` image in a sensible location, usually a bottom corner. Give it an appropriate size like \`w-24 h-24\` or \`w-32 h-32\` and add a small white border or padding (\`p-1 bg-white rounded-md\`) to ensure it's scannable on any background.

      **FLYER DETAILS:**
      - **Flyer Type:** ${flyerOptions.flyerType}
      - **Topic:** ${flyerOptions.topic}
      - **Style Theme:** ${flyerOptions.styleTheme}
      - **Primary Color:** ${flyerOptions.primaryColor}
      - **Accent Color:** ${flyerOptions.accentColor}
      - **Brand Name:** ${flyerOptions.brandName || 'Not provided'}
      - **Logo Requested:** ${hasLogo}
      - **Speaker Image Requested:** ${hasSpeakerImage}
      - **Background Image Requested:** ${hasBackgroundImage}
      - **QR Code Requested:** ${hasQrCode}
      - **Primary Text:** Title: ${title}, Subtitle: ${subtitle || ''}, Supporting: ${sup1 || ''}, ${sup2 || ''}
      - **Details Block Items:** ${detailsList.join(', ')}
      - **CTA Text:** ${flyerOptions.ctaText}
      ${variationInstruction ? `- **Variation Instruction:** ${variationInstruction}` : ''}

      Generate the HTML code now.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    let htmlContent = response.text.trim();
    if (htmlContent.startsWith('```html')) {
        htmlContent = htmlContent.substring(7);
    }
    if (htmlContent.endsWith('```')) {
        htmlContent = htmlContent.substring(0, htmlContent.length - 3);
    }

    return htmlContent.trim();
  } catch (error) {
    console.error("Error generating flyer HTML:", error);
    return `<div class="p-8 text-red-500 flex items-center justify-center h-full">Sorry, an error occurred while generating the flyer. Please check the console for details.</div>`;
  }
};

export const generateCopySuggestions = async (flyerType: FlyerType, topic: string): Promise<string[]> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        if (!topic.trim()) {
            throw new Error("Please provide a topic for the flyer to generate suggestions.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            You are a professional copywriter. Your task is to generate 3 catchy and concise 'Primary Text' options for a flyer.

            **Flyer Details:**
            - **Type:** ${flyerType}
            - **Topic:** ${topic}

            **CRITICAL INSTRUCTIONS:**
            1.  Generate exactly 3 distinct options.
            2.  Format EACH option as a single line with four parts separated by semicolons: \`Title;Subtitle;Supporting Line 1;Supporting Line 2\`.
            3.  Use the placeholder \`[Name]\` or \`[Detail]\` for specifics that you don't know.
            4.  Separate the 3 options from each other with \`---\`.
            5.  Do NOT add any other text, explanation, or markdown formatting.

            **Example Output:**
            Unlock Your Potential;A Masterclass on Public Speaking;With Expert [Name];Limited Seats Available
            ---
            Speak with Confidence;Transform Your Career in 90 Minutes;Learn from the Best;[Date] & [Time]
            ---
            The Art of Persuasion;Master Public Speaking Today;Hosted by [Your Brand];Register Now
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text.trim();
        return text.split('---').map(s => s.trim()).filter(s => s);

    } catch (error) {
        console.error("Error generating copy suggestions:", error);
        throw error;
    }
};

export const generateBackgroundImage = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image data found in the response.");
};


export const generateImagePromptSuggestion = async (topic: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        Based on the flyer topic "${topic}", generate one creative, concise, and visually descriptive prompt for an AI image generator to create a background image.
        The prompt should focus on abstract concepts, textures, or artistic styles rather than specific people or text.
        Do not add any explanation or preamble. Respond with only the prompt.
        
        Example for topic "AI & The Future of Design":
        Abstract network of glowing neural pathways and geometric shapes, dark blue and purple background
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
};
