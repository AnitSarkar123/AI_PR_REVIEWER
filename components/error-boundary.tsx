"use client";

import { Component, type ReactNode } from "react";
import { ErrorFallback } from "./error-fallback";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		console.error("[ErrorBoundary] Caught error:", error, errorInfo);
		this.props.onError?.(error, errorInfo);
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ErrorFallback
					error={this.state.error}
					onRetry={this.handleRetry}
				/>
			);
		}

		return this.props.children;
	}
}
