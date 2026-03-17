"use client";
import React from "react";

export interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactElement<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return React.cloneElement(this.props.fallback, {
        error: this.state.error,
        resetError: this.handleReset
      });
    }
    return this.props.children;
  }
}

export default ErrorBoundary;