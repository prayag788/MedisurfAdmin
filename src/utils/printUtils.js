/**
 * Print Utilities
 * Provides helper functions for better print functionality
 */

/**
 * Triggers the browser's print dialog
 * @param {string} title - Optional title for the print job
 */
export const printPage = (title = '') => {
  if (title) {
    const originalTitle = document.title
    document.title = title
    window.print()
    document.title = originalTitle
  } else {
    window.print()
  }
}

/**
 * Adds print-visible class to elements that should be visible during print
 * @param {string|Element} selector - CSS selector or DOM element
 */
export const makePrintVisible = selector => {
  const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector]

  elements.forEach(element => {
    if (element) {
      element.classList.add('print-visible')
    }
  })
}

/**
 * Removes print-visible class from elements
 * @param {string|Element} selector - CSS selector or DOM element
 */
export const makePrintHidden = selector => {
  const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector]

  elements.forEach(element => {
    if (element) {
      element.classList.remove('print-visible')
    }
  })
}

/**
 * Prepares the page for printing by hiding/showing specific elements
 * @param {Object} options - Configuration options
 * @param {string[]} options.hideSelectors - Array of selectors to hide
 * @param {string[]} options.showSelectors - Array of selectors to show
 */
export const preparePrint = (options = {}) => {
  const { hideSelectors = [], showSelectors = [] } = options

  // Hide specified elements
  hideSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.style.display = 'none'
    })
  })

  // Show specified elements
  showSelectors.forEach(selector => {
    makePrintVisible(selector)
  })
}

/**
 * Restores the page after printing
 * @param {Object} options - Configuration options
 * @param {string[]} options.restoreSelectors - Array of selectors to restore
 */
export const restoreAfterPrint = (options = {}) => {
  const { restoreSelectors = [] } = options

  restoreSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.style.display = ''
    })
  })
}

/**
 * Enhanced print function with before/after callbacks
 * @param {Object} options - Configuration options
 * @param {Function} options.beforePrint - Callback before printing
 * @param {Function} options.afterPrint - Callback after printing
 * @param {string} options.title - Print job title
 */
export const enhancedPrint = (options = {}) => {
  const { beforePrint, afterPrint, title } = options

  // Execute before print callback
  if (beforePrint && typeof beforePrint === 'function') {
    beforePrint()
  }

  // Set up after print listener
  const handleAfterPrint = () => {
    if (afterPrint && typeof afterPrint === 'function') {
      afterPrint()
    }
    window.removeEventListener('afterprint', handleAfterPrint)
  }

  window.addEventListener('afterprint', handleAfterPrint)

  // Trigger print
  printPage(title)
}

/**
 * Print specific element by selector
 * @param {string} selector - CSS selector of element to print
 * @param {string} title - Optional title for print job
 */
export const printElement = (selector, title = '') => {
  const element = document.querySelector(selector)
  if (!element) {
    console.warn(`Element with selector "${selector}" not found`)
    return
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank')
  const elementHTML = element.outerHTML

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          color: black; 
          background: white; 
        }
        * { 
          color: black !important; 
          background: transparent !important; 
        }
        img { 
          max-width: 100%; 
          height: auto; 
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
        }
        th, td { 
          border: 1px solid black; 
          padding: 8px; 
          text-align: left; 
        }
      </style>
    </head>
    <body>
      ${elementHTML}
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
