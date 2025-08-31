/* eslint-disable @typescript-eslint/no-explicit-any */
// XML Parser for BGG Service
// Handles parsing BGG XML responses with focus on accurate type classification

import type { BGGAPISearchItem, BGGAPIMetadata, BGGGameVersion, LanguageMatchedVersion } from '../types'
import { formatDimensions, parseAndConvertWeight } from '../utils/dimensions'

/**
 * Parse XML string to JavaScript object
 */
export function parseXML(xmlText: string): any {
  if (!xmlText || typeof xmlText !== 'string') {
    console.error('❌ XML parser: Invalid input:', typeof xmlText, xmlText?.length)
    return null
  }

  try {
    // Use DOMParser for browser environments
    if (typeof DOMParser !== 'undefined') {
      console.log('🔍 Using DOMParser for XML parsing, input length:', xmlText.length)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName('parsererror')
      if (parseError.length > 0) {
        console.error('❌ XML parsing error:', parseError[0].textContent)
        console.error('❌ XML input preview:', xmlText.substring(0, 500))
        return null
      }
      
      // Log the raw XML structure for debugging
      console.log('🔍 Raw XML document structure:')
      console.log('📊 Root element:', xmlDoc.documentElement?.tagName || 'No root element')
      console.log('📊 Root attributes:', xmlDoc.documentElement ? Array.from(xmlDoc.documentElement.attributes).map(attr => `${attr.name}="${attr.value}"`) : 'No attributes')
      
      const result = xmlToObject(xmlDoc.documentElement)
      console.log('✅ XML parsing successful, result keys:', Object.keys(result || {}))
      return result
    } else {
      console.warn('⚠️ DOMParser not available, using fallback parser')
      return fallbackXMLParser(xmlText)
    }
  } catch (error) {
    console.error('❌ XML parsing failed:', error)
    console.error('❌ XML input preview:', xmlText.substring(0, 500))
    return null
  }
}

/**
 * Convert XML DOM element to JavaScript object
 */
function xmlToObject(element: Element): any {
  const result: any = {}
  
  // Handle attributes
  if (element.attributes.length > 0) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i]
      result[`@${attr.name}`] = attr.value
    }
  }
  
  // Handle child nodes
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i]
    
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim()
      if (text) {
        result.value = text
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element
      const childName = childElement.tagName
      const childData = xmlToObject(childElement)
      
      if (result[childName]) {
        // Convert to array if multiple elements with same name
        if (!Array.isArray(result[childName])) {
          result[childName] = [result[childName]]
        }
        result[childName].push(childData)
      } else {
        result[childName] = childData
      }
    }
  }
  
  return result
}

/**
 * Fallback XML parser for Node.js environments
 */
function fallbackXMLParser(xmlText: string): any {
  // Simple regex-based parser for basic XML structure
  const result: any = {}
  
  // Extract root element
  const rootMatch = xmlText.match(/<(\w+)[^>]*>([\s\S]*)<\/\1>/)
  if (rootMatch) {
    result[rootMatch[1]] = parseXMLContent(rootMatch[2])
  }
  
  return result
}

/**
 * Parse XML content recursively
 */
function parseXMLContent(content: string): any {
  const result: any = {}
  
  // Extract all elements
  const elementRegex = /<(\w+)([^>]*)>([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/\1>/g
  let match
  
  while ((match = elementRegex.exec(content)) !== null) {
    const tagName = match[1]
    const attributes = match[2]
    const innerContent = match[3]
    
    let elementData: any = {}
    
    // Parse attributes
    if (attributes) {
      const attrRegex = /(\w+)="([^"]*)"/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        elementData[`@${attrMatch[1]}`] = attrMatch[2]
      }
    }
    
    // Parse inner content
    if (innerContent && !innerContent.includes('<')) {
      elementData.value = innerContent.trim()
    } else if (innerContent) {
      elementData = parseXMLContent(innerContent)
    }
    
    // Handle multiple elements with same name
    if (result[tagName]) {
      if (!Array.isArray(result[tagName])) {
        result[tagName] = [result[tagName]]
      }
      result[tagName].push(elementData)
    } else {
      result[tagName] = elementData
    }
  }
  
  return result
}

/**
 * Extract search items from XML
 */
export function extractSearchItems(xmlText: string): BGGAPISearchItem[] {
  console.log('🔍 Parsing XML for search items:', xmlText.substring(0, 200) + '...')
  
  const parsed = parseXML(xmlText)
  console.log('📊 Parsed XML result:', parsed)
  console.log('📊 Parsed XML structure:', JSON.stringify(parsed, null, 2))
  
  // Check for items at the root level (since BGG returns <items> as root)
  let items = parsed?.item
  
  if (!items) {
    console.log('❌ No items found in parsed XML')
    console.log('❌ parsed:', parsed)
    console.log('❌ parsed.item:', parsed?.item)
    return []
  }
  
  // Ensure items is an array
  if (!Array.isArray(items)) {
    items = [items]
  }
  
  console.log('📋 Raw items found:', items.length)
  
  const result = items
    .filter((item: any) => item && (item.id || item['@id']) && item.name)
    .map((item: any) => {
      // Helper function to safely extract values from BGG XML structure
      const extractValue = (field: any): string => {
        if (!field) return ''
        if (typeof field === 'string') return field
        if (field.value) return String(field.value)
        if (field['@value']) return String(field['@value'])
        return ''
      }

      // Extract primary name properly
      let name = 'Unknown'
      if (item.name) {
        if (Array.isArray(item.name)) {
          // Find the primary name (type="primary")
          const primaryName = item.name.find((n: any) => n['@type'] === 'primary')
          if (primaryName) {
            name = String(primaryName['@value'] || primaryName.value || '')
          } else {
            // Fallback to first name with a value
            for (const n of item.name) {
              const value = n['@value'] || n.value
              if (value) {
                name = String(value)
                break
              }
            }
          }
        } else {
          // Single name object
          name = String(item.name['@value'] || item.name.value || item.name || 'Unknown')
        }
      }
      
      return {
        id: String(item.id || item['@id']),
        name,
        type: String(item.type || item['@type'] || 'boardgame'),
        yearpublished: extractValue(item.yearpublished)
      }
    })
  
  console.log('✅ Final search items:', result)
  return result
}

/**
 * Extract metadata from XML with enhanced type classification
 */
export function extractMetadata(xmlText: string): BGGAPIMetadata[] {
  console.log('🔍 extractMetadata called with XML length:', xmlText.length)
  
  const parsed = parseXML(xmlText)
  console.log('🔍 Parsed XML result:', parsed)
  
  // Log the raw XML structure for debugging
  console.log('🔍 Raw XML structure analysis:')
  if (parsed?.item) {
    const item = parsed.item
    console.log('📊 Item structure keys:', Object.keys(item))
    console.log('📊 Item link structure:', item.link ? {
      isArray: Array.isArray(item.link),
      length: Array.isArray(item.link) ? item.link.length : 1,
      sampleLink: Array.isArray(item.link) ? item.link[0] : item.link
    } : 'No links found')
    
    if (item.link && Array.isArray(item.link)) {
      console.log('📊 Link types found:', item.link.map((link: any) => link?.['@type'] || link?.type).filter(Boolean))
    }
  }
  
  // Check for items at the root level (since BGG returns <items> as root)
  let items = parsed?.item
  
  if (!items) {
    console.log('❌ No items found in parsed XML')
    console.log('❌ parsed:', parsed)
    console.log('❌ parsed.item:', parsed?.item)
    return []
  }
  
  // Ensure items is an array
  if (!Array.isArray(items)) {
    items = [items]
  }
  
  console.log('🔍 Items found:', items.length)
  
  const result = items
    .filter((item: any) => item && (item.id || item['@id']) && item.name && (item.type || item['@type']))
    .map((item: any) => {
      console.log('🔍 Processing item:', item)
      const metadata = extractBasicMetadata(item)
      console.log('🔍 Basic metadata:', metadata)
      const enhancedMetadata = enhanceWithInboundLinks(item, metadata)
      console.log('🔍 Enhanced metadata:', enhancedMetadata)
      return enhancedMetadata
    })
    .filter(Boolean) as BGGAPIMetadata[]
  
  console.log('🔍 Final metadata result:', result)
  return result
}

/**
 * Extract basic metadata from item
 */
function extractBasicMetadata(item: any): Partial<BGGAPIMetadata> {
  // Helper function to safely extract values from BGG XML structure
  const extractValue = (field: any): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    if (field.value) return String(field.value)
    if (field['@value']) return String(field['@value'])
    return ''
  }



  // Special handling for name field - find primary name
  const extractPrimaryName = (nameField: any): string => {
    if (!nameField) return ''
    
    if (Array.isArray(nameField)) {
      // Find the primary name (type="primary")
      const primaryName = nameField.find((n: any) => n['@type'] === 'primary')
      if (primaryName) {
        return extractValue(primaryName)
      }
      // Fallback to first name with a value
      for (const name of nameField) {
        const value = extractValue(name)
        if (value) return value
      }
    } else {
      return extractValue(nameField)
    }
    
    return ''
  }

  return {
    id: String(item.id || item['@id'] || ''),
    name: extractPrimaryName(item.name),
    type: String(item.type || item['@type'] || 'boardgame'),
    yearpublished: extractValue(item.yearpublished),
    rank: extractRank(item),
    bayesaverage: extractBayesAverage(item),
    average: extractAverage(item),
    thumbnail: extractValue(item.thumbnail),
    image: extractValue(item.image),
    alternateNames: extractAlternateNamesFromItem(item),
    minplayers: extractValue(item.minplayers),
    maxplayers: extractValue(item.maxplayers),
    playingtime: extractValue(item.playingtime),
    minage: extractValue(item.minage),
    description: extractValue(item.description),
    weight: extractWeight(item),
    mechanics: extractLinksFromItem(item, 'boardgamemechanic'),
    categories: extractLinksFromItem(item, 'boardgamecategory'),
    designers: extractLinksFromItem(item, 'boardgamedesigner'),
    versions: extractVersionsFromItem(item),
    hasInboundExpansionLink: false,
    inboundExpansionLinks: []
  }
}

/**
 * Enhance metadata with inbound link analysis for accurate type classification
 */
function enhanceWithInboundLinks(item: any, metadata: Partial<BGGAPIMetadata>): BGGAPIMetadata | null {
  if (!metadata.id || !metadata.name || !metadata.type) {
    return null
  }
  
  // Extract all inbound links
  const inboundLinks = extractInboundLinks(item)
  const hasInboundExpansion = inboundLinks.some(link => 
    link.type === 'boardgameexpansion' || link.type === 'boardgameintegration'
  )
  
  // Determine true type based on inbound link analysis
  let trueType = metadata.type as 'boardgame' | 'boardgameexpansion'
  
  if (hasInboundExpansion) {
    trueType = 'boardgameexpansion'
  } else if (metadata.type === 'boardgameexpansion') {
    // If BGG says it's an expansion but no inbound links, double-check
    trueType = 'boardgameexpansion'
  } else {
    trueType = 'boardgame'
  }
  
  return {
    ...metadata,
    type: trueType,
    hasInboundExpansionLink: hasInboundExpansion,
    inboundExpansionLinks: inboundLinks.filter(link => 
      link.type === 'boardgameexpansion' || link.type === 'boardgameintegration'
    )
  } as BGGAPIMetadata
}

/**
 * Extract inbound links for type classification
 */
function extractInboundLinks(item: any): Array<{ id: string; type: string; value: string }> {
  const links: Array<{ id: string; type: string; value: string }> = []
  
  if (!item.link) return links
  
  const linkElements = Array.isArray(item.link) ? item.link : [item.link]
  
  linkElements.forEach((link: any) => {
    if (link && link['@inbound'] === 'true') {
      links.push({
        id: String(link['@id'] || link.id || ''),
        type: String(link['@type'] || link.type || ''),
        value: String(link['@value'] || link.value || '')
      })
    }
  })
  
  return links
}

/**
 * Extract links from item object by type
 */
function extractLinksFromItem(item: any, type: string): string[] {
  const links: string[] = []
  
  if (!item.link) return links
  
  const linkElements = Array.isArray(item.link) ? item.link : [item.link]
  
  linkElements.forEach((link: any) => {
    if (link && (link['@type'] === type || link.type === type) && (link['@value'] || link.value)) {
      const linkValue = link['@value'] || link.value
      if (linkValue) {
        links.push(String(linkValue))
      }
    }
  })
  
  return [...new Set(links)] // Remove duplicates
}

/**
 * Extract versions from item object
 */
function extractVersionsFromItem(item: any): BGGGameVersion[] {
  console.log(`🔍 extractVersionsFromItem called with item:`, item)
  const versions: BGGGameVersion[] = []
  
  // Look for version elements within the game item
  if (item.versions?.item) {
    console.log(`✅ Found versions.item:`, item.versions.item)
    const versionElements = Array.isArray(item.versions.item) 
      ? item.versions.item 
      : [item.versions.item]
    
    console.log(`📊 Processing ${versionElements.length} version elements`)
    
    versionElements.forEach((versionItem: any, index: number) => {
      console.log(`🔍 Processing version ${index}:`, versionItem)
      if (versionItem && (versionItem.id || versionItem['@id'])) {
        console.log(`🔍 Version ${index} structure:`, {
          id: versionItem.id || versionItem['@id'],
          name: versionItem.name,
          yearpublished: versionItem.yearpublished,
          hasLinks: !!versionItem.link,
          linkCount: versionItem.link ? (Array.isArray(versionItem.link) ? versionItem.link.length : 1) : 0
        })
        
        // Log ALL available fields in this version item
        console.log(`📊 Version ${index} ALL fields:`, Object.keys(versionItem))
        console.log(`📊 Version ${index} FULL data:`, versionItem)
        
        // Deep dive into specific fields that should contain data
        console.log(`🔍 Version ${index} deep analysis:`)
        console.log(`  - name:`, versionItem.name)
        console.log(`  - publishers:`, versionItem.publishers)
        console.log(`  - languages:`, versionItem.languages)
        console.log(`  - productcode:`, versionItem.productcode)
        console.log(`  - thumbnail:`, versionItem.thumbnail)
        console.log(`  - image:`, versionItem.image)
        console.log(`  - link:`, versionItem.link ? `Array(${Array.isArray(versionItem.link) ? versionItem.link.length : 1})` : 'None')
        
        // Specifically look for language-related fields
        if (versionItem.link && Array.isArray(versionItem.link)) {
          const languageLinks = versionItem.link.filter((link: any) => 
            link?.['@type'] === 'language' || link?.type === 'language'
          )
          console.log(`🌐 Version ${index} language links:`, languageLinks)
          
          // Also check for publisher links
          const publisherLinks = versionItem.link.filter((link: any) => 
            link?.['@type'] === 'boardgamepublisher' || link?.type === 'boardgamepublisher'
          )
          console.log(`🏢 Version ${index} publisher links:`, publisherLinks)
        }
        
        const version = extractVersionData(versionItem)
        console.log(`✅ Extracted version ${index}:`, version)
        if (version) {
          versions.push(version)
        }
      } else {
        console.log(`❌ Version ${index} missing ID:`, versionItem)
      }
    })
  } else {
    console.log(`❌ No versions.item found in item`)
  }
  
  // Check for version links (this is how BGG typically stores versions)
  if (item.link) {
    console.log(`🔍 Checking for version links in item.link:`, item.link)
    const linkElements = Array.isArray(item.link) ? item.link : [item.link]
    
    console.log(`📊 Total link elements found:`, linkElements.length)
    
    linkElements.forEach((link: any, index: number) => {
      console.log(`🔍 Examining link ${index}:`, {
        type: link?.['@type'] || link?.type,
        id: link?.['@id'] || link?.id,
        value: link?.['@value'] || link?.value,
        inbound: link?.['@inbound'] || link?.inbound,
        fullLink: link
      })
      
      if (link && link['@type'] === 'boardgameversion' && (link['@id'] || link.id)) {
        console.log(`✅ Found version link:`, link)
        
        // Create a version entry from the link data
        const version: BGGGameVersion = {
          id: String(link['@id'] || link.id || ''),
          name: String(link['@value'] || link.value || 'Unknown Version'),
          yearpublished: '',
          publishers: [],
          languages: [],
          productcode: '',
          thumbnail: '',
          image: '',
          width: '',
          length: '',
          depth: '',
          weight: '',
          primaryLanguage: undefined,
          isMultilingual: false,
          languageCount: 0
        }
        versions.push(version)
      } else {
        console.log(`❌ Link ${index} is not a version link:`, {
          hasType: !!link?.['@type'] || !!link?.type,
          typeValue: link?.['@type'] || link?.type,
          isVersionType: (link?.['@type'] || link?.type) === 'boardgameversion',
          hasId: !!(link?.['@id'] || link?.id)
        })
      }
    })
  } else {
    console.log(`❌ No link elements found in item`)
  }
  
  console.log(`📊 Final versions array:`, versions)
  return versions
}

/**
 * Extract publishers from item object
 */
function extractPublishersFromItem(item: any): string[] {
  // First try direct publishers field
  if (item.publishers?.publisher) {
    const publishers = Array.isArray(item.publishers.publisher) 
      ? item.publishers.publisher 
      : [item.publishers.publisher]
    
    const directPublishers = publishers
      .filter((pub: any) => pub && (pub['@value'] || pub.value))
      .map((pub: any) => String(pub['@value'] || pub.value))
    
    if (directPublishers.length > 0) {
      return directPublishers
    }
  }
  
  // Fallback: look for publisher links
  if (item.link && Array.isArray(item.link)) {
    const publisherLinks = item.link
      .filter((link: any) => link?.['@type'] === 'boardgamepublisher' || link?.type === 'boardgamepublisher')
      .map((link: any) => String(link?.['@value'] || link?.value || ''))
      .filter(Boolean)
    
    if (publisherLinks.length > 0) {
      return publisherLinks
    }
  }
  
  return []
}

/**
 * Extract product code from item object
 * Note: This field is not used in the marketplace, so we return empty string
 */
function extractProductCode(_productcode: any): string {
  // Product code is not needed for marketplace functionality
  return ''
}

/**
 * Extract languages from item object
 */
function extractLanguagesFromItem(item: any): string[] {
  // First try direct languages field
  if (item.languages?.language) {
    const languages = Array.isArray(item.languages.language) 
      ? item.languages.language 
      : [item.languages.language]
    
    const directLanguages = languages
      .filter((lang: any) => lang && (lang['@value'] || lang.value))
      .map((lang: any) => String(lang['@value'] || lang.value))
    
    if (directLanguages.length > 0) {
      return directLanguages
    }
  }
  
  // Fallback: look for language links
  if (item.link && Array.isArray(item.link)) {
    const languageLinks = item.link
      .filter((link: any) => link?.['@type'] === 'language' || link?.type === 'language')
      .map((link: any) => String(link?.['@value'] || link?.value || ''))
      .filter(Boolean)
    
    if (languageLinks.length > 0) {
      return languageLinks
    }
  }
  
  return []
}

/**
 * Extract version data from item
 */
function extractVersionData(item: any): BGGGameVersion | null {
  if (!(item.id || item['@id']) || !(item.name || item.name?.value || item.name?.['@value'])) return null
  
  // Extract languages with better analysis
  const languages = extractLanguagesFromItem(item)
  const primaryLanguage = languages.length > 0 ? languages[0] : undefined
  const isMultilingual = languages.length > 1
  const languageCount = languages.length
  
  const width = String(item.width?.['@value'] || item.width?.value || item.width || '')
  const length = String(item.length?.['@value'] || item.length?.value || item.length || '')
  const depth = String(item.depth?.['@value'] || item.depth?.value || item.depth || '')
  const weight = String(item.weight?.['@value'] || item.weight?.value || item.weight || '')

  // Improved name extraction to handle various XML structures
  let versionName = 'Unknown'
  if (item.name) {
    if (typeof item.name === 'string') {
      versionName = item.name
    } else if (item.name['@value']) {
      versionName = String(item.name['@value'])
    } else if (item.name.value) {
      versionName = String(item.name.value)
    } else if (item.name['#text']) {
      versionName = String(item.name['#text'])
    } else if (Array.isArray(item.name)) {
      // Handle case where name is an array
      const firstValidName = item.name.find((n: any) => {
        if (typeof n === 'string') return true
        if (n && typeof n === 'object') {
          return n['@value'] || n.value || n['#text']
        }
        return false
      })
      if (firstValidName) {
        if (typeof firstValidName === 'string') {
          versionName = firstValidName
        } else {
          versionName = String(firstValidName['@value'] || firstValidName.value || firstValidName['#text'] || 'Unknown')
        }
      }
    }
  }

  return {
    id: String(item.id || item['@id'] || ''),
    name: versionName,
    yearpublished: String(item.yearpublished?.['@value'] || item.yearpublished?.value || item.yearpublished || ''),
    publishers: extractPublishersFromItem(item),
    languages,
    productcode: extractProductCode(item.productcode),
    thumbnail: String(item.thumbnail?.['@value'] || item.thumbnail?.value || item.thumbnail || ''),
    image: String(item.image?.['@value'] || item.image?.value || item.image || ''),
    width,
    length,
    depth,
    weight,
    // Enhanced language information
    primaryLanguage,
    isMultilingual,
    languageCount,
    // Enhanced dimension information
    dimensions: formatDimensions(width, length, depth),
    weightInfo: parseAndConvertWeight(weight)
  }
}

/**
 * Extract alternate names from item
 */
function extractAlternateNamesFromItem(item: any): string[] {
  if (!item.name) return []
  
  const names = Array.isArray(item.name) ? item.name : [item.name]
  const alternates: string[] = []
  
  names.forEach((name: any) => {
    if (name && name['@type'] === 'alternate' && (name['@value'] || name.value)) {
      const nameValue = name['@value'] || name.value
      if (nameValue) {
        alternates.push(String(nameValue))
      }
    }
  })
  
  return alternates
}

/**
 * Extract rank from item
 */
function extractRank(item: any): string | undefined {
  if (!item.statistics?.ratings?.ranks?.rank) return undefined
  
  const ranks = Array.isArray(item.statistics.ratings.ranks.rank) 
    ? item.statistics.ratings.ranks.rank 
    : [item.statistics.ratings.ranks.rank]
  
  const boardgameRank = ranks.find((r: any) => r['@name'] === 'boardgame' || r.name === 'boardgame')
  if (!boardgameRank) return undefined
  
  const rankValue = boardgameRank['@value'] || boardgameRank.value
  return rankValue === 'Not Ranked' ? undefined : String(rankValue || '')
}

/**
 * Extract Bayes average from item
 */
function extractBayesAverage(item: any): string | undefined {
  const value = item.statistics?.ratings?.bayesaverage?.['@value'] || item.statistics?.ratings?.bayesaverage?.value
  return value ? String(value) : undefined
}

/**
 * Extract average rating from item
 */
function extractAverage(item: any): string | undefined {
  const value = item.statistics?.ratings?.average?.['@value'] || item.statistics?.ratings?.average?.value
  return value ? String(value) : undefined
}

/**
 * Extract weight from item
 */
function extractWeight(item: any): string | undefined {
  const value = item.statistics?.ratings?.averageweight?.['@value'] || item.statistics?.ratings?.averageweight?.value
  return value ? String(value) : undefined
}

/**
 * Validate XML structure
 */
export function validateXML(xmlText: string): boolean {
  if (!xmlText || typeof xmlText !== 'string') {
    return false
  }
  
  const trimmed = xmlText.trim()
  
  // Check for basic XML structure
  if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<')) {
    return false
  }
  
  // Check for opening and closing tags
  const hasOpeningTag = /<[^>]+>/.test(trimmed)
  const hasClosingTag = /<\/[^>]+>/.test(trimmed)
  
  return hasOpeningTag && hasClosingTag
}

/**
 * Clean XML text for parsing
 */
export function cleanXML(xmlText: string): string {
  if (!xmlText) return ''
  
  return xmlText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;') // Fix unescaped ampersands
    .trim()
}



/**
 * Smart language matching for versions and alternate names
 */
export function matchLanguageToAlternateName(
  version: BGGGameVersion,
  alternateNames: string[],
  primaryGameName?: string,
  totalVersions: number = 1
): LanguageMatchedVersion {
  const result: LanguageMatchedVersion = {
    version,
    languageMatch: 'none',
    confidence: 0,
    reasoning: 'No language match found'
  }

  // If only one version available, use primary game name directly
  if (totalVersions === 1) {
    if (primaryGameName) {
      result.suggestedAlternateName = primaryGameName
      result.languageMatch = 'none'
      result.confidence = 0.1
      result.reasoning = 'Single version - using primary game name'
      return result
    }
  }

  if (!version.primaryLanguage || alternateNames.length === 0) {
    // If no language info, suggest primary game name
    if (primaryGameName) {
      result.suggestedAlternateName = primaryGameName
      result.languageMatch = 'none'
      result.confidence = 0.1
      result.reasoning = 'Fallback to primary game name (no language info)'
    }
    return result
  }

  // Special handling for English versions - always use primary game name
  if (version.primaryLanguage === 'English') {
    if (primaryGameName) {
      result.suggestedAlternateName = primaryGameName
      result.languageMatch = 'none'
      result.confidence = 0.1
      result.reasoning = 'English version - using primary game name'
      return result
    }
  }

  // Try to find exact language matches
  const exactMatches = findExactLanguageMatches(version, alternateNames)
  if (exactMatches.length > 0) {
    const bestMatch = exactMatches[0]
    
    // If confidence is below 85%, use primary game name instead
    if (bestMatch.confidence < 0.85) {
      if (primaryGameName) {
        result.suggestedAlternateName = primaryGameName
        result.languageMatch = 'none'
        result.confidence = 0.1
        result.reasoning = `Low confidence match (${(bestMatch.confidence * 100).toFixed(0)}%) - using primary game name`
        return result
      }
    }
    
    result.suggestedAlternateName = bestMatch.name
    result.languageMatch = 'exact'
    result.confidence = bestMatch.confidence
    result.reasoning = `Exact ${version.primaryLanguage} language match found`
    return result
  }

  // Try partial matches (e.g., multilingual versions)
  const partialMatches = findPartialLanguageMatches(version, alternateNames)
  if (partialMatches.length > 0) {
    const bestPartialMatch = partialMatches[0]
    
    // If confidence is below 85%, use primary game name instead
    if (bestPartialMatch.confidence < 0.85) {
      if (primaryGameName) {
        result.suggestedAlternateName = primaryGameName
        result.languageMatch = 'none'
        result.confidence = 0.1
        result.reasoning = `Low confidence partial match (${(bestPartialMatch.confidence * 100).toFixed(0)}%) - using primary game name`
        return result
      }
    }
    
    result.suggestedAlternateName = bestPartialMatch.name
    result.languageMatch = 'partial'
    result.confidence = bestPartialMatch.confidence
    result.reasoning = `Partial language match in ${version.primaryLanguage} version`
    return result
  }

  // Fallback: use primary game name instead of first alternate name
  if (primaryGameName) {
    result.suggestedAlternateName = primaryGameName
    result.languageMatch = 'none'
    result.confidence = 0.1
    result.reasoning = 'Fallback to primary game name (no language match)'
  } else if (alternateNames.length > 0) {
    // Only use alternate names if no primary name available
    result.suggestedAlternateName = alternateNames[0]
    result.languageMatch = 'none'
    result.confidence = 0.05
    result.reasoning = 'Fallback to first alternate name (no primary name available)'
  }

  return result
 }

/**
 * Find exact language matches between version and alternate names
 */
function findExactLanguageMatches(
  version: BGGGameVersion,
  alternateNames: string[]
): Array<{ name: string; confidence: number }> {
  const matches: Array<{ name: string; confidence: number }> = []
  
  // This is a simplified version - in practice, we'd use more sophisticated
  // language detection based on BGG's explicit language tags
  for (const name of alternateNames) {
    let confidence = 0
    
    // Check if name contains language-specific characters or patterns
    if (version.primaryLanguage === 'German' && containsGermanCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'French' && containsFrenchCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Spanish' && containsSpanishCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'English' && isEnglishName(name)) {
      confidence = 0.8
    } else if (version.primaryLanguage === 'Chinese' && containsChineseCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Japanese' && containsJapaneseCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Korean' && containsKoreanCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Latvian' && containsLatvianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Lithuanian' && containsLithuanianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Estonian' && containsEstonianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Russian' && containsRussianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Bulgarian' && containsBulgarianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Ukrainian' && containsUkrainianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Italian' && containsItalianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Portuguese' && containsPortugueseCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Dutch' && containsDutchCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Swedish' && containsSwedishCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Norwegian' && containsNorwegianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Danish' && containsDanishCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Polish' && containsPolishCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Czech' && containsCzechCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Slovak' && containsSlovakCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Hungarian' && containsHungarianCharacters(name)) {
      confidence = 0.9
    } else if (version.primaryLanguage === 'Romanian' && containsRomanianCharacters(name)) {
      confidence = 0.9
    }
    
    if (confidence > 0) {
      matches.push({ name, confidence })
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Find partial language matches (e.g., multilingual versions)
 */
function findPartialLanguageMatches(
  version: BGGGameVersion,
  alternateNames: string[]
): Array<{ name: string; confidence: number }> {
  if (!version.isMultilingual) return []
  
  const matches: Array<{ name: string; confidence: number }> = []
  
  for (const name of alternateNames) {
    // For multilingual versions, we can be less strict
    let confidence = 0.3 // Base confidence for multilingual
    
    // Boost confidence if name seems to match any of the version languages
    if (version.languages.some(lang => name.toLowerCase().includes(lang.toLowerCase()))) {
      confidence += 0.2
    }
    
    if (confidence > 0) {
      matches.push({ name, confidence })
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Simple language detection helpers
 */
function containsGermanCharacters(text: string): boolean {
  return /[äöüßÄÖÜ]/.test(text)
}

function containsFrenchCharacters(text: string): boolean {
  return /[àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/.test(text)
}

function containsSpanishCharacters(text: string): boolean {
  return /[áéíóúñüÁÉÍÓÚÑÜ]/.test(text)
}

function containsChineseCharacters(text: string): boolean {
  // Chinese characters (Simplified and Traditional)
  return /[\u4e00-\u9fff]/.test(text)
}

function containsJapaneseCharacters(text: string): boolean {
  // Japanese characters (Hiragana, Katakana, and Kanji)
  return /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(text)
}

function containsKoreanCharacters(text: string): boolean {
  // Korean characters (Hangul)
  return /[\uac00-\ud7af]/.test(text)
}

function containsLatvianCharacters(text: string): boolean {
  // Latvian characters (ā, ē, ī, ū, ķ, ļ, ņ, ģ, š, ž, č)
  return /[āēīūķļņģšžčĀĒĪŪĶĻŅĢŠŽČ]/.test(text)
}

function containsLithuanianCharacters(text: string): boolean {
  // Lithuanian characters (ą, ę, į, ų, ū, č, š, ž)
  return /[ąęįųūčšžĄĘĮŲŪČŠŽ]/.test(text)
}

function containsEstonianCharacters(text: string): boolean {
  // Estonian characters (ä, ö, ü, õ, š, ž)
  return /[äöüõšžÄÖÜÕŠŽ]/.test(text)
}

function containsRussianCharacters(text: string): boolean {
  // Russian characters (Cyrillic script)
  return /[\u0400-\u04FF]/.test(text)
}

function containsBulgarianCharacters(text: string): boolean {
  // Bulgarian characters (Cyrillic script, similar to Russian but with some unique letters)
  return /[\u0400-\u04FF]/.test(text)
}

function containsUkrainianCharacters(text: string): boolean {
  // Ukrainian characters (Cyrillic script, similar to Russian but with some unique letters)
  return /[\u0400-\u04FF]/.test(text)
}

function containsItalianCharacters(text: string): boolean {
  // Italian characters (à, è, é, ì, ò, ù)
  return /[àèéìòùÀÈÉÌÒÙ]/.test(text)
}

function containsPortugueseCharacters(text: string): boolean {
  // Portuguese characters (ã, õ, ç, á, é, í, ó, ú)
  return /[ãõçáéíóúÃÕÇÁÉÍÓÚ]/.test(text)
}

function containsDutchCharacters(text: string): boolean {
  // Dutch characters (ij, ë, ï)
  return /[ëïËÏ]/.test(text) || /ij|IJ/.test(text)
}

function containsSwedishCharacters(text: string): boolean {
  // Swedish characters (å, ä, ö)
  return /[åäöÅÄÖ]/.test(text)
}

function containsNorwegianCharacters(text: string): boolean {
  // Norwegian characters (å, æ, ø)
  return /[åæøÅÆØ]/.test(text)
}

function containsDanishCharacters(text: string): boolean {
  // Danish characters (å, æ, ø)
  return /[åæøÅÆØ]/.test(text)
}

function containsPolishCharacters(text: string): boolean {
  // Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)
  return /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)
}

function containsCzechCharacters(text: string): boolean {
  // Czech characters (á, č, ď, é, ě, í, ň, ó, ř, š, ť, ú, ů, ý, ž)
  return /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(text)
}

function containsSlovakCharacters(text: string): boolean {
  // Slovak characters (á, ä, č, ď, é, í, ĺ, ľ, ň, ó, ô, ŕ, š, ť, ú, ý, ž)
  return /[áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/.test(text)
}

function containsHungarianCharacters(text: string): boolean {
  // Hungarian characters (á, é, í, ó, ö, ő, ú, ü, ű)
  return /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(text)
}

function containsRomanianCharacters(text: string): boolean {
  // Romanian characters (ă, â, î, ș, ț)
  return /[ăâîșțĂÂÎȘȚ]/.test(text)
}

function isEnglishName(text: string): boolean {
  // Simple heuristic: English names typically don't have special characters
  // and are usually shorter than translations
  return !/[àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇäöüßÄÖÜáéíóúñüÁÉÍÓÚÑÜ\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7afāēīūķļņģšžčĀĒĪŪĶĻŅĢŠŽČąęįųūčšžĄĘĮŲŪČŠŽäöüõšžÄÖÜÕŠŽ\u0400-\u04FFăâîșțĂÂÎȘȚáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáéíóöőúüűÁÉÍÓÖŐÚÜŰåæøÅÆØãõçÃÕÇëïËÏ]/.test(text) && text.length < 30
}
