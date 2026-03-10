// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { useState } from 'react'
import { Card, Row, Col, Label, Input } from 'reactstrap'
import DataTable from 'react-data-table-component'
import { ChevronDown } from 'react-feather'

const CustomTable = ({ columns, paginationPerPage, data, handleRowClick }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // ** Function to handle filter
  const handleFilter = (e) => {
    const value = e.target.value
    let updatedData = []
    setSearchValue(value)

    if (value.length) {
      updatedData = data.filter((item) => {
        const startsWith = Object.keys(item).some((val) => {
          if (
            typeof item[val] === 'string' ||
            typeof item[val] === 'number' ||
            typeof item[val] === 'object'
          ) {
            if (typeof item[val] === 'string') {
              return item[val].toLowerCase().startsWith(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().startsWith(value)
            } else if (
              typeof item[val] === 'object' &&
              item[val] &&
              item[val].length
            ) {
              if (
                item[val].find((o) => o.subject.toString().startsWith(value))
              ) {
                return item[val].find((o) =>
                  o.subject.toString().startsWith(value)
                )
              } else if (
                item[val].find((o) => o.subject === 't&c') &&
                'Terms & Conditions'
                  .toLowerCase()
                  .startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'upload-dicom') &&
                'Upload Dicom Image'
                  .toLowerCase()
                  .startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'doctors') &&
                'Doctors'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Study List Viewer') &&
                'Study list'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'power-user') &&
                'Power User'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Modality') &&
                'Modality'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'data-analytics') &&
                'Data analytics'.toLowerCase().startsWith(value.toLowerCase())
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
              return item[val].toLowerCase().startsWith(value.toLowerCase())
            } else if (typeof item[val] === 'number') {
              return item[val].toString().startsWith(value)
            } else if (
              typeof item[val] === 'object' &&
              item[val] &&
              item[val].length
            ) {
              if (
                item[val].find((o) => o.subject.toString().startsWith(value))
              ) {
                return item[val].find((o) =>
                  o.subject.toString().startsWith(value)
                )
              } else if (
                item[val].find((o) => o.subject === 't&c') &&
                'Terms & Conditions'
                  .toLowerCase()
                  .startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Study List Viewer') &&
                'Upload Dicom Image'
                  .toLowerCase()
                  .startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'upload-dicom') &&
                'Doctors'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'doctors') &&
                'Study list'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'power-user') &&
                'Power User'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'Modality') &&
                'Modality'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'privacy-policy') &&
                'Privacy policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'cookie-policy') &&
                'Cookie policy'.toLowerCase().startsWith(value.toLowerCase())
              ) {
                return true
              } else if (
                item[val].find((o) => o.subject === 'data-analytics') &&
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
    }
  }

  return (
    <Card>
      <Row className="justify-content-end mx-0 p-1">
        <Col
          className="d-flex align-items-center justify-content-end"
          md="6"
          sm="12"
        >
          <Label className="mr-1" for="search-input">
            Search
          </Label>
          <Input
            className="dataTable-filter"
            type="text"
            bsSize="sm"
            id="search-input"
            value={searchValue}
            onChange={handleFilter}
          />
        </Col>
      </Row>
      <DataTable
        noHeader
        pagination
        columns={columns}
        paginationPerPage={paginationPerPage ? paginationPerPage : 25}
        className="react-dataTable"
        sortIcon={<ChevronDown size={10} />}
        paginationDefaultPage={currentPage + 1}
        pointerOnHover={true}
        onRowClicked={handleRowClick}
        data={searchValue.length ? filteredData : data}
      />
    </Card>
  )
}

export default CustomTable
