import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/** Catches render-time errors so a single bad block doesn't blank the whole app. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-8">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-lg font-bold text-slate-900">Algo deu errado</h1>
            <p className="mb-4 text-sm text-slate-500">
              Ocorreu um erro inesperado. Seus dados continuam salvos localmente.
            </p>
            <pre className="mb-4 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-xs text-red-600">
              {this.state.error.message}
            </pre>
            <button
              onClick={this.handleReset}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
