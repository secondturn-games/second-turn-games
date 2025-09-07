import { 
  Lock, 
  PackageCheck, 
  Box, 
  AlertTriangle, 
  CheckCircle, 
  Gift,
  Camera,
  PackageX
} from 'lucide-react'

export const BOX_CONDITIONS = [
  { id: 'new', icon: Lock, title: 'New', description: 'Still in shrink wrap' },
  { id: 'like-new', icon: PackageCheck, title: 'Like New', description: 'No visible wear' },
  { id: 'lightly-worn', icon: Box, title: 'Lightly Worn', description: 'Small scuffs or corner wear' },
  { id: 'damaged', icon: PackageX, title: 'Damaged', description: 'Tears, dents, or water damage' }
]

export const COMPLETENESS_OPTIONS = [
  { id: 'complete', icon: CheckCircle, title: 'Complete', description: 'All components present' },
  { id: 'incomplete', icon: AlertTriangle, title: 'Incomplete', description: 'Missing some components' }
]

export const COMPONENT_CONDITIONS = [
  { id: 'like-new', icon: CheckCircle, title: 'Like New', description: 'No visible wear' },
  { id: 'lightly-used', icon: PackageCheck, title: 'Lightly Used', description: 'Minor wear from play' },
  { id: 'well-played', icon: Box, title: 'Well Played', description: 'Visible wear but functional' },
  { id: 'damaged', icon: AlertTriangle, title: 'Damaged', description: 'Significant wear or damage' }
]


export const EXTRAS_OPTIONS = [
  'Card sleeves',
  'Upgraded components',
  'Custom insert',
  'Playmat',
  'Painted miniatures',
  'Promos'
]

export const CONDITION_FILTERS = [
  { id: 'box', label: 'Box', icon: Box },
  { id: 'components', label: 'Components', icon: PackageCheck },
  { id: 'extras', label: 'Extras', icon: Gift },
  { id: 'photos', label: 'Photos', icon: Camera }
]

export const SHIPPING_COUNTRIES = ['Estonia', 'Latvia', 'Lithuania']

export const GAME_TYPES = [
  { id: 'base-game', label: 'Base Game' },
  { id: 'expansion', label: 'Expansion' }
]


