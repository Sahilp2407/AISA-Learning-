import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AISA ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFCF7] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#ED7D31] border border-amber-200 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We encountered an unexpected error while rendering this page. You can reload or return to the landing page.
            </p>
            {this.state.error && (
              <p className="text-[11px] font-mono text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-left overflow-auto max-h-28">
                {this.state.error.toString()}
              </p>
            )}
            <div className="flex items-center gap-3 pt-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-[#ED7D31] hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Reload Application
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  try {
                    localStorage.setItem('aisa_screen', 'dashboard');
                  } catch (e) {}
                  window.location.href = '/?screen=dashboard';
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
