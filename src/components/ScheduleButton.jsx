import { useState } from 'react'
import { CalendarPlus, X } from 'lucide-react'

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL

export default function ScheduleButton() {
  const [open, setOpen] = useState(false)

  if (!CALENDLY_URL) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="schedule-pulse fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-float transition-colors"
        title="Schedule a service appointment"
      >
        <CalendarPlus size={18} />
        <span className="hidden sm:block">Schedule Service</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col overflow-hidden"
            style={{ height: 'min(700px, 92vh)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarPlus size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Schedule a Service</p>
                  <p className="text-xs text-slate-500">Pick a date and time that works for you</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Calendly iframe */}
            <iframe
              src={`${CALENDLY_URL}?embed_type=Inline&hide_gdpr_banner=1&primary_color=2563eb`}
              className="flex-1 w-full border-0"
              title="Schedule a service appointment"
            />
          </div>
        </div>
      )}
    </>
  )
}
