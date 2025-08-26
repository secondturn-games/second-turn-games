/* eslint-disable @typescript-eslint/no-explicit-any */
// Image OCR Utility for BGG Service
// Helps extract text from version images to improve alternate name matching

/**
 * Extract text from image using browser's built-in OCR capabilities
 * This uses the experimental Shape Detection API when available
 */
export async function extractTextFromImage(imageUrl: string): Promise<string | null> {
  try {
    // Check if Shape Detection API is available (Chrome/Edge)
    if ('TextDetector' in window) {
      return await extractTextWithShapeDetection(imageUrl)
    }
    
    // Fallback: try to use Tesseract.js if available
    if (typeof window !== 'undefined' && (window as any).Tesseract) {
      return await extractTextWithTesseract(imageUrl)
    }
    
    // Final fallback: manual image analysis hints
    return await extractTextWithImageAnalysis(imageUrl)
    
  } catch (error) {
    console.warn('Image OCR failed:', error)
    return null
  }
}

/**
 * Use browser's built-in Shape Detection API for text extraction
 */
async function extractTextWithShapeDetection(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    // Create image element
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          // Use TextDetector API
          const textDetector = new (window as any).TextDetector()
          const textRegions = await textDetector.detect(canvas)
          
          if (textRegions && textRegions.length > 0) {
            const extractedText = textRegions
              .map((region: any) => region.rawValue)
              .join(' ')
              .trim()
            
            console.log('🔍 Shape Detection OCR result:', extractedText)
            resolve(extractedText)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.warn('Shape Detection failed:', error)
          resolve(null)
        }
      }
      
      img.src = URL.createObjectURL(blob)
    })
    
  } catch (error) {
    console.warn('Shape Detection setup failed:', error)
    return null
  }
}

/**
 * Use Tesseract.js for text extraction (if available)
 */
async function extractTextWithTesseract(imageUrl: string): Promise<string | null> {
  try {
    const Tesseract = (window as any).Tesseract
    const result = await Tesseract.recognize(imageUrl, 'eng+fra+deu+spa+ita+por+rus+ukr+pol+cze+slk+hun+rom+bul+swe+nor+dan+lat+lit+est', {
      logger: (m: any) => console.log('🔍 Tesseract:', m)
    })
    
    const extractedText = result.data.text.trim()
    console.log('🔍 Tesseract OCR result:', extractedText)
    return extractedText || null
    
  } catch (error) {
    console.warn('Tesseract OCR failed:', error)
    return null
  }
}

/**
 * Manual image analysis - provide hints based on image characteristics
 */
async function extractTextWithImageAnalysis(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        // Analyze image dimensions and characteristics
        const analysis = {
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          hasText: img.width > 200 && img.height > 100, // Likely contains text
          isBoxArt: img.width > 300 && img.height > 400, // Typical box art dimensions
          isCardArt: Math.abs(img.width / img.height - 1.4) < 0.1 // Card-like proportions
        }
        
        console.log('🔍 Image analysis:', analysis)
        
        // Provide hints based on analysis
        if (analysis.hasText) {
          const hints = [
            'Image likely contains game title text',
            'Consider manual text extraction',
            'Check for clear, high-contrast text areas'
          ]
          console.log('🔍 OCR hints:', hints)
        }
        
        resolve(null) // Manual analysis doesn't extract text
      }
      
      img.src = URL.createObjectURL(blob)
    })
    
  } catch (error) {
    console.warn('Image analysis failed:', error)
    return null
  }
}

/**
 * Enhanced language matching using OCR results
 */
export function enhanceLanguageMatchingWithOCR(
  version: any,
  alternateNames: string[],
  ocrText: string | null
): { enhancedNames: string[], confidence: number, reasoning: string } {
  if (!ocrText) {
    return {
      enhancedNames: alternateNames,
      confidence: 0,
      reasoning: 'No OCR text available'
    }
  }
  
  // Clean OCR text
  const cleanOcrText = ocrText
    .replace(/[^\w\s\u0400-\u04FF\u00C0-\u017F]/g, '') // Keep letters, spaces, and European characters
    .trim()
    .toLowerCase()
  
  console.log('🔍 Cleaned OCR text:', cleanOcrText)
  
  // Find exact matches with OCR text
  const exactMatches = alternateNames.filter(name => 
    cleanOcrText.includes(name.toLowerCase()) || 
    name.toLowerCase().includes(cleanOcrText)
  )
  
  if (exactMatches.length > 0) {
    return {
      enhancedNames: exactMatches,
      confidence: 0.95,
      reasoning: `OCR text "${cleanOcrText}" exactly matches alternate names`
    }
  }
  
  // Find partial matches
  const partialMatches = alternateNames.filter(name => {
    const nameWords = name.toLowerCase().split(/\s+/)
    const ocrWords = cleanOcrText.split(/\s+/)
    
    return nameWords.some(word => 
      word.length > 3 && ocrWords.some(ocrWord => 
        ocrWord.length > 3 && (
          ocrWord.includes(word) || word.includes(ocrWord)
        )
      )
    )
  })
  
  if (partialMatches.length > 0) {
    return {
      enhancedNames: partialMatches,
      confidence: 0.8,
      reasoning: `OCR text "${cleanOcrText}" partially matches alternate names`
    }
  }
  
  // No matches found
  return {
    enhancedNames: alternateNames,
    confidence: 0.1,
    reasoning: `OCR text "${cleanOcrText}" doesn't match any alternate names`
  }
}

/**
 * Check if OCR is available in the current environment
 */
export function isOCRAvailable(): boolean {
  return (
    'TextDetector' in window ||
    (typeof window !== 'undefined' && !!(window as any).Tesseract)
  )
}

/**
 * Get OCR method recommendations
 */
export function getOCRRecommendations(): string[] {
  const recommendations = []
  
  if ('TextDetector' in window) {
    recommendations.push('✅ Shape Detection API available (Chrome/Edge)')
  } else {
    recommendations.push('⚠️ Shape Detection API not available')
  }
  
  if (typeof window !== 'undefined' && (window as any).Tesseract) {
    recommendations.push('✅ Tesseract.js available')
  } else {
    recommendations.push('💡 Consider adding Tesseract.js for better OCR support')
  }
  
  recommendations.push('💡 Manual text extraction always works as fallback')
  
  return recommendations
}
