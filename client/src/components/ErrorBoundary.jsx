import React from "react";

/**
 * ErrorBoundary — catches React crashes and shows a farmer-friendly error page
 * instead of a blank white screen. Supports i18n through props.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("🔴 AgroAware crashed:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f0fdf4",
                        padding: "24px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            maxWidth: "400px",
                            padding: "40px",
                            borderRadius: "24px",
                            backgroundColor: "white",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌾</div>
                        <h1
                            style={{
                                fontSize: "24px",
                                fontWeight: 700,
                                color: "#1f2937",
                                marginBottom: "8px",
                            }}
                        >
                            Something went wrong
                        </h1>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                lineHeight: 1.6,
                                marginBottom: "24px",
                            }}
                        >
                            Don't worry, your data is safe. Please reload the page to continue
                            using AgroAware.
                        </p>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: "12px 32px",
                                borderRadius: "12px",
                                border: "none",
                                backgroundColor: "#059669",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "16px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
                            }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#047857")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#059669")
                            }
                        >
                            🔄 Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
