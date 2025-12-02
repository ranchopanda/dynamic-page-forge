import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <span 
                className="material-symbols-outlined text-7xl text-primary"
                aria-hidden="true"
              >
                error_outline
              </span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-text-primary-light/70 dark:text-text-primary-dark/70 mb-6">
              We're sorry, but something unexpected happened. Please try again or go back to the home page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-800 dark:text-red-300 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-[#a15842] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/10 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
