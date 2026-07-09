/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, Check, AlertCircle, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebhookSettingsProps {
  currentUrl: string;
  onSave: (url: string) => void;
}

export default function WebhookSettings({ currentUrl, onSave }: WebhookSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(urlInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4 transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors focus:outline-none"
        id="toggle-webhook-settings-btn"
      >
        <div className="flex items-center gap-2">
          <Settings className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
          <span>Webhook Configuration</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUrl ? (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 font-normal">
              <Check className="w-3 h-3" /> Configured
            </span>
          ) : (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1 font-normal animate-pulse">
              <AlertCircle className="w-3 h-3" /> Required
            </span>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSave} className="space-y-3 pt-1">
              <div className="text-xs text-slate-500 leading-relaxed">
                Paste your custom <strong className="text-slate-700">n8n Webhook URL</strong> below. Submissions will be sent as a POST request to this URL.
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="https://your-n8n-instance/webhook/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-slate-700 transition-all font-sans"
                    id="webhook-url-input"
                  />
                </div>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all focus:outline-none ${
                    isSaved
                      ? 'bg-emerald-500 text-white shadow-emerald-100 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-100 shadow-md active:scale-98'
                  }`}
                  id="save-webhook-btn"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>

              {currentUrl && (
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <span className="font-semibold text-slate-500">Active:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 block max-w-full truncate">
                    {currentUrl}
                  </span>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
