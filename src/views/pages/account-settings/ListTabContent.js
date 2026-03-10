import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Form,
  FormGroup,
  Label,
  Row,
  Spinner,
} from 'reactstrap'
import axios from 'axios'

import Select from 'react-select'
import { extractErrorMessage, selectThemeColors } from '@utils'
import { toast } from 'react-toastify'
// ** Sweet Alert Setup
import {
  showLoadingAlert,
  hideLoadingAlert,
  showErrorAlert,
  getErrorMessage,
} from '../../../utils/alerts'
import {
  ToastContent,
  ToastContentForError,
  showToastSuccess,
  showToastError,
} from '../../../utils/toast'
import { useForm } from 'react-hook-form'

// centralized alerts and toast

const ListTabContent = () => {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)

  const { handleSubmit } = useForm({ mode: 'onSubmit' })

  const onSubmit = async () => {
    showLoadingAlert()
    try {
      const data = modules.map((m) => {
        return {
          moduleName: m.moduleName,
          columns: m.selected,
        }
      })
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/lists-setting`,
        {
          modules: data,
        }
      )

      hideLoadingAlert()
      showToastSuccess(res.data?.message)
    } catch (err) {
      hideLoadingAlert()
      if (err) {
        showToastError(extractErrorMessage(err?.response?.data ?? err))
      }
    }
  }

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/lists-setting`)
      .then((res) => {
        const tempModules = []

        res?.data?.allModules?.map((module) => {
          const tempColumns = []
          module.columns.map((column) => {
            tempColumns.push({
              value: column.id,
              label: column.name,
            })
          })

          let tmpselected = []
          res?.data?.result?.modules?.map((m) => {
            if (m.moduleName === module.moduleName) {
              tmpselected = m.columns.map((c) => {
                return {
                  value: c.id,
                  label: c.name,
                }
              })
            }
          })

          tempModules.push({
            moduleName: module.moduleName,
            columns: tempColumns,
            selected: tmpselected,
          })
        })
        setModules(tempModules)
        setLoading(false)
      })
      .catch((err) => {
        if (err && err.response) {
          showErrorAlert(getErrorMessage(err))
        }
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="loading-initial">
        <Spinner color="primary" />
      </Card>
    )
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        {modules &&
          modules.map((module) => (
            <Col lg={6} md={6} sm={12}>
              <FormGroup>
                <Label
                  for={module.moduleName}
                  className="text-capitalize font-weight-bold"
                >
                  {module.moduleName?.replace('-', ' ')} Module Columns
                </Label>
                <Select
                  id="columns[]"
                  name="columns[]"
                  isMulti
                  closeMenuOnSelect={false}
                  isClearable={false}
                  theme={selectThemeColors}
                  defaultValue={module.selected}
                  options={module.columns}
                  className="react-select"
                  classNamePrefix="select"
                  onChange={(value) => {
                    module.selected = value
                  }}
                />
              </FormGroup>
            </Col>
          ))}
      </Row>

      <Row className="mt-1">
        <Col lg={12} md={12} sm={12}>
          <Button color="primary" type="submit">
            Save
          </Button>
          <Button
            className="ml-2"
            onClick={() => navigate(-1)}
            color="danger"
            type="button"
          >
            Close
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default ListTabContent
