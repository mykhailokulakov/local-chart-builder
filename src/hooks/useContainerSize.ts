import { useState, useEffect } from 'react'

interface ContainerSize {
  width: number
  height: number
}

/**
 * Observes the pixel dimensions of a DOM element via ResizeObserver.
 * Returns { width: 0, height: 0 } until the element mounts and is measured.
 */
export function useContainerSize(ref: React.RefObject<HTMLDivElement | null>): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [ref])

  return size
}
