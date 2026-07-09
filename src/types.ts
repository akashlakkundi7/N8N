/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PostHistoryItem {
  id: string;
  topic: string;
  timestamp: string;
  postContent?: string;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface WebhookConfig {
  webhookUrl: string;
}
