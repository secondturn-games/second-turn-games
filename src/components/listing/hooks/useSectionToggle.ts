import { useState } from 'react'
import type { ActiveSection } from '../types'

export function useSectionToggle() {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)
  const [showVersions, setShowVersions] = useState(false)
  const [showGameCondition, setShowGameCondition] = useState(false)
  const [showPrice, setShowPrice] = useState(false)
  const [showShipping, setShowShipping] = useState(false)

  const toggleSection = (section: 'versions' | 'condition' | 'price' | 'shipping') => {
    if (activeSection === section) {
      // If clicking the same section, close it
      setActiveSection(null)
      setShowVersions(false)
      setShowGameCondition(false)
      setShowPrice(false)
      setShowShipping(false)
    } else {
      // Close all sections first, then open the selected one
      setShowVersions(false)
      setShowGameCondition(false)
      setShowPrice(false)
      setShowShipping(false)
      
      setActiveSection(section)
      
      // Open the selected section
      switch (section) {
        case 'versions':
          setShowVersions(true)
          break
        case 'condition':
          setShowGameCondition(true)
          break
        case 'price':
          setShowPrice(true)
          break
        case 'shipping':
          setShowShipping(true)
          break
      }
    }
  }

  const closeAllSections = () => {
    setActiveSection(null)
    setShowVersions(false)
    setShowGameCondition(false)
    setShowPrice(false)
    setShowShipping(false)
  }

  return {
    activeSection,
    showVersions,
    showGameCondition,
    showPrice,
    showShipping,
    toggleSection,
    closeAllSections
  }
}


