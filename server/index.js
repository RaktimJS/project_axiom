import crypto from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import session from 'express-session'

const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.resolve(serverDirectory, '../data')
const transactionFile = path.join(dataDirectory, 'transactions.json')
const mockFilesPath = path.join(dataDirectory, 'mock-files.json')
const port = Number(process.env.API_PORT || 3001)
const demoPassword = process.env.DEMO_LOGIN_PASSWORD || 'Axiom@2026'

const rolesByDomain = {
  'circle-office.assam.gov.in': 'Circle Officer',
  'register-office.assam.gov.in': 'Registration Officer',
  'bank.gov.in': 'Bank',
  'adc.assam.gov.in': 'Assistant District Commissioner',
  'dc.assam.gov.in': 'District Commissioner',
  'citizen.axiom.demo': 'Citizen',
  'buyer.axiom.demo': 'Buyer',
  'seller.axiom.demo': 'Seller',
  'field-survey.axiom.demo': 'Field Survey Officer',
  'lat-mandal.axiom.demo': 'Lat-Mandal',
}

const documentPolicies = [
  { type: 'Sale agreement', stage: 'preparation', roles: ['Buyer', 'Seller'] },
  { type: 'Transfer / NOC application', stage: 'preparation', roles: ['Citizen', 'Buyer', 'Seller'] },
  { type: 'Buyer identity record', stage: 'preparation', roles: ['Citizen', 'Buyer'] },
  { type: 'Seller identity record', stage: 'preparation', roles: ['Seller'] },
  { type: 'Land record copy', stage: 'preparation', roles: ['Seller', 'Lat-Mandal'] },
  { type: 'Other supporting document', stage: 'preparation', roles: ['Citizen', 'Buyer', 'Seller'] },
  { type: 'Field verification report', stage: 'revenue_examination', roles: ['Field Survey Officer'] },
  { type: 'Authority decision reference', stage: 'authority_decision', roles: ['Assistant District Commissioner', 'District Commissioner'] },
  { type: 'Registration report', stage: 'registration', roles: ['Registration Officer'] },
  { type: 'Mutation application', stage: 'mutation', roles: ['Circle Officer', 'Lat-Mandal'] },
  { type: 'Updated land-record extract', stage: 'mutation', roles: ['Circle Officer', 'Lat-Mandal'] },
]

const stageLabels = {
  preparation: 'Transaction preparation',
  revenue_examination: 'Revenue examination',
  authority_decision: 'Competent authority review (demo)',
  registration: 'Registration (demo tracking)',
  mutation: 'Post-registration mutation (demo tracking)',
  completed_demo: 'Workflow complete (demo only)',
  closed_demo: 'Closed without advancement (demo)',
}

const participantRoles = new Set(['Citizen', 'Buyer', 'Seller'])
const authorityRoles = new Set([
  'Circle Officer',
  'Registration Officer',
  'Assistant District Commissioner',
  'District Commissioner',
  'Field Survey Officer',
  'Lat-Mandal',
  'Bank',
])
const uploadableMediaTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const maximumMockUploadSize = 25 * 1024 * 1024

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

let workflow = await readJson(transactionFile)
let mockFiles = await readJson(mockFilesPath)
let persistenceQueue = Promise.resolve()

function persistJson(filePath, value) {
  const snapshot = `${JSON.stringify(value, null, 2)}\n`
  persistenceQueue = persistenceQueue.then(async () => {
    await writeFile(filePath, snapshot, 'utf8')
  })
  return persistenceQueue
}

function isAuthenticated(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Sign in is required.' })
  next()
}

function canAccessTransaction(user, transaction) {
  const isParticipant = [transaction.buyerEmail, transaction.sellerEmail, transaction.citizenEmail]
    .filter(Boolean)
    .includes(user.email)
  return isParticipant || transaction.allowedRoles.includes(user.role)
}

function findAccessibleTransaction(req, res) {
  const transaction = workflow.transactions.find((item) => item.id === req.params.id)
  if (!transaction || !canAccessTransaction(req.session.user, transaction)) {
    res.status(404).json({ error: 'Transaction case was not found.' })
    return null
  }
  return transaction
}

function addEvent(transaction, user, action, note = '') {
  const event = {
    id: `EV-${crypto.randomUUID()}`,
    at: new Date().toISOString(),
    actor: user.email,
    role: user.role,
    action,
    note,
    official: false,
  }
  transaction.events.push(event)
  transaction.updatedAt = event.at
  return event
}

function applyStage(transaction, stage, status) {
  transaction.stage = stage
  transaction.stageLabel = stageLabels[stage]
  transaction.status = status
}

function getMockFile(fileId) {
  return mockFiles.files.find((file) => file.id === fileId) || null
}

function roleForEmail(email = '') {
  const domain = email.split('@')[1]
  return rolesByDomain[domain] || 'Unknown'
}

function getDocumentPolicy(documentType) {
  return documentPolicies.find((policy) => policy.type === documentType)
}

function requiredDocumentsForStage(stage) {
  return documentPolicies.filter((policy) => policy.stage === stage).map((policy) => policy.type)
}

function serializeTransaction(transaction, user) {
  const stagePosition = Object.keys(stageLabels).indexOf(transaction.stage)
  return {
    ...transaction,
    documents: transaction.documents.map((document) => ({
      ...document,
      file: document.mockFileId ? getMockFile(document.mockFileId) : null,
    })),
    documentChecklist: documentPolicies.map((policy) => {
      const document = transaction.documents.find((item) => item.type === policy.type)
      const file = document?.mockFileId ? getMockFile(document.mockFileId) : null
      const uploader = document?.uploadedBy || file?.uploadedBy || null
      const isAuthorizedRole = policy.roles.includes(user.role)
      const isActiveStage = transaction.stage === policy.stage
      const isUploader = uploader === user.email
      const canManage = Boolean(isAuthorizedRole && isActiveStage && (!document || isUploader))
      const policyStagePosition = Object.keys(stageLabels).indexOf(policy.stage)
      const status = document?.status || (stagePosition > policyStagePosition ? 'Missing · previous stage' : isActiveStage ? 'Required now' : 'Required at later stage')
      return {
        type: policy.type,
        stage: policy.stage,
        stageLabel: stageLabels[policy.stage],
        responsibleRoles: policy.roles,
        required: true,
        status,
        document: document ? { ...document, file } : null,
        canUpload: canManage,
        canRemove: Boolean(document && canManage),
        readOnly: Boolean(document && !canManage),
        uploader,
        uploaderRole: document?.uploadedByRole || (uploader ? roleForEmail(uploader) : null),
      }
    }),
  }
}

function hasProvidedDocument(transaction, documentType) {
  return transaction.documents.some((document) => document.type === documentType && document.status === 'Provided')
}

function requireRole(user, allowedRoles) {
  return allowedRoles.includes(user.role)
}

function makeError(message, status = 400) {
  const error = new Error(message)
  error.status = status
  return error
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))
app.use(session({
  name: 'axiom.sid',
  secret: process.env.SESSION_SECRET || 'project-axiom-local-showcase-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 8 * 60 * 60 * 1000,
  },
}))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', storage: 'local JSON files', demo: true }))

app.get('/api/session', (req, res) => res.json({ user: req.session.user || null }))

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const [localPart, domain, extraPart] = email.split('@')
  const role = localPart && domain && !extraPart ? rolesByDomain[domain] : null

  if (!role) {
    return res.status(401).json({ error: 'Use an email address from an accepted demo or organization domain.' })
  }
  if (password !== demoPassword) return res.status(401).json({ error: 'The password is incorrect.' })

  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ error: 'Could not start a sign-in session.' })
    req.session.user = { email, role }
    req.session.save((saveError) => {
      if (saveError) return res.status(500).json({ error: 'Could not save the sign-in session.' })
      res.json({ user: req.session.user })
    })
  })
})

app.post('/api/auth/logout', isAuthenticated, (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ error: 'Could not end the sign-in session.' })
    res.clearCookie('axiom.sid', { httpOnly: true, sameSite: 'lax' })
    res.json({ ok: true })
  })
})

app.get('/api/workflow', isAuthenticated, (req, res) => {
  const transactions = workflow.transactions
    .filter((transaction) => canAccessTransaction(req.session.user, transaction))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((transaction) => serializeTransaction(transaction, req.session.user))
  res.json({ transactions, demo: true })
})

app.post('/api/workflow', isAuthenticated, async (req, res, next) => {
  try {
    const user = req.session.user
    if (!participantRoles.has(user.role)) throw makeError('Only a citizen, buyer, or seller can start a transaction case.', 403)

    const parcelName = String(req.body?.parcelName || '').trim()
    const village = String(req.body?.village || '').trim()
    const circle = String(req.body?.circle || '').trim()
    const transactionType = String(req.body?.transactionType || '').trim()
    const transactionArea = String(req.body?.transactionArea || '').trim()
    const buyerEmailInput = String(req.body?.buyerEmail || '').trim().toLowerCase()
    const sellerEmailInput = String(req.body?.sellerEmail || '').trim().toLowerCase()

    if (!parcelName || !village || !circle || !transactionType || !transactionArea) {
      throw makeError('Parcel, village, circle, transaction type, and intended area are required.')
    }

    const buyerEmail = user.role === 'Buyer' || user.role === 'Citizen' ? user.email : buyerEmailInput
    const sellerEmail = user.role === 'Seller' ? user.email : sellerEmailInput
    if (!buyerEmail || !sellerEmail) throw makeError('Add the buyer and seller email addresses to the case.')

    const createdAt = new Date().toISOString()
    const id = `TX-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    const transaction = {
      id,
      title: `${transactionType} · ${parcelName}`,
      transactionType,
      status: 'Draft transaction preparation',
      stage: 'preparation',
      stageLabel: stageLabels.preparation,
      parcel: {
        name: parcelName,
        village,
        circle,
        district: String(req.body?.district || '').trim() || 'Not provided',
        recordedArea: String(req.body?.recordedArea || '').trim() || 'Not provided',
        transactionArea,
      },
      buyerEmail,
      sellerEmail,
      citizenEmail: user.role === 'Citizen' ? user.email : null,
      allowedRoles: [...authorityRoles],
      requiredDocuments: requiredDocumentsForStage('preparation'),
      documents: [],
      findings: [],
      decision: null,
      registration: { status: 'Not started', reference: null, official: false },
      mutation: { status: 'Not started', reference: null, official: false },
      createdAt,
      updatedAt: createdAt,
      events: [],
    }
    addEvent(transaction, user, 'Created transaction preparation case', 'Case created in the local demonstration workflow.')
    workflow.transactions.push(transaction)
    await persistJson(transactionFile, workflow)
    res.status(201).json({ transaction: serializeTransaction(transaction, user), demo: true })
  } catch (error) {
    next(error)
  }
})

app.get('/api/workflow/:id', isAuthenticated, (req, res) => {
  const transaction = findAccessibleTransaction(req, res)
  if (transaction) res.json({ transaction: serializeTransaction(transaction, req.session.user), demo: true })
})

app.post('/api/workflow/:id/documents', isAuthenticated, async (req, res, next) => {
  try {
    const transaction = findAccessibleTransaction(req, res)
    if (!transaction) return
    const user = req.session.user
    const documentType = String(req.body?.documentType || '').trim()
    const policy = getDocumentPolicy(documentType)
    if (!policy) throw makeError('Choose a required workflow document.')
    if (transaction.stage !== policy.stage || !policy.roles.includes(user.role)) {
      throw makeError(`Only ${policy.roles.join(' or ')} can upload this document during ${stageLabels[policy.stage]}.`, 403)
    }

    const fileName = path.basename(String(req.body?.fileName || '').replace(/\\/g, '/')).trim()
    const mediaType = String(req.body?.mediaType || '')
    const fileSize = Number(req.body?.fileSize)
    if (!fileName || fileName.length > 180) throw makeError('Choose a file with a valid name.')
    if (!uploadableMediaTypes.has(mediaType)) throw makeError('Use a PDF, JPEG, PNG, or Word document.')
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maximumMockUploadSize) {
      throw makeError('Choose a non-empty file smaller than 25 MB.')
    }

    const prior = transaction.documents.find((document) => document.type === documentType)
    if (prior) {
      const currentFile = prior.mockFileId ? getMockFile(prior.mockFileId) : null
      const owner = prior.uploadedBy || currentFile?.uploadedBy
      if (owner !== user.email) throw makeError('This document is read-only. Only its authorized uploader can replace or remove it.', 403)
    }

    const uploadedAt = new Date().toISOString()
    if (prior?.mockFileId) {
      const oldFile = getMockFile(prior.mockFileId)
      if (oldFile) {
        oldFile.supersededAt = uploadedAt
        oldFile.supersededBy = user.email
      }
    }

    const file = {
      id: `MOCK-FILE-${crypto.randomUUID()}`,
      transactionId: transaction.id,
      documentType,
      fileName,
      mediaType,
      fileSize,
      lastModified: Number(req.body?.lastModified) || null,
      metadataOnly: true,
      uploadedBy: user.email,
      uploadedByRole: user.role,
      uploadedAt,
      notice: 'Mock upload only; the selected file bytes were not uploaded or stored.',
    }
    mockFiles.files.push(file)
    if (prior) {
      prior.status = 'Provided'
      prior.mockFileId = file.id
      prior.uploadedBy = user.email
      prior.uploadedByRole = user.role
      prior.uploadedAt = uploadedAt
      prior.lockedToOthers = true
    } else {
      transaction.documents.push({
        id: `DOC-${crypto.randomUUID()}`,
        type: documentType,
        status: 'Provided',
        mockFileId: file.id,
        uploadedBy: user.email,
        uploadedByRole: user.role,
        uploadedAt,
        lockedToOthers: true,
      })
    }
    addEvent(transaction, user, `Uploaded ${documentType}`, file.notice)
    await Promise.all([persistJson(mockFilesPath, mockFiles), persistJson(transactionFile, workflow)])
    res.status(201).json({ transaction: serializeTransaction(transaction, user), demo: true })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/workflow/:id/documents/:documentId', isAuthenticated, async (req, res, next) => {
  try {
    const transaction = findAccessibleTransaction(req, res)
    if (!transaction) return
    const user = req.session.user
    const documentIndex = transaction.documents.findIndex((document) => document.id === req.params.documentId)
    if (documentIndex < 0) throw makeError('Document reference was not found.', 404)
    const document = transaction.documents[documentIndex]
    const policy = getDocumentPolicy(document.type)
    const file = document.mockFileId ? getMockFile(document.mockFileId) : null
    const owner = document.uploadedBy || file?.uploadedBy
    if (!policy || transaction.stage !== policy.stage || !policy.roles.includes(user.role) || owner !== user.email) {
      throw makeError('This document is read-only. Only its authorized uploader can remove it during the active stage.', 403)
    }

    if (file) {
      file.removedAt = new Date().toISOString()
      file.removedBy = user.email
      file.removedByRole = user.role
      file.notice = 'Mock document reference removed by its authorized uploader; no file bytes were stored.'
    }
    transaction.documents.splice(documentIndex, 1)
    addEvent(transaction, user, `Removed ${document.type} reference`, 'Authorized uploader removed the mock attachment reference.')
    await Promise.all([persistJson(mockFilesPath, mockFiles), persistJson(transactionFile, workflow)])
    res.json({ transaction: serializeTransaction(transaction, user), demo: true })
  } catch (error) {
    next(error)
  }
})

app.post('/api/workflow/:id/actions', isAuthenticated, async (req, res, next) => {
  try {
    const transaction = findAccessibleTransaction(req, res)
    if (!transaction) return
    const user = req.session.user
    const action = String(req.body?.action || '')
    const note = String(req.body?.note || '').trim().slice(0, 1000)

    if (action === 'submit_for_revenue_examination') {
      if (!participantRoles.has(user.role) || transaction.stage !== 'preparation') throw makeError('This case is not available for submission by this role.', 403)
      const missingDocuments = requiredDocumentsForStage('preparation').filter((type) => !hasProvidedDocument(transaction, type))
      if (missingDocuments.length) throw makeError(`Add the required documents first: ${missingDocuments.join(', ')}.`)
      applyStage(transaction, 'revenue_examination', 'Submitted for revenue examination')
      addEvent(transaction, user, 'Submitted preparation packet for revenue examination', note)
    } else if (action === 'complete_revenue_examination') {
      if (!requireRole(user, ['Circle Officer', 'Lat-Mandal']) || transaction.stage !== 'revenue_examination') throw makeError('Revenue examination is not available to this role at this stage.', 403)
      const missingDocuments = requiredDocumentsForStage('revenue_examination').filter((type) => !hasProvidedDocument(transaction, type))
      if (missingDocuments.length) throw makeError(`Required documents are missing: ${missingDocuments.join(', ')}.`)
      if (!note) throw makeError('Add a short examination note before forwarding the case.')
      transaction.findings.push(note)
      applyStage(transaction, 'authority_decision', 'Forwarded for competent authority review')
      addEvent(transaction, user, 'Completed demonstration revenue examination', note)
    } else if (action === 'submit_field_finding') {
      if (user.role !== 'Field Survey Officer' || transaction.stage !== 'revenue_examination') throw makeError('Field findings are not available to this role at this stage.', 403)
      if (!note) throw makeError('Add the field finding before submitting.')
      transaction.findings.push(note)
      addEvent(transaction, user, 'Submitted demonstration field finding', note)
    } else if (action === 'record_demo_authority_decision') {
      if (!requireRole(user, ['Assistant District Commissioner', 'District Commissioner']) || transaction.stage !== 'authority_decision') throw makeError('Authority review is not available to this role at this stage.', 403)
      const missingDocuments = requiredDocumentsForStage('authority_decision').filter((type) => !hasProvidedDocument(transaction, type))
      if (missingDocuments.length) throw makeError(`Required documents are missing: ${missingDocuments.join(', ')}.`)
      const decision = String(req.body?.decision || '')
      if (!['recorded_for_demo', 'more_information', 'not_advanced'].includes(decision)) throw makeError('Choose a valid demonstration decision status.')
      const labels = {
        recorded_for_demo: 'Recorded for demonstration only',
        more_information: 'Further information requested (demo)',
        not_advanced: 'Not advanced in demonstration workflow',
      }
      transaction.decision = { status: labels[decision], reference: `MOCK-DEC-${transaction.id}`, official: false, recordedAt: new Date().toISOString() }
      if (decision === 'recorded_for_demo') applyStage(transaction, 'registration', 'Ready for registration step in demo workflow')
      else if (decision === 'more_information') applyStage(transaction, 'revenue_examination', 'Further information requested in demo')
      else applyStage(transaction, 'closed_demo', 'Closed without advancement in demo')
      addEvent(transaction, user, 'Recorded demonstration authority workflow status', `${labels[decision]}. This is not an official decision or NOC. ${note}`.trim())
    } else if (action === 'record_demo_registration') {
      if (user.role !== 'Registration Officer' || transaction.stage !== 'registration') throw makeError('Registration tracking is not available to this role at this stage.', 403)
      if (!hasProvidedDocument(transaction, 'Registration report')) throw makeError('Add a mock registration report reference first.')
      transaction.registration = { status: 'Recorded for demonstration only', reference: `MOCK-REG-${transaction.id}`, official: false, recordedAt: new Date().toISOString() }
      applyStage(transaction, 'mutation', 'Ready for mutation step in demo workflow')
      addEvent(transaction, user, 'Recorded demonstration registration status', 'This does not represent an official registration.')
    } else if (action === 'record_demo_mutation') {
      if (!requireRole(user, ['Circle Officer', 'Lat-Mandal']) || transaction.stage !== 'mutation') throw makeError('Mutation tracking is not available to this role at this stage.', 403)
      if (!hasProvidedDocument(transaction, 'Mutation application') || !hasProvidedDocument(transaction, 'Updated land-record extract')) {
        throw makeError('Add mock mutation application and updated land-record extract references first.')
      }
      transaction.mutation = { status: 'Recorded for demonstration only', reference: `MOCK-MUT-${transaction.id}`, official: false, recordedAt: new Date().toISOString() }
      applyStage(transaction, 'completed_demo', 'Completed in demonstration workflow only')
      addEvent(transaction, user, 'Recorded demonstration mutation status', 'This does not represent an official land-record change.')
    } else {
      throw makeError('Unknown workflow action.')
    }

    await persistJson(transactionFile, workflow)
    res.json({ transaction: serializeTransaction(transaction, user), demo: true })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  const status = Number(error.status || 500)
  if (status >= 500) console.error(error)
  res.status(status).json({ error: status >= 500 ? 'Unexpected workflow service error.' : error.message })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Project Axiom JSON workflow API listening on http://localhost:${port}`)
})
