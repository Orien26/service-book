import { useState, useEffect, useRef } from 'react'
import { Send, ShieldCheck, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1)  return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CommentThread({ jobId, comments, onNewComment }) {
  const { user, profile } = useAuth()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('comments')
      .insert({
        job_id: jobId,
        content: text.trim(),
        author_name: profile?.full_name || 'Unknown',
        created_by: user.id,
      })
      .select('*, profiles(role, full_name)')
      .single()

    if (err) { setError(err.message); setSubmitting(false); return }

    setText('')
    setSubmitting(false)
    onNewComment?.(data)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Thread */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Send size={16} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          comments.map((c) => {
            const isAdminComment = c.profiles?.role === 'admin'
            return (
              <div key={c.id} className={`flex gap-3 ${isAdminComment ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isAdminComment ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  {isAdminComment
                    ? <ShieldCheck size={15} className="text-blue-600" />
                    : <User size={15} className="text-slate-500" />
                  }
                </div>
                <div className={`max-w-[78%] flex flex-col gap-1 ${isAdminComment ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isAdminComment
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {c.content}
                  </div>
                  <p className="text-[11px] text-slate-400 px-1">
                    {c.author_name || 'Unknown'} · {formatDate(c.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} className="flex gap-2 pt-3 border-t border-slate-100">
        <textarea
          className="input flex-1 resize-none"
          rows={1}
          placeholder="Write a message… (Enter to send)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={submitting}
          style={{ minHeight: '42px' }}
        />
        <button
          type="submit"
          className="btn-primary px-3.5 self-end shrink-0"
          disabled={submitting || !text.trim()}
        >
          <Send size={15} />
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
