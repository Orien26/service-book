// Generate a Google Calendar URL and an .ics file for the 1-year service reminder

export function buildGoogleCalendarUrl({ jobTitle, clientName, propertyAddress, serviceDate }) {
  const base = new Date(serviceDate)
  base.setFullYear(base.getFullYear() + 1)

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const end = new Date(base.getTime() + 60 * 60 * 1000) // 1 hour slot

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Annual service reminder – ${clientName}`,
    dates: `${fmt(base)}/${fmt(end)}`,
    details: `Job: ${jobTitle}\nProperty: ${propertyAddress}\n\nTime to follow up with ${clientName} about their annual service.`,
    location: propertyAddress,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcsFile({ jobTitle, clientName, propertyAddress, serviceDate }) {
  const base = new Date(serviceDate)
  base.setFullYear(base.getFullYear() + 1)

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const end = new Date(base.getTime() + 60 * 60 * 1000)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ServiceBook//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(base)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Annual service reminder – ${clientName}`,
    `DESCRIPTION:Job: ${jobTitle}\\nProperty: ${propertyAddress}`,
    `LOCATION:${propertyAddress}`,
    `UID:${Date.now()}@servicebook`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `service-reminder-${clientName.replace(/\s+/g, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
