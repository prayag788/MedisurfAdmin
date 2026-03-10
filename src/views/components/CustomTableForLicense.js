// ** React Imports
import { Fragment, forwardRef } from 'react'

// ** Third Party Components
import DataTable from 'react-data-table-component'
import { ChevronDown, Plus } from 'react-feather'
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Row,
  Col,
} from 'reactstrap'

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
  <div className="custom-control custom-checkbox">
    <input
      type="checkbox"
      className="custom-control-input"
      ref={ref}
      {...rest}
    />
    <label className="custom-control-label" onClick={onClick} />
  </div>
))

const CustomTableForLicense = ({
  data,
  columns,
  AddNewModal,
  title,
  customStyles,
  addButtonOpion,
  searchOption,
  setSearchValue,
  searchValue,
  setFilteredData,
  filteredData,
  sortServer,
  handleSort,
  setRowsPerPage,
  rowsPerPage,
  totalRows,
  setPage,
}) => {
  // **
  addButtonOpion = addButtonOpion === undefined ? false : addButtonOpion
  searchOption = searchOption === undefined ? true : searchOption

  // ** States

  // ** Function to handle filter
  const handleFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    setSearchValue(value)

    if (value.length) {
      updatedData = data.filter((item) => {
        const startWiths = Object.keys(item).some((val) => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().includes(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().includes(value)
            } else if (
              typeof item[val] === 'object' &&
              item[val] &&
              item[val].length
            ) {
              if (
                item[val].find((o) => {
                  if (o.subject) {
                    return o.subject.toString().includes(value)
                  }
                })
              ) {
                return item[val].find((o) =>
                  o.subject.toString().includes(value)
                )
              } else if (
                item[val].find((o) => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'power-user') &&
                'Power User'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Modality') &&
                'Modality'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              }
            }
          }
        })

        const includes = Object.keys(item).some((val) => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().includes(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().includes(value)
            } else if (
              typeof item[val] === 'object' &&
              item[val] &&
              item[val].length
            ) {
              if (
                item[val].find((o) => {
                  if (o.subject) {
                    return o.subject.toString().includes(value)
                  }
                })
              ) {
                return item[val].find((o) =>
                  o.subject.toString().includes(value)
                )
              } else if (
                item[val].find((o) => o.subject === 't&c') &&
                'Terms & Conditions'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'power-user') &&
                'Power User'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Modality') &&
                'Modality'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().includes(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'data-analytics') &&
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

  return (
    <Fragment>
      <Card>
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-center border-bottom">
          <CardTitle tag="h4">{title}</CardTitle>
          <div className="d-flex mt-md-0 mt-1">
            {addButtonOpion ? (
              <Button
                className="ml-2"
                color="primary"
                onClick={() => {
                  AddNewModal()
                }}
              >
                <Plus size={15} />
                <span className="align-middle ml-50">Add New</span>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        {searchOption ? (
          <Row className="justify-content-end mx-0">
            <Col
              className="d-flex align-items-center justify-content-end mt-1"
              md="6"
              sm="12"
            >
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
          paginationTotalRows={totalRows}
          className="react-license-dataTable"
          sortIcon={<ChevronDown size={10} />}
          paginationRowsPerPageOptions={[7, 10, 25, 50, 75, 100]}
          onChangeRowsPerPage={(currentRowsPerPage) => {
            setRowsPerPage((prev) => currentRowsPerPage)
            localStorage.setItem('licenserow', currentRowsPerPage)
          }}
          data={data}
          defaultSortAsc={true}
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

export default CustomTableForLicense
