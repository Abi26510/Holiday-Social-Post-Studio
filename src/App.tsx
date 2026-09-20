import React, { useState, useEffect } from 'react';
import { HolidayItem, Tone, Platform, VisualCardConfig, ProcessedPost, PostStatus } from './types';
import { INITIAL_HOLIDAYS, PRESET_THEMES } from './data/holidays';
import { generatePlatformPosts, generateTemplateSentence, getDefaultVisualConfig } from './utils/postGenerator';
import { HolidaySelector } from './components/HolidaySelector';
import { PostDrafter } from './components/PostDrafter';
import { VisualCanvas } from './components/VisualCanvas';
import { TrackingSheet } from './components/TrackingSheet';
import { TemplateSummaryBanner } from './components/TemplateSummaryBanner';
import { Calendar, Sparkles, FileSpreadsheet, Layers, CheckCircle2, BookmarkCheck } from 'lucide-react';

const STORAGE_KEY_POSTS = 'holiday_studio_processed_posts_v1';
const STORAGE_KEY_CUSTOM_HOLIDAYS = 'holiday_studio_custom_holidays_v1';
const STORAGE_KEY_BRAND = 'holiday_studio_brand_name_v1';

export default function App() {
  // Load holidays (initial + custom from local storage)
  const [holidays, setHolidays] = useState<HolidayItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_HOLIDAYS);
      if (saved) {
        const custom: HolidayItem[] = JSON.parse(saved);
        return [...INITIAL_HOLIDAYS, ...custom];
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_HOLIDAYS;
  });

  // Current active holiday
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayItem>(INITIAL_HOLIDAYS[0]);

  // Brand Name
  const [brandName, setBrandName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_BRAND) || 'Acme Brand';
  });

  // Drafter configuration
  const [tone, setTone] = useState<Tone>('celebratory');
  const [ctaText, setCtaText] = useState('Let us know your thoughts in the comments below!');

  // Generated Platform Posts
  const [currentPosts, setCurrentPosts] = useState<{
    instagram: string;
    linkedin: string;
    twitter: string;
    tiktok: string;
  }>(() => generatePlatformPosts(INITIAL_HOLIDAYS[0], 'celebratory', 'Acme Brand', ''));

  // Visual Card Config
  const [visualConfig, setVisualConfig] = useState<VisualCardConfig>(() =>
    getDefaultVisualConfig(INITIAL_HOLIDAYS[0], 'Acme Brand')
  );

  // Processed Posts (Tracking Sheet)
  const [processedPosts, setProcessedPosts] = useState<ProcessedPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }

    // Default seeded records for instant demonstration
    const seed1 = INITIAL_HOLIDAYS[0]; // New Year's Day
    const seedPosts1 = generatePlatformPosts(seed1, 'celebratory', 'Acme Brand', '');
    const seedConfig1 = getDefaultVisualConfig(seed1, 'Acme Brand');

    const seed2 = INITIAL_HOLIDAYS[2]; // Valentine's Day
    const seedPosts2 = generatePlatformPosts(seed2, 'thoughtful', 'Acme Brand', '');
    const seedConfig2 = getDefaultVisualConfig(seed2, 'Acme Brand');

    return [
      {
        id: `post-${seed1.id}`,
        holidayId: seed1.id,
        holidayName: seed1.name,
        holidayDate: seed1.date,
        holidayEmoji: seed1.emoji,
        tone: 'celebratory',
        brandName: 'Acme Brand',
        platforms: seedPosts1,
        visualConfig: seedConfig1,
        status: 'ready',
        createdAt: new Date().toISOString().slice(0, 10),
        notes: 'Holiday season campaign kickoff.',
        templateSentence: generateTemplateSentence(seed1, 'Acme Brand'),
      },
      {
        id: `post-${seed2.id}`,
        holidayId: seed2.id,
        holidayName: seed2.name,
        holidayDate: seed2.date,
        holidayEmoji: seed2.emoji,
        tone: 'thoughtful',
        brandName: 'Acme Brand',
        platforms: seedPosts2,
        visualConfig: seedConfig2,
        status: 'draft',
        createdAt: new Date().toISOString().slice(0, 10),
        notes: 'Customer appreciation focus.',
        templateSentence: generateTemplateSentence(seed2, 'Acme Brand'),
      },
    ];
  });

  // Save to LocalStorage whenever processedPosts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(processedPosts));
    } catch (e) {
      console.error(e);
    }
  }, [processedPosts]);

  // Save brandName
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BRAND, brandName);
    } catch (e) {
      console.error(e);
    }
  }, [brandName]);

  // When selected holiday or tone or brand changes, update the draft and visual config
  const handleSelectHoliday = (holiday: HolidayItem) => {
    setSelectedHoliday(holiday);
    const newPosts = generatePlatformPosts(holiday, tone, brandName, ctaText);
    setCurrentPosts(newPosts);
    setVisualConfig(getDefaultVisualConfig(holiday, brandName));
  };

  const handleToneChange = (newTone: Tone) => {
    setTone(newTone);
    const newPosts = generatePlatformPosts(selectedHoliday, newTone, brandName, ctaText);
    setCurrentPosts(newPosts);
  };

  const handleBrandNameChange = (newName: string) => {
    setBrandName(newName);
    setVisualConfig((prev) => ({ ...prev, brandName: newName.toUpperCase() }));
  };

  const handleRegeneratePosts = () => {
    const newPosts = generatePlatformPosts(selectedHoliday, tone, brandName, ctaText);
    setCurrentPosts(newPosts);
  };

  const handlePostContentChange = (platform: Platform, content: string) => {
    setCurrentPosts((prev) => ({ ...prev, [platform]: content }));
  };

  const handleAddCustomHoliday = (newHoliday: HolidayItem) => {
    const updated = [newHoliday, ...holidays];
    setHolidays(updated);
    try {
      const customOnly = updated.filter((h) => h.isCustom);
      localStorage.setItem(STORAGE_KEY_CUSTOM_HOLIDAYS, JSON.stringify(customOnly));
    } catch (e) {
      console.error(e);
    }
    handleSelectHoliday(newHoliday);
  };

  // Save or update draft into the tracking sheet
  const handleSaveToSheet = (status: PostStatus) => {
    const templateSentence = generateTemplateSentence(selectedHoliday, brandName);
    const existingIndex = processedPosts.findIndex((p) => p.holidayId === selectedHoliday.id);

    const newRecord: ProcessedPost = {
      id: existingIndex >= 0 ? processedPosts[existingIndex].id : `post-${selectedHoliday.id}-${Date.now()}`,
      holidayId: selectedHoliday.id,
      holidayName: selectedHoliday.name,
      holidayDate: selectedHoliday.date,
      holidayEmoji: selectedHoliday.emoji,
      tone,
      brandName,
      platforms: currentPosts,
      visualConfig,
      status,
      createdAt: new Date().toISOString().slice(0, 10),
      notes: `${selectedHoliday.categoryLabel} campaign`,
      templateSentence,
    };

    if (existingIndex >= 0) {
      const nextPosts = [...processedPosts];
      nextPosts[existingIndex] = newRecord;
      setProcessedPosts(nextPosts);
    } else {
      setProcessedPosts([newRecord, ...processedPosts]);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: PostStatus) => {
    setProcessedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleDeletePost = (id: string) => {
    setProcessedPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectToEdit = (post: ProcessedPost) => {
    const matchedHoliday = holidays.find((h) => h.id === post.holidayId);
    if (matchedHoliday) {
      setSelectedHoliday(matchedHoliday);
      setTone(post.tone);
      setBrandName(post.brandName);
      setCurrentPosts(post.platforms);
      setVisualConfig(post.visualConfig);

      // Scroll to post drafter
      const drafterEl = document.getElementById('post-drafter-container');
      if (drafterEl) {
        drafterEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentTemplateSentence = generateTemplateSentence(selectedHoliday, brandName);
  const isCurrentSaved = processedPosts.some((p) => p.holidayId === selectedHoliday.id);

  // Counters
  const processedCount = processedPosts.length;
  const readyCount = processedPosts.filter((p) => p.status === 'ready' || p.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Holiday Social Post Studio
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  Standalone • No Database
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Draft platform posts, generate creative visuals, and maintain your processed content tracking sheet
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold">{holidays.length}</span>
              <span className="text-slate-500 hidden md:inline">Holidays</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-100">
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-bold">{processedCount}</span>
              <span className="text-indigo-700 hidden md:inline">Processed in Sheet</span>
            </div>

            <a
              href="#tracking-sheet-container"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Tracking Sheet</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Template Summary Banner */}
        <TemplateSummaryBanner currentSentence={currentTemplateSentence} />

        {/* Section 1: Holiday Catalog & Picker */}
        <section aria-label="Holiday Selector">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Step 1: Select Holiday or Awareness Day
            </h2>
            <span className="text-xs text-slate-400">
              Active: <strong className="text-slate-700">{selectedHoliday.name}</strong> ({selectedHoliday.date})
            </span>
          </div>

          <HolidaySelector
            holidays={holidays}
            selectedHolidayId={selectedHoliday.id}
            onSelectHoliday={handleSelectHoliday}
            processedPosts={processedPosts}
            onAddCustomHoliday={handleAddCustomHoliday}
          />
        </section>

        {/* Section 2: Post Drafter and Creative Visual Studio */}
        <section aria-label="Content Creation Studio" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Step 2: Draft Platform Copy & Craft Creative Visual
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {isCurrentSaved ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced with Tracking Sheet
                </span>
              ) : (
                <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Unsaved Draft
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left: Multi-Platform Post Drafter */}
            <div className="xl:col-span-6">
              <PostDrafter
                holiday={selectedHoliday}
                brandName={brandName}
                onBrandNameChange={handleBrandNameChange}
                tone={tone}
                onToneChange={handleToneChange}
                ctaText={ctaText}
                onCtaTextChange={setCtaText}
                posts={currentPosts}
                onPostContentChange={handlePostContentChange}
                onRegenerate={handleRegeneratePosts}
                onSaveToSheet={handleSaveToSheet}
                isSaved={isCurrentSaved}
              />
            </div>

            {/* Right: Creative Visual Studio (Canvas) */}
            <div className="xl:col-span-6">
              <VisualCanvas
                config={visualConfig}
                onChange={setVisualConfig}
                holidayName={selectedHoliday.name}
              />
            </div>
          </div>
        </section>

        {/* Section 3: The Dedicated Processed Content Tracking Sheet */}
        <section aria-label="Processed Content Tracking Sheet" className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Step 3: Processed Content Tracking Sheet
            </h2>
            <span className="text-xs text-slate-400">
              {processedPosts.length} items logged • Ready for scheduling & publishing
            </span>
          </div>

          <TrackingSheet
            processedPosts={processedPosts}
            onUpdateStatus={handleUpdateStatus}
            onDeletePost={handleDeletePost}
            onSelectToEdit={handleSelectToEdit}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <p>
          Holiday Social Post Studio • Designed for social media managers drafting holiday posts & creative visual banners.
        </p>
        <p className="font-mono text-[11px] text-slate-500">
          Standalone client-side storage • Zero external database dependencies
        </p>
      </footer>
    </div>
  );
}
