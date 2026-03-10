import React, { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Badge,
  Button,
  Alert,
  Progress,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap'
import {
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
} from 'react-feather'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const SyncMonitor = () => {
  const [syncStatus, setSyncStatus] = useState(null)
  const [healthMetrics, setHealthMetrics] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    action: null,
    loading: false,
  })

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await axios.get('/api/sync/status')
      setSyncStatus(response.data.data)
    } catch (error) {
      console.error('Error fetching sync status:', error)
      toast.error('Failed to fetch sync status')
    }
  }

  // Fetch health metrics
  const fetchHealthMetrics = async () => {
    try {
      const response = await axios.get('/api/sync/health')
      setHealthMetrics(response.data.data)
    } catch (error) {
      console.error('Error fetching health metrics:', error)
    }
  }

  // Fetch recent activities
  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/sync/activities?limit=20')
      setActivities(response.data.data.recentActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSyncStatus(),
        fetchHealthMetrics(),
        fetchActivities(),
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!refreshing) {
        setRefreshing(true)
        await Promise.all([
          fetchSyncStatus(),
          fetchHealthMetrics(),
          fetchActivities(),
        ])
        setRefreshing(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshing])

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchSyncStatus(),
      fetchHealthMetrics(),
      fetchActivities(),
    ])
    setRefreshing(false)
    toast.success('Data refreshed')
  }

  // Execute sync action
  const executeSyncAction = async (action) => {
    setActionModal({ ...actionModal, loading: true })

    try {
      let response
      switch (action) {
        case 'incremental':
          response = await axios.post('/api/sync/incremental', {
            sinceMinutes: 5,
          })
          break
        case 'full':
          response = await axios.post('/api/sync/full')
          break
        case 'clear-errors':
          response = await axios.post('/api/sync/clear-errors')
          break
        case 'reset':
          response = await axios.post('/api/sync/reset')
          break
        default:
          throw new Error('Unknown action')
      }

      toast.success(response.data.message)
      setActionModal({ isOpen: false, action: null, loading: false })

      // Refresh data after action
      setTimeout(() => {
        handleRefresh()
      }, 2000)
    } catch (error) {
      console.error('Error executing action:', error)
      toast.error(error.response?.data?.message || 'Action failed')
      setActionModal({ ...actionModal, loading: false })
    }
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge color="success">
            <CheckCircle size={14} className="me-1" />
            Healthy
          </Badge>
        )
      case 'degraded':
        return (
          <Badge color="warning">
            <AlertTriangle size={14} className="me-1" />
            Degraded
          </Badge>
        )
      case 'unhealthy':
        return (
          <Badge color="danger">
            <XCircle size={14} className="me-1" />
            Unhealthy
          </Badge>
        )
      default:
        return <Badge color="secondary">Unknown</Badge>
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  // Format uptime
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '400px' }}
      >
        <Spinner color="primary" />
      </div>
    )
  }

  return (
    <div className="sync-monitor">
      <Row>
        <Col md="12">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle tag="h4">
                <Activity className="me-2" />
                Sync System Monitor
              </CardTitle>
              <div>
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="me-2"
                >
                  <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                  {refreshing ? ' Refreshing...' : ' Refresh'}
                </Button>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setActionModal({ isOpen: true, action: 'settings' })
                  }
                >
                  <Settings size={14} /> Actions
                </Button>
              </div>
            </CardHeader>
          </Card>
        </Col>
      </Row>

      {/* Health Overview */}
      <Row>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Overall Health</h6>
                  {healthMetrics && getStatusBadge(healthMetrics.overall)}
                </div>
                <Activity size={24} className="text-primary" />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Queue Size</h6>
                  <h4>{syncStatus?.queueSize || 0}</h4>
                </div>
                <div className="text-primary">
                  {syncStatus?.queueSize > 50 ? (
                    <AlertTriangle />
                  ) : (
                    <CheckCircle />
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Success Rate</h6>
                  <h4>{healthMetrics?.databaseHooks?.successRate || '100%'}</h4>
                </div>
                <div className="text-success">
                  <CheckCircle />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Uptime</h6>
                  <h4>
                    {syncStatus?.uptime
                      ? formatUptime(syncStatus.uptime)
                      : 'N/A'}
                  </h4>
                </div>
                <div className="text-info">
                  <Activity />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Detailed Status */}
      <Row>
        <Col md="6">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Sync Manager Status</CardTitle>
            </CardHeader>
            <CardBody>
              {syncStatus?.syncManager && (
                <div>
                  <div className="mb-2">
                    <strong>Total Synced:</strong>{' '}
                    {syncStatus.syncManager.totalSynced}
                  </div>
                  <div className="mb-2">
                    <strong>Total Errors:</strong>{' '}
                    {syncStatus.syncManager.totalErrors}
                  </div>
                  <div className="mb-2">
                    <strong>Last Sync:</strong>{' '}
                    {formatTimestamp(syncStatus.syncManager.lastSync)}
                  </div>
                  <div className="mb-2">
                    <strong>Processing:</strong>{' '}
                    {syncStatus.syncManager.processingCount} items
                  </div>
                  <div className="mb-2">
                    <strong>Retry Queue:</strong>{' '}
                    {syncStatus.syncManager.retryQueueSize} items
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Database Hooks Status</CardTitle>
            </CardHeader>
            <CardBody>
              {syncStatus?.databaseHooks && (
                <div>
                  <div className="mb-2">
                    <strong>Total Hooks:</strong>{' '}
                    {syncStatus.databaseHooks.totalHooks}
                  </div>
                  <div className="mb-2">
                    <strong>Successful:</strong>{' '}
                    {syncStatus.databaseHooks.successfulSyncs}
                  </div>
                  <div className="mb-2">
                    <strong>Failed:</strong>{' '}
                    {syncStatus.databaseHooks.failedSyncs}
                  </div>
                  <div className="mb-2">
                    <strong>Success Rate:</strong>{' '}
                    {syncStatus.databaseHooks.successRate}
                  </div>
                  <div className="mb-2">
                    <strong>Initialized:</strong>{' '}
                    {syncStatus.databaseHooks.isInitialized ? 'Yes' : 'No'}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Health Recommendations */}
      {healthMetrics?.recommendations && (
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h5">Health Recommendations</CardTitle>
              </CardHeader>
              <CardBody>
                {healthMetrics.recommendations.map((rec, index) => (
                  <Alert
                    key={index}
                    color={
                      rec.type === 'critical'
                        ? 'danger'
                        : rec.type === 'warning'
                          ? 'warning'
                          : rec.type === 'info'
                            ? 'info'
                            : 'success'
                    }
                  >
                    <strong>{rec.message}</strong>
                    <br />
                    <small>{rec.action}</small>
                  </Alert>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Activities */}
      <Row>
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Recent Sync Activities</CardTitle>
            </CardHeader>
            <CardBody>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Study ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.studyId}</td>
                      <td>
                        <Badge color="info">{activity.type}</Badge>
                      </td>
                      <td>
                        <Badge color="success">{activity.status}</Badge>
                      </td>
                      <td>{formatTimestamp(activity.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        toggle={() => setActionModal({ isOpen: false, action: null })}
      >
        <ModalHeader
          toggle={() => setActionModal({ isOpen: false, action: null })}
        >
          Sync Actions
        </ModalHeader>
        <ModalBody>
          <div className="d-grid gap-2">
            <Button
              color="primary"
              onClick={() => executeSyncAction('incremental')}
              disabled={actionModal.loading}
            >
              {actionModal.loading ? (
                <Spinner size="sm" />
              ) : (
                'Trigger Incremental Sync'
              )}
            </Button>
            <Button
              color="warning"
              onClick={() => executeSyncAction('full')}
              disabled={actionModal.loading}
            >
              {actionModal.loading ? (
                <Spinner size="sm" />
              ) : (
                'Trigger Full Sync'
              )}
            </Button>
            <Button
              color="info"
              onClick={() => executeSyncAction('clear-errors')}
              disabled={actionModal.loading}
            >
              {actionModal.loading ? <Spinner size="sm" /> : 'Clear Errors'}
            </Button>
            <Button
              color="danger"
              onClick={() => executeSyncAction('reset')}
              disabled={actionModal.loading}
            >
              {actionModal.loading ? (
                <Spinner size="sm" />
              ) : (
                'Reset Sync System'
              )}
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setActionModal({ isOpen: false, action: null })}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default SyncMonitor
