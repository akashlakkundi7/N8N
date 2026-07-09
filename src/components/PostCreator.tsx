/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, Copy, Check, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubmissionStatus } from '../types';

interface PostCreatorProps {
  webhookUrl: string;
  onPostSuccess: (topic: string, postContent: string) => void;
  onPostError: (topic: string, error: string) => void;
}

export default function PostCreator({ webhookUrl, onPostSuccess, onPostError }: PostCreatorProps) {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Default target endpoint as specified
  const targetWebhookUrl = webhookUrl || 'https://workflow.ccbp.in/webhook-test/c58c1c84-c9b2-4193-bcf2-59a63ffcc4a3';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus('loading');
    setGeneratedPost(null);
    setErrorMessage(null);

    // Enforce 2 seconds minimum loading time as per requirements
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    // The actual fetch request to the n8n webhook
    const fetchPromise = async () => {
      try {
        const response = await fetch(targetWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: topic.trim() }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract post from response: { "post": "generated post content" }
        if (data && data.post) {
          return data.post as string;
        } else if (data && typeof data === 'string') {
          return data;
        } else if (data && typeof data === 'object') {
          // Fallback if returned in another format
          return JSON.stringify(data.post || data.text || data, null, 2);
        } else {
          throw new Error('Response format is missing generated post.');
        }
      } catch (err: any) {
        console.error('API Error:', err);
        throw err;
      }
    };

    try {
      // Execute both promises concurrently to ensure at least 2 seconds delay
      const [_, post] = await Promise.all([delayPromise, fetchPromise()]);
      
      setGeneratedPost(post);
      setStatus('success');
      onPostSuccess(topic.trim(), post);
      setTopic(''); // Clear text box on success as required: "After successful generation: Clear the text box for the next topic"
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Oops! Something went wrong. Please try again.');
      onPostError(topic.trim(), err?.message || 'Network request failed');
    }
  };

  const copyToClipboard = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100/60 shadow-lg shadow-rose-50/50 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="topic-input" className="block text-sm font-medium text-slate-700 tracking-tight flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <span>Post Topic / URL</span>
          </label>
          
          <div className="relative group">
            <input
              type="text"
              required
              id="topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Provide the URL here…"
              disabled={status === 'loading'}
              className="w-full px-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 focus:border-rose-200 focus:bg-white text-slate-800 placeholder-slate-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 disabled:opacity-60 transition-all duration-200 text-base"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full relative py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-400 to-amber-300 hover:from-rose-50 hover:to-amber-400 text-white font-medium shadow-md shadow-rose-200/50 hover:shadow-lg hover:shadow-rose-300/40 active:scale-[0.99] disabled:opacity-80 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center min-h-[52px] group"
          id="create-post-submit-btn"
        >
          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-semibold tracking-wide">Creating post... please wait!</span>
                {/* Custom Pulsing Dots */}
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }} />
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }} />
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-2"
              >
                <span>Generate Post</span>
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </form>

      {/* Results panel with enter/exit animations */}
      <AnimatePresence mode="wait">
        {status === 'success' && generatedPost && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="p-5 sm:p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col gap-4"
            id="success-message-panel"
          >
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>✅ Post is ready!</span>
            </div>

            <div className="bg-white border border-emerald-100 rounded-xl p-4 relative group">
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> AI Generated
              </span>
              <p className="text-sm text-slate-700 font-sans whitespace-pre-wrap leading-relaxed pr-16">
                {generatedPost}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 active:scale-[0.99]'
              }`}
              id="copy-post-btn"
              type="button"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Generated Post</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {status === 'error' && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100/70 flex items-start gap-3"
            id="error-message-panel"
          >
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-rose-900">Oops! Something went wrong. Please try again.</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                We couldn't connect or fetch the post content. Please verify your connection or try again.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
