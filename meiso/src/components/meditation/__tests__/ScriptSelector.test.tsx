import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScriptSelector from '../ScriptSelector';
import { INITIAL_MEDITATION_SCRIPTS } from '@/constants/meditation';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ScriptSelector', () => {
  const mockProps = {
    scripts: INITIAL_MEDITATION_SCRIPTS,
    selectedScript: 'basic-breathing',
    onScriptChange: jest.fn(),
    onPreview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders script selector with scripts', () => {
    render(<ScriptSelector {...mockProps} />);
    
    expect(screen.getByText('カテゴリー')).toBeInTheDocument();
    expect(screen.getByText('瞑想スクリプト (4件)')).toBeInTheDocument();
    expect(screen.getByText('基本の呼吸瞑想')).toBeInTheDocument();
  });

  it('shows all category filters', () => {
    render(<ScriptSelector {...mockProps} />);
    
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '呼吸法' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'マインドフルネス' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '集中力' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'リラクゼーション' })).toBeInTheDocument();
  });

  it('filters scripts by category', async () => {
    render(<ScriptSelector {...mockProps} />);
    
    // Click on breathing category
    fireEvent.click(screen.getByRole('button', { name: '呼吸法' }));
    
    await waitFor(() => {
      expect(screen.getByText('瞑想スクリプト (1件)')).toBeInTheDocument();
      expect(screen.getByText('基本の呼吸瞑想')).toBeInTheDocument();
      expect(screen.queryByText('マインドフルネス集中')).not.toBeInTheDocument();
    });
  });

  it('calls onScriptChange when script is selected', () => {
    render(<ScriptSelector {...mockProps} />);
    
    const scriptCard = screen.getByText('マインドフルネス集中').closest('div');
    fireEvent.click(scriptCard!);
    
    expect(mockProps.onScriptChange).toHaveBeenCalledWith('mindfulness-focus');
  });

  it('shows preview modal when preview button is clicked', async () => {
    render(<ScriptSelector {...mockProps} showPreview={true} />);
    
    const previewButtons = screen.getAllByText('プレビュー');
    fireEvent.click(previewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('瞑想の流れ')).toBeInTheDocument();
      expect(screen.getByText('このスクリプトを選択')).toBeInTheDocument();
    });
  });

  it('closes preview modal when close button is clicked', async () => {
    render(<ScriptSelector {...mockProps} showPreview={true} />);
    
    // Open preview
    const previewButtons = screen.getAllByText('プレビュー');
    fireEvent.click(previewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('瞑想の流れ')).toBeInTheDocument();
    });
    
    // Close preview
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('瞑想の流れ')).not.toBeInTheDocument();
    });
  });

  it('shows selected script indicator', () => {
    render(<ScriptSelector {...mockProps} />);
    
    const selectedCard = screen.getByText('基本の呼吸瞑想').closest('.relative');
    expect(selectedCard).toHaveClass('border-blue-500');
  });

  it('shows empty state when no scripts match filter', async () => {
    const emptyProps = {
      ...mockProps,
      scripts: [],
    };
    
    render(<ScriptSelector {...emptyProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('スクリプトが見つかりません')).toBeInTheDocument();
    });
  });

  it('displays script metadata correctly', () => {
    render(<ScriptSelector {...mockProps} />);
    
    expect(screen.getAllByText('1分')[0]).toBeInTheDocument();
    expect(screen.getAllByText('初心者')[0]).toBeInTheDocument();
    expect(screen.getByText('#初心者')).toBeInTheDocument();
  });
});