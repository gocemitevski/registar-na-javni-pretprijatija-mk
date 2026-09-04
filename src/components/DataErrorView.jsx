import ErrorDisplay from "./ErrorDisplay";

export default function DataErrorView({ errorInfo, onRetry }) {
  return (
    <div className="container my-5 flex-fill">
      <ErrorDisplay
        messageKey={errorInfo?.messageKey || "unknown"}
        originalError={errorInfo?.originalError}
        onRetry={onRetry}
      />
    </div>
  );
}
