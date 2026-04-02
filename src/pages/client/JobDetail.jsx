import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Clock, Calendar, Download, Archive, Cpu, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ClientLayout } from '../../components/Layout'
import MediaGallery from '../../components/MediaGallery'
import CommentThread from '../../components/CommentThread'
import EquipmentBadge from '../../components/EquipmentBadge'
import HelpTip from '../../components/HelpTip'
import { buildGoogleCalendarUrl, downloadIcsFile } from '../../lib/calendar'

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="section-title mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ClientJobDetail() {
  const { jobId } = useParams()
  const [job, setJob]         = useState(null)
  const [client, setClient]   = useState(null)
  const [device, setDevice]   = useState(null)
  const [location, setLocation] = useState(null)
  const [media, setMedia]     = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </ClientLayout>
    )
  }
  if (!job) return <ClientLayout><p className="text-slate-500">Job not found.</p></ClientLayout>

  const calendarParams = {
    jobTitle: job.title,
    clientName: client?.full_name,
    propertyAddress: location?.address || client?.property_address,
    serviceDate: job.next_service_date || job.service_date,
  }

  return (
    <ClientLayout
      title={job.title}
      breadcrumbs={[{ label: 'My records', href: '/dashboard' }, { label: job.title }]}
    >
      <div className={`space-y-4 ${job.is_archived ? 'archived-row' : ''}`}>

        {/* Status bar */}
        <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {job.is_archived ? (
              <span className="badge-slate text-sm px-3 py-1.5"><Archive size={13} className="mr-1" />Archived record</span>
            ) : job.status === 'completed' ? (
              <span className="badge-green text-sm px-3 py-1.5"><CheckCircle size={13} className="mr-1" />Completed</span>
            ) : (
              <span className="badge-yellow text-sm px-3 py-1.5"><Clock size={13} className="mr-1" />In progress</span>
            )}
            <span className="text-sm text-slate-500">Serviced on {formatDate(job.service_date)}</span>
          </div>

          {job.status === 'completed' && !job.is_archived && (
            <div className="flex gap-2">
              <a
                href={buildGoogleCalendarUrl(calendarParams)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-sm"
              >
                <Calendar size={13} /> Add reminder
              </a>
              <button onClick={() => downloadIcsFile(calendarParams)} className="btn-secondary btn-sm">
                <Download size={13} /> .ics
              </button>
            </div>
          )}
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
                  <EquipmentBadge type={device.equipment_type} />
                </div>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 ml-auto">
                <MapPin size={13} className="text-slate-400" />
                {location.address}
              </div>
            )}
          </div>
        )}

        {/* Job archive notice */}
        {job.is_archived && (
          <div className="card p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
            <Archive size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This is an archived service record. The information is kept for your records but is no longer active.
            </p>
          </div>
        )}

        {/* Service details */}
        {(job.issue_description || job.work_done || job.parts_replaced || job.total_amount) && (
          <Section title="Service details">
            <div className="space-y-5">
              <Field label="Issue reported"            value={job.issue_description} />
              <Field label="Work done"                 value={job.work_done} />
              <Field label="Parts / materials replaced" value={job.parts_replaced} />
              {job.total_amount && (
                <div>
                  <p className="section-title mb-1.5">Invoice amount</p>
                  <p className="text-sm font-bold text-slate-900">
                    {job.currency} {Number(job.total_amount).toLocaleString()}
                  </p>
                </div>
              )}
              {job.next_service_date && (
                <div>
                  <p className="section-title mb-1.5">Next service due</p>
                  <p className="text-sm font-semibold text-blue-700">{formatDate(job.next_service_date)}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Before photos */}
        <Section title="Before photos">
          <MediaGallery media={media.filter(m => m.media_type === 'before')} />
        </Section>

        {/* After photos */}
        <Section title="After photos">
          <MediaGallery media={media.filter(m => m.media_type === 'after')} />
        </Section>

        {/* Invoice */}
        <Section title="Invoice">
          <MediaGallery media={media.filter(m => m.media_type === 'invoice')} />
        </Section>

        {/* Messages */}
        <Section title="Messages">
          <div className="space-y-3">
            <HelpTip>You can send a message to your technician here — for example to ask a question about this job or request a follow-up.</HelpTip>
            <CommentThread jobId={jobId} comments={comments} onNewComment={c => setComments(prev => [...prev, c])} />
          </div>
        </Section>
      </div>
    </ClientLayout>
  )
}
