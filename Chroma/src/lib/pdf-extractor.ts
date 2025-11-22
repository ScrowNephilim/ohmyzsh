/**
 * PDF Text Extraction Utility
 * Uses PDF.js to extract text content from uploaded PDF files
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
  };
}

/**
 * Extract text content from a PDF file URL
 */
export async function extractTextFromPDF(fileUrl: string): Promise<PDFExtractionResult> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    
    const pageCount = pdf.numPages;
    const textPages: string[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      
      if (pageText) {
        textPages.push(`\n--- Page ${pageNum} ---\n${pageText}`);
      }
    }
    
    // Get PDF metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any;
    
    return {
      text: textPages.join('\n\n'),
      pageCount,
      metadata: {
        title: info?.Title,
        author: info?.Author,
        subject: info?.Subject,
        creator: info?.Creator,
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a File object (browser upload)
 */
export async function extractTextFromFile(file: File): Promise<PDFExtractionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const pageCount = pdf.numPages;
        const textPages: string[] = [];
        
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          
          if (pageText) {
            textPages.push(`\n--- Page ${pageNum} ---\n${pageText}`);
          }
        }
        
        const metadata = await pdf.getMetadata();
        const info = metadata.info as any;
        
        resolve({
          text: textPages.join('\n\n'),
          pageCount,
          metadata: {
            title: info?.Title,
            author: info?.Author,
            subject: info?.Subject,
            creator: info?.Creator,
          },
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Calculate token count estimate (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate word count
 */
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Get character count
 */
export function getCharCount(text: string): number {
  return text.length;
}
