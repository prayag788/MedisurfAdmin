// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { useEffect, useState } from 'react'
import { Card, Row, Col, Label, Input, CardHeader, CardTitle } from 'reactstrap'
import ListTable from '../../../@core/components/list-table'

const CustomTable = ({ columns, data, handleRowClick, tableName }) => {
  const [tableData, setTableData] = useState([])
  const [searchValue, setSearchValue] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [isShow, setIsShow] = useState(false)

  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [moduleName, setModuleName] = useState('')

  // ** Function to handle filter
  function handleSort(d) {
    if (d.sortField) {
      setSortOrder(d.sortOrder)
      setSortField(d.sortField)

      if (sortOrder === -1) {
        data.sort((a, b) => String(b[d.sortField]).localeCompare(String(a[d.sortField])))
      } else {
        data.sort((a, b) => String(a[d.sortField]).localeCompare(String(b[d.sortField])))
      }

      setTableData(data)
    }
  }

  const handleFilter = e => {
    const value = e.target.value
    let updatedData = []
    setSearchValue(value)

    if (value.length) {
      updatedData = tableData.filter(item => {
        const startsWith = Object.keys(item).some(val => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().startsWith(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().startsWith(value)
            } else if (typeof item[val] === 'object' && item[val] && item[val].length) {
              if (item[val].find(o => o.subject?.toString()?.startsWith(value))) {
                return item[val].find(o => o.subject?.toString().startsWith(value))
              } else if (
                item[val].find(o => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'power-user') &&
                'Power User'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Modality') &&
                'Modality'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              }
            }
          }
        })

        const includes = Object.keys(item).some(val => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().startsWith(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().startsWith(value)
            } else if (typeof item[val] === 'object' && item[val] && item[val].length) {
              if (item[val].find(o => o.subject?.toString().startsWith(value))) {
                return item[val].find(o => o.subject?.toString().startsWith(value))
              } else if (
                item[val].find(o => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'power-user') &&
                'Power User'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Modality') &&
                'Modality'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              }
            }
          }
        })

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData(updatedData)
      setSearchValue(value)
    } else {
      setSearchValue(null)
    }
  }

  useEffect(() => {
    if (data.length > 0) {
      setTableData(data)
    }
  }, [data])

  useEffect(() => {
    setIsShow(false)
    switch (tableName) {
      case 'explorer-series':
        setModuleName(() => 'Series')
        break

      case 'explorer-studies':
        setModuleName(() => 'Studies')
        break

      case 'explorer-instances':
        setModuleName(() => 'Instances')
        break

      default:
        setModuleName(() => tableName)
        break
    }
    setIsShow(true)
  }, [tableName])

  return (
    <Card>
      <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
        <CardTitle tag="h4">{moduleName}</CardTitle>
      </CardHeader>
      <Row className="justify-content-end mx-0">
        <Col className="d-flex align-items-center justify-content-end mt-1" md="6" sm="12">
          <Label className="mr-1" for="search-input">
            Search
          </Label>
          <Input
            className="dataTable-filter mb-50"
            type="text"
            bsSize="sm"
            id="search-input"
            value={searchValue}
            onChange={handleFilter}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          {isShow && (
            <ListTable
              {...{
                ref: { tableName },
                moduleName: tableName,
                tableData: searchValue ? filteredData : tableData,
                visibleColumns: columns,
                rows: rowsPerPage,
                totalRecords: searchValue ? filteredData.length : tableData.length,
                onRowSelect: handleRowClick,
                first: page,
                onSort: handleSort,
                sortField,
                sortOrder,
                onPage: e => {
                  setPage(e.first++)
                  setRowsPerPage(prev => e.rows)
                },
              }}
            />
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default CustomTable
