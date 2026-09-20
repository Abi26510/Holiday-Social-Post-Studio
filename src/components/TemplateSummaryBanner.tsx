import React, { useState } from 'react';
import { Copy, Check, Info, Sparkles } from 'lucide-react';

interface TemplateSummaryBannerProps {
  currentSentence: string;
}

export const TemplateSummaryBanner: React.FC<TemplateSummaryBannerProps> = ({ currentSentence }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="template-summary-banner"
      className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm border border-indigo-800/40 relative overflow-hidden"
    >
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-start justify-between gap-3 relative z-10">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Active Workflow Specification
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Standard Social Media Manager Pipeline
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-100 font-mono leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-indigo-400/20">
            &ldquo;{currentSentence}&rdquo;
          </p>
        </div>

        <button
          id="btn-copy-template-summary"
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 self-center"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied Format!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Sentence</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
