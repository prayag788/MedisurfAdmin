# Report Preview Module

## Overview

The Report Preview module provides a comprehensive interface for medical professionals to create, edit, and manage medical reports with DICOM image integration and worksheet management.

## Components

### PreviewReport.js

Main component that handles:

- Report creation and editing with TinyMCE editor
- DICOM image selection and preview
- Template management and application
- Report saving and finalization
- Addendum creation for finalized reports
- Study lock management for concurrent access control

### Tabs.js

Navigation component providing:

- Report editing tab
- DICOM images tab
- Worksheets management tab

### WorkSheetPanel.js

Worksheet management component featuring:

- File upload functionality
- Worksheet preview and download
- Delete operations with confirmation
- Responsive data table display

### APIs (apis.js)

API integration functions:

- `getAllWorkSheet(id)` - Fetch all worksheets for a study
- `uploadWorksheet(data, id)` - Upload new worksheet files
- `deleteWorksheet(studyId, worksheetId)` - Delete worksheet
- `getAllDicomImage(seriesId)` - Get DICOM images for series
- `getAllSeries(seriesId)` - Get all series for study
- `getDiagnosis()` - Fetch diagnosis templates
- `getTemplates()` - Fetch report templates

## Features

### Report Management

- Rich text editing with TinyMCE
- Template selection and application
- Auto-save functionality
- Draft and final report states
- Change detection and validation

### DICOM Integration

- Series selection and navigation
- Image preview and selection
- Multi-image selection for reports
- Responsive image grid layout

### Worksheet Management

- Multi-file upload support
- File type validation (PDF, DOC, DOCX, images)
- Preview and download functionality
- Organized data table display

### Security & Access Control

- Role-based access control
- Study locking mechanism
- Authentication token validation
- Concurrent user management

### User Experience

- Responsive design for all screen sizes
- Loading states and progress indicators
- Error handling with user-friendly messages
- Keyboard shortcuts and accessibility

## Usage

```javascript
import { PreviewReport } from './views/report'

// Basic usage
<PreviewReport renderFrom="normal" />

// Shared study usage
<PreviewReport renderFrom="sharedStudy" />
```

## Dependencies

- React 18+
- TinyMCE React
- Reactstrap
- React Data Table Component
- Axios for API calls
- Socket.io for real-time updates
- SweetAlert2 for notifications

## Configuration

Ensure the following environment variables are set:

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SOCKET_API_URL` - Socket.io server URL

## File Structure

```
report/
├── PreviewReport.js    # Main component
├── Tabs.js            # Navigation tabs
├── WorkSheetPanel.js   # Worksheet management
├── apis.js            # API functions
├── styles.css         # Component styles
├── index.js           # Module exports
└── README.md          # This file
```

## Styling

The module includes comprehensive CSS for:

- DICOM image grid layouts
- Report editor styling
- Worksheet management interface
- Responsive design breakpoints
- Print-friendly styles

## Error Handling

- Network error management
- File upload validation
- User permission checks
- Graceful degradation for missing data

## Performance Optimizations

- Lazy loading of DICOM images
- Debounced auto-save functionality
- Efficient re-rendering with React hooks
- Optimized API calls with caching
