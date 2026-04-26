"use client";

import { ReactNode, Component, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // You could log to an error tracking service here
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="mb-6 flex justify-center"
            >
              <AlertTriangle size={48} className="text-error" strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-h2 font-medium mb-2">Something went wrong</h1>
            <p className="text-on-surface-variant text-small mb-6 leading-relaxed">
              We encountered an unexpected error. Try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div
                className="mb-6 p-4 rounded-md bg-error/5 border border-error/20 text-left"
                style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--c-error)" }}
              >
                <p className="font-medium mb-2">Error Details:</p>
                <p className="break-words">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="btn w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh Page
              </button>
              <a href="/dashboard" className="btn-ghost w-full">
                Back to Dashboard
              </a>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
