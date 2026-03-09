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
  Pagination,
  PaginationItem,
  PaginationLink,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
  Table,
} from 'reactstrap'
import axios from 'axios'
import { RefreshCw, Search, XCircle } from 'react-feather'
import ROLES from '@configs/roles'
import { socket } from '@src/socket'
import { showToastError, showToastSuccess } from '@src/utils/toast'
import { getUserData } from '@utils'

const LOG_LEVEL_COLORS = {
  DEBUG: 'secondary',
  INFO: 'primary',
  WARN: 'warning',
  ERROR: 'danger',
  FATAL: 'dark',
}

const DEFAULT_FILTERS = {
  level: '',
  service: '',
  hostname: '',
  environment: '',
  query: '',
  from: '',
  to: '',
  size: '50',
}

const ClinicAdminLogs = () => {
  const [userRole, setUserRole] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [nextCursor, setNextCursor] = useState(null)
  const [cursorHistory, setCursorHistory] = useState([null])
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0)
  const [error, setError] = useState(null)

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
    const user = getUserData()
    if (user) {
      setCurrentUserId(user._id || user.id || null)
      setUserRole(user.role || 'guest')
    } else {
      setUserRole('guest')
    }
  }, [])

  const canView = useMemo(
    () =>
      userRole &&
      [ROLES.ClinicAdmin, ROLES.Admin, ROLES.SuperAdmin].includes(userRole),
    [userRole],
  )

  const buildQueryParams = useCallback(
    (overrides = {}) => {
      const params = {}
      Object.entries({ ...filters, ...overrides }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          params[key] = value
        }
      })
      return params
    },
    [filters],
  )

  const fetchLogs = useCallback(
    async overrides => {
      if (!canView) return null
      setLoading(true)
      setError(null)

      try {
        const params = buildQueryParams(overrides)
        const response = await axios.get(resolveEndpointUrl('/api/logs'), {
          params,
        })

        const payload = response?.data?.data ?? {}
        setLogs(payload.hits || [])
        setTotal(payload.total || 0)
        setNextCursor(payload.next || null)

        if (response?.data?.message) {
          showToastSuccess(response.data.message)
        }

        return payload
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || 'Failed to fetch logs'
        setError(message)
        showToastError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [buildQueryParams, canView, resolveEndpointUrl],
  )

  const refreshCurrentPage = useCallback(async () => {
    const targetCursor = cursorHistory[currentCursorIndex] || null
    const overrides = targetCursor ? { after: targetCursor } : {}
    await fetchLogs(overrides)
  }, [cursorHistory, currentCursorIndex, fetchLogs])

  const handleNextPage = useCallback(
    async event => {
      if (event) {
        event.preventDefault()
      }
      if (loading) {
        return
      }

      const existingCursor = cursorHistory[currentCursorIndex + 1]
      const targetCursor = existingCursor || nextCursor

      if (!targetCursor) {
        return
      }

      const payload = await fetchLogs({ after: targetCursor })
      if (!payload) {
        return
      }

      if (!existingCursor) {
        setCursorHistory(prev => {
          const base = prev.slice(0, currentCursorIndex + 1)
          return [...base, targetCursor]
        })
      }
      setCurrentCursorIndex(currentCursorIndex + 1)
    },
    [cursorHistory, currentCursorIndex, fetchLogs, loading, nextCursor],
  )

  const handlePreviousPage = useCallback(
    async event => {
      if (event) {
        event.preventDefault()
      }
      if (loading || currentCursorIndex === 0) {
        return
      }

      const targetCursor = cursorHistory[currentCursorIndex - 1] || null
      const payload = await fetchLogs(targetCursor ? { after: targetCursor } : {})
      if (!payload) {
        return
      }

      setCurrentCursorIndex(currentCursorIndex - 1)
    },
    [cursorHistory, currentCursorIndex, fetchLogs, loading],
  )

  const pageSize = useMemo(() => {
    const parsed = parseInt(filters.size, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
      return 50
    }
    return parsed
  }, [filters.size])

  const currentPage = currentCursorIndex + 1
  const totalPages =
    total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const hasPreviousPage = currentCursorIndex > 0
  const hasHistoryForward = currentCursorIndex < cursorHistory.length - 1
  const hasNextPage = hasHistoryForward || Boolean(nextCursor)
  const fromRecord =
    total === 0 ? 0 : Math.min(currentCursorIndex * pageSize + 1, total)
  const toRecord =
    total === 0
      ? 0
      : Math.min(currentCursorIndex * pageSize + logs.length, total)

  useEffect(() => {
    if (!canView) {
      return
    }

    setCursorHistory([null])
    setCurrentCursorIndex(0)
    setNextCursor(null)

    fetchLogs()
  }, [canView, fetchLogs])

  const handleFilterChange = event => {
    const { name, value } = event.target
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    const defaults = { ...DEFAULT_FILTERS }
    setFilters(defaults)
    setCursorHistory([null])
    setCurrentCursorIndex(0)
    setNextCursor(null)
  }

  useEffect(() => {
    const handler = event => {
      if (!event || !event.operation) {
        return
      }
      if (!canView) {
        return
      }
      if (event.operation === 'sync-orthanc-to-db' || event.operation === 'sync-db-to-orthanc') {
        refreshCurrentPage()
      }
    }

    socket.on('adminToolsJobUpdate', handler)
    return () => {
      socket.off('adminToolsJobUpdate', handler)
    }
  }, [canView, refreshCurrentPage])

  const renderLogLevel = level => {
    if (!level) {
      return <Badge color="light-secondary">UNKNOWN</Badge>
    }
    const normalized = (level || '').toUpperCase()
    const badgeColor = LOG_LEVEL_COLORS[normalized] || 'secondary'
    return <Badge color={badgeColor}>{normalized}</Badge>
  }

  const formatTimestamp = value => {
    if (!value) return '-'
    try {
      return new Date(value).toLocaleString()
    } catch (_) {
      return value
    }
  }

  if (userRole === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner color="primary" />
      </div>
    )
  }

  if (!canView) {
    return (
      <Row className="justify-content-center">
        <Col md="6">
          <Card className="text-center">
            <CardBody>
              <XCircle size={32} className="text-danger mb-1" />
              <h4>Access Denied</h4>
              <p className="text-muted mb-2">
                This section is restricted to Clinic Admins. Please contact an administrator if you believe this is an error.
              </p>
              <Button color="primary" onClick={() => (window.location.href = '/')}>
                Return Home
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <div className="clinic-admin-logs">
      <Row className="mb-2">
        <Col md="12">
          <Card>
            <CardBody className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h3 className="mb-0">System Logs</h3>
                <p className="text-muted mb-0">
                  View and filter application logs ingested into OpenSearch. Use filters to locate errors or specific services.
                </p>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Button color="primary" size="sm" outline onClick={() => refreshCurrentPage()} disabled={loading}>
                  <RefreshCw size={14} className={loading ? 'me-50 spin' : 'me-50'} />
                  {loading ? 'Refreshing…' : 'Refresh'}
                </Button>
                <Button color="secondary" size="sm" outline onClick={resetFilters} disabled={loading}>
                  Reset
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">
                <Search size={16} className="me-50" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Form
                onSubmit={event => {
                  event.preventDefault()
                  refreshCurrentPage()
                }}
              >
                <Row className="g-2">
                  <Col md="2" sm="6">
                    <FormGroup>
                      <Label for="level">Level</Label>
                      <Input id="level" name="level" type="select" value={filters.level} onChange={handleFilterChange}>
                        <option value="">Any</option>
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warn">Warn</option>
                        <option value="error">Error</option>
                        <option value="fatal">Fatal</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="2" sm="6">
                    <FormGroup>
                      <Label for="service">Service</Label>
                      <Input id="service" name="service" value={filters.service} onChange={handleFilterChange} placeholder="medisurf-api" />
                    </FormGroup>
                  </Col>
                  <Col md="2" sm="6">
                    <FormGroup>
                      <Label for="hostname">Hostname</Label>
                      <Input id="hostname" name="hostname" value={filters.hostname} onChange={handleFilterChange} placeholder={window.location.hostname} />
                    </FormGroup>
                  </Col>
                  <Col md="2" sm="6">
                    <FormGroup>
                      <Label for="environment">Environment</Label>
                      <Input id="environment" name="environment" value={filters.environment} onChange={handleFilterChange} placeholder="development" />
                    </FormGroup>
                  </Col>
                  <Col md="2" sm="6">
                    <FormGroup>
                      <Label for="size">Page Size</Label>
                      <Input id="size" name="size" type="select" value={filters.size} onChange={handleFilterChange}>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label for="query">Message Contains</Label>
                      <Input id="query" name="query" value={filters.query} onChange={handleFilterChange} placeholder="Search text…" />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="g-2">
                  <Col md="3" sm="6">
                    <FormGroup>
                      <Label for="from">From</Label>
                      <Input id="from" name="from" type="datetime-local" value={filters.from} onChange={handleFilterChange} />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="6">
                    <FormGroup>
                      <Label for="to">To</Label>
                      <Input id="to" name="to" type="datetime-local" value={filters.to} onChange={handleFilterChange} />
                    </FormGroup>
                  </Col>
                  <Col md="3" sm="6" className="d-flex align-items-end">
                    <Button color="primary" type="submit" disabled={loading}>
                      {loading ? <Spinner size="sm" /> : 'Apply Filters'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {error ? (
        <Row className="mb-2">
          <Col md="12">
            <Alert color="danger">{error}</Alert>
          </Col>
        </Row>
      ) : null}

      <Row>
        <Col md="12">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">Results ({total})</CardTitle>
              <div className="text-muted small">
                Page {currentPage} of {totalPages}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Level</th>
                      <th style={{ width: '20%' }}>Timestamp</th>
                      <th>Message</th>
                      <th style={{ width: '15%' }}>Service</th>
                      <th style={{ width: '15%' }}>Host</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 && !loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-3 text-muted">
                          No logs found for the selected filters.
                        </td>
                      </tr>
                    ) : null}
                    {logs.map(log => (
                      <tr key={`${log.id}-${log.timestamp}`}>
                        <td>{renderLogLevel(log.level)}</td>
                        <td>{formatTimestamp(log.timestamp)}</td>
                        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          <strong>{log.message || '-'}</strong>
                          {log.meta ? (
                            <pre className="mt-50 mb-0 small bg-light rounded p-1">{JSON.stringify(log.meta, null, 2)}</pre>
                          ) : null}
                        </td>
                        <td>{log.service || '-'}</td>
                        <td>{log.hostname || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
            <CardBody className="py-2">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-muted small mb-0">
                  {total === 0
                    ? 'No results to display'
                    : `Showing ${fromRecord.toLocaleString()}–${toRecord.toLocaleString()} of ${total.toLocaleString()}`}
                </span>
                <Pagination className="mb-0">
                  <PaginationItem disabled={!hasPreviousPage || loading}>
                    <PaginationLink
                      previous
                      tag="button"
                      type="button"
                      onClick={handlePreviousPage}
                    />
                  </PaginationItem>
                  <PaginationItem active>
                    <PaginationLink tag="button" type="button" onClick={event => event.preventDefault()}>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem disabled={!hasNextPage || loading}>
                    <PaginationLink
                      next
                      tag="button"
                      type="button"
                      onClick={handleNextPage}
                    />
                  </PaginationItem>
                </Pagination>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ClinicAdminLogs

