import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, CardTitle, Col, Row } from 'reactstrap'
import { ArrowRight } from 'react-feather'
import { flattenObj } from '../../../utility/Utils'
import moment from 'moment'
import { isUserLoggedIn } from '@utils'

const DetailsCard = ({
  data,
  idx,
  callback,
  showArrow,
  title,
  showKeys,
  className,
  level,
}) => {
  const [fieldData, setFieldData] = useState({})
  const [calculatedTitle, setCalculatedTitle] = useState('')
  const userData = JSON.parse(isUserLoggedIn())

  useEffect(() => {
    if (showKeys) {
      setFieldData((prev) => {
        const flatData = flattenObj(data)
        let tags

        if (Array.isArray(title)) {
          tags = [...showKeys, ...title]
        } else {
          tags = showKeys
        }

        tags.forEach((tag) => {
          if (flatData[tag] !== undefined) {
            prev[tag] = flatData[tag]
          }
        })

        if (Array.isArray(title)) {
          setCalculatedTitle(() => {
            let ctitle = ''
            if (level === 'series') {
              title.forEach((value) => {
                ctitle += ctitle
                  ? `- ${prev[value] !== undefined ? prev[value] : ''}`
                  : `${prev[value] !== undefined ? prev[value] : ''} `
                delete prev[value]
              })
              ctitle = `Instance: ${ctitle}`
            } else {
              title.forEach((value) => {
                ctitle += ctitle
                  ? `- ${prev[value] ? prev[value] : ''}`
                  : `${prev[value] ? prev[value] : ''} `
                delete prev[value]
              })
            }
            return ctitle
          })
        } else {
          tags = showKeys
        }

        return { ...prev }
      })
    } else {
      setFieldData(() => data)
    }
  }, [data])

  const handleCallback = (idx) => {
    if (callback) {
      callback(idx)
    }
  }

  return (
    <Card
      className={!className ? '' : className.main ? className.main : ''}
      onClick={() => {
        handleCallback(idx)
      }}
    >
      <CardHeader
        className={`pb-75 ${!className ? '' : className.head ? className.head : ''}`}
      >
        <CardTitle>{calculatedTitle ? calculatedTitle : title}</CardTitle>
      </CardHeader>
      <CardBody
        className={!className ? '' : className.body ? className.body : ''}
      >
        <Row>
          <Col md={11}>
            {Object.keys(fieldData).map((key) => {
              if (key === 'PatientBirthDate' || key === 'StudyDate') {
                return (
                  <p className="mb-0">
                    {key}:{' '}
                    <strong>
                      {moment(fieldData[key]).format(
                        userData?.dateFormats?.dateFormat
                      )}
                    </strong>
                  </p>
                )
              } else {
                return (
                  <p className="mb-0">
                    {key}: <strong>{fieldData[key]}</strong>
                  </p>
                )
              }
            })}
          </Col>
          <Col className="d-flex align-items-center justify-content-end">
            {showArrow === false ? '' : <ArrowRight />}
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailsCard
