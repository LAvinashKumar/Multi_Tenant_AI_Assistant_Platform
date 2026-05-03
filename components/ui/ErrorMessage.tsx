/**
 * Reusable error display component.
 */

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      data-testid="error-message"
      className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="mt-0.5 text-xs text-red-600/80">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
