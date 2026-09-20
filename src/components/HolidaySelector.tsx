import React, { useState } from 'react';
import { HolidayItem, HolidayCategory, ProcessedPost } from '../types';
import { Search, Calendar, Plus, CheckCircle2, Sparkles, Filter, X } from 'lucide-react';

interface HolidaySelectorProps {
  holidays: HolidayItem[];
  selectedHolidayId: string;
  onSelectHoliday: (holiday: HolidayItem) => void;
  processedPosts: ProcessedPost[];
  onAddCustomHoliday: (newHoliday: HolidayItem) => void;
}

export const HolidaySelector: React.FC<HolidaySelectorProps> = ({
  holidays,
  selectedHolidayId,
  onSelectHoliday,
  processedPosts,
  onAddCustomHoliday,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<HolidayCategory | 'all'>('all');
  const [showProcessedOnly, setShowProcessedOnly] = useState<'all' | 'processed' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Custom Holiday Form State
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('2026-10-15');
  const [customEmoji, setCustomEmoji] = useState('🎉');
  const [customCategory, setCustomCategory] = useState<HolidayCategory>('cultural');
  const [customDescription, setCustomDescription] = useState('');
  const [customAngle, setCustomAngle] = useState('');

  const processedHolidayIds = new Set(processedPosts.map((p) => p.holidayId));

  const filteredHolidays = holidays.filter((h) => {
    // Search
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.defaultHashtags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Month
    const matchesMonth = selectedMonth === 'all' || h.month === selectedMonth;

    // Category
    const matchesCat = selectedCategory === 'all' || h.category === selectedCategory;

    // Processed status
    const isProcessed = processedHolidayIds.has(h.id);
    const matchesStatus =
      showProcessedOnly === 'all' ||
      (showProcessedOnly === 'processed' && isProcessed) ||
      (showProcessedOnly === 'pending' && !isProcessed);

    return matchesSearch && matchesMonth && matchesCat && matchesStatus;
  });

  const months = [
    { num: 1, label: 'Jan' },
    { num: 2, label: 'Feb' },
    { num: 3, label: 'Mar' },
    { num: 4, label: 'Apr' },
    { num: 5, label: 'May' },
    { num: 6, label: 'Jun' },
    { num: 7, label: 'Jul' },
    { num: 8, label: 'Aug' },
    { num: 9, label: 'Sep' },
    { num: 10, label: 'Oct' },
    { num: 11, label: 'Nov' },
    { num: 12, label: 'Dec' },
  ];

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const parsedDate = new Date(customDate);
    const month = parsedDate.getMonth() + 1;
    const day = parsedDate.getDate();

    const newH: HolidayItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      date: customDate,
      month,
      day,
      category: customCategory,
      categoryLabel: customCategory.replace('_', ' ').toUpperCase(),
      emoji: customEmoji || '📅',
      description: customDescription.trim() || 'Custom brand holiday celebration.',
      recommendedAngle: customAngle.trim() || 'Community appreciation and key announcement',
      suggestedHooks: [
        `Today we are celebrating ${customName}!`,
        `Marking a special milestone: ${customName}.`,
      ],
      defaultHashtags: [`#${customName.replace(/\s+/g, '')}`, '#BrandCelebration'],
      colorTheme: {
        name: 'Custom Brand Theme',
        primary: '#1e293b',
        secondary: '#6366f1',
        accent: '#a5b4fc',
        text: '#ffffff',
        bgGradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
      },
      isCustom: true,
    };

    onAddCustomHoliday(newH);
    setShowAddModal(false);
    setCustomName('');
    setCustomDescription('');
    setCustomAngle('');
  };

  return (
    <div id="holiday-selector-container" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      {/* Top Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-holidays"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holidays, observances, hashtags..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <button
          id="btn-add-custom-holiday"
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Holiday
        </button>
      </div>

      {/* Month Filter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <button
          id="btn-filter-month-all"
          type="button"
          onClick={() => setSelectedMonth('all')}
          className={`px-2.5 py-1 rounded-md shrink-0 font-medium transition-colors ${
            selectedMonth === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Year ({holidays.length})
        </button>
        {months.map((m) => {
          const count = holidays.filter((h) => h.month === m.num).length;
          return (
            <button
              key={m.num}
              id={`btn-filter-month-${m.num}`}
              type="button"
              onClick={() => setSelectedMonth(m.num)}
              className={`px-2 py-1 rounded-md shrink-0 font-medium transition-colors ${
                selectedMonth === m.num
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Category & Status Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Type:
          </span>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'major', label: 'Major' },
              { id: 'cultural', label: 'Festive' },
              { id: 'fun_awareness', label: 'Social & Fun' },
              { id: 'business', label: 'Retail & Business' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Sheet Status:</span>
          <select
            id="select-filter-sheet-status"
            value={showProcessedOnly}
            onChange={(e) => setShowProcessedOnly(e.target.value as 'all' | 'processed' | 'pending')}
            className="text-[11px] font-medium border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Items</option>
            <option value="processed">Processed in Sheet ({processedPosts.length})</option>
            <option value="pending">Pending Draft</option>
          </select>
        </div>
      </div>

      {/* Holiday Horizontal Cards / Scrollable Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-1">
        {filteredHolidays.map((holiday) => {
          const isSelected = holiday.id === selectedHolidayId;
          const isProcessed = processedHolidayIds.has(holiday.id);

          return (
            <button
              key={holiday.id}
              id={`card-holiday-${holiday.id}`}
              type="button"
              onClick={() => onSelectHoliday(holiday)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-xl">{holiday.emoji}</span>
                  <div className="flex items-center gap-1">
                    {isProcessed && (
                      <span
                        title="Processed & logged in Tracking Sheet"
                        className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Processed
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {holiday.date.slice(5)}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{holiday.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {holiday.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-indigo-600 font-semibold truncate">
                  {holiday.defaultHashtags[0]}
                </span>
                <span className="text-slate-400 font-medium">{holiday.categoryLabel}</span>
              </div>
            </button>
          );
        })}

        {filteredHolidays.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No holidays found matching your filters. Try clearing your search or add a custom holiday!
          </div>
        )}
      </div>

      {/* Add Custom Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Add Custom Holiday / Event
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Holiday / Event Name *</label>
                <input
                  id="custom-holiday-name"
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Founders Day, Annual Summer Gala"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    id="custom-holiday-date"
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Icon / Emoji</label>
                  <input
                    id="custom-holiday-emoji"
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    placeholder="🎉"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  id="custom-holiday-category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as HolidayCategory)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cultural">Festive / Cultural</option>
                  <option value="business">Company / Business / Milestone</option>
                  <option value="fun_awareness">Awareness / Social Day</option>
                  <option value="major">Major Holiday</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  id="custom-holiday-desc"
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="What is this holiday about?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-add-custom"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
