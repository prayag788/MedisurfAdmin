import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, CardTitle, Col, Row } from 'reactstrap'
import { ArrowRight } from 'react-feather'

const fieldSets = ['PatientBirthDate', 'PatientID', 'PatientSex']

const PatientListItem = ({ data, value, callback, showArrow }) => {
  const [fieldDataHead, setFieldDataHead] = useState({ PatientName: '' })
  const [fieldData, setFieldData] = useState({})

  const isObject = obj => {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }

  const flattenObj = ob => {
    const result = {}

    for (const i in ob) {
      if (isObject(ob[i])) {
        const temp = flattenObj(ob[i])
        for (const j in temp) {
          result[j] = temp[j]
        }
      } else {
        result[i] = ob[i]
      }
    }
    return result
  }

  useEffect(() => {
    const extractedData = {}
    const flatData = flattenObj(data)
    fieldSets.forEach(tag => {
      if (flatData[tag] !== undefined) {
        extractedData[tag] = flatData[tag]
      }
    })

    setFieldData(() => extractedData)

    setFieldDataHead(prev => {
      return {
        ...prev,
        PatientName: flatData['PatientName'] ? flatData['PatientName'] : '',
        StudyDescription: flatData['StudyDescription'] ? flatData['StudyDescription'] : '',
      }
    })
  }, [data])

  const handleCallback = idx => {
    if (callback) {
      callback(idx)
    }
  }

  return (
    <Col key={value}>
      <Card
        className="cursor-pointer"
        onClick={() => {
          handleCallback(value)
        }}
      >
        <CardHeader className="pb-75">
          <CardTitle>{`${fieldDataHead['PatientName']}`}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={11}>
              {Object.keys(fieldData).map(key => {
                return (
                  <p className="mb-0">
                    {key}: <strong>{fieldData[key]}</strong>
                  </p>
                )
              })}
            </Col>
            <Col className="d-flex align-items-center justify-content-end">
              {showArrow === false ? '' : <ArrowRight />}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  )
}

export default PatientListItem
