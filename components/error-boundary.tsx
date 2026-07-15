"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    componentDidMount() {
        this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
            console.error("[ErrorBoundary] Unhandled promise rejection:", event.reason);
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
            if (!this.state.hasError) {
                this.setState({ hasError: true, error });
            }
        };
        window.addEventListener("unhandledrejection", this.unhandledRejectionHandler);
    }

    componentWillUnmount() {
        if (this.unhandledRejectionHandler) {
            window.removeEventListener("unhandledrejection", this.unhandledRejectionHandler);
        }
    }

    private unhandledRejectionHandler?: (event: PromiseRejectionEvent) => void;

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="border-destructive/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-lg">Something went wrong</CardTitle>
                        </div>
                        <CardDescription>
                            An unexpected error occurred. Please try again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {this.state.error && (
                            <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted p-2 rounded">
                                {this.state.error.message}
                            </p>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={this.handleRetry}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}