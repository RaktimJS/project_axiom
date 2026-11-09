import { useEffect, useState } from 'react'
import { APIProvider, Map as GoogleMap, Polygon, Polyline, useMap } from '@vis.gl/react-google-maps'
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

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function MapDrawingController({ drawingTool, setDraftPoints }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return undefined

    const drawing = drawingTool !== 'pan'
    map.setOptions({
      draggable: !drawing,
      gestureHandling: drawing ? 'none' : 'greedy',
      disableDoubleClickZoom: drawing,
    })

    if (drawingTool === 'polygon') {
      const clickListener = map.addListener('click', (event) => {
        if (!event.latLng) return
        setDraftPoints((points) => [...points, event.latLng.toJSON()])
      })
      return () => clickListener.remove()
    }

    return undefined
  }, [drawingTool, map, setDraftPoints])

  return null
}

function App() {
  const [transactionIntent, setTransactionIntent] = useState('Sale deed transfer')
  const [drawingTool, setDrawingTool] = useState('pan')
  const [drawMenuOpen, setDrawMenuOpen] = useState(false)
  const [drawnShapes, setDrawnShapes] = useState([])
  const [draftPoints, setDraftPoints] = useState([])

  const selectedParcel = parcelData[0]

  const statusKey = selectedParcel.status.toLowerCase().replace(/\s+/g, '-')

  const outcomeReason =
    selectedParcel.status === 'Restricted'
      ? 'Restricted by government classification or legal hold.'
      : selectedParcel.status === 'Ready for transaction'
        ? 'No material mismatch or restriction was found in the available records.'
        : 'Record data is broadly consistent, but condition checks still require review.'

  const finishPolygon = () => {
    if (draftPoints.length < 3) return
    setDrawnShapes((shapes) => [...shapes, { id: Date.now(), points: draftPoints }])
    setDraftPoints([])
    setDrawingTool('pan')
    setDrawMenuOpen(false)
  }

  const handleGenerateReport = () => {
    const report = [
      'Project Axiom — Land Transaction Pre-Flight Check',
      '---',
      `Parcel: ${selectedParcel.name}`,
      `Status: ${selectedParcel.status}`,
      `Intent: ${transactionIntent}`,
      `Selected transaction area: ${selectedParcel.selectedArea}`,
      `User-drawn shapes: ${drawnShapes.length}`,
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
        <button type="button" className="primary-button" onClick={handleGenerateReport}>Generate report</button>
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

          <div className="map-tools" role="toolbar" aria-label="Map drawing tools">
            <button
              type="button"
              className={drawMenuOpen ? 'map-tool active' : 'map-tool'}
              aria-expanded={drawMenuOpen}
              aria-controls="geometry-tools"
              onClick={() => {
                const nextOpen = !drawMenuOpen
                setDrawMenuOpen(nextOpen)
                setDrawingTool(nextOpen ? 'polygon' : 'pan')
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
            <span className="map-tool-hint">{drawMenuOpen ? 'Click map to add polygon vertices' : 'Pan and zoom the map normally'}</span>
          </div>

          <div className={`map-canvas ${drawingTool}`} aria-label="Google Maps parcel selection map">
            {googleMapsApiKey ? (
              <APIProvider apiKey={googleMapsApiKey} libraries={['geometry']}>
                <GoogleMap
                  defaultCenter={{ lat: 26.95, lng: 94.63 }}
                  defaultZoom={14}
                  mapTypeId="satellite"
                  gestureHandling={drawingTool === 'pan' ? 'greedy' : 'none'}
                  disableDoubleClickZoom={drawingTool !== 'pan'}
                  reuseMaps
                  style={{ width: '100%', height: '100%' }}
                >
                  <MapDrawingController
                    drawingTool={drawingTool}
                    setDraftPoints={setDraftPoints}
                  />
                  {drawnShapes.map((shape) => (
                    <Polygon
                      key={shape.id}
                      paths={shape.points}
                      options={{ fillColor: '#0a0a0a', fillOpacity: 0.2, strokeColor: '#0a0a0a', strokeWeight: 3, clickable: false }}
                    />
                  ))}
                  {draftPoints.length > 1 && (
                    <Polyline
                      path={draftPoints}
                      options={{ strokeColor: '#ffffff', strokeWeight: 3, clickable: false }}
                    />
                  )}
                  {draftPoints.length > 2 && drawingTool === 'polygon' && (
                    <Polygon
                      paths={draftPoints}
                      options={{ fillColor: '#fafafa', fillOpacity: 0.25, strokeColor: '#0a0a0a', strokeWeight: 2, clickable: false }}
                    />
                  )}
                </GoogleMap>
              </APIProvider>
            ) : (
              <div className="map-setup-message">
                <strong>Google Maps API key required</strong>
                <p>Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to <code>.env.local</code> and enable the Maps JavaScript API for the key.</p>
              </div>
            )}
          </div>

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

export default App
