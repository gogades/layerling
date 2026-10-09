"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Download, Home, PlusCircle, RefreshCw } from "lucide-react";
import { t } from "@/lib/i18n";
import { PROJECT_SHAPES_DB_NAME } from "@/lib/storageMigration";

type ProjectRecord = {
  id: string;
  lylPackage?: ArrayBuffer | Uint8Array;
  skfPackage?: ArrayBuffer | Uint8Array;
};

async function getProjectRawPackage(projectId: string): Promise<Uint8Array | null> {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = window.indexedDB.open(PROJECT_SHAPES_DB_NAME);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const result = await new Promise<ProjectRecord | undefined>((resolve, reject) => {
      const tx = db.transaction("projectShapes", "readonly");
      const store = tx.objectStore("projectShapes");
      const getReq = store.get(projectId);
      getReq.onsuccess = () => resolve(getReq.result as ProjectRecord | undefined);
      getReq.onerror = () => reject(getReq.error);
    });
    db.close();
    const pkg = result?.lylPackage ?? result?.skfPackage;
    if (pkg) {
      return pkg instanceof Uint8Array ? pkg : new Uint8Array(pkg);
    }
  } catch {
    // Database or read error: ignore
  }
  return null;
}

type Props = {
  children: ReactNode;
  activeProjectId?: string | null;
  projectName?: string | null;
  onGoToDashboard?: () => void;
  onNewEmptyProject?: () => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
  downloading: boolean;
};

export class SafeModeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      downloading: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      downloading: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Layerling editor caught rendering error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoToDashboard = () => {
    if (this.props.onGoToDashboard) {
      this.setState({ hasError: false, error: null });
      this.props.onGoToDashboard();
    } else {
      window.location.href = "/";
    }
  };

  handleNewEmptyProject = () => {
    if (this.props.onNewEmptyProject) {
      this.setState({ hasError: false, error: null });
      this.props.onNewEmptyProject();
    } else {
      window.location.href = "/?editor=1";
    }
  };

  handleDownloadEmergencyBackup = async () => {
    const { activeProjectId, projectName } = this.props;
    if (!activeProjectId) return;
    this.setState({ downloading: true });
    try {
      const bytes = await getProjectRawPackage(activeProjectId);
      if (bytes && bytes.byteLength > 0) {
        const blob = new Blob([bytes as BlobPart], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const safeName = (projectName || "emergency-backup").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim() || "design";
        anchor.href = url;
        anchor.download = `${safeName}.lyl`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      } else {
        alert("Could not extract raw package from local storage.");
      }
    } catch (err) {
      console.error("Emergency download failed:", err);
    } finally {
      this.setState({ downloading: false });
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { projectName, activeProjectId } = this.props;

    return (
      <div className="safe-mode-screen" role="alert" style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        padding: "1.5rem",
      }}>
        <div style={{
          maxWidth: "560px",
          width: "100%",
          backgroundColor: "var(--color-bg, #ffffff)",
          color: "var(--color-fg, #0f172a)",
          borderRadius: "1rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          border: "1px solid var(--color-border, #e2e8f0)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#dc2626" }}>
            <AlertTriangle size={32} />
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
              {t("crash.title")}
            </h2>
          </div>

          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, opacity: 0.9 }}>
            {t("crash.description")}
          </p>

          {projectName ? (
            <div style={{
              fontSize: "0.85rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              backgroundColor: "rgba(226, 232, 240, 0.4)",
              fontFamily: "monospace",
            }}>
              {t("crash.projectHint", { name: projectName })}
            </div>
          ) : null}

          {this.state.error?.message ? (
            <details style={{ fontSize: "0.8rem", opacity: 0.7, cursor: "pointer" }}>
              <summary>Error details</summary>
              <pre style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {this.state.error.message}
              </pre>
            </details>
          ) : null}

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
            marginTop: "0.5rem",
          }}>
            {activeProjectId ? (
              <button
                type="button"
                onClick={this.handleDownloadEmergencyBackup}
                disabled={this.state.downloading}
                style={{
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
                <Download size={16} />
                {t("crash.downloadBackup")}
              </button>
            ) : null}

            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={this.handleGoToDashboard}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "rgba(226, 232, 240, 0.8)",
                  color: "inherit",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Home size={16} />
                {t("crash.goToDashboard")}
              </button>

              <button
                type="button"
                onClick={this.handleNewEmptyProject}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "rgba(226, 232, 240, 0.8)",
                  color: "inherit",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <PlusCircle size={16} />
                {t("crash.newEmptyProject")}
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "transparent",
                  color: "inherit",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  border: "1px solid var(--color-border, #cbd5e1)",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={16} />
                {t("crash.tryAgain")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
