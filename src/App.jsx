import { useEffect, useState } from 'react'
import { MapContainer, Polygon, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const parcelData = [
  {
    id: 'plot-7a',
    name: 'Plot 7A / Dag No. 214',
    village: 'Kachari Gaon',
    circle: 'Sivasagar Revenue Circle',
    owner: 'Ranjit Das & Family',
    status: 'Needs Verification',
    area: '2,480 sq m',
    selectedArea: '0.62 ha',
    mutation: '3 recorded changes',
    risk: 'Medium',
    score: 68,
    intent: 'Sale deed transfer',
    transactionType: 'Private market sale',
    summary:
      'The parcel is likely suitable for transaction preparation, but the deeded area does not fully match the selected polygon and an old encumbrance note remains active.',
    checks: [
      {
        label: 'Ownership chain',
        detail: 'Ownership matches the last registered sale deed and mutation record.',
        tone: 'success',
      },
      {
        label: 'Area mismatch',
        detail: 'Selected polygon is 12% larger than the recorded deeded plot area.',
        tone: 'warning',
      },
      {
        label: 'Encumbrance flag',
        detail: 'Earlier land mortgage entry remains unresolved in the office register.',
        tone: 'warning',
      },
      {
        label: 'Government restriction',
        detail: 'No active government restriction identified for this sub-plot.',
        tone: 'success',
      },
    ],
    conditions: [
      { label: 'Ownership validation', status: 'Pass', detail: 'Chain is traceable to registered deed.' },
      { label: 'Area tolerance', status: 'Review', detail: 'Deviation exceeds expected tolerance.' },
      { label: 'Encumbrance check', status: 'Review', detail: 'Mortgage annotation requires office closure.' },
      { label: 'Restriction check', status: 'Pass', detail: 'No notified reserve found in this segment.' },
    ],
    timeline: [
      '06 Apr 1988 — Original sanad issued to the ancestral patta holder.',
      '14 Jan 2007 — Mutation approved for inheritance transfer.',
      '19 Sep 2023 — Sale deed registered for 1/2 share transfer.',
      '02 Oct 2024 — Encumbrance remark added pending office review.',
    ],
    workflow: [
      { label: 'Field boundary verification', status: 'Pending' },
      { label: 'Office encumbrance review', status: 'In progress' },
      { label: 'Mutation approval checklist', status: 'Awaiting signature' },
    ],
    recordActions: [
      { label: 'Create record', status: 'Eligible', note: 'New assessment entry can be created.' },
      { label: 'Modify record', status: 'Controlled', note: 'Requires officer approval before update.' },
      { label: 'Archive record', status: 'Queue', note: 'Previous versions are retained for audit.' },
      { label: 'Mutation approval', status: 'Pending', note: 'Approval turned on only after review.' },
    ],
    assessment: {
      generatedAt: '2026-11-07 14:20',
      reviewer: 'Pre-flight verification engine',
      evidence: ['Patta record', 'Mutation ledger', 'Survey sketch', 'Encumbrance register'],
      nextStep: 'Field verification and final encumbrance clearance required.',
    },
  },
  {
    id: 'plot-3b',
    name: 'Plot 3B / Dag No. 456',
    village: 'Bokakhat',
    circle: 'Golaghat Revenue Circle',
    owner: 'Anita & Debojit Bora',
    status: 'Ready for transaction',
    area: '1,980 sq m',
    selectedArea: '0.49 ha',
    mutation: '2 recorded changes',
    risk: 'Low',
    score: 90,
    intent: 'Mortgage review',
    transactionType: 'Bank loan against property',
    summary:
      'The land record set is internally consistent with the transaction area and contains no current restriction or encumbrance flags.',
    checks: [
      {
        label: 'Ownership chain',
        detail: 'History confirms clear title with no unsettled litigation entry.',
        tone: 'success',
      },
      {
        label: 'Area check',
        detail: 'Recorded area aligns with the proposed sale segment within tolerance.',
        tone: 'success',
      },
      {
        label: 'Restriction check',
        detail: 'No government restriction or reserve classification is recorded.',
        tone: 'success',
      },
      {
        label: 'Document readiness',
        detail: 'Supporting deed and mutation documents are complete and coherent.',
        tone: 'success',
      },
    ],
    conditions: [
      { label: 'Ownership validation', status: 'Pass', detail: 'No dispute or missing chain entry found.' },
      { label: 'Area tolerance', status: 'Pass', detail: 'Boundary and deed area align.' },
      { label: 'Encumbrance check', status: 'Pass', detail: 'No active claim recorded against this parcel.' },
      { label: 'Restriction check', status: 'Pass', detail: 'No government hold or reserve category detected.' },
    ],
    timeline: [
      '23 Dec 1994 — Original patta issued for agricultural land.',
      '11 May 2011 — Ownership transfer approved after family partition.',
      '08 Aug 2024 — Registration-ready record validated by field office.',
    ],
    workflow: [
      { label: 'Khasra cross-check', status: 'Completed' },
      { label: 'Bank verification packet', status: 'Ready' },
      { label: 'Mutation ledger review', status: 'Not required' },
    ],
    recordActions: [
      { label: 'Create record', status: 'Eligible', note: 'New packet accepted for review.' },
      { label: 'Modify record', status: 'Open', note: 'Minor corrections can be approved by office desk.' },
      { label: 'Archive record', status: 'Retention', note: 'Previous versions kept for standard archival period.' },
      { label: 'Mutation approval', status: 'Clear', note: 'No legal objection in the current registry.' },
    ],
    assessment: {
      generatedAt: '2026-11-07 13:35',
      reviewer: 'Revenue circle review desk',
      evidence: ['Khasra details', 'Ownership records', 'Registration copy'],
      nextStep: 'Proceed to document submission and formal approval workflow.',
    },
  },
  {
    id: 'plot-9c',
    name: 'Plot 9C / Dag No. 611',
    village: 'Nagaon East',
    circle: 'Nagaon Revenue Circle',
    owner: 'State land reserve',
    status: 'Restricted',
    area: '3,710 sq m',
    selectedArea: '0.91 ha',
    mutation: '5 recorded changes',
    risk: 'High',
    score: 24,
    intent: 'Transfer under objection',
    transactionType: 'Restricted land transfer',
    summary:
      'The selected polygon falls within a restricted classification area. Additional government approval is required before any transaction can proceed.',
    checks: [
      {
        label: 'Government classification',
        detail: 'Parcel is under notified land-use restriction and cannot be transferred without approval.',
        tone: 'error',
      },
      {
        label: 'Ownership status',
        detail: 'The current title is valid but tied to a restricted land-use category.',
        tone: 'warning',
      },
      {
        label: 'Mutation note',
        detail: 'An earlier mutation was reversed after a reassessment by the revenue office.',
        tone: 'error',
      },
      {
        label: 'Administrative action',
        detail: 'Government notification and legal review are mandatory before any mutation or transfer.',
        tone: 'error',
      },
    ],
    conditions: [
      { label: 'Ownership validation', status: 'Pass', detail: 'Title exists, but legal transfer is restricted.' },
      { label: 'Area tolerance', status: 'Pass', detail: 'Area is valid but classification remains restrictive.' },
      { label: 'Encumbrance check', status: 'Pass', detail: 'No private lien is active, but public restriction remains.' },
      { label: 'Restriction check', status: 'Fail', detail: 'Government restriction prevents the transaction as proposed.' },
    ],
    timeline: [
      '09 Mar 1978 — Land initially classified as reserve category.',
      '16 Jun 1999 — Mutation request denied pending classification audit.',
      '29 Jan 2024 — Restriction re-confirmed after administrative review.',
    ],
    workflow: [
      { label: 'Government restriction confirmation', status: 'Required' },
      { label: 'Legal review', status: 'Escalated' },
      { label: 'Field survey for boundary dispute', status: 'Mandatory' },
    ],
    recordActions: [
      { label: 'Create record', status: 'Blocked', note: 'No creation while restriction notification is active.' },
      { label: 'Modify record', status: 'Restricted', note: 'Only government authority can alter the record.' },
      { label: 'Archive record', status: 'Required', note: 'Historical versions are preserved as part of audit trail.' },
      { label: 'Mutation approval', status: 'Denied', note: 'Transfer request cannot pass without authority clearance.' },
    ],
    assessment: {
      generatedAt: '2026-11-07 11:45',
      reviewer: 'Administrative restriction desk',
      evidence: ['Restriction map', 'Government order', 'Field survey note'],
      nextStep: 'No transfer or mutation can proceed until the relevant authority clears the restriction.',
    },
  },
]

function MapClickHandler({ enabled, onMapClick }) {
  useMapEvents({
    click(event) {
      if (enabled) onMapClick([event.latlng.lat, event.latlng.lng])
    },
  })

  const map = useMap()
  useEffect(() => {
    if (enabled) map.dragging.disable()
    else map.dragging.enable()
    return () => map.dragging.enable()
  }, [enabled, map])

  return null
}

function MapDrawingSurface({ onShapeCountChange }) {
  const [drawMenuOpen, setDrawMenuOpen] = useState(false)
  const [drawnShapes, setDrawnShapes] = useState([])
  const [draftPoints, setDraftPoints] = useState([])

  useEffect(() => {
    onShapeCountChange?.(drawnShapes.length)
  }, [drawnShapes, onShapeCountChange])

  const finishPolygon = () => {
    if (draftPoints.length < 3) return
    setDrawnShapes((shapes) => [...shapes, { id: Date.now(), points: draftPoints }])
    setDraftPoints([])
  }

  return (
    <>
      <div className="map-tools" role="toolbar" aria-label="Map drawing tools">
        <button
          type="button"
          className={drawMenuOpen ? 'map-tool active' : 'map-tool'}
          aria-expanded={drawMenuOpen}
          aria-controls="geometry-tools"
          onClick={() => {
            setDrawMenuOpen((isOpen) => !isOpen)
            setDraftPoints([])
          }}
        >
          Draw geometry
        </button>
        {drawMenuOpen && (
          <div id="geometry-tools" className="geometry-menu" role="group" aria-label="Geometry controls">
            <span className="geometry-menu-label">Polygon</span>
            {draftPoints.length >= 3 && <button type="button" className="map-tool" onClick={finishPolygon}>Finish shape</button>}
            {(draftPoints.length > 0 || drawnShapes.length > 0) && (
              <button
                type="button"
                className="map-tool"
                onClick={() => {
                  if (draftPoints.length > 0) setDraftPoints((points) => points.slice(0, -1))
                  else setDrawnShapes((shapes) => shapes.slice(0, -1))
                }}
              >
                Undo
              </button>
            )}
            {drawnShapes.length > 0 && <button type="button" className="map-tool" onClick={() => { setDraftPoints([]); setDrawnShapes([]) }}>Clear drawings</button>}
          </div>
        )}
        <span className="map-tool-hint">{drawMenuOpen ? 'Click map to add polygon vertices' : 'Drag to pan · scroll to zoom'}</span>
      </div>
      <div className={`map-canvas ${drawMenuOpen ? 'drawing' : ''}`} aria-label="OpenStreetMap parcel selection map">
        <MapContainer
          className="leaflet-map"
          center={[26.98, 94.64]}
          zoom={13}
          scrollWheelZoom
          doubleClickZoom={!drawMenuOpen}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            enabled={drawMenuOpen}
            onMapClick={(point) => setDraftPoints((points) => [...points, point])}
          />
          {drawnShapes.map((shape) => (
            <Polygon key={shape.id} positions={shape.points} pathOptions={{ color: '#0a0a0a', fillColor: '#0a0a0a', fillOpacity: 0.2, weight: 3 }} />
          ))}
          {draftPoints.length > 1 && <Polyline positions={draftPoints} pathOptions={{ color: '#ffffff', weight: 3 }} />}
          {draftPoints.length > 2 && <Polygon positions={draftPoints} pathOptions={{ color: '#0a0a0a', fillColor: '#fafafa', fillOpacity: 0.25, weight: 2 }} />}
        </MapContainer>
      </div>
    </>
  )
}

function OfficerPlatform({ officer, onSignOut, blank = false }) {
  const [transactionIntent, setTransactionIntent] = useState('Sale deed transfer')
  const [drawnShapeCount, setDrawnShapeCount] = useState(0)

  const selectedParcel = parcelData[0]

  const statusKey = selectedParcel.status.toLowerCase().replace(/\s+/g, '-')

  const outcomeReason =
    selectedParcel.status === 'Restricted'
      ? 'Restricted by government classification or legal hold.'
      : selectedParcel.status === 'Ready for transaction'
        ? 'No material mismatch or restriction was found in the available records.'
        : 'Record data is broadly consistent, but condition checks still require review.'

  const handleGenerateReport = () => {
    const report = [
      'Project Axiom — Land Transaction Pre-Flight Check',
      '---',
      `Parcel: ${selectedParcel.name}`,
      `Status: ${selectedParcel.status}`,
      `Intent: ${transactionIntent}`,
      `Selected transaction area: ${selectedParcel.selectedArea}`,
      `User-drawn shapes: ${drawnShapeCount}`,
      `Owner: ${selectedParcel.owner}`,
      `Circle: ${selectedParcel.circle}`,
      '',
      'Assessment summary:',
      selectedParcel.summary,
      '',
      'Key reasons:',
      ...selectedParcel.checks.map((check) => `- ${check.label}: ${check.detail}`),
      '',
      'Next step:',
      selectedParcel.assessment.nextStep,
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedParcel.id}-preflight-report.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  if (blank) return <main className="blank-workspace" aria-label="Signed-in workspace" />

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">A</span>
          <div>
            <div className="brand-name">Project Axiom</div>
            <div className="brand-subtitle">Land transaction pre-flight</div>
          </div>
        </div>
        <nav className="topnav" aria-label="Main navigation">
          <button type="button" className="nav-link active">Overview</button>
          <button type="button" className="nav-link">Records</button>
          <button type="button" className="nav-link">Dashboards</button>
          <button type="button" className="nav-link">Field workflow</button>
        </nav>
        <div className="officer-session">
          <span>{officer.name}</span>
          <button type="button" className="secondary-button" onClick={onSignOut}>Sign out</button>
          <button type="button" className="primary-button" onClick={handleGenerateReport}>Generate report</button>
        </div>
      </header>

      <main className="layout">
        <section className="map-panel panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Parcel selection</span>
              <h1>Transaction pre-flight check</h1>
            </div>
            <span className="demo-tag">Demonstration data</span>
          </div>

          <MapDrawingSurface onShapeCountChange={setDrawnShapeCount} />

        </section>

        <aside className="info-panel panel">
          <div className={`status-badge ${statusKey}`}>{selectedParcel.status}</div>
          <h2>{selectedParcel.name}</h2>
          <div className="meta-row">
            <span>{selectedParcel.village}</span>
            <span>{selectedParcel.circle}</span>
          </div>

          <dl className="meta-grid">
            <div>
              <dt>Owner</dt>
              <dd>{selectedParcel.owner}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{selectedParcel.area}</dd>
            </div>
            <div>
              <dt>Selected area</dt>
              <dd>{selectedParcel.selectedArea}</dd>
            </div>
            <div>
              <dt>Mutation</dt>
              <dd>{selectedParcel.mutation}</dd>
            </div>
            <div>
              <dt>Risk</dt>
              <dd>{selectedParcel.risk}</dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>{selectedParcel.score}/100</dd>
            </div>
          </dl>

          <div className="summary-box">
            <p>{selectedParcel.summary}</p>
          </div>

          <div className="intent-box">
            <label htmlFor="intentSelect">Transaction intent</label>
            <select
              id="intentSelect"
              value={transactionIntent}
              onChange={(event) => setTransactionIntent(event.target.value)}
            >
              {parcelData.map((parcel) => (
                <option key={parcel.id} value={parcel.intent}>
                  {parcel.intent}
                </option>
              ))}
            </select>
            <div className="intent-meta">
              <span>{selectedParcel.transactionType}</span>
              <strong>{selectedParcel.status}</strong>
            </div>
          </div>

        </aside>
      </main>

      <section className="lower-grid">
        <article className="panel card">
          <div className="card-header">
            <span className="eyebrow">Verification reasons</span>
            <h3>Assessment summary</h3>
          </div>
          <ul className="check-list">
            {selectedParcel.checks.map((check) => (
              <li key={check.label} className={check.tone}>
                <span className="check-label">{check.label}</span>
                <p>{check.detail}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel card">
          <div className="card-header">
            <span className="eyebrow">Decision engine</span>
            <h3>Verification outcome</h3>
          </div>
          <div className="decision-box">
            <div className={`decision-pill ${statusKey}`}>{selectedParcel.status}</div>
            <p>{outcomeReason}</p>
            <ul>
              <li>Record integrity reviewed against ownership, mutation, and restriction sources.</li>
              <li>Parcel selected area compared to deeded area for transaction suitability.</li>
              <li>Outcome is preliminary and does not replace competent authority clearance.</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="panel condition-panel">
        <div className="card-header">
          <span className="eyebrow">Verification conditions</span>
          <h3>Pre-flight pass/fail matrix</h3>
        </div>
        <div className="condition-grid">
          {selectedParcel.conditions.map((condition) => (
            <div key={condition.label} className="condition-card">
              <div className="condition-head">
                <span>{condition.label}</span>
                <strong className={condition.status === 'Fail' ? 'fail' : condition.status === 'Review' ? 'review' : 'pass'}>
                  {condition.status}
                </strong>
              </div>
              <p>{condition.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel summary-section">
        <div className="card-header">
          <span className="eyebrow">Record trail</span>
          <h3>Assessment record and workflow</h3>
        </div>
        <div className="summary-grid">
          <div>
            <h4>Ownership and mutation trail</h4>
            <ul className="timeline">
              {selectedParcel.timeline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Field and administrative workflow</h4>
            <ul className="workflow-list">
              {selectedParcel.workflow.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.status}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Assessment record</h4>
            <dl className="record-list">
              <div>
                <dt>Generated</dt>
                <dd>{selectedParcel.assessment.generatedAt}</dd>
              </div>
              <div>
                <dt>Author</dt>
                <dd>{selectedParcel.assessment.reviewer}</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>{selectedParcel.assessment.evidence.join(', ')}</dd>
              </div>
              <div>
                <dt>Next step</dt>
                <dd>{selectedParcel.assessment.nextStep}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="panel control-panel">
        <div className="card-header">
          <span className="eyebrow">Record control</span>
          <h3>Controlled mutation and archival workflow</h3>
        </div>
        <div className="action-grid">
          {selectedParcel.recordActions.map((action) => (
            <div key={action.label} className="action-card">
              <div className="action-row">
                <span>{action.label}</span>
                <strong>{action.status}</strong>
              </div>
              <p>{action.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel dashboard">
        <div className="card-header">
          <span className="eyebrow">Operations dashboard</span>
          <h3>Administrative readiness</h3>
        </div>
        <div className="dashboard-grid">
          <div className="metric-card">
            <span>Ready</span>
            <strong>31</strong>
            <small>Parcels cleared</small>
          </div>
          <div className="metric-card">
            <span>Needs verification</span>
            <strong>18</strong>
            <small>Awaiting review</small>
          </div>
          <div className="metric-card warning">
            <span>Restricted</span>
            <strong>7</strong>
            <small>Require approval</small>
          </div>
          <div className="metric-card">
            <span>Field checks</span>
            <strong>12</strong>
            <small>Pending survey</small>
          </div>
        </div>
      </section>
    </div>
  )
}

function PublicLanding({ onOfficerAccess }) {
  return (
    <div className="public-shell">
      <header className="landing-topbar">
        <a className="brand-block" href="#top" aria-label="Project Axiom home">
          <span className="brand-mark">A</span>
          <span>
            <span className="brand-name">Project Axiom</span>
            <span className="brand-subtitle">Land transaction pre-flight</span>
          </span>
        </a>
        <span className="public-access-label">PUBLIC ACCESS · NO LOGIN REQUIRED</span>
        <button type="button" className="secondary-button" onClick={onOfficerAccess}>Organization Login</button>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="eyebrow">A clearer start to a land transaction</span>
            <h1>Know the land<br />before the deal.</h1>
            <p>Explore a proposed parcel, draw the area in question, and see what may need further verification before a transaction begins.</p>
            <a className="primary-button landing-cta" href="#public-map">Open the public map <span aria-hidden="true">↓</span></a>
          </div>
          <div className="landing-hero-index" aria-label="Preliminary verification notice">
            <span className="index-number">01</span>
            <span className="index-rule" />
            <p>PRELIMINARY<br />INFORMATION ONLY</p>
            <small>Not a title certificate or legal clearance.</small>
          </div>
        </section>

        <section className="public-map-section" id="public-map">
          <div className="public-section-heading">
            <div>
              <span className="eyebrow">Open access map</span>
              <h2>Start with the area you mean.</h2>
            </div>
            <p>Pan the illustrative map and draw a polygon around the land you want to examine. No account is needed.</p>
          </div>
          <div className="public-map-frame">
            <MapDrawingSurface />
          </div>
          <p className="map-disclaimer">Demonstration map only. User-drawn shapes do not establish legal parcel boundaries or ownership.</p>
        </section>
      </main>

      <footer className="landing-footer">
        <span>PROJECT AXIOM</span>
        <span>Preliminary verification · Assam</span>
      </footer>
    </div>
  )
}

function OfficerAccess({ onLogin, onBack }) {
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim().toLowerCase()
    const password = String(formData.get('password'))
    const result = onLogin({ email, password })
    setError(result ?? '')
  }

  return (
    <main className="access-page">
      <header className="access-topbar">
        <a className="brand-block" href="#top" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="brand-mark">A</span>
          <span>
            <span className="brand-name">Project Axiom</span>
            <span className="brand-subtitle">Organization access</span>
          </span>
        </a>
        <button type="button" className="nav-link" onClick={onBack}>Back to public map</button>
      </header>

      <section className="access-content">
        <div className="access-intro">
          <span className="eyebrow">Partner and official access</span>
          <h1>Organization login</h1>
          <p>Sign in with an email address from an approved organization domain.</p>
        </div>

        <div className="access-form-wrap">
          <form className="access-form" onSubmit={handleSubmit}>
            <label>
              Organization email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="primary-button access-submit">Sign in</button>
          </form>
          <div className="domain-hint">
            <span>Accepted domains</span>
            <p>circle-office.assam.gov.in<br />register-office.assam.gov.in<br />bank.gov.in<br />adc.assam.gov.in<br />dc.assam.gov.in</p>
          </div>
          <p className="prototype-note">Showcase login only. The shared password and domain checks run in the browser and do not verify identity. Do not use for real accounts.</p>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [page, setPage] = useState('public')
  const [officer, setOfficer] = useState(null)

  const loginOfficer = ({ email, password }) => {
    const rolesByDomain = {
      'circle-office.assam.gov.in': 'Circle Officer',
      'register-office.assam.gov.in': 'Registration Officer',
      'bank.gov.in': 'Bank',
      'adc.assam.gov.in': 'Assistant District Commissioner',
      'dc.assam.gov.in': 'District Commissioner',
    }
    const emailParts = email.split('@')
    const role = emailParts.length === 2 ? rolesByDomain[emailParts[1]] : null

    if (!role) return 'Use an email address from one of the accepted organization domains.'
    if (password !== 'Axiom@2026') return 'The password is incorrect.'

    setOfficer({ email, role })
    setPage('officer')
    return ''
  }

  if (page === 'officer' && officer) {
    return <OfficerPlatform officer={officer} blank />
  }

  if (page === 'access') {
    return <OfficerAccess onLogin={loginOfficer} onBack={() => setPage('public')} />
  }

  return <PublicLanding onOfficerAccess={() => setPage('access')} />
}

export default App
