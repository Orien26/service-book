import { CalendarPlus } from 'lucide-react'

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL

export default function ScheduleButton() {
  if (!CALENDLY_URL) return null

  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="schedule-pulse fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-float transition-colors"
      title="Schedule a service appointment"
    >
      <CalendarPlus size={18} />
      <span className="hidden sm:block">Schedule Service</span>
    </a>
  )
}
