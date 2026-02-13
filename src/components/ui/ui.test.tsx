import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';

// ============================================================================
// ProgressBar Tests
// ============================================================================
describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />);
    const progressBar = document.querySelector('.bg-teal-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays correct progress value', () => {
    render(<ProgressBar value={75} />);
    const progressFill = document.querySelector('.bg-teal-600') as HTMLElement;
    expect(progressFill.style.width).toBe('75%');
  });

  it('clamps value to 0 when negative', () => {
    render(<ProgressBar value={-10} />);
    const progressFill = document.querySelector('.bg-teal-600') as HTMLElement;
    expect(progressFill.style.width).toBe('0%');
  });

  it('clamps value to 100 when over 100', () => {
    render(<ProgressBar value={150} />);
    const progressFill = document.querySelector('.bg-teal-600') as HTMLElement;
    expect(progressFill.style.width).toBe('100%');
  });

  it('applies teal color by default', () => {
    render(<ProgressBar value={50} />);
    expect(document.querySelector('.bg-teal-600')).toBeInTheDocument();
  });

  it('applies orange color', () => {
    render(<ProgressBar value={50} color="orange" />);
    expect(document.querySelector('.bg-orange-500')).toBeInTheDocument();
  });

  it('applies gray color', () => {
    render(<ProgressBar value={50} color="gray" />);
    expect(document.querySelector('.bg-gray-400')).toBeInTheDocument();
  });

  it('applies small size', () => {
    render(<ProgressBar value={50} size="sm" />);
    const track = document.querySelector('.bg-gray-200');
    expect(track).toHaveClass('h-1.5');
  });

  it('applies medium size', () => {
    render(<ProgressBar value={50} size="md" />);
    const track = document.querySelector('.bg-gray-200');
    expect(track).toHaveClass('h-2.5');
  });

  it('applies large size', () => {
    render(<ProgressBar value={50} size="lg" />);
    const track = document.querySelector('.bg-gray-200');
    expect(track).toHaveClass('h-4');
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={50} showLabel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ProgressBar value={50} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProgressBar value={50} className="custom-progress" />);
    expect(document.querySelector('.custom-progress')).toBeInTheDocument();
  });
});

// ============================================================================
// Modal Tests
// ============================================================================
describe('Modal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when open is false', () => {
    render(
      <Modal open={false} title="Test Modal" onClose={() => {}}>
        Content
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <Modal open={true} title="Test Modal" onClose={() => {}}>
        Content
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Modal open={true} title="Modal" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Modal 
        open={true} 
        title="Modal" 
        onClose={() => {}}
        footer={<button>Footer Button</button>}
      >
        Content
      </Modal>
    );
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(
      <Modal open={true} title="Modal" onClose={() => {}}>
        Content
      </Modal>
    );
    const buttons = screen.getAllByRole('button');
    // Only close button should exist
    expect(buttons.length).toBe(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} title="Modal" onClose={handleClose}>
        Content
      </Modal>
    );
    // Find and click the close button (svg path close button)
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} title="Modal" onClose={handleClose}>
        Content
      </Modal>
    );
    // Click on the backdrop (first div with bg-black/50)
    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} title="Modal" onClose={handleClose}>
        Content
      </Modal>
    );
    // Trigger Escape key press
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies small width', () => {
    render(
      <Modal open={true} title="Modal" onClose={() => {}} width="sm">
        Content
      </Modal>
    );
    const modalContent = document.querySelector('.max-w-sm');
    expect(modalContent).toBeInTheDocument();
  });

  it('applies medium width', () => {
    render(
      <Modal open={true} title="Modal" onClose={() => {}} width="md">
        Content
      </Modal>
    );
    const modalContent = document.querySelector('.max-w-md');
    expect(modalContent).toBeInTheDocument();
  });

  it('applies large width', () => {
    render(
      <Modal open={true} title="Modal" onClose={() => {}} width="lg">
        Content
      </Modal>
    );
    const modalContent = document.querySelector('.max-w-lg');
    expect(modalContent).toBeInTheDocument();
  });
});
// Button Tests
// ============================================================================
describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-teal-600');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-teal-700');
  });

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies small size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
  });

  it('applies medium size', () => {
    render(<Button size="md">Medium</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  it('applies large size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});

// ============================================================================
// Input Tests
// ============================================================================
describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(<Input />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
    expect(input).toHaveClass('bg-red-50');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('forwards ref', () => {
    const ref: { current: HTMLInputElement | null } = { current: null };
    render(<Input ref={(el) => { ref.current = el; }} />);
    expect(ref.current).not.toBeNull();
  });
});

// ============================================================================
// Checkbox Tests
// ============================================================================
describe('Checkbox', () => {
  it('renders checkbox input', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(<Checkbox />);
    expect(screen.queryByText(/terms/)).not.toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Checkbox checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('handles unchecked state', () => {
    render(<Checkbox checked={false} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox" />);
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox');
  });

  it('forwards ref', () => {
    const ref: { current: HTMLInputElement | null } = { current: null };
    render(<Checkbox ref={(el) => { ref.current = el; }} />);
    expect(ref.current).not.toBeNull();
  });
});

// ============================================================================
// Card Tests
// ============================================================================
describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default padding', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('p-4');
  });

  it('applies none padding', () => {
    render(<Card padding="none">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    // Check that it doesn't have padding classes
    expect(card).not.toHaveClass('p-3');
    expect(card).not.toHaveClass('p-4');
    expect(card).not.toHaveClass('p-6');
  });

  it('applies small padding', () => {
    render(<Card padding="sm">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('p-3');
  });

  it('applies large padding', () => {
    render(<Card padding="lg">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('p-6');
  });

  it('applies hoverable styles', () => {
    render(<Card hoverable>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Card className="custom-card">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('custom-card');
  });
});
