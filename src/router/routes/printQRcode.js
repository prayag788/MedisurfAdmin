import { lazy } from 'react'

const PrintQRcode = [
  {
    path: '/print-QR-code',
    component: lazy(() => import('../../views/print-qrcode')),
    meta: {
      action: 'manage',
      resource: 'print-QR-code',
    },
  },
]

export default PrintQRcode
