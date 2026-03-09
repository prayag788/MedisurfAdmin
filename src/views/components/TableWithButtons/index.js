// ** React Imports
import { Fragment, useState, forwardRef } from 'react'

// ** Third Party Components
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus } from 'react-feather'
import { Card, CardHeader, CardTitle, Button, Input, Label, Row, Col } from 'reactstrap'

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
  <div className="custom-control custom-checkbox">
    <input type="checkbox" className="custom-control-input" ref={ref} {...rest} />
    <label className="custom-control-label" onClick={onClick} />
  </div>
))

const DataTableWithButtons = ({
  data,
  columns,
  AddNewModal,
  title,
  customStyles,
  addButtonOpion,
  searchOption,
  row,
  rowperpage,
  limitHandler,
  limit = false,
  setPage,
  handleSort,
  totalRows,
  rowsPerPage,
  setRowsPerPage,
  searchValue,
  setSearchValue,
  setFilteredData,
  setCurrentPage,
  sortServer = null,
}) => {
  // **
  addButtonOpion = addButtonOpion === undefined ? true : addButtonOpion
  searchOption = searchOption === undefined ? true : searchOption

  // ** States

  if (!setCurrentPage) {
    const [currentPage, setCurrentPage] = useState(0)
  }

  if (!setSearchValue) {
    const [searchValue, setSearchValue] = useState('')
  }
  if (sortServer === null) {
    sortServer = true
  }

  if (!setFilteredData || setFilteredData === undefined) {
    const [filteredData, setFilteredData] = useState([])
  }

  // ** Function to handle filter
  const handleFilter = e => {
    const value = e.target.value
    let updatedData = []
    setSearchValue(value)

    const status = {
      0: { title: 'Inactive', color: 'light-danger' },
      1: { title: 'Active', color: 'light-success' },
      2: { title: 'Professional', color: 'light-success' },
      3: { title: 'Rejected', color: 'light-danger' },
      4: { title: 'Resigned', color: 'light-warning' },
      5: { title: 'Applied', color: 'light-info' },
    }

    if (value.length) {
      updatedData = data.filter(item => {
        const startWiths = Object.keys(item).some(val => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().includes(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().includes(value)
            } else if (typeof item[val] === 'object' && item[val] && item[val].length) {
              if (
                item[val].find(o => {
                  if (o.subject) {
                    return o.subject.toString().includes(value)
                  }
                })
              ) {
                return item[val].find(o => o.subject.toString().includes(value))
              } else if (
                item[val].find(o => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'power-user') &&
                'Power User'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Modality') &&
                'Modality'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().includes(value.toLowerCase())
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
              return item[val].toLowerCase().includes(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().includes(value)
            } else if (typeof item[val] === 'object' && item[val] && item[val].length) {
              if (
                item[val].find(o => {
                  if (o.subject) {
                    return o.subject.toString().includes(value)
                  }
                })
              ) {
                return item[val].find(o => o.subject.toString().includes(value))
              } else if (
                item[val].find(o => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'power-user') &&
                'Power User'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'Modality') &&
                'Modality'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find(o => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              }
            }
          }
        })

        if (startWiths) {
          return startWiths
        } else if (!startWiths && includes) {
          return includes
        } else return null
      })
      setFilteredData(updatedData)
      setSearchValue(value)
    }
  }

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
    setPage(page.selected)
  }

  // ** Function to handle per page
  const handlePerPage = e => {
    setRowsPerPage(parseInt(e.target.value))
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={totalRows / rowsPerPage || 1}
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      nextLinkClassName="page-link"
      nextClassName="page-item next"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  )

  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result

    const columnDelimiter = ','
    const lineDelimiter = '\n'
    const keys = Object.keys(data[0])

    result = ''
    result += keys.join(columnDelimiter)
    result += lineDelimiter

    array.forEach(item => {
      let ctr = 0
      keys.forEach(key => {
        if (ctr > 0) result += columnDelimiter

        result += item[key]

        ctr++
      })
      result += lineDelimiter
    })

    return result
  }

  // ** Downloads CSV
  function downloadCSV(array) {
    const link = document.createElement('a')
    let csv = convertArrayOfObjectsToCSV(array)
    if (csv === null) return

    const filename = 'export.csv'

    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`
    }

    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', filename)
    link.click()
  }

  return (
    <Fragment>
      <Card>
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
          <CardTitle tag="h4">{title}</CardTitle>
          <div className="d-flex mt-md-0 mt-1">
            {addButtonOpion ? (
              <Button
                className="ml-2"
                color={limit ? 'secondary' : 'primary'}
                onClick={
                  limit
                    ? () => limitHandler()
                    : () => {
                        AddNewModal()
                      }
                }
              >
                <Plus size={15} />
                <span className="align-middle ml-50">Add New</span>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        {searchOption ? (
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
        ) : null}
        <DataTable
          noHeader
          pagination
          columns={columns}
          customStyles={customStyles}
          paginationPerPage={rowsPerPage}
          className="react-dataTable"
          sortIcon={<ChevronDown size={10} />}
          paginationRowsPerPageOptions={[7, 10, 25, 50, 75, 100]}
          onChangeRowsPerPage={currentRowsPerPage => {
            setRowsPerPage(prev => currentRowsPerPage)
            row === 'modality'
              ? localStorage.setItem('modalityrow', currentRowsPerPage)
              : row === 'poweruser'
                ? localStorage.setItem('poweruserrow', currentRowsPerPage)
                : row === 'technicianuser'
                  ? localStorage.setItem('technicianuserrow', currentRowsPerPage)
                  : localStorage.setItem('doctorrow', currentRowsPerPage)
          }}
          data={data}
          defaultSortAsc={true}
          paginationTotalRows={totalRows}
          sortServer={sortServer}
          onSort={handleSort}
          onChangePage={(page, totalRows) => {
            setPage(page)
          }}
        />
      </Card>
    </Fragment>
  )
}

export default DataTableWithButtons
