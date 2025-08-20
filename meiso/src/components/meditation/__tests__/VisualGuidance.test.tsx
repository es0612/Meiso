import React from 'react';
import { render, screen } from '@testing-library/react';
import { VisualGuidance, VisualGuidancePreview } from '../VisualGuidance';
import type { MeditationScript } from '@/types';

// Framer Motion のモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: React.ComponentProps<'circle'>) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockScript: MeditationScript = {
  id: 'test-script',
  title: 'テスト瞑想',
  description: 'テスト用の瞑想スクリプト',
  category: 'breathing',
  duration: 60,
  instructions: [
    {
      timestamp: 0,
      text: '深く息を吸ってください',
      type: 'breathing',
    },
    {
      timestamp: 30,
      text: '心を落ち着けてください',
      type: 'guidance',
    },
    {
      timestamp: 45,
      text: '美しい景色を想像してください',
      type: 'visualization',
    },
  ],
  tags: ['test'],
  difficulty: 'beginner',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VisualGuidance', () => {
  it('should not render when not active', () => {
    const { container } = render(
      <VisualGuidance
        script={mockScript}
        currentTime={0}
        isActive={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render default state when no current instruction', () => {
    const scriptWithoutInstructions = {
      ...mockScript,
      instructions: [],
    };
    
    render(
      <VisualGuidance
        script={scriptWithoutInstructions}
        currentTime={0}
        isActive={true}
      />
    );
    
    expect(screen.getByText('テスト瞑想')).toBeInTheDocument();
    expect(screen.getByText('リラックスして、自然な呼吸に意識を向けましょう')).toBeInTheDocument();
  });

  it('should show current instruction based on time', () => {
    render(
      <VisualGuidance
        script={mockScript}
        currentTime={5}
        isActive={true}
      />
    );
    
    expect(screen.getByText('深く息を吸ってください')).toBeInTheDocument();
  });

  it('should show next instruction preview', () => {
    render(
      <VisualGuidance
        script={mockScript}
        currentTime={5}
        isActive={true}
      />
    );
    
    expect(screen.getByText('次: 心を落ち着けてください')).toBeInTheDocument();
  });

  it('should show breathing animation for breathing instructions', () => {
    render(
      <VisualGuidance
        script={mockScript}
        currentTime={5}
        isActive={true}
      />
    );
    
    expect(screen.getByLabelText('呼吸のリズムガイド')).toBeInTheDocument();
  });

  it('should show different instruction at different times', () => {
    const { rerender } = render(
      <VisualGuidance
        script={mockScript}
        currentTime={35}
        isActive={true}
      />
    );
    
    expect(screen.getByText('心を落ち着けてください')).toBeInTheDocument();
    
    rerender(
      <VisualGuidance
        script={mockScript}
        currentTime={50}
        isActive={true}
      />
    );
    
    expect(screen.getByText('美しい景色を想像してください')).toBeInTheDocument();
  });

  it('should show audio off explanation', () => {
    render(
      <VisualGuidance
        script={mockScript}
        currentTime={0}
        isActive={true}
      />
    );
    
    expect(screen.getByText(/音声ガイダンスがオフになっています/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <VisualGuidance
        script={mockScript}
        currentTime={0}
        isActive={true}
      />
    );
    
    expect(screen.getByRole('region', { name: '視覚的瞑想ガイダンス' })).toBeInTheDocument();
  });

  it('should handle empty instructions array', () => {
    const scriptWithoutInstructions = {
      ...mockScript,
      instructions: [],
    };
    
    render(
      <VisualGuidance
        script={scriptWithoutInstructions}
        currentTime={30}
        isActive={true}
      />
    );
    
    expect(screen.getByText('テスト瞑想')).toBeInTheDocument();
  });
});

describe('VisualGuidancePreview', () => {
  it('should render preview when enabled', () => {
    render(<VisualGuidancePreview enabled={true} />);
    
    expect(screen.getByText('視覚的ガイダンスが表示されます')).toBeInTheDocument();
  });

  it('should not render when disabled', () => {
    const { container } = render(<VisualGuidancePreview enabled={false} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VisualGuidancePreview enabled={true} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});