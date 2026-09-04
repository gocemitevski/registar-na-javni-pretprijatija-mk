// Error boundary specifically for data loading failures (render-time errors)
import { Component } from "react";
import ErrorDisplay from "./ErrorDisplay";
import { getErrorMessageKey } from "../utils/errorMessages";

class DataErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      messageKey: "unknown",
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, messageKey: getErrorMessageKey(error) };
  }

  componentDidCatch(error, info) {
    console.error("[DataErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, messageKey: "unknown" });
    if (this.props.onRetry) {
      this.props.onRetry();
      return;
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="text-center py-5">
        <ErrorDisplay
          messageKey={this.state.messageKey || "unknown"}
          originalError={this.state.error}
          onRetry={this.handleRetry}
        />
      </div>
    );
  }
}

export default DataErrorBoundary;
