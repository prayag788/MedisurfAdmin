import { io } from 'socket.io-client'

// Determine URL based on environment
const URL =
  process.env.NODE_ENV === 'production'
    ? undefined // Use current origin in production
    : process.env.REACT_APP_SOCKET_API_URL || 'http://localhost:3000'

// Create socket instance
export const socket = io(URL, {
  autoConnect: false,
})

// })

// })

// })

// })

// })

// }
// )

// })

// })

// })

// })

// })

// })
