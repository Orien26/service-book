import { Info } from 'lucide-react'

export default function HelpTip({ children }) {
  return (
    <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 leading-relaxed">
      <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  )
}
