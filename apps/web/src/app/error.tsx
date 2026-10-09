"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { t } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("Global application error:", error);
  }, [error]);

  const goToDashboard = () => {
    // Clear URL parameters that may force loading a broken project
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: "2rem",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0f172a",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#f8fafc",
    }}>
        <div style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#1e293b",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          border: "1px solid #334155",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#f87171" }}>
            <AlertTriangle size={32} />
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
              {mounted ? t("crash.title") : "Layerling encountered an unexpected error"}
            </h1>
          </div>

          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, color: "#cbd5e1" }}>
            {mounted
              ? t("crash.description")
              : "A problem occurred while loading the application. Your designs saved in the browser remain intact."}
          </p>

          {error?.message ? (
            <details style={{ fontSize: "0.8rem", color: "#94a3b8", cursor: "pointer" }}>
              <summary>Error details</summary>
              <pre style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {error.message}
              </pre>
            </details>
          ) : null}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={goToDashboard}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.625rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontWeight: 500,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Home size={16} />
              {mounted ? t("crash.goToDashboard") : "Back to Overview"}
            </button>

            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.625rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "transparent",
                color: "#f8fafc",
                fontWeight: 500,
                fontSize: "0.9rem",
                border: "1px solid #475569",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
              {mounted ? t("crash.tryAgain") : "Try again"}
            </button>
          </div>
        </div>
    </div>
  );
}
