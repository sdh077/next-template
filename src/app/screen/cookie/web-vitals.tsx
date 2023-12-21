'use client'
 
import { useReportWebVitals } from 'next/web-vitals'
 
export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric)
    switch (metric.name) {
      case 'FCP': {
        // handle FCP results 
      }
      case 'LCP': {
        // handle LCP results
      }
      // ...
    }
  })
}