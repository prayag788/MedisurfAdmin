// Test file to verify PR Agent is working
// This file contains intentional issues that PR Agent should detect

import React, { useState } from 'react'

const TestComponent = () => {
  // Issue 1: Unused state variable
  const [unusedState, setUnusedState] = useState('')
  
  // Issue 2: Missing error handling
  const fetchData = async () => {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  }
  
  // Issue 3: Potential security issue - direct innerHTML
  const renderHTML = (htmlContent) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  }
  
  // Issue 4: Missing dependency in useEffect
  React.useEffect(() => {
    fetchData()
  }, []) // Missing fetchData dependency
  
  // Issue 5: Hardcoded API endpoint
  const API_URL = 'http://localhost:3000/api'
  
  return (
    <div>
      <h1>Test Component</h1>
      {renderHTML('<script>alert("XSS")</script>')}
    </div>
  )
}

export default TestComponent