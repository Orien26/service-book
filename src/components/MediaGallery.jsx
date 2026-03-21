import { useEffect, useState } from 'react'
import { EyeOff, FileText, ZoomIn, X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { getSignedUrl } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function MediaGallery({ media, onHide }) {
  const { isAdmin } = useAuth()
  const [urls, setUrls] = useState({})
  const [lightbox, setLightbox] = useState(null) // { index, url }

  const visible = media.filter(m => !m.is_hidden || isAdmin)

  useEffect(() => {
    async function loadUrls() {
      const result = {}
      for (const item of media) {
        if (!item.is_hidden) {
          try { result[item.id] = await getSignedUrl(item.storage_path) } catch (_) {}
        }
      }
      setUrls(result)
    }
    if (media.length) loadUrls()
  }, [media])

  if (!media.length) {
    return (
      <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-slate-200">
        <p className="text-sm text-slate-400">No files uploaded yet</p>
      </div>
    )
  }

  const imageItems = visible.filter(m => !m.file_name?.toLowerCase().endsWith('.pdf') && !m.is_hidden)

  function openLightbox(item) {
    const index = imageItems.findIndex(m => m.id === item.id)
    setLightbox({ index, url: urls[item.id] })
  }

  function prevImage() {
    setLightbox(lb => {
      const next = (lb.index - 1 + imageItems.length) % imageItems.length
      return { index: next, url: urls[imageItems[next].id] }
    })
  }

  function nextImage() {
    setLightbox(lb => {
      const next = (lb.index + 1) % imageItems.length
      return { index: next, url: urls[imageItems[next].id] }
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((item) => (
          <div key={item.id} className="relative group">
            {item.is_hidden ? (
              // Hidden item — admins still see a placeholder
              <div className="aspect-square rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 p-3">
                <EyeOff size={20} className="text-slate-400" />
                <p className="text-xs text-slate-500 text-center leading-snug">
                  Hidden{item.hidden_reason && <span className="block text-slate-400 mt-0.5">{item.hidden_reason}</span>}
                </p>
              </div>
            ) : item.file_name?.toLowerCase().endsWith('.pdf') ? (
              // PDF
              <a
                href={urls[item.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 hover:border-blue-300 flex flex-col items-center justify-center gap-2 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText size={22} className="text-blue-600" />
                </div>
                <span className="text-xs text-slate-600 text-center px-2 line-clamp-2 leading-snug font-medium">
                  {item.file_name}
                </span>
                <Download size={13} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </a>
            ) : (
              // Image
              <div
                className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in relative"
                onClick={() => openLightbox(item)}
              >
                {urls[item.id] ? (
                  <img
                    src={urls[item.id]}
                    alt={item.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center rounded-xl">
                  <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </div>
            )}

            {/* Admin hide button */}
            {isAdmin && !item.is_hidden && onHide && (
              <button
                onClick={(e) => { e.stopPropagation(); onHide(item) }}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 border border-slate-200"
                title="Hide this file from client"
              >
                <EyeOff size={13} className="text-slate-500 hover:text-red-600" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          {imageItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <img
            src={lightbox.url}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {imageItems.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Counter */}
          {imageItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-xs font-medium">
              {lightbox.index + 1} / {imageItems.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
