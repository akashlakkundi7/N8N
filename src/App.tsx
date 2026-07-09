/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Share2, HelpCircle } from 'lucide-react';
import WebhookSettings from './components/WebhookSettings';
import PostCreator from './components/PostCreator';
import RecentPosts from './components/RecentPosts';
import { PostHistoryItem } from './types';

export default function App() {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [history, setHistory] = useState<PostHistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize values from localStorage on mount
  useEffect(() => {
    const defaultUrl = 'https://workflow.ccbp.in/webhook-test/c58c1c84-c9b2-4193-bcf2-59a63ffcc4a3';
    const savedWebhook = localStorage.getItem('n8n_webhook_url') || defaultUrl;
    setWebhookUrl(savedWebhook);

    try {
      const savedHistory = localStorage.getItem('post_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
    }
    setIsMounted(true);
  }, []);

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('n8n_webhook_url', url);
  };

  const handlePostSuccess = (topic: string, postContent: string) => {
    const newPost: PostHistoryItem = {
      id: crypto.randomUUID(),
      topic,
      timestamp: new Date().toISOString(),
      postContent,
      status: 'success',
    };
    const updatedHistory = [newPost, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('post_history', JSON.stringify(updatedHistory));
  };

  const handlePostError = (topic: string, errorMessage: string) => {
    const newPost: PostHistoryItem = {
      id: crypto.randomUUID(),
      topic,
      timestamp: new Date().toISOString(),
      status: 'error',
      errorMessage,
    };
    const updatedHistory = [newPost, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('post_history', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('post_history');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex gap-1.5 items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-rose-50/10 to-indigo-50/20 py-12 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-3 pb-2">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-white border border-rose-100/60 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" /> n8n Social Hub
            </span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 font-display flex items-center justify-center gap-2">
              <Share2 className="w-7 h-7 text-indigo-400 shrink-0" />
              <span>Post Generator</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Submit any topic or URL below to automatically generate and polish engaging social media posts with n8n workflow logic.
            </p>
          </div>
        </div>

        {/* Post Form (Primary Card) */}
        <PostCreator
          webhookUrl={webhookUrl}
          onPostSuccess={handlePostSuccess}
          onPostError={handlePostError}
        />

        {/* Webhook Configuration Panel */}
        <WebhookSettings currentUrl={webhookUrl} onSave={handleSaveWebhook} />

        {/* Recent Activity Log (History Card) */}
        <RecentPosts posts={history} onClear={handleClearHistory} />

        {/* Footer info/guide */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-500 transition-colors cursor-help group justify-center relative">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How does this work?</span>
            <div className="absolute bg-slate-800 text-white text-[10px] p-3 rounded-xl shadow-xl max-w-xs leading-normal hidden group-hover:block transition-all z-20 bottom-6 left-1/2 -translate-x-1/2 w-64 text-left">
              This portal sends a JSON payload <code className="font-mono text-indigo-300">{"{ text: topic }"}</code> to your webhook. The n8n workflow processes the request and responds with the completed post.
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Designed with soft pastel aesthetics &bull; Fully local configuration
          </p>
        </div>

      </div>
    </div>
  );
}
