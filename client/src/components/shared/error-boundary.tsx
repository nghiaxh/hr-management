import { Component, ReactNode } from 'react';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center p-8" role="alert" aria-live="assertive">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" id="error-heading">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">{this.state.error?.message}</p>
          </div>
          <Button variant="outline" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
