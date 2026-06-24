import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

function TestComponent({ onAction }: { onAction: () => void }) {
  const { isDirty, setIsDirty, withWarning, UnsavedChangesDialog } = useUnsavedChanges();
  return (
    <div>
      <span data-testid="dirty">{isDirty ? 'dirty' : 'clean'}</span>
      <button onClick={() => withWarning(onAction)}>Trigger</button>
      <button onClick={() => setIsDirty((p) => !p)}>Toggle Dirty</button>
      {UnsavedChangesDialog}
    </div>
  );
}

describe('useUnsavedChanges', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('calls action immediately when not dirty', async () => {
    const onAction = vi.fn();
    render(<TestComponent onAction={onAction} />);
    await user.click(screen.getByText('Trigger'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('shows dialog when dirty', async () => {
    const onAction = vi.fn();
    render(<TestComponent onAction={onAction} />);
    await user.click(screen.getByText('Toggle Dirty'));
    await user.click(screen.getByText('Trigger'));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('calls action on confirm', async () => {
    const onAction = vi.fn();
    render(<TestComponent onAction={onAction} />);
    await user.click(screen.getByText('Toggle Dirty'));
    await user.click(screen.getByText('Trigger'));
    await user.click(screen.getByText('Discard'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not call action on cancel', async () => {
    const onAction = vi.fn();
    render(<TestComponent onAction={onAction} />);
    await user.click(screen.getByText('Toggle Dirty'));
    await user.click(screen.getByText('Trigger'));
    await user.click(screen.getByText('Keep editing'));
    expect(onAction).not.toHaveBeenCalled();
  });

  it('resets dirty state after confirm', async () => {
    const onAction = vi.fn();
    render(<TestComponent onAction={onAction} />);
    await user.click(screen.getByText('Toggle Dirty'));
    await user.click(screen.getByText('Trigger'));
    await user.click(screen.getByText('Discard'));
    expect(screen.getByTestId('dirty')).toHaveTextContent('clean');
  });
});
