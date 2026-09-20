import React, { useState } from 'react';
import { HolidayItem, Tone, Platform, VisualCardConfig, PostStatus } from '../types';
import { Copy, Check, RefreshCw, Save, Send, Sparkles, Instagram, Linkedin, Twitter, Video } from 'lucide-react';

interface PostDrafterProps {
  holiday: HolidayItem;
  brandName: string;
  onBrandNameChange: (name: string) => void;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  ctaText: string;
  onCtaTextChange: (cta: string) => void;
  posts: {
    instagram: string;
    linkedin: string;
    twitter: string;
    tiktok: string;
  };
  onPostContentChange: (platform: Platform, content: string) => void;
  onRegenerate: () => void;
  onSaveToSheet: (status: PostStatus) => void;
  isSaved?: boolean;
}

export const PostDrafter: React.FC<PostDrafterProps> = ({
  holiday,
  brandName,
  onBrandNameChange,
  tone,
  onToneChange,
  ctaText,
  onCtaTextChange,
  posts,
  onPostContentChange,
  onRegenerate,
  onSaveToSheet,
  isSaved,
}) => {
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram');
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PostStatus>('ready');

  const handleCopy = (platform: Platform) => {
    const text = posts[platform];
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const getCharCount = (text: string) => text.length;

  const tonesList: { id: Tone; label: string; desc: string }[] = [
    { id: 'celebratory', label: '🎉 Celebratory', desc: 'Warm, festive, uplifting' },
    { id: 'engaging', label: '💬 Engaging', desc: 'Community questions & debate' },
    { id: 'promotional', label: '🏷️ Promotional', desc: 'Holiday offer & CTA' },
    { id: 'thoughtful', label: '🌱 Thoughtful', desc: 'Mindful, reflection, values' },
    { id: 'humorous', label: '😄 Humorous', desc: 'Relatable fun & light irony' },
    { id: 'storytelling', label: '📖 Storytelling', desc: 'Behind the scenes & mission' },
  ];

  return (
    <div id="post-drafter-container" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Drafter Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{holiday.emoji}</span>
            <h2 className="text-lg font-bold text-slate-900">{holiday.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {holiday.date}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Angle: <span className="text-slate-700 font-medium">{holiday.recommendedAngle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-regenerate-posts"
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate All Platforms
          </button>

          <div className="flex items-center gap-1.5">
            <select
              id="select-save-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PostStatus)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="draft">Status: Draft</option>
              <option value="ready">Status: Ready</option>
              <option value="scheduled">Status: Scheduled</option>
              <option value="published">Status: Published</option>
            </select>

            <button
              id="btn-save-to-sheet"
              type="button"
              onClick={() => onSaveToSheet(selectedStatus)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaved ? 'Update in Sheet' : 'Save to Sheet'}
            </button>
          </div>
        </div>
      </div>

      {/* Tone & Brand Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Brand / Organization Name
          </label>
          <input
            id="input-drafter-brand"
            type="text"
            value={brandName}
            onChange={(e) => onBrandNameChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Acme Studio"
          />
        </div>

        <div className="md:col-span-8">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Draft Tone
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {tonesList.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onToneChange(t.id)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all truncate ${
                  tone === t.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={t.desc}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Tabs & Content Editor */}
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1">
            <button
              id="tab-btn-instagram"
              type="button"
              onClick={() => setActivePlatform('instagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePlatform === 'instagram'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram Post
            </button>

            <button
              id="tab-btn-linkedin"
              type="button"
              onClick={() => setActivePlatform('linkedin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePlatform === 'linkedin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn Article
            </button>

            <button
              id="tab-btn-twitter"
              type="button"
              onClick={() => setActivePlatform('twitter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePlatform === 'twitter'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Twitter className="w-3.5 h-3.5" />
              X / Twitter Post
            </button>

            <button
              id="tab-btn-tiktok"
              type="button"
              onClick={() => setActivePlatform('tiktok')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePlatform === 'tiktok'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              30s Video Script (TikTok/Reels)
            </button>
          </div>

          {/* Copy Button & Metrics */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {getCharCount(posts[activePlatform])} chars
              {activePlatform === 'twitter' && (
                <span
                  className={`ml-1 font-semibold ${
                    getCharCount(posts.twitter) <= 280 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  ({280 - getCharCount(posts.twitter)} left)
                </span>
              )}
            </span>

            <button
              id="btn-copy-platform-draft"
              type="button"
              onClick={() => handleCopy(activePlatform)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              {copiedPlatform === activePlatform ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Post</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="relative">
          <textarea
            id={`textarea-post-${activePlatform}`}
            rows={10}
            value={posts[activePlatform]}
            onChange={(e) => onPostContentChange(activePlatform, e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-sans leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            placeholder="Draft content..."
          />
        </div>

        {/* Suggested Hooks Pill Bar */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Suggested Alternative Hooks:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {holiday.suggestedHooks.map((hk, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const current = posts[activePlatform];
                  // Prepend or replace first line
                  const lines = current.split('\n');
                  lines[0] = hk;
                  onPostContentChange(activePlatform, lines.join('\n'));
                }}
                className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors border border-slate-200/60"
              >
                &ldquo;{hk}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
