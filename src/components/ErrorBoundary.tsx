import { Component, type ReactNode } from 'react';

// A render exception with no boundary is a blank iframe on the WordPress
// page — the quietest possible failure. This makes it loud instead: the
// message renders where the tool was, and still reaches the console.
export class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(e: unknown) {
    return { message: e instanceof Error ? e.message : String(e) };
  }

  componentDidCatch(e: unknown) {
    console.error(e);
  }

  render() {
    if (this.state.message === null) return this.props.children;
    return (
      <div className="app">
        <p className="error">
          This tool hit a problem and stopped: {this.state.message}. Reload the page to try again.
        </p>
      </div>
    );
  }
}
