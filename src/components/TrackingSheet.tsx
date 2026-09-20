import React, { useState } from 'react';
import { ProcessedPost, PostStatus } from '../types';
import { FileSpreadsheet, Download, Trash2, Eye, Copy, Check, Filter, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

interface TrackingSheetProps {
  processedPosts: ProcessedPost[];
  onUpdateStatus: (id: string, newStatus: PostStatus) => void;
  onDeletePost: (id: string) => void;
  onSelectToEdit: (post: ProcessedPost) => void;
}

export const TrackingSheet: React.FC<TrackingSheetProps> = ({
  processedPosts,
  onUpdateStatus,
  onDeletePost,
  onSelectToEdit,
}) => {
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<ProcessedPost | null>(null);

  const filteredPosts = processedPosts.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  const handleCopyTemplateSentence = (post: ProcessedPost) => {
    navigator.clipboard.writeText(post.templateSentence);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    if (processedPosts.length === 0) return;

    const headers = [
      'Holiday Name',
      'Date',
      'Status',
      'Tone',
      'Brand',
      'Instagram Caption',
      'LinkedIn Post',
      'Twitter Post',
      'TikTok Script',
      'Template Summary Sentence',
      'Created At',
    ];

    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const rows = processedPosts.map((p) => [
      escapeCsv(p.holidayName),
      escapeCsv(p.holidayDate),
      escapeCsv(p.status),
      escapeCsv(p.tone),
      escapeCsv(p.brandName),
      escapeCsv(p.platforms.instagram),
      escapeCsv(p.platforms.linkedin),
      escapeCsv(p.platforms.twitter),
      escapeCsv(p.platforms.tiktok),
      escapeCsv(p.templateSentence),
      escapeCsv(p.createdAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `holiday-social-content-sheet-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div id="tracking-sheet-container" className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Sheet Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Processed Content Tracking Sheet
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track of all drafted holiday posts, creative visual cards, and platform distribution status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-tracking-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PostStatus | 'all')}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Statuses ({processedPosts.length})</option>
              <option value="draft">Drafts</option>
              <option value="ready">Ready to Post</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button
            id="btn-export-sheet-csv"
            type="button"
            onClick={exportToCSV}
            disabled={processedPosts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Sheet (.CSV)
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      {filteredPosts.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No processed holiday posts in sheet yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Select any holiday from the calendar above, customize your post drafts and creative visual, and click &ldquo;Save to Sheet&rdquo;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Holiday & Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tone & Brand</th>
                <th className="py-3 px-3 min-w-[320px]">Formatted Processed Sentence</th>
                <th className="py-3 px-3 text-center">Visual Format</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Holiday & Date */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{post.holidayEmoji}</span>
                      <div>
                        <div className="font-bold text-slate-900">{post.holidayName}</div>
                        <div className="text-[11px] text-slate-400">{post.holidayDate}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={post.status}
                      onChange={(e) => onUpdateStatus(post.id, e.target.value as PostStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-md border ${getStatusBadge(
                        post.status
                      )} cursor-pointer focus:outline-none`}
                    >
                      <option value="draft">Draft</option>
                      <option value="ready">Ready</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </td>

                  {/* Tone & Brand */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800 capitalize">{post.tone}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {post.brandName || 'Default Brand'}
                    </div>
                  </td>

                  {/* Template Sentence */}
                  <td className="py-3 px-3">
                    <div className="relative group">
                      <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/60 leading-relaxed font-mono">
                        {post.templateSentence}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyTemplateSentence(post)}
                        className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {copiedId === post.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied Template Sentence!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Formatted Summary</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Visual Card format */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {post.visualConfig.format === 'square_1_1'
                        ? '1:1 Square'
                        : post.visualConfig.format === 'story_9_16'
                        ? '9:16 Story'
                        : '16:9 Banner'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="View Full Post Drafts"
                        onClick={() => setSelectedPostDetail(post)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        title="Load into Editor"
                        onClick={() => onSelectToEdit(post)}
                        className="px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        title="Delete from sheet"
                        onClick={() => onDeletePost(post.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal for inspecting drafted content */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedPostDetail.holidayEmoji}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPostDetail.holidayName} Drafts
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedPostDetail.holidayDate} • {selectedPostDetail.tone} tone • {selectedPostDetail.brandName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Template Summary Box */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 mb-1">
                Formatted Processed Template:
              </div>
              <p className="text-xs text-indigo-950 font-mono leading-relaxed">
                {selectedPostDetail.templateSentence}
              </p>
            </div>

            {/* Platform Previews */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Instagram Post:</span>
                <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans">
                  {selectedPostDetail.platforms.instagram}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">LinkedIn Post:</span>
                <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans">
                  {selectedPostDetail.platforms.linkedin}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">X / Twitter Post:</span>
                <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans">
                  {selectedPostDetail.platforms.twitter}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">TikTok / Reels 30s Script:</span>
                <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans">
                  {selectedPostDetail.platforms.tiktok}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPostDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
