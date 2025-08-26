// Dimension Conversion Utility for BGG Service
// Converts imperial measurements to metric for European users

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(pounds: number): number {
  return Math.round(pounds * 0.453592 * 10) / 10
}

/**
 * Parse dimension string and convert to metric
 * Handles various formats: "12.5", "12.5 inches", "12.5 in", "12.5\""
 */
export function parseAndConvertDimension(dimensionStr: string): {
  imperial: string
  metric: string
  rawValue: number | null
} {
  if (!dimensionStr || dimensionStr.trim() === '') {
    return { imperial: '', metric: '', rawValue: null }
  }

  // Extract numeric value from string
  const numericMatch = dimensionStr.match(/(\d+(?:\.\d+)?)/)
  if (!numericMatch) {
    return { imperial: dimensionStr, metric: dimensionStr, rawValue: null }
  }

  const numericValue = parseFloat(numericMatch[1])
  if (isNaN(numericValue)) {
    return { imperial: dimensionStr, metric: dimensionStr, rawValue: null }
  }

  // Check if already in metric (cm, mm, m)
  if (dimensionStr.toLowerCase().includes('cm') || 
      dimensionStr.toLowerCase().includes('mm') || 
      dimensionStr.toLowerCase().includes('m')) {
    return { imperial: dimensionStr, metric: dimensionStr, rawValue: numericValue }
  }

  // Assume imperial (inches) and convert to metric
  const cmValue = inchesToCm(numericValue)
  
  return {
    imperial: `${numericValue}"`,
    metric: `${cmValue} cm`,
    rawValue: numericValue
  }
}

/**
 * Parse weight string and convert to metric
 * Handles various formats: "2.5", "2.5 lbs", "2.5 pounds", "2.5 lb"
 */
export function parseAndConvertWeight(weightStr: string): {
  imperial: string
  metric: string
  rawValue: number | null
} {
  if (!weightStr || weightStr.trim() === '') {
    return { imperial: '', metric: '', rawValue: null }
  }

  // Extract numeric value from string
  const numericMatch = weightStr.match(/(\d+(?:\.\d+)?)/)
  if (!numericMatch) {
    return { imperial: weightStr, metric: weightStr, rawValue: null }
  }

  const numericValue = parseFloat(numericMatch[1])
  if (isNaN(numericValue)) {
    return { imperial: weightStr, metric: weightStr, rawValue: null }
  }

  // Check if already in metric (kg, g)
  if (weightStr.toLowerCase().includes('kg') || 
      weightStr.toLowerCase().includes('g')) {
    return { imperial: weightStr, metric: weightStr, rawValue: numericValue }
  }

  // Assume imperial (pounds) and convert to metric
  const kgValue = lbsToKg(numericValue)
  
  return {
    imperial: `${numericValue} lbs`,
    metric: `${kgValue} kg`,
    rawValue: numericValue
  }
}

/**
 * Format dimensions for display
 */
export function formatDimensions(width: string, length: string, depth: string): {
  imperial: string
  metric: string
  hasDimensions: boolean
} {
  const widthData = parseAndConvertDimension(width)
  const lengthData = parseAndConvertDimension(length)
  const depthData = parseAndConvertDimension(depth)

  const hasDimensions = widthData.rawValue !== null || 
                       lengthData.rawValue !== null || 
                       depthData.rawValue !== null

  if (!hasDimensions) {
    return { imperial: '', metric: '', hasDimensions: false }
  }

  const imperialParts = []
  const metricParts = []

  if (widthData.rawValue !== null) {
    imperialParts.push(`W: ${widthData.imperial}`)
    metricParts.push(`W: ${widthData.metric}`)
  }
  if (lengthData.rawValue !== null) {
    imperialParts.push(`L: ${lengthData.imperial}`)
    metricParts.push(`L: ${lengthData.metric}`)
  }
  if (depthData.rawValue !== null) {
    imperialParts.push(`D: ${depthData.imperial}`)
    metricParts.push(`D: ${depthData.metric}`)
  }

  return {
    imperial: imperialParts.join(' × '),
    metric: metricParts.join(' × '),
    hasDimensions: true
  }
}

/**
 * Get user's preferred unit system
 * Can be extended to use user preferences or locale detection
 */
export function getUserPreferredUnit(): 'metric' | 'imperial' {
  // For now, default to metric for European users
  // This could be enhanced with user preferences or locale detection
  return 'metric'
}
