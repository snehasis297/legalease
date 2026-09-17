import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 text-center border border-danger/40 rounded-2xl">
            <AlertTriangle className="w-14 h-14 text-danger mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-textSecondary mb-6">
              {this.state.error?.message || 'An unexpected application error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-medium rounded-xl transition-colors shadow-glow-purple"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
