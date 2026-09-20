import React, { useEffect, useRef, useState } from 'react';
import { VisualCardConfig, VisualFormat } from '../types';
import { PRESET_THEMES } from '../data/holidays';
import { Download, Copy, Check, Sparkles, Sliders, RefreshCw } from 'lucide-react';

interface VisualCanvasProps {
  config: VisualCardConfig;
  onChange: (updated: VisualCardConfig) => void;
  holidayName: string;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({ config, onChange, holidayName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'customize'>('preview');

  // Aspect ratio dimensions
  const getDimensions = (format: VisualFormat): { width: number; height: number; scale: number } => {
    switch (format) {
      case 'story_9_16':
        return { width: 1080, height: 1920, scale: 0.28 };
      case 'landscape_16_9':
        return { width: 1200, height: 675, scale: 0.45 };
      case 'square_1_1':
      default:
        return { width: 1080, height: 1080, scale: 0.42 };
    }
  };

  const { width, height, scale } = getDimensions(config.format);

  // Render on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const theme = PRESET_THEMES[config.themeIndex] || PRESET_THEMES[0];
    const primaryColor = config.customBgColor || theme.primary;
    const secondaryColor = theme.secondary;
    const accentColor = theme.accent;
    const textColor = config.customTextColor || theme.text;

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(0.6, secondaryColor);
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Pattern accents
    ctx.save();
    if (config.pattern === 'sparkles' || config.pattern === 'festive_dots') {
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.25;
      const seed = 42;
      for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i * 99 + seed) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 33 + seed) * 0.5 + 0.5) * height;
        const r = (i % 5) + 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle for larger dots
        if (i % 4 === 0) {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 10, y);
          ctx.lineTo(x + 10, y);
          ctx.moveTo(x, y - 10);
          ctx.lineTo(x, y + 10);
          ctx.stroke();
        }
      }
    } else if (config.pattern === 'confetti') {
      ctx.globalAlpha = 0.35;
      const colors = [accentColor, secondaryColor, '#ffffff', '#f43f5e', '#38bdf8'];
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle = colors[i % colors.length];
        const x = (Math.sin(i * 47) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 23) * 0.5 + 0.5) * height;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((i * 15 * Math.PI) / 180);
        ctx.fillRect(-8, -4, 16, 8);
        ctx.restore();
      }
    } else if (config.pattern === 'geometric') {
      ctx.strokeStyle = accentColor;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.strokeRect(60 + i * 40, 60 + i * 40, width - 120 - i * 80, height - 120 - i * 80);
      }
    } else if (config.pattern === 'minimal_rings') {
      ctx.strokeStyle = accentColor;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 3;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, (width / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Elegant border
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Subtle inner corner accents
    const cornerSize = 36;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.85;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(37, 37 + cornerSize);
    ctx.lineTo(37, 37);
    ctx.lineTo(37 + cornerSize, 37);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 37 - cornerSize, 37);
    ctx.lineTo(width - 37, 37);
    ctx.lineTo(width - 37, 37 + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(37, height - 37 - cornerSize);
    ctx.lineTo(37, height - 37);
    ctx.lineTo(37 + cornerSize, height - 37);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 37 - cornerSize, height - 37);
    ctx.lineTo(width - 37, height - 37);
    ctx.lineTo(width - 37, height - 37 - cornerSize);
    ctx.stroke();
    ctx.restore();

    // 4. Brand tag at the top
    ctx.save();
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.globalAlpha = 0.9;
    ctx.fillText((config.brandName || 'BRAND').toUpperCase(), width / 2, 100);
    ctx.restore();

    // 5. Category Badge Pill
    if (config.badgeText) {
      ctx.save();
      const badgeY = 145;
      const textToDraw = config.badgeText.toUpperCase();
      ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(textToDraw).width;
      const pillWidth = textWidth + 44;
      const pillHeight = 36;

      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.2;
      roundRect(ctx, width / 2 - pillWidth / 2, badgeY, pillWidth, pillHeight, 18);
      ctx.fill();

      ctx.strokeStyle = accentColor;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.5;
      roundRect(ctx, width / 2 - pillWidth / 2, badgeY, pillWidth, pillHeight, 18);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.fillText(textToDraw, width / 2, badgeY + 24);
      ctx.restore();
    }

    // 6. Central Emoji / Festive Icon
    ctx.save();
    ctx.font = '120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emojiY = config.format === 'story_9_16' ? height * 0.35 : height * 0.38;
    ctx.fillText(config.emoji || '🎉', width / 2, emojiY);
    ctx.restore();

    // 7. Headline
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;

    const fontFamily =
      config.fontStyle === 'serif'
        ? '"Playfair Display", Georgia, serif'
        : config.fontStyle === 'display'
        ? '"Playfair Display", Georgia, serif'
        : '"Plus Jakarta Sans", sans-serif';

    const headlineFontSize = config.format === 'story_9_16' ? 72 : 68;
    ctx.font = `800 ${headlineFontSize}px ${fontFamily}`;

    const maxTextWidth = width - 180;
    const headlineY = config.format === 'story_9_16' ? height * 0.48 : height * 0.55;
    const lines = wrapText(ctx, config.headline || `Happy ${holidayName}!`, maxTextWidth);

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, headlineY + idx * (headlineFontSize * 1.15));
    });

    const headlineBottomY = headlineY + lines.length * (headlineFontSize * 1.15);
    ctx.restore();

    // 8. Subheading / Tagline
    if (config.subheading) {
      ctx.save();
      ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.85;
      ctx.textAlign = 'center';
      const subLines = wrapText(ctx, config.subheading, width - 240);
      subLines.slice(0, 3).forEach((line, idx) => {
        ctx.fillText(line, width / 2, headlineBottomY + 25 + idx * 38);
      });
      ctx.restore();
    }

    // 9. CTA Pill Button at Bottom
    if (config.cta) {
      ctx.save();
      const ctaY = config.format === 'story_9_16' ? height - 160 : height - 130;
      const ctaText = config.cta.toUpperCase();
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(ctaText).width;
      const pillWidth = Math.max(textWidth + 56, 260);
      const pillHeight = 54;

      // Glow / shadow
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 20;

      ctx.fillStyle = accentColor;
      roundRect(ctx, width / 2 - pillWidth / 2, ctaY, pillWidth, pillHeight, 27);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(ctaText, width / 2, ctaY + 34);
      ctx.restore();
    }
  }, [config, width, height, holidayName]);

  // Helper for rounded rect on canvas
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Helper for text wrapping
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Download high-res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sanitizedName = holidayName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const link = document.createElement('a');
    link.download = `${sanitizedName}-visual-${config.format}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Copy Image to clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Fallback download if clipboard item not supported
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    }
  };

  return (
    <div id="visual-canvas-studio" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Creative Visual Studio
          </h3>
          <p className="text-xs text-slate-500">
            Generate high-resolution holiday graphics ready for download and publishing.
          </p>
        </div>

        {/* View / Edit Tabs */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-medium">
            <button
              id="btn-tab-preview"
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preview & Export
            </button>
            <button
              id="btn-tab-customize"
              type="button"
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors ${
                activeTab === 'customize' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Customize Card
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-900/5 rounded-xl border border-slate-200/70 min-h-[460px]">
          {/* Format Selector Pills */}
          <div className="flex items-center gap-2 mb-4 bg-white p-1 rounded-lg border border-slate-200 text-xs font-medium shadow-xs">
            <button
              id="btn-format-square"
              type="button"
              onClick={() => onChange({ ...config, format: 'square_1_1' })}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                config.format === 'square_1_1'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Square 1:1 (Feed)
            </button>
            <button
              id="btn-format-story"
              type="button"
              onClick={() => onChange({ ...config, format: 'story_9_16' })}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                config.format === 'story_9_16'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Story 9:16 (Reel)
            </button>
            <button
              id="btn-format-landscape"
              type="button"
              onClick={() => onChange({ ...config, format: 'landscape_16_9' })}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                config.format === 'landscape_16_9'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Landscape 16:9
            </button>
          </div>

          {/* Canvas Wrapper */}
          <div
            className="relative shadow-xl rounded-lg overflow-hidden border border-slate-700/20 bg-slate-950 flex items-center justify-center"
            style={{
              width: width * scale,
              height: height * scale,
              maxWidth: '100%',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: width * scale,
                height: height * scale,
                display: 'block',
              }}
            />
          </div>

          {/* Export Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
            <button
              id="btn-download-png"
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG ({width}x{height})
            </button>
            <button
              id="btn-copy-image"
              type="button"
              onClick={handleCopyImage}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Palette Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Festive Theme Palette
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_THEMES.map((th, idx) => (
                <button
                  key={th.name}
                  type="button"
                  onClick={() => onChange({ ...config, themeIndex: idx })}
                  className={`p-2 rounded-lg border text-left transition-all text-xs flex flex-col gap-1.5 ${
                    config.themeIndex === idx
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-slate-300/40"
                      style={{ backgroundColor: th.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-slate-300/40"
                      style={{ backgroundColor: th.secondary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-slate-300/40"
                      style={{ backgroundColor: th.accent }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 truncate w-full">
                    {th.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Background Pattern
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(
                [
                  { id: 'sparkles', label: '✨ Sparkles' },
                  { id: 'confetti', label: '🎊 Confetti' },
                  { id: 'geometric', label: '📐 Frames' },
                  { id: 'minimal_rings', label: '⭕ Rings' },
                  { id: 'clean', label: '💎 Clean' },
                ] as const
              ).map((pat) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => onChange({ ...config, pattern: pat.id })}
                  className={`px-2.5 py-1.5 rounded-md border text-center font-medium transition-colors ${
                    config.pattern === pat.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Fields */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline Text
              </label>
              <input
                id="input-card-headline"
                type="text"
                value={config.headline}
                onChange={(e) => onChange({ ...config, headline: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Happy New Year!"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subheading / Tagline
              </label>
              <input
                id="input-card-subheading"
                type="text"
                value={config.subheading}
                onChange={(e) => onChange({ ...config, subheading: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Celebrating fresh starts and new possibilities."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Name
                </label>
                <input
                  id="input-card-brand"
                  type="text"
                  value={config.brandName}
                  onChange={(e) => onChange({ ...config, brandName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="OUR BRAND"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Emoji
                </label>
                <input
                  id="input-card-emoji"
                  type="text"
                  value={config.emoji}
                  onChange={(e) => onChange({ ...config, emoji: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  placeholder="✨"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Badge Text
                </label>
                <input
                  id="input-card-badge"
                  type="text"
                  value={config.badgeText}
                  onChange={(e) => onChange({ ...config, badgeText: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="FESTIVE SPECIAL"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CTA Button Label
                </label>
                <input
                  id="input-card-cta"
                  type="text"
                  value={config.cta}
                  onChange={(e) => onChange({ ...config, cta: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="SWIPE & CELEBRATE"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
