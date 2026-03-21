import { useState, useRef } from 'react'
import { Upload, FileText, Image, CheckCircle } from 'lucide-react'
import { uploadFile, logAction } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function MediaUpload({ jobId, mediaType, onUploaded }) {
  const { user } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState([])
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const configs = {
    before:  { label: 'Before Photos',  accept: 'image/*',           icon: Image,    hint: 'Upload before-service photos' },
    after:   { label: 'After Photos',   accept: 'image/*',           icon: Image,    hint: 'Upload after-service photos' },
    invoice: { label: 'Invoice',        accept: '.pdf,image/*',      icon: FileText, hint: 'Upload PDF or image invoice' },
  }
  const { label, accept, icon: Icon, hint } = configs[mediaType]

  async function handleFiles(files) {
    if (!files.length) return
    setUploading(true)
    setError(null)
    setProgress([])

    const fileArr = Array.from(files)
    const results = []

    try {
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i]
        setProgress(fileArr.map((f, j) => ({ name: f.name, done: j < i })))

        const storagePath = await uploadFile(file, jobId, mediaType)

        const { data, error: dbErr } = await supabase
          .from('job_media')
          .insert({
            job_id: jobId,
            media_type: mediaType,
            storage_path: storagePath,
            file_name: file.name,
            created_by: user.id,
          })
          .select()
          .single()

        if (dbErr) throw dbErr

        await logAction('job_media', data.id, 'upload', { media_type: mediaType, file_name: file.name })
        results.push(data)
        onUploaded?.(data)
      }
      setProgress(fileArr.map(f => ({ name: f.name, done: true })))
      setTimeout(() => setProgress([]), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={mediaType !== 'invoice'}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
            {uploading
              ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              : <Icon size={20} className={dragging ? 'text-blue-600' : 'text-slate-500'} />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {uploading ? 'Uploading…' : `Upload ${label}`}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{hint} · drag & drop or click</p>
          </div>
        </div>
      </div>

      {/* Per-file progress */}
      {progress.length > 0 && (
        <div className="space-y-1">
          {progress.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
              {f.done
                ? <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                : <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
              }
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 px-1">{error}</p>
      )}
    </div>
  )
}
