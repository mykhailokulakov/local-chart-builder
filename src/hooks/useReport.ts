import { useContext } from 'react'
import { ReportContext, type ReportContextValue } from '../store/ReportContext'

/**
 * Convenience hook for consuming `ReportContext`.
 * Throws if called outside of `ReportProvider`.
 */
export function useReport(): ReportContextValue {
  const ctx = useContext(ReportContext)
  if (ctx === null) {
    throw new Error('useReport must be used within a ReportProvider')
  }
  return ctx
}
