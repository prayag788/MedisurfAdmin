// ** React Imports
import { Fragment, useEffect } from 'react'
import DataTable from 'react-data-table-component'
// ** Third Party Components
import { ChevronDown } from 'react-feather'
import { Input, CardTitle, FormGroup, Button, Col, Row, CardBody, Card, Label } from 'reactstrap'
import { checkForOtherOperationDm, getStudyLockDataAPIDm, setLockPatientIdsDm } from '@utils'
import STUDYSTATUS from '@configs/studyStatus'
import { socket } from '../../socket'
const WorkSheetPanel = ({
  userData,
  studyId,
  fileInput,
  worksheetFile,
  worksheetData,
  column,
  previewWorksheet,
  setWorksheetFile,
  worksheetUploadHandler,
}) => {
  useEffect(() => {
    socket.on('reloadRouteStudy', Data => {
      if (Data) {
        // setLockPatientIdsDm(Data)
      }
    })
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      await getStudyLockDataAPIDm()
    }
    fetchData()
  }, [])

  useEffect(() => {}, [worksheetData])

  return (
    <Fragment>
      <Card className="worksheet-panel">
        <CardBody className="flex-grow-1">
          <Row>
            <Col md="5" lg="5" xl="4">
              <CardTitle tag="h4" className="text-nowrap">
                Worksheet
              </CardTitle>
              {(userData.role === 'TCU' || userData.role === 'RDU') &&
                studyId.status !== STUDYSTATUS.Final && (
                  <>
                    <div className="mt-1 mb-1">
                      <FormGroup className="w-100">
                        <Input
                          ref={fileInput}
                          type="file"
                          accept=".pdf"
                          id="studyWorksheet"
                          name="studyWorksheet"
                          multiple
                          onChange={e => setWorksheetFile(e.target.files)}
                        />
                        <Label>*Accepted File Formats: PDF. Max file size: 5 MB.</Label>
                      </FormGroup>
                      <FormGroup className="w-100">
                        <Button
                          className="cursor-pointer text-nowrap"
                          color="primary"
                          onClick={() => {
                            if (checkForOtherOperationDm(studyId, 1)) {
                              return false
                            }
                            worksheetUploadHandler(studyId?.ID)
                          }}
                        >
                          <span className="align-middle">Upload worksheet</span>
                        </Button>
                      </FormGroup>
                    </div>

                    {worksheetData.length > 0 && (
                      <div className="mt-1">
                        <DataTable
                          noHeader
                          highlightOnHover
                          columns={column}
                          className="worksheet_table react-dataTable"
                          sortIcon={<ChevronDown size={10} />}
                          data={worksheetData}
                        />
                      </div>
                    )}
                  </>
                )}
              {(userData.role === 'TCU' || userData.role === 'RDU') &&
                studyId.status === STUDYSTATUS.Final &&
                worksheetData.length > 0 && (
                  <div className="mt-1">
                    <DataTable
                      noHeader
                      highlightOnHover
                      columns={column}
                      className="worksheet_table react-dataTable"
                      sortIcon={<ChevronDown size={10} />}
                      data={worksheetData}
                    />
                  </div>
                )}
            </Col>
            <Col
              className={!previewWorksheet && `rounded border border-secondary p-0`}
              md="7"
              lg="7"
              xl="8"
              style={{ minHeight: `${previewWorksheet ? '800px' : '300px'}` }}
            >
              {previewWorksheet ? (
                <div className="text-center w-100 h-100">
                  <iframe
                    allowfullscreen="true"
                    webkitallowfullscreen="true"
                    mozallowfullscreen="true"
                    src={previewWorksheet}
                    className="w-100 h-100"
                  />{' '}
                  :
                </div>
              ) : (
                <h3 className="d-flex justify-content-center align-items-center h-100">
                  Worksheet
                </h3>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default WorkSheetPanel
