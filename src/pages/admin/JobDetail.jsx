import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle, Clock, Calendar, Download, EyeOff,
  Edit2, Save, X, Archive, RotateCcw, Bell, BellOff, Cpu, MapPin
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { AdminLayout } from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import MediaUpload from '../../components/MediaUpload'
import MediaGallery from '../../components/MediaGallery'
import CommentThread from '../../components/CommentThread'
import EquipmentBadge from '../../components/EquipmentBadge'
import HelpTip from '../../components/HelpTip'
import { buildGoogleCalendarUrl, downloadIcsFile } from '../../lib/calendar'
import { createNotification } from '../../lib/supabase'

function Section({ title, children, action }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function AdminJobDetail() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const [job, setJob]         = useState(null)
  const [client, setClient]   = useState(null)
  const [device, setDevice]   = useState(null)
  const [location, setLocation] = useState(null)
  const [media, setMedia]     = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving]   = useState(false)
  const [notifSent, setNotifSent] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: j } = await supabase
        .from('jobs')
        .select('*, clients(*), devices(*, locations(*))')
        .eq('id', jobId)
        .single()
      const { data: m } = await supabase.from('job_media').select('*').eq('job_id', jobId).order('created_at')
      const { data: c } = await supabase.from('comments').select('*, profiles(role, full_name)').eq('job_id', jobId).order('created_at')
      setJob(j)
      setClient(j?.clients)
      setDevice(j?.devices)
      setLocation(j?.devices?.locations)
      setMedia(m || [])
      setComments(c || [])
      setLoading(false)
    }
    load()
  }, [jobId])

  async function saveEdit() {
    setSaving(true)
    const { data } = await supabase.from('jobs').update(editForm).eq('id', jobId).select().single()
    setJob(data)
    setEditing(false)
    setSaving(false)
  }

  async function markComplete() {
    const { data } = await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId).select().single()
    setJob(data)
    // Create notification
    if (client?.id) {
      await createNotification(
        client.id,
        jobId,
        'job_completed',
        `Your service job "${job.title}" has been completed.`
      )
      setNotifSent(true)
      setTimeout(() => setNotifSent(false), 4000)
    }
  }

  async function toggleArchive() {
    const { data } = await supabase
      .from('jobs')
      .update({ is_archived: !job.is_archived })
      .eq('id', jobId)
      .select()
      .single()
    setJob(data)
  }

  async function hideMedia(item) {
    const reason = prompt('Reason for hiding this file (clients will see this message):')
    if (reason === null) return
    await supabase.from('job_media').update({ is_hidden: true, hidden_at: new Date().toISOString(), hidden_reason: reason }).eq('id', item.id)
    setMedia(m => m.map(x => x.id === item.id ? { ...x, is_hidden: true, hidden_reason: reason } : x))
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  )
  if (!job) return <AdminLayout><p className="text-slate-500">Job not found.</p></AdminLayout>

  const calendarParams = {
    jobTitle: job.title,
    clientName: client?.full_name,
    propertyAddress: location?.address || client?.property_address,
    serviceDate: job.next_service_date || job.service_date,
  }

  return (
    <AdminLayout
      title={job.title}
      breadcrumbs={[
        { label: 'Clients', href: '/admin' },
        { label: client?.full_name, href: `/admin/clients/${client?.id}` },
        { label: job.title },
      ]}
    >
      <div className={`space-y-4 ${job.is_archived ? 'opacity-70' : ''}`}>

        {/* Status / actions bar */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {job.is_archived ? (
              <span className="badge-slate text-sm px-3 py-1.5"><Archive size={13} className="mr-1" />Archived</span>
            ) : job.status === 'completed' ? (
              <span className="badge-green text-sm px-3 py-1.5"><CheckCircle size={13} className="mr-1" />Completed</span>
            ) : (
              <span className="badge-yellow text-sm px-3 py-1.5"><Clock size={13} className="mr-1" />In progress</span>
            )}
            <span className="text-sm text-slate-500">{formatDate(job.service_date)}</span>
            {job.total_amount && (
              <span className="text-sm font-semibold text-slate-700">
                {job.currency} {Number(job.total_amount).toLocaleString()}
              </span>
            )}
            {notifSent && (
              <span className="badge-green animate-fade-in text-xs">
                <Bell size={11} /> Client notified
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!job.is_archived && job.status !== 'completed' && (
              <button onClick={markComplete} className="btn-primary btn-sm">
                <CheckCircle size={13} /> Mark complete
              </button>
            )}
            {job.status === 'completed' && !job.is_archived && (
              <>
                <a href={buildGoogleCalendarUrl(calendarParams)} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                  <Calendar size={13} /> Google Calendar
                </a>
                <button onClick={() => downloadIcsFile(calendarParams)} className="btn-secondary btn-sm">
                  <Download size={13} /> .ics
                </button>
              </>
            )}
            <button onClick={toggleArchive} className="btn-secondary btn-sm">
              {job.is_archived ? <><RotateCcw size={13} /> Unarchive</> : <><Archive size={13} /> Archive</>}
            </button>
            {!editing ? (
              <button
                onClick={() => {
                  setEditing(true)
                  setEditForm({
                    title: job.title,
                    issue_description: job.issue_description,
                    work_done: job.work_done,
                    parts_replaced: job.parts_replaced,
                    total_amount: job.total_amount,
                    next_service_date: job.next_service_date,
                  })
                }}
                className="btn-secondary btn-sm"
              >
                <Edit2 size={13} /> Edit
              </button>
            ) : (
              <>
                <button onClick={saveEdit} disabled={saving} className="btn-primary btn-sm">
                  <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary btn-sm">
                  <X size={13} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Device / location context */}
        {(device || location) && (
          <div className="card p-4 flex items-center gap-4">
            {device && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Cpu size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {device.manufacturer} {device.model}
                  </p>
                  <div className="flex items-center gap-2">
                    <EquipmentBadge type={device.equipment_type} />
                    {device.serial_number && <span className="text-xs text-slate-400">S/N: {device.serial_number}</span>}
                  </div>
                </div>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-slate-500 ml-auto">
                <MapPin size={14} className="text-slate-400" />
                {location.address}
              </div>
            )}
          </div>
        )}

        {/* Job details */}
        <Section
          title="Job details"
          action={!editing && (
            <button onClick={() => { setEditing(true); setEditForm({ title: job.title, issue_description: job.issue_description, work_done: job.work_done, parts_replaced: job.parts_replaced, total_amount: job.total_amount, next_service_date: job.next_service_date }) }} className="btn-ghost btn-sm">
              <Edit2 size={13} /> Edit
            </button>
          )}
        >
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input className="input" value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Issue description</label>
                <textarea className="input resize-none" rows={3} value={editForm.issue_description || ''} onChange={e => setEditForm(f => ({ ...f, issue_description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Work done</label>
                <textarea className="input resize-none" rows={3} value={editForm.work_done || ''} onChange={e => setEditForm(f => ({ ...f, work_done: e.target.value }))} />
              </div>
              <div>
                <label className="label">Parts replaced</label>
                <textarea className="input resize-none" rows={2} value={editForm.parts_replaced || ''} onChange={e => setEditForm(f => ({ ...f, parts_replaced: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Invoice amount</label>
                  <input type="number" className="input" value={editForm.total_amount || ''} onChange={e => setEditForm(f => ({ ...f, total_amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Next service date</label>
                  <input type="date" className="input" value={editForm.next_service_date || ''} onChange={e => setEditForm(f => ({ ...f, next_service_date: e.target.value }))} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {job.issue_description && (
                <Field label="Issue reported" value={job.issue_description} />
              )}
              {job.work_done && (
                <Field label="Work done" value={job.work_done} />
              )}
              {job.parts_replaced && (
                <Field label="Parts / materials replaced" value={job.parts_replaced} />
              )}
              {job.total_amount && (
                <div>
                  <p className="section-title mb-1.5">Invoice amount</p>
                  <p className="text-sm font-bold text-slate-900">{job.currency} {Number(job.total_amount).toLocaleString()}</p>
                </div>
              )}
              {job.next_service_date && (
                <div>
                  <p className="section-title mb-1.5">Next service due</p>
                  <p className="text-sm font-semibold text-blue-700">{formatDate(job.next_service_date)}</p>
                </div>
              )}
              {!job.issue_description && !job.work_done && !job.parts_replaced && (
                <p className="text-sm text-slate-400 italic">No details added yet. Click Edit to add information.</p>
              )}
            </div>
          )}
        </Section>

        {/* Before photos */}
        <Section title="Before photos">
          <div className="space-y-3">
            <HelpTip>Upload photos taken before the service — these help document the initial condition of the equipment.</HelpTip>
            <MediaGallery media={media.filter(m => m.media_type === 'before')} onHide={hideMedia} />
            <MediaUpload jobId={jobId} mediaType="before" onUploaded={m => setMedia(prev => [...prev, m])} />
          </div>
        </Section>

        {/* After photos */}
        <Section title="After photos">
          <div className="space-y-3">
            <HelpTip>Upload photos taken after the service — these show the completed work to the client.</HelpTip>
            <MediaGallery media={media.filter(m => m.media_type === 'after')} onHide={hideMedia} />
            <MediaUpload jobId={jobId} mediaType="after" onUploaded={m => setMedia(prev => [...prev, m])} />
          </div>
        </Section>

        {/* Invoice */}
        <Section title="Invoice">
          <div className="space-y-3">
            <HelpTip>Upload the invoice PDF or photo here. The client will be able to download it from their account.</HelpTip>
            <MediaGallery media={media.filter(m => m.media_type === 'invoice')} onHide={hideMedia} />
            <MediaUpload jobId={jobId} mediaType="invoice" onUploaded={m => setMedia(prev => [...prev, m])} />
          </div>
        </Section>

        {/* Messages */}
        <Section title="Messages">
          <div className="space-y-3">
            <HelpTip>Use messages to communicate with your client about this job. Both you and the client can leave notes here.</HelpTip>
            <CommentThread jobId={jobId} comments={comments} onNewComment={c => setComments(prev => [...prev, c])} />
          </div>
        </Section>
      </div>
    </AdminLayout>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="section-title mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  )
}
