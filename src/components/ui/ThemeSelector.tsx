'use client';

import { useState, useRef } from 'react';
import { useTheme, ThemeId } from '@/hooks/useTheme';
import { themeList } from '@/lib/themes/registry';
import { useGlassSettings } from '@/hooks/useGlassSettings';
import { Modal, Button } from '@/components/ui';

// Custom theme order: Light -> Dark -> Glass -> Dracula -> Nord -> Monokai
const themeOrder: ThemeId[] = ['light', 'dark', 'glass', 'dracula', 'nord', 'monokai'];

function reorderThemes(themes: typeof themeList) {
  return [...themes].sort((a, b) => {
    const orderA = themeOrder.indexOf(a.id);
    const orderB = themeOrder.indexOf(b.id);
    return orderA - orderB;
  });
}

function GlassSettingsModal({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void;
}) {
  const { glassBlur, glassOpacity, setGlassBlur, setGlassOpacity } = useGlassSettings();
  
  // Initialize temp values from glass settings
  // Using key prop on modal to reset state on re-open
  const [tempBlurValue, setTempBlurValue] = useState(glassBlur);
  const [tempOpacityValue, setTempOpacityValue] = useState(glassOpacity);

  const handleConfirm = () => {
    setGlassBlur(tempBlurValue);
    setGlassOpacity(tempOpacityValue);
    onClose();
  };

  const handleCancel = () => {
    // Reset to saved values
    document.documentElement.style.setProperty('--glass-blur', `${glassBlur}px`);
    document.documentElement.style.setProperty('--glass-opacity', `${glassOpacity / 100}`);
    onClose();
  };

  // Apply preview in real-time
  const handleBlurChange = (value: number) => {
    setTempBlurValue(value);
    document.documentElement.style.setProperty('--glass-blur', `${value}px`);
  };

  const handleOpacityChange = (value: number) => {
    setTempOpacityValue(value);
    document.documentElement.style.setProperty('--glass-opacity', `${value / 100}`);
  };

  return (
    <Modal 
      open={open} 
      title="Theme Settings"
      onClose={handleCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Blur Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>Blur</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{tempBlurValue}px</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={tempBlurValue}
            onChange={(e) => handleBlurChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              background: 'var(--color-border)',
              accentColor: 'var(--color-primary)'
            }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            <span>5px</span>
            <span>30px</span>
          </div>
        </div>
        
        {/* Opacity Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>Opacity</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{tempOpacityValue}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={tempOpacityValue}
            onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              background: 'var(--color-border)',
              accentColor: 'var(--color-primary)'
            }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            <span>5%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Preview Card */}
        <div>
          <span className="font-medium mb-2 block" style={{ color: 'var(--color-text)' }}>Preview (预览)</span>
          <div 
            className="p-4 rounded-lg"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, ${tempOpacityValue / 100}) 0%, rgba(255, 255, 255, ${tempOpacityValue / 100 * 0.5}) 100%)`,
              backdropFilter: `blur(${tempBlurValue}px) saturate(180%)`,
              WebkitBackdropFilter: `blur(${tempBlurValue}px) saturate(180%)`,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="font-semibold mb-1" style={{ color: '#fff' }}>Card Title</div>
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              This is a preview with blur: {tempBlurValue}px, opacity: {tempOpacityValue}%
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const orderedThemes = reorderThemes(themeList);
  const [showGlassModal, setShowGlassModal] = useState(false);
  // glass settings are accessed via useGlassSettings in the modal
  useGlassSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  // Click once to switch theme
  // If click on already active theme, open settings modal
  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>, themeId: ThemeId) => {
    // Remove focus from clicked button immediately
    e.currentTarget.blur();
    
    if (themeId === theme) {
      // Already on this theme, open settings modal
      setShowGlassModal(true);
    } else {
      // Switch to new theme
      setTheme(themeId);
    }
  };
  

  return (
    <div data-theme-selector ref={containerRef}>
      <div className="grid grid-cols-3 gap-3">
        {orderedThemes.map((t) => {
          const isActive = theme === t.id;
          
          return (
            <button
              key={t.id}
              type="button"
              onClick={(e) => handleThemeClick(e, t.id)}
              className={`
                p-4 rounded-lg border-2 transition-all flex flex-col items-center
                select-none
                ${isActive 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/15' 
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }
              `}
              style={{ 
                background: isActive ? undefined : t.colors.bg,
              }}
            >
              <div 
                className="w-12 h-12 rounded-md mb-2 flex items-center justify-center text-xl border"
                style={{ 
                  background: t.colors.bg,
                  borderColor: t.colors.border,
                }}
              >
                {t.icon}
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Glass Theme Settings Modal */}
      <GlassSettingsModal 
        key={showGlassModal ? 'modal-open' : 'modal-closed'}
        open={showGlassModal} 
        onClose={() => setShowGlassModal(false)}
      />
    </div>
  );
}
