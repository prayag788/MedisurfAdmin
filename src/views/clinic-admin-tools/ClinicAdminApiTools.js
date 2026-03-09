import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Table,
  Input,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap'
import { Shield, AlertTriangle, CheckCircle, Clock, RefreshCw, FileText, Play, Eye } from 'react-feather'
import axios from 'axios'
import { showToastError, showToastSuccess } from '@src/utils/toast'
import ROLES from '@configs/roles'
import { socket } from '@src/socket'

const methodColorMap = {
  GET: 'info',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger',
  PATCH: 'secondary',
}

const statusColorMap = status => {
  switch (status) {
    case 'success':
    case 'healthy':
      return 'success'
    case 'degraded':
    case 'fallback':
      return 'warning'
    case 'disabled':
      return 'secondary'
    case 'unreachable':
    case 'unhealthy':
    case 'error':
      return 'danger'
    case 'started':
    case 'pending':
      return 'info'
    default:
      return 'secondary'
  }
}

const initialResult = {
  status: 'idle',
  message: 'Not triggered yet',
  timestamp: null,
  statusCode: null,
}

const ClinicAdminApiTools = () => {
  const [userRole, setUserRole] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loadingKey, setLoadingKey] = useState(null)
  const [results, setResults] = useState({})
  const [systemHealth, setSystemHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState(null)
  const [migrations, setMigrations] = useState([])
  const [migrationsLoading, setMigrationsLoading] = useState(false)
  const [viewingMigration, setViewingMigration] = useState(null)
  const [migrationContent, setMigrationContent] = useState(null)
  const [migrationContentLoading, setMigrationContentLoading] = useState(false)
  const [migrationFilters, setMigrationFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'status',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
  })
  const [migrationPagination, setMigrationPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [migrationSummary, setMigrationSummary] = useState({
    executedCount: 0,
    pendingCount: 0,
    totalCount: 0,
    filteredCount: 0,
  })

  const resolveEndpointUrl = useCallback(url => {
    if (!url) {
      return url
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    const normalized = url.startsWith('/') ? url : `/${url}`
    const base = axios.defaults.baseURL || ''
    const baseHasApi = /\/api\/?$/.test(base)

    if (baseHasApi && normalized.startsWith('/api/')) {
      return normalized.replace(/^\/api/, '')
    }

    if (!baseHasApi && !normalized.startsWith('/api/')) {
      return `/api${normalized}`
    }

    return normalized
  }, [])

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userData')
      if (!storedUser) {
        setUserRole('guest')
        return
      }
      const parsed = JSON.parse(storedUser)
      setCurrentUserId(parsed?._id || parsed?.id || null)
      setUserRole(parsed?.role || 'guest')
    } catch (error) {
      setUserRole('guest')
    }
  }, [])

  const fetchSystemHealth = useCallback(async () => {
    try {
      setHealthLoading(true)
      setHealthError(null)
      const response = await axios.get(resolveEndpointUrl('/api/system/health'))
      setSystemHealth(response.data?.data || null)
    } catch (error) {
      setHealthError(error?.response?.data?.message || error?.message || 'Failed to load system health')
    } finally {
      setHealthLoading(false)
    }
  }, [resolveEndpointUrl])

  useEffect(() => {
    fetchSystemHealth()
    const intervalId = setInterval(fetchSystemHealth, 60000)
    return () => clearInterval(intervalId)
  }, [fetchSystemHealth])

  const endpointGroups = useMemo(
    () => [
      {
        key: 'orthanc-sync',
        title: 'Orthanc Synchronization',
        description: 'Manual controls for aligning Orthanc and PostgreSQL metadata.',
        endpoints: [
          {
            key: 'sync-orthanc-to-db',
            operation: 'sync-orthanc-to-db',
            label: 'Sync Orthanc → Database',
            method: 'POST',
            url: '/api/admin/sync/orthanc-to-db',
            description:
              'Pull new studies, restore deleted records, and refresh metadata from Orthanc into PostgreSQL.',
          },
          {
            key: 'sync-db-to-orthanc',
            operation: 'sync-db-to-orthanc',
            label: 'Sync Database → Orthanc',
            method: 'POST',
            url: '/api/admin/sync/db-to-orthanc',
            description:
              'Push patient and study metadata updates from PostgreSQL back to Orthanc.',
          },
          {
            key: 'sync-status',
            operation: 'sync-status',
            label: 'Fetch Sync Status',
            method: 'GET',
            url: '/api/admin/sync/status',
            description:
              'Retrieve the latest manual sync results along with service health information.',
          },
        ],
      },
      {
        key: 'backup',
        title: 'Data Backup & Cleanup',
        description: 'Manual controls for backup tasks and maintenance.',
        endpoints: [
          {
            key: 'backup-deleted-studies',
            operation: 'backup-deleted-studies',
            label: 'Backup Deleted Studies',
            method: 'POST',
            url: '/api/backup/deleted-studies',
            description:
              'Moves studies that are marked as deleted into the backup tables immediately.',
          },
        ],
      },
      {
        key: 'sync',
        title: 'Sync & Search Utilities',
        description: 'On-demand sync operations with Orthanc and OpenSearch.',
        endpoints: [
          {
            key: 'sync-incremental',
            operation: 'sync-incremental',
            label: 'Start Incremental Sync',
            method: 'POST',
            url: '/api/sync/incremental',
            payload: { sinceMinutes: 5 },
            description:
              'Triggers an incremental sync for studies updated within the last 5 minutes.',
          },
          {
            key: 'sync-full',
            operation: 'sync-full',
            label: 'Start Full Sync',
            method: 'POST',
            url: '/api/sync/full',
            description: 'Performs a full synchronization of studies with OpenSearch.',
          },
          {
            key: 'sync-clear-errors',
            operation: 'sync-clear-errors',
            label: 'Clear Sync Errors',
            method: 'POST',
            url: '/api/sync/clear-errors',
            description: 'Clears the sync retry/error queue.',
          },
        ],
      },
      {
        key: 'cache',
        title: 'Cache Management',
        description: 'Quick operations to validate or clear cache layers.',
        endpoints: [
          {
            key: 'cache-health',
            operation: 'cache-health',
            label: 'Check Cache Health',
            method: 'GET',
            url: '/api/cache/health',
            description: 'Retrieves current Redis cache health metrics.',
          },
          {
            key: 'cache-clear',
            operation: 'cache-clear',
            label: 'Clear Cache',
            method: 'POST',
            url: '/api/cache/clear',
            description: 'Clears all cache entries. Use carefully during off-peak hours.',
          },
        ],
      },
      {
        key: 'migration',
        title: 'MongoDB to PostgreSQL Migration',
        description: 'Verify and migrate MongoDB ObjectId references to PostgreSQL UUIDs.',
        endpoints: [
          {
            key: 'migration-verify',
            operation: 'migration-verify',
            label: 'Verify Migration Status',
            method: 'POST',
            url: '/api/migration/verify',
            description:
              'Scans database to identify MongoDB ObjectId references that need conversion to UUIDs. Safe to run anytime.',
          },
          {
            key: 'migration-dry-run',
            operation: 'migration-dry-run',
            label: 'Dry Run Migration',
            method: 'POST',
            url: '/api/migration/migrate',
            payload: { dryRun: true },
            description:
              'Simulates migration without making changes. Shows what would be updated. Safe to run anytime.',
          },
          {
            key: 'migration-run',
            operation: 'migration-run',
            label: 'Run Migration (LIVE)',
            method: 'POST',
            url: '/api/migration/migrate',
            payload: { dryRun: false },
            description:
              '⚠️ LIVE MIGRATION: Converts all MongoDB ObjectId references to PostgreSQL UUIDs. Make sure to backup database first!',
          },
        ],
      },
      {
        key: 'db-schema',
        title: 'Database Schema Migrations',
        description: 'Ensure the PostgreSQL schema matches the latest Sequelize migrations.',
        endpoints: [
          {
            key: 'db-migration-sync',
            operation: 'db-migration-sync',
            label: 'Apply Pending DB Migrations',
            method: 'POST',
            url: '/api/db-migration/sync',
            description:
              'Runs the latest Sequelize migrations on the API server and reports applied/pending steps.',
          },
        ],
      },
    ],
    [],
  )

  const handleTrigger = async endpoint => {
    const operationKey = endpoint.operation || endpoint.key
    setLoadingKey(operationKey)
    setResults(prev => ({
      ...prev,
      [operationKey]: {
        ...(prev[operationKey] || { history: [] }),
        status: 'pending',
        message: 'Request submitted...',
        timestamp: new Date().toISOString(),
        history: prev[operationKey]?.history || [],
      },
    }))

    const requestConfig = {
      method: endpoint.method,
      url: resolveEndpointUrl(endpoint.url),
    }

    if (endpoint.payload) {
      requestConfig.data =
        typeof endpoint.payload === 'function' ? endpoint.payload() : endpoint.payload
    }

    const startedAt = new Date()

    try {
      const response = await axios(requestConfig)
      const responseData = response?.data || {}
      const jobId = responseData.jobId
      const success = responseData.success !== false
      const message = responseData.message || 'Request completed successfully'
      const payload =
        responseData.summary ?? responseData.data ?? (jobId ? null : responseData)

      if (jobId) {
        setResults(prev => ({
          ...prev,
          [operationKey]: {
            ...(prev[operationKey] || { history: [] }),
            jobId,
            status: 'started',
            message,
            timestamp: new Date().toISOString(),
            history: prev[operationKey]?.history || [],
          },
        }))
      } else {
        setResults(prev => ({
          ...prev,
          [operationKey]: {
            ...(prev[operationKey] || { history: [] }),
            status: success ? 'success' : 'error',
            message,
            timestamp: new Date().toISOString(),
            statusCode: response?.status || null,
            data: payload,
            history: prev[operationKey]?.history || [],
          },
        }))

        if (payload?.systemHealth) {
          setSystemHealth(payload.systemHealth)
        }

        if (success) {
          showToastSuccess(message)
        } else {
          showToastError(message)
        }
      }
    } catch (error) {
      const statusCode = error?.response?.status
      const errorData = error?.response?.data || {}
      const errorMessage =
        errorData?.message || errorData?.error?.message || errorData?.error || error?.message || 'Failed'

      // Handle 401 (Unauthorized) specially for migration endpoints
      const isMigrationEndpoint =
        endpoint.url?.includes('/migration/') ||
        endpoint.url?.includes('/db-migration/') ||
        endpoint.key?.includes('migration')

      if (statusCode === 401 && isMigrationEndpoint) {
        const accessDeniedMessage = errorData?.message || 'Access denied. Only Clinic Admin users can access migration tools.'
        showToastError(accessDeniedMessage)
        
        setResults(prev => ({
          ...prev,
          [operationKey]: {
            ...(prev[operationKey] || { history: [] }),
            status: 'error',
            message: accessDeniedMessage,
            timestamp: startedAt.toISOString(),
            statusCode: 401,
            error: {
              ...errorData,
              accessDenied: true,
              role: errorData?.role || 'unknown',
            },
          },
        }))
      } else {
        // Handle other errors normally
        showToastError(errorMessage)

        setResults(prev => ({
          ...prev,
          [operationKey]: {
            ...(prev[operationKey] || { history: [] }),
            status: 'error',
            message: errorMessage,
            timestamp: startedAt.toISOString(),
            statusCode: statusCode || null,
            error: errorData || { message: errorMessage },
          },
        }))
      }
    } finally {
      setLoadingKey(null)
    }
  }

  const resetEndpointResult = endpointKey => {
    setResults(prev => ({
      ...prev,
      [endpointKey]: { ...initialResult },
    }))
  }

  const collectFailureEntries = useCallback(data => {
    const failures = []
    const inspect = payload => {
      if (!payload || typeof payload !== 'object') return

      if (Array.isArray(payload.failed)) {
        failures.push(
          ...payload.failed.map(entry => ({
            studyId: entry.studyId || entry.id || entry._id || null,
            reason: entry.reason || entry.message || JSON.stringify(entry),
          })),
        )
      }

      if (Array.isArray(payload.failedCreates)) {
        failures.push(
          ...payload.failedCreates.map(entry => ({
            studyId: entry.studyId || entry.id || null,
            reason: entry.reason || entry.message || JSON.stringify(entry),
          })),
        )
      }

      if (Array.isArray(payload.errors)) {
        failures.push(
          ...payload.errors.map(entry => ({
            studyId: entry.studyId || entry.id || null,
            reason: entry.reason || entry.message || JSON.stringify(entry),
          })),
        )
      }

      if (payload.summary && typeof payload.summary === 'object') {
        inspect(payload.summary)
      }

      if (payload.studies) {
        inspect(payload.studies)
      }

      if (payload.exams) {
        inspect(payload.exams)
      }
    }

    inspect(data)
    return failures
  }, [])

  const handleJobEvent = useCallback(
    event => {
      if (!event || !event.operation) {
        return
      }

      setResults(prev => {
        const previous = prev[event.operation] || {}
        const history = [...(previous.history || []), event]

        return {
          ...prev,
          [event.operation]: {
            ...previous,
            status: event.status,
            message: event.message,
            jobId: event.jobId,
            triggeredBy: event.triggeredBy ?? previous.triggeredBy ?? null,
            actorRole: event.actorRole ?? previous.actorRole ?? null,
            startedAt: event.startedAt ?? previous.startedAt ?? null,
            finishedAt: event.finishedAt ?? previous.finishedAt ?? null,
            durationMs: event.durationMs ?? previous.durationMs ?? null,
            data: event.data ?? previous.data ?? null,
            error: event.error ?? (event.status === 'error' ? previous.error : null),
            timestamp: event.timestamp,
            history,
          },
        }
      })

      if (
        (event.status === 'success' || event.status === 'error') &&
        event.triggeredBy &&
        currentUserId &&
        event.triggeredBy === currentUserId
      ) {
        if (event.status === 'success') {
          showToastSuccess(event.message || `${event.label || event.operation} completed`)
        } else if (event.status === 'error') {
          showToastError(event.message || `${event.label || event.operation} failed`)
        }
        fetchSystemHealth()
      }
    },
    [currentUserId, fetchSystemHealth],
  )

  useEffect(() => {
    socket.on('adminToolsJobUpdate', handleJobEvent)
    return () => {
      socket.off('adminToolsJobUpdate', handleJobEvent)
    }
  }, [handleJobEvent])

  // Migration management functions
  const fetchMigrations = useCallback(async (filters = null) => {
    try {
      setMigrationsLoading(true)
      const activeFilters = filters || migrationFilters
      const params = new URLSearchParams()
      
      if (activeFilters.status && activeFilters.status !== 'all') {
        params.append('status', activeFilters.status)
      }
      if (activeFilters.dateFrom) {
        params.append('dateFrom', activeFilters.dateFrom)
      }
      if (activeFilters.dateTo) {
        params.append('dateTo', activeFilters.dateTo)
      }
      params.append('sortBy', activeFilters.sortBy)
      params.append('sortOrder', activeFilters.sortOrder)
      params.append('page', activeFilters.page)
      params.append('limit', activeFilters.limit)

      const response = await axios.get(
        `${resolveEndpointUrl('/api/db-migration/list')}?${params.toString()}`
      )
      
      if (response.data?.success && response.data?.data) {
        setMigrations(response.data.data.migrations || [])
        setMigrationPagination(response.data.data.pagination || {})
        setMigrationSummary(response.data.data.summary || {})
      }
    } catch (error) {
      showToastError(error?.response?.data?.message || 'Failed to fetch migrations')
      console.error('Failed to fetch migrations:', error)
    } finally {
      setMigrationsLoading(false)
    }
  }, [resolveEndpointUrl, migrationFilters])

  const handleViewMigration = useCallback(async (filename) => {
    try {
      setViewingMigration(filename)
      setMigrationContentLoading(true)
      const response = await axios.get(
        resolveEndpointUrl(`/api/db-migration/${filename}/content`)
      )
      if (response.data?.success && response.data?.content) {
        setMigrationContent(response.data.content)
      } else {
        setMigrationContent(null)
      }
    } catch (error) {
      showToastError(error?.response?.data?.message || 'Failed to load migration content')
      setMigrationContent(null)
    } finally {
      setMigrationContentLoading(false)
    }
  }, [resolveEndpointUrl])

  const handleRunMigration = useCallback(async (filename) => {
    try {
      setMigrationsLoading(true)
      const response = await axios.post(resolveEndpointUrl('/api/db-migration/run'), {
        filename,
      })
      if (response.data?.success) {
        showToastSuccess(response.data.message || 'Migration executed successfully')
        // Auto-refresh after running migration
        setTimeout(() => {
          fetchMigrations(migrationFilters)
        }, 500)
      }
    } catch (error) {
      showToastError(error?.response?.data?.message || 'Failed to run migration')
    } finally {
      setMigrationsLoading(false)
    }
  }, [resolveEndpointUrl, fetchMigrations, migrationFilters])

  const handleRunAllMigrations = useCallback(async () => {
    if (
      !window.confirm(
        'Are you sure you want to run all pending migrations? This will modify the database.'
      )
    ) {
      return
    }

    try {
      setMigrationsLoading(true)
      const response = await axios.post(resolveEndpointUrl('/api/db-migration/run-all'))
      if (response.data?.success) {
        showToastSuccess(response.data.message || 'All migrations executed successfully')
        // Auto-refresh after running all migrations
        setTimeout(() => {
          fetchMigrations(migrationFilters)
        }, 1000)
      }
    } catch (error) {
      showToastError(error?.response?.data?.message || 'Failed to run migrations')
    } finally {
      setMigrationsLoading(false)
    }
  }, [resolveEndpointUrl, fetchMigrations, migrationFilters])

  const handleGenerateMigration = useCallback(async () => {
    const description = window.prompt('Enter migration description:')
    if (!description) return

    try {
      setMigrationsLoading(true)
      const response = await axios.post(resolveEndpointUrl('/api/db-migration/generate'), {
        description,
      })
      if (response.data?.success) {
        showToastSuccess('Migration file generated successfully')
        // Auto-refresh after generation
        setMigrationFilters(prev => ({ ...prev, page: 1 }))
        setTimeout(() => {
          fetchMigrations({ ...migrationFilters, page: 1 })
        }, 1000)
      }
    } catch (error) {
      showToastError(error?.response?.data?.message || 'Failed to generate migration')
    } finally {
      setMigrationsLoading(false)
    }
  }, [resolveEndpointUrl, fetchMigrations, migrationFilters])

  const handleGenerateAutoMigration = useCallback(async () => {
    if (
      !window.confirm(
        'This will generate migration files for all models with differences. Continue?'
      )
    ) {
      return
    }

    try {
      setMigrationsLoading(true)
      const response = await axios.post(resolveEndpointUrl('/api/db-migration/generate-auto'))
      if (response.data?.success) {
        showToastSuccess(
          response.data.message || 'Migration files generated successfully'
        )
        // Auto-refresh after generation - reset to first page
        setMigrationFilters(prev => ({ ...prev, page: 1 }))
        setTimeout(() => {
          fetchMigrations({ ...migrationFilters, page: 1 })
        }, 1000) // Small delay to ensure files are written
      }
    } catch (error) {
      showToastError(error?.response?.data?.message || 'Failed to generate migrations')
    } finally {
      setMigrationsLoading(false)
    }
  }, [resolveEndpointUrl, fetchMigrations, migrationFilters])

  // Fetch migrations on component mount
  useEffect(() => {
    if (userRole === ROLES.ClinicAdmin) {
      fetchMigrations()
    }
  }, [userRole, fetchMigrations])

  const renderResultRow = endpoint => {
    const operationKey = endpoint.operation || endpoint.key
    const result = results[operationKey]

    if (!result) {
      return null
    }

    const isSuccess = result.status === 'success'
    const isError = result.status === 'error'
    const alertColor = statusColorMap(result.status)

    const formatStatus = value =>
      value ? value.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'Unknown'

    const formatDuration = durationMs => {
      if (durationMs === null || durationMs === undefined) {
        return null
      }
      if (durationMs < 1000) {
        return `${durationMs} ms`
      }
      return `${(durationMs / 1000).toFixed(2)} s`
    }

    const failureEntries = collectFailureEntries(result.data || result.error)

    return (
      <tr>
        <td colSpan={5}>
          <Alert color={alertColor} className="mb-0">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center mb-1">
                  {isSuccess ? (
                    <CheckCircle size={16} className="me-1 text-success" />
                  ) : isError ? (
                    <AlertTriangle size={16} className="me-1 text-danger" />
                  ) : (
                    <Clock size={16} className="me-1 text-muted" />
                  )}
                  <strong>{result.message}</strong>
                </div>
                <div className="small text-muted">
                  {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Not available'}
                  {result.status ? ` • Status: ${formatStatus(result.status)}` : ''}
                  {result.statusCode ? ` • Status: ${result.statusCode}` : ''}
                  {result.durationMs !== null && result.durationMs !== undefined
                    ? ` • Duration: ${formatDuration(result.durationMs)}`
                    : ''}
                  {result.jobId ? ` • Job: ${result.jobId}` : ''}
                  {result.triggeredBy ? ` • Triggered by: ${result.triggeredBy}` : ''}
                </div>
                {result.data ? (
                  <div className="mt-2">
                    {/* Show summary for verification results */}
                    {result.data.summary ? (
                      <div className="mb-2">
                        <strong>Verification Summary:</strong>
                        <ul className="mb-0 small">
                          <li>
                            <strong>Filtermodels:</strong> {result.data.summary.filtermodels?.total || 0} issues found
                            {result.data.summary.filtermodels?.total > 0 && (
                              <ul className="mt-1 mb-0">
                                {result.data.summary.filtermodels.byField?.users > 0 && (
                                  <li>users: {result.data.summary.filtermodels.byField.users} filters</li>
                                )}
                                {result.data.summary.filtermodels.byField?.physicians > 0 && (
                                  <li>physicians: {result.data.summary.filtermodels.byField.physicians} filters</li>
                                )}
                                {result.data.summary.filtermodels.byField?.clinic_names > 0 && (
                                  <li>clinic_names: {result.data.summary.filtermodels.byField.clinic_names} filters</li>
                                )}
                                {result.data.summary.filtermodels.byField?.created_by > 0 && (
                                  <li>created_by: {result.data.summary.filtermodels.byField.created_by} filters</li>
                                )}
                              </ul>
                            )}
                          </li>
                          <li>
                            <strong>Users:</strong> {result.data.summary.users?.total || 0} issues found
                            {result.data.summary.users?.total > 0 && (
                              <ul className="mt-1 mb-0">
                                {result.data.summary.users.byField?.parent_user > 0 && (
                                  <li>parent_user: {result.data.summary.users.byField.parent_user} users</li>
                                )}
                                {result.data.summary.users.byField?.physicianname_clinics > 0 && (
                                  <li>physicianname_clinics: {result.data.summary.users.byField.physicianname_clinics} users</li>
                                )}
                                {result.data.summary.users.byField?.clinics > 0 && (
                                  <li>clinics: {result.data.summary.users.byField.clinics} users</li>
                                )}
                              </ul>
                            )}
                          </li>
                          <li>
                            <strong>Studies:</strong> {result.data.summary.studies?.total || 0} issues found
                          </li>
                          <li>
                            <strong>Other tables:</strong> {result.data.summary.other?.tables || 0} tables with{' '}
                            {result.data.summary.other?.total || 0} issues
                          </li>
                        </ul>
                        <div className="mt-1">
                          <strong>Total:</strong> {(result.data.summary.filtermodels?.total || 0) + 
                            (result.data.summary.users?.total || 0) + 
                            (result.data.summary.studies?.total || 0) + 
                            (result.data.summary.other?.total || 0)} issues need migration
                        </div>
                      </div>
                    ) : null}
                    {/* Show migration results (updated/skipped counts) */}
                    {(result.data.filtermodels?.updated !== undefined || result.data.users?.updated !== undefined) ? (
                      <div className="mb-2">
                        <strong>Migration Summary:</strong>
                        <ul className="mb-0 small">
                          {result.data.filtermodels && (
                            <li>
                              Filtermodels: {result.data.filtermodels.updated || 0} updated,{' '}
                              {result.data.filtermodels.skipped || 0} skipped
                            </li>
                          )}
                          {result.data.users && (
                            <li>
                              Users: {result.data.users.updated || 0} updated,{' '}
                              {result.data.users.skipped || 0} skipped
                            </li>
                          )}
                          {result.data.studies && (
                            <li>
                              Studies: {result.data.studies.updated || 0} updated,{' '}
                              {result.data.studies.skipped || 0} skipped
                            </li>
                          )}
                          {result.data.other && (
                            <li>
                              Other tables: {result.data.other.updated || 0} updated,{' '}
                              {result.data.other.skipped || 0} skipped
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : null}
                    <pre className="mt-1 mb-0 small bg-light rounded p-1" style={{ maxHeight: '400px', overflow: 'auto' }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {result.error && !isSuccess ? (
                  <div className="mt-1">
                    {result.error?.accessDenied ? (
                      <Alert color="warning" className="mb-1">
                        <strong>⚠️ Access Denied</strong>
                        <p className="mb-0 small">
                          {result.error.message || 'You do not have permission to access this feature.'}
                          {result.error.role && (
                            <span className="d-block mt-1">
                              Your role: <code>{result.error.role}</code> (Required: ClinicAdmin)
                            </span>
                          )}
                        </p>
                      </Alert>
                    ) : null}
                    <pre className="mt-1 mb-0 small bg-light rounded p-1 text-danger">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {failureEntries.length > 0 ? (
                  <div className="mt-1">
                    <strong>Errors ({failureEntries.length})</strong>
                    <ul className="small mb-0 text-danger">
                      {failureEntries.slice(0, 10).map((entry, idx) => (
                        <li key={`${entry.studyId || 'failure'}-${idx}`}>
                          {entry.studyId ? (
                            <span>
                              <code>{entry.studyId}</code>: {entry.reason}
                            </span>
                          ) : (
                            entry.reason
                          )}
                        </li>
                      ))}
                      {failureEntries.length > 10 ? (
                        <li>
                          …and {failureEntries.length - 10} more (see detailed data above)
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
                {result.history && result.history.length > 1 ? (
                  <details className="mt-1 mb-0">
                    <summary className="small text-muted">
                      Event history ({result.history.length})
                    </summary>
                    <ul className="small mb-0">
                      {result.history.map((item, index) => (
                        <li key={`${item.jobId || 'history'}-${index}`}>
                          {new Date(item.timestamp).toLocaleString()} — {formatStatus(item.status)}:{' '}
                          {item.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
              <Button
                color="link"
                size="sm"
                className="text-decoration-none p-0"
                onClick={() => resetEndpointResult(operationKey)}
              >
                Clear
              </Button>
            </div>
          </Alert>
        </td>
      </tr>
    )
  }

  if (userRole === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner color="primary" />
      </div>
    )
  }

  const formatStatusLabel = status =>
    status ? status.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : 'Unknown'

  if (userRole !== ROLES.ClinicAdmin) {
    return (
      <Row className="justify-content-center">
        <Col md="6">
          <Card className="text-center">
            <CardBody>
              <Shield size={32} className="text-danger mb-1" />
              <h4>Access Denied</h4>
              <p className="text-muted">
                This toolkit is available to Clinic Admin users only. Please contact an administrator if you
                believe this is an error.
              </p>
              <Button color="primary" onClick={() => (window.location.href = '/')}>
                Go to Dashboard
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <div className="clinic-admin-api-tools">
      <Row className="mb-2">
        <Col md="12">
          <Card>
            <CardBody className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h3 className="mb-0">System Health Status</h3>
                <p className="text-muted mb-0">
                  Real-time indicators for database, Redis cache, and OpenSearch services.
                </p>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Button color="primary" size="sm" outline onClick={fetchSystemHealth} disabled={healthLoading}>
                  {healthLoading ? (
                    <>
                      <Spinner size="sm" className="me-50" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} className="me-50" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
            <CardBody className="pt-0">
              {healthError ? (
                <Alert color="danger" className="mb-0">
                  {healthError}
                </Alert>
              ) : (
                <Row className="g-2">
                  <Col md="4" sm="6">
                    <Card className="mb-0">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-50">
                          <h5 className="mb-0">Database</h5>
                          <Badge color={statusColorMap(systemHealth?.services?.database?.status)}>
                            {formatStatusLabel(systemHealth?.services?.database?.status)}
                          </Badge>
                        </div>
                        <div className="small text-muted">
                          Latency:{' '}
                          {systemHealth?.services?.database?.latencyMs !== null &&
                          systemHealth?.services?.database?.latencyMs !== undefined
                            ? `${systemHealth.services.database.latencyMs} ms`
                            : 'N/A'}
                        </div>
                        {systemHealth?.services?.database?.error ? (
                          <div className="small text-danger mt-50">
                            {systemHealth.services.database.error}
                          </div>
                        ) : null}
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" sm="6">
                    <Card className="mb-0">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-50">
                          <h5 className="mb-0">Redis</h5>
                          <Badge color={statusColorMap(systemHealth?.services?.redis?.status)}>
                            {formatStatusLabel(systemHealth?.services?.redis?.status)}
                          </Badge>
                        </div>
                        <div className="small text-muted">
                          Response:{' '}
                          {systemHealth?.services?.redis?.responseTime
                            ? systemHealth.services.redis.responseTime
                            : 'N/A'}
                        </div>
                        <div className="small text-muted">
                          Mode: {formatStatusLabel(systemHealth?.services?.redis?.mode || 'unknown')}
                        </div>
                        <div className="small text-muted">
                          Connected: {systemHealth?.services?.redis?.connected ? 'Yes' : 'No'}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" sm="12">
                    <Card className="mb-0">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-50">
                          <h5 className="mb-0">OpenSearch</h5>
                          <Badge color={statusColorMap(systemHealth?.services?.opensearch?.status)}>
                            {formatStatusLabel(systemHealth?.services?.opensearch?.status)}
                          </Badge>
                        </div>
                        <div className="small text-muted">
                          Enabled: {systemHealth?.services?.opensearch?.enabled ? 'Yes' : 'No'}
                        </div>
                        <div className="small text-muted">
                          Latency:{' '}
                          {systemHealth?.services?.opensearch?.latencyMs !== null &&
                          systemHealth?.services?.opensearch?.latencyMs !== undefined
                            ? `${systemHealth.services.opensearch.latencyMs} ms`
                            : 'N/A'}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              )}
              <div className="small text-muted mt-1">
                Last updated:{' '}
                {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'N/A'}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md="12">
          <Card>
            <CardBody className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h3 className="mb-0">Clinic Admin Sync Tools</h3>
                <p className="text-muted mb-0">
                  Manually coordinate Orthanc, PostgreSQL, and related maintenance tasks. Actions run immediately against the live system.
                </p>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Badge color="light-secondary" className="px-2 py-1">
                  Role: Clinic Admin
                </Badge>
                <Badge color="light-warning" className="px-2 py-1">
                  Use with caution
                </Badge>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {endpointGroups.map(group => (
        <Row key={group.key} className="mb-3">
          <Col md="12">
            <Card>
              <CardHeader className="d-flex justify-content-between flex-wrap gap-1">
                <div>
                  <CardTitle tag="h4" className="mb-0">
                    {group.title}
                  </CardTitle>
                  <p className="text-muted mb-0">{group.description}</p>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>Endpoint</th>
                      <th style={{ width: '10%' }}>Method</th>
                      <th style={{ width: '32%' }}>URL</th>
                      <th>Description</th>
                      <th style={{ width: '12%' }} className="text-end">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.endpoints.map(endpoint => (
                      <React.Fragment key={endpoint.key}>
                        <tr>
                          <td className="fw-bold">{endpoint.label}</td>
                          <td>
                            <Badge color={methodColorMap[endpoint.method] || 'secondary'}>
                              {endpoint.method}
                            </Badge>
                          </td>
                          <td>
                            <code>{resolveEndpointUrl(endpoint.url)}</code>
                          </td>
                          <td>
                            {endpoint.description}
                            {endpoint.key === 'migration-run' && (
                              <Badge color="danger" className="ms-1">
                                ⚠️ LIVE
                              </Badge>
                            )}
                          </td>
                          <td className="text-end">
                            <Button
                              color={endpoint.key === 'migration-run' ? 'danger' : 'primary'}
                              size="sm"
                              onClick={() => {
                                if (endpoint.key === 'migration-run') {
                                  const confirmed = window.confirm(
                                    '⚠️ WARNING: This will modify your database!\n\n' +
                                    'Are you sure you want to run the LIVE migration?\n\n' +
                                    'Make sure you have:\n' +
                                    '1. Backed up your database\n' +
                                    '2. Run verification first\n' +
                                    '3. Run dry-run to see what will change\n\n' +
                                    'Click OK to proceed, or Cancel to abort.'
                                  )
                                  if (!confirmed) return
                                }
                                handleTrigger(endpoint)
                              }}
                              disabled={loadingKey === (endpoint.operation || endpoint.key)}
                            >
                              {loadingKey === (endpoint.operation || endpoint.key) ? (
                                <>
                                  <Spinner size="sm" className="me-50" />
                                  Working...
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={14} className="me-50" />
                                  Trigger
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                        {renderResultRow(endpoint)}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      ))}

      {/* Migration Management Section */}
      <Row className="mb-3">
        <Col md="12">
          <Card>
            <CardHeader className="d-flex justify-content-between flex-wrap gap-1">
              <div>
                <CardTitle tag="h4" className="mb-0">
                  Database Migration Management
                </CardTitle>
                <p className="text-muted mb-0">
                  Generate, view, and run database migration files
                </p>
              </div>
              <div className="d-flex gap-1">
                <Button
                  color="primary"
                  size="sm"
                  onClick={fetchMigrations}
                  disabled={migrationsLoading}
                >
                  {migrationsLoading ? (
                    <>
                      <Spinner size="sm" className="me-50" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} className="me-50" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={handleGenerateMigration}
                  disabled={migrationsLoading}
                >
                  Generate
                </Button>
                <Button
                  color="info"
                  size="sm"
                  onClick={handleGenerateAutoMigration}
                  disabled={migrationsLoading}
                >
                  Auto-Generate
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  onClick={handleRunAllMigrations}
                  disabled={migrationsLoading}
                >
                  Run All
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {/* Filters and Sorting */}
              <Row className="mb-3">
                <Col md="3">
                  <Label for="statusFilter" className="small">Status</Label>
                  <Input
                    type="select"
                    id="statusFilter"
                    value={migrationFilters.status}
                    onChange={(e) => {
                      const newFilters = { ...migrationFilters, status: e.target.value, page: 1 }
                      setMigrationFilters(newFilters)
                      fetchMigrations(newFilters)
                    }}
                    size="sm"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="executed">Executed</option>
                    <option value="failed">Failed</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Label for="dateFrom" className="small">Date From</Label>
                  <Input
                    type="date"
                    id="dateFrom"
                    value={migrationFilters.dateFrom}
                    onChange={(e) => {
                      const newFilters = { ...migrationFilters, dateFrom: e.target.value, page: 1 }
                      setMigrationFilters(newFilters)
                      fetchMigrations(newFilters)
                    }}
                    size="sm"
                  />
                </Col>
                <Col md="2">
                  <Label for="dateTo" className="small">Date To</Label>
                  <Input
                    type="date"
                    id="dateTo"
                    value={migrationFilters.dateTo}
                    onChange={(e) => {
                      const newFilters = { ...migrationFilters, dateTo: e.target.value, page: 1 }
                      setMigrationFilters(newFilters)
                      fetchMigrations(newFilters)
                    }}
                    size="sm"
                  />
                </Col>
                <Col md="2">
                  <Label for="sortBy" className="small">Sort By</Label>
                  <Input
                    type="select"
                    id="sortBy"
                    value={migrationFilters.sortBy}
                    onChange={(e) => {
                      const newFilters = { ...migrationFilters, sortBy: e.target.value, page: 1 }
                      setMigrationFilters(newFilters)
                      fetchMigrations(newFilters)
                    }}
                    size="sm"
                  >
                    <option value="status">Status</option>
                    <option value="date">Date</option>
                    <option value="filename">Filename</option>
                  </Input>
                </Col>
                <Col md="2">
                  <Label for="sortOrder" className="small">Order</Label>
                  <Input
                    type="select"
                    id="sortOrder"
                    value={migrationFilters.sortOrder}
                    onChange={(e) => {
                      const newFilters = { ...migrationFilters, sortOrder: e.target.value, page: 1 }
                      setMigrationFilters(newFilters)
                      fetchMigrations(newFilters)
                    }}
                    size="sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </Input>
                </Col>
                <Col md="1">
                  <Label className="small d-block">&nbsp;</Label>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => {
                      const resetFilters = {
                        status: 'all',
                        dateFrom: '',
                        dateTo: '',
                        sortBy: 'status',
                        sortOrder: 'asc',
                        page: 1,
                        limit: 10,
                      }
                      setMigrationFilters(resetFilters)
                      fetchMigrations(resetFilters)
                    }}
                    title="Reset Filters"
                  >
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* Summary */}
              <Row className="mb-2">
                <Col>
                  <div className="d-flex gap-3 align-items-center">
                    <small className="text-muted">
                      Total: <strong>{migrationSummary.totalCount}</strong> | 
                      Executed: <strong className="text-success">{migrationSummary.executedCount}</strong> | 
                      Pending: <strong className="text-warning">{migrationSummary.pendingCount}</strong>
                      {migrationSummary.filteredCount !== migrationSummary.totalCount && (
                        <> | Filtered: <strong>{migrationSummary.filteredCount}</strong></>
                      )}
                    </small>
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardBody className="p-0">
              {migrationsLoading && migrations.length === 0 ? (
                <div className="text-center p-4">
                  <Spinner color="primary" />
                </div>
              ) : migrations.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  No migration files found
                </div>
              ) : (
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Size</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {migrations.map((migration) => (
                      <tr key={migration.filename}>
                        <td>
                          <code className="small">{migration.filename}</code>
                        </td>
                        <td>
                          <Badge
                            color={
                              migration.status === 'executed'
                                ? 'success'
                                : migration.status === 'pending'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {migration.status === 'executed'
                              ? 'Executed'
                              : migration.status === 'pending'
                              ? 'Pending'
                              : 'Unknown'}
                          </Badge>
                        </td>
                        <td className="small text-muted">
                          {migration.created
                            ? new Date(migration.created).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="small text-muted">
                          {(migration.size / 1024).toFixed(2)} KB
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => handleViewMigration(migration.filename)}
                              title="View Content"
                            >
                              <Eye size={14} />
                            </Button>
                            {migration.status === 'pending' && (
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => handleRunMigration(migration.filename)}
                                disabled={migrationsLoading}
                                title="Run Migration"
                              >
                                <Play size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              {/* Pagination */}
              {migrationPagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="small text-muted">
                    Showing {((migrationPagination.page - 1) * migrationPagination.limit) + 1} to{' '}
                    {Math.min(migrationPagination.page * migrationPagination.limit, migrationPagination.total)} of{' '}
                    {migrationPagination.total} migrations
                  </div>
                  <Pagination className="mb-0">
                    <PaginationItem disabled={!migrationPagination.hasPrev}>
                      <PaginationLink
                        previous
                        onClick={() => {
                          if (migrationPagination.hasPrev) {
                            const newFilters = { ...migrationFilters, page: migrationPagination.page - 1 }
                            setMigrationFilters(newFilters)
                            fetchMigrations(newFilters)
                          }
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: migrationPagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and pages around current
                        const current = migrationPagination.page
                        return (
                          page === 1 ||
                          page === migrationPagination.totalPages ||
                          (page >= current - 1 && page <= current + 1)
                        )
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1]
                        const showEllipsis = prevPage && page - prevPage > 1
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem disabled>
                                <PaginationLink>...</PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationItem active={page === migrationPagination.page}>
                              <PaginationLink
                                onClick={() => {
                                  const newFilters = { ...migrationFilters, page }
                                  setMigrationFilters(newFilters)
                                  fetchMigrations(newFilters)
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        )
                      })}
                    <PaginationItem disabled={!migrationPagination.hasNext}>
                      <PaginationLink
                        next
                        onClick={() => {
                          if (migrationPagination.hasNext) {
                            const newFilters = { ...migrationFilters, page: migrationPagination.page + 1 }
                            setMigrationFilters(newFilters)
                            fetchMigrations(newFilters)
                          }
                        }}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Migration Content Modal */}
      {viewingMigration && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => {
            setViewingMigration(null)
            setMigrationContent(null)
          }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Migration File: {viewingMigration}</h5>
                <Button
                  color="link"
                  className="btn-close"
                  onClick={() => {
                    setViewingMigration(null)
                    setMigrationContent(null)
                  }}
                >
                  ×
                </Button>
              </div>
              <div className="modal-body">
                {migrationContentLoading ? (
                  <div className="text-center p-4">
                    <Spinner color="primary" />
                  </div>
                ) : migrationContent ? (
                  <pre
                    className="bg-light p-3 rounded"
                    style={{
                      maxHeight: '500px',
                      overflow: 'auto',
                      fontSize: '12px',
                    }}
                  >
                    {migrationContent}
                  </pre>
                ) : (
                  <Alert color="warning">Failed to load migration content</Alert>
                )}
              </div>
              <div className="modal-footer">
                <Button
                  color="secondary"
                  onClick={() => {
                    setViewingMigration(null)
                    setMigrationContent(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicAdminApiTools

