import { Component } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#F6F5F0] flex items-center justify-center px-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
            <div className="w-14 h-14 bg-[#FCEBEB] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-[#A32D2D]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1A1A18] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#5F5E5A] mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="bg-[#0F6E56] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#085041] transition-colors"
            >
              Go to home page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-[#888780] cursor-pointer">
                  Error details
                </summary>
                <pre className="text-xs text-[#A32D2D] mt-2 bg-[#FCEBEB] p-3 rounded-lg overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary