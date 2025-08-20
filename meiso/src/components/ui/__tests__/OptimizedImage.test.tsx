import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../OptimizedImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ 
    src, 
    alt, 
    onLoad, 
    onError, 
    ...props 
  }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="optimized-image"
        {...props}
      />
    );
  };
});

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200,
  };

  it('should render image with correct attributes', () => {
    render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('should show loading state initially', () => {
    render(<OptimizedImage {...defaultProps} />);

    // Should show loading skeleton
    const container = screen.getByTestId('optimized-image').parentElement;
    expect(container?.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should hide loading state after image loads', async () => {
    render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByTestId('optimized-image');
    
    // Simulate image load
    fireEvent.load(image);

    await waitFor(() => {
      const container = image.parentElement;
      expect(container?.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
  });

  it('should show error state when image fails to load', async () => {
    render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByTestId('optimized-image');
    
    // Simulate image error
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByTestId('error-placeholder')).toBeInTheDocument();
    });
  });

  it('should call onLoad callback when image loads', async () => {
    const onLoad = jest.fn();
    render(<OptimizedImage {...defaultProps} onLoad={onLoad} />);

    const image = screen.getByTestId('optimized-image');
    fireEvent.load(image);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('should call onError callback when image fails to load', async () => {
    const onError = jest.fn();
    render(<OptimizedImage {...defaultProps} onError={onError} />);

    const image = screen.getByTestId('optimized-image');
    fireEvent.error(image);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should apply custom className', () => {
    render(<OptimizedImage {...defaultProps} className="custom-class" />);

    const container = screen.getByTestId('optimized-image').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('should handle fill prop correctly', () => {
    render(
      <OptimizedImage 
        {...defaultProps} 
        fill={true}
        width={undefined}
        height={undefined}
      />
    );

    const image = screen.getByTestId('optimized-image');
    expect(image).toBeInTheDocument();
  });

  it('should show error fallback with correct dimensions', async () => {
    render(<OptimizedImage {...defaultProps} />);

    const image = screen.getByTestId('optimized-image');
    fireEvent.error(image);

    await waitFor(() => {
      const errorFallback = screen.getByTestId('error-placeholder');
      expect(errorFallback).toHaveStyle({
        width: '300px',
        height: '200px',
      });
    });
  });
});