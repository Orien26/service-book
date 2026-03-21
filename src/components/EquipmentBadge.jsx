const CONFIGS = {
  heat_pump:  { label: 'Heat Pump',  cls: 'equip-heat_pump' },
  oil_boiler: { label: 'Oil Boiler', cls: 'equip-oil_boiler' },
  gas_boiler: { label: 'Gas Boiler', cls: 'equip-gas_boiler' },
  other:      { label: 'Other',      cls: 'equip-other' },
}

export default function EquipmentBadge({ type }) {
  if (!type) return null
  const { label, cls } = CONFIGS[type] || CONFIGS.other
  return <span className={cls}>{label}</span>
}

export const EQUIPMENT_OPTIONS = [
  { value: 'heat_pump',  label: 'Heat Pump' },
  { value: 'oil_boiler', label: 'Oil Boiler' },
  { value: 'gas_boiler', label: 'Gas Boiler' },
  { value: 'other',      label: 'Other' },
]

export const EQUIPMENT_LABELS = {
  heat_pump:  'Heat Pump',
  oil_boiler: 'Oil Boiler',
  gas_boiler: 'Gas Boiler',
  other:      'Other',
}
