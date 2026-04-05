const CONFIGS = {
  heat_pump:  { label: 'Wärmepumpe',  cls: 'equip-heat_pump' },
  oil_boiler: { label: 'Ölheizung', cls: 'equip-oil_boiler' },
  gas_boiler: { label: 'Gasheizung', cls: 'equip-gas_boiler' },
  other:      { label: 'Sonstiges',      cls: 'equip-other' },
}

export default function EquipmentBadge({ type }) {
  if (!type) return null
  const { label, cls } = CONFIGS[type] || CONFIGS.other
  return <span className={cls}>{label}</span>
}

export const EQUIPMENT_OPTIONS = [
  { value: 'heat_pump',  label: 'Wärmepumpe' },
  { value: 'oil_boiler', label: 'Ölheizung' },
  { value: 'gas_boiler', label: 'Gasheizung' },
  { value: 'other',      label: 'Sonstiges' },
]

export const EQUIPMENT_LABELS = {
  heat_pump:  'Wärmepumpe',
  oil_boiler: 'Ölheizung',
  gas_boiler: 'Gasheizung',
  other:      'Sonstiges',
}
