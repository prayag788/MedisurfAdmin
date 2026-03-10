import { Card, CardBody, Button, Col, ButtonGroup, Row } from 'reactstrap'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, PieChart } from 'react-feather'
// ** Config
import themeConfig from '@configs/themeConfig'

const Header = ({ children }) => {
  const navigate = useNavigate()
  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={4} sm={12} className="d-flex justify-content-start">
            <Row className="ml-1">
              <Link
                className="brand-logo d-flex align-items-center"
                to="/explorer"
              >
                <img
                  id="medisurf-logo"
                  src={themeConfig.app.appLogoImage}
                  alt="logo"
                />
              </Link>
            </Row>
          </Col>
          <Col
            md={4}
            sm={12}
            className="d-flex align-items-center justify-content-center"
          >
            {children}
          </Col>
          <Col md={4} sm={12} className="d-flex justify-content-end">
            <ButtonGroup>
              <Button
                color="primary"
                outline
                onClick={() => {
                  navigate('/explorer')
                }}
              >
                <ArrowRight size={14} className="mr-50 mb-xs-25" />
                <span className="align-middle ms-25">Lookup</span>
              </Button>
              <Button
                color="primary"
                outline
                onClick={() => {
                  navigate('/explorer/query-retrieve')
                }}
              >
                <Search size={14} className="mr-50 mb-xs-25" />
                <span className="align-middle ms-25">Query/Retrieve</span>
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  navigate('/explorer/jobs')
                }}
              >
                <PieChart size={14} className="mr-50 mb-xs-25" />
                <span className="align-middle ms-25">Jobs</span>
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Header
