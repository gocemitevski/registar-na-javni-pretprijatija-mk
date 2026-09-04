import { useTranslation } from "react-i18next";

function serializeError(err) {
  if (!err) return null;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      status: err.status,
    };
  }
  if (typeof err === "object") {
    try {
      const out = { ...err };
      const msg = err.message ?? String(err);
      if (msg && msg !== "[object Object]") out.message = msg;
      if (err.stack) out.stack = err.stack;
      return out;
    } catch {
      return String(err?.message ?? err ?? "");
    }
  }
  return String(err?.message ?? err ?? "");
}

function ErrorDisplay({ messageKey, originalError, onRetry }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "mk";
  const resolvedKey = messageKey || "unknown";
  // Localized via i18n resources error.*
  const errorMessage = t(`error.${resolvedKey}`, { lng: currentLang });

  return (
    <div className="alert alert-danger" role="alert">
      <h5 className="alert-heading hstack gap-2">
        <i className="bi bi-exclamation-triangle-fill"></i>
        {t("error.title")}
      </h5>
      <p>{errorMessage}</p>

      {/* Technical details - message always visible, stack only in DEV to avoid prod disclosure */}
      <details>
        <summary>{t("error.technicalData")}</summary>
        <pre className="mt-2 bg-light p-3 rounded-1 overflow-auto text-break">
          {JSON.stringify(
            {
              messageKey: resolvedKey,
              lang: currentLang,
              originalError: import.meta.env.DEV
                ? serializeError(originalError)
                : {
                    message:
                      originalError?.message ?? String(originalError ?? ""),
                    status: originalError?.status,
                  },
            },
            null,
            2,
          )}
        </pre>
      </details>

      {onRetry && (
        <button
          type="button"
          className="btn btn-outline-danger mt-3"
          onClick={onRetry}
        >
          {t("error.retry")}
        </button>
      )}
    </div>
  );
}

export default ErrorDisplay;
