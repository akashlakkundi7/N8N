/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { History, Copy, Check, Trash2, Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';
import { PostHistoryItem } from '../types';

interface RecentPostsProps {
  posts: PostHistoryItem[];
  onClear: () => void;
}

export default function RecentPosts({ posts, onClear }: RecentPostsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-amber-100/40 shadow-sm text-center space-y-2 animate-fade-in">
        <div className="mx-auto w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
          <History className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500 font-display">No posts generated yet</p>
        <p className="text-xs text-slate-400">Your recent topics and generated posts will be stored here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100/80 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-700 font-display">Generated Post History</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 focus:outline-none"
          title="Clear history"
          type="button"
          id="clear-history-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Logs</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1 space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="pt-3 first:pt-0 space-y-2 group">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>{new Date(post.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isUrl(post.topic) ? (
                    <a
                      href={post.topic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline truncate block"
                    >
                      {post.topic}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-700 truncate block">
                      "{post.topic}"
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {post.status === 'success' ? (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-2.5 h-2.5" /> Ready
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1 font-medium">
                    <XCircle className="w-2.5 h-2.5" /> Error
                  </span>
                )}
              </div>
            </div>

            {post.status === 'success' && post.postContent && (
              <div className="flex flex-col gap-1.5 bg-slate-50/70 border border-slate-100 rounded-xl px-3 py-2">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed break-words">
                  {post.postContent}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100/50 pt-1.5 mt-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">AI Post Content</span>
                  <button
                    onClick={() => copyToClipboard(post.postContent!, post.id)}
                    className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-600 font-semibold focus:outline-none"
                    title="Copy Content"
                    type="button"
                    id={`copy-post-${post.id}`}
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {post.status === 'error' && post.errorMessage && (
              <p className="text-[10px] text-rose-500 italic leading-tight pl-4 border-l-2 border-rose-200/50">
                {post.errorMessage}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
