import { useEffect, useRef } from 'react'

const useDragScroll = () => {
  const observerRef = useRef(null)

  useEffect(() => {
    const addDragScrollToElement = (element) => {
      let isDown = false
      let startX = 0
      let scrollLeft = 0

      const handleMouseDown = (e) => {
        isDown = true
        element.style.cursor = 'grabbing'
        startX = e.pageX - element.offsetLeft
        scrollLeft = element.scrollLeft
      }

      const handleMouseLeave = () => {
        isDown = false
        element.style.cursor = 'grab'
      }

      const handleMouseUp = () => {
        isDown = false
        element.style.cursor = 'grab'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - element.offsetLeft
        const walk = (x - startX) * 2
        element.scrollLeft = scrollLeft - walk
      }

      element.addEventListener('mousedown', handleMouseDown)
      element.addEventListener('mouseleave', handleMouseLeave)
      element.addEventListener('mouseup', handleMouseUp)
      element.addEventListener('mousemove', handleMouseMove)

      return () => {
        element.removeEventListener('mousedown', handleMouseDown)
        element.removeEventListener('mouseleave', handleMouseLeave)
        element.removeEventListener('mouseup', handleMouseUp)
        element.removeEventListener('mousemove', handleMouseMove)
      }
    }

    const handleMutations = (mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const valueContainers =
              node.querySelectorAll?.(
                '.select__value-container.select__value-container--is-multi'
              ) || []
            valueContainers.forEach(addDragScrollToElement)
          }
        })
      })
    }

    // Initial setup for existing elements
    const existingContainers = document.querySelectorAll(
      '.select__value-container.select__value-container--is-multi'
    )
    existingContainers.forEach(addDragScrollToElement)

    // Setup MutationObserver for dynamic elements
    observerRef.current = new MutationObserver(handleMutations)
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
}

export default useDragScroll
