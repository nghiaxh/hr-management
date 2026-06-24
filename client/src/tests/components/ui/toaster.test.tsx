import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

describe('Toaster', () => {
  it('renders toasts from useToast', () => {
    toast({ title: 'Success!', description: 'Operation completed' });
    toast({ title: 'Error!', variant: 'destructive' });
    render(<Toaster />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });
});
