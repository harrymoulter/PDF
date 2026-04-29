
import { ExtractedTable, SmartProcessResult } from './lib/smartProcessor';

export type ToolId = 'merge' | 'split' | 'compress' | 'extract' | 'organize' | 'ocr' | 'image-to-pdf' | 'smart' | 'resume' | 'invoice' | 'translate' | 'viewer' | 'assistant' | 'extractor-pro' | 'pdf-to-json' | 'cleaner';
export type AppView = 'dashboard' | 'pdf-tools' | 'ai-tools' | 'extraction' | 'recent' | 'settings' | 'admin' | 'account' | 'history' | 'page-tool';

export interface UserHistory {
  id: string;
  user_id: string;
  action_type: string;
  file_name: string;
  file_size: string | number;
  result_status: 'success' | 'failed';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export type FooterSection = 'company' | 'legal' | 'quick';

export interface FooterLink {
  id: string;
  name: string;
  url: string;
  section: FooterSection;
  order_index: number;
  created_at: string;
}

export interface ToolDef {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'utility' | 'ai';
}

export interface ProcessingPage {
  id: string;
  pageNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  rawText: string;
  tables: ExtractedTable[];
  smartResult?: SmartProcessResult;
  error?: string;
  rotation?: number;
}

export interface ProcessingState {
  fileName: string;
  totalPages: number;
  processedPages: number;
  status: 'idle' | 'analyzing' | 'processing' | 'completed' | 'error';
  currentAction?: string;
  pages: ProcessingPage[];
}

export interface Ad {
  id?: string;
  name: string;
  code: string;
  position: 'After Header' | 'Before Footer' | 'Inside Content' | 'Sidebar Top' | 'Sidebar Bottom' | 'ALL';
  active: boolean;
  created_at?: string;
}

export interface NavItem {
  id?: string;
  name: string;
  url: string;
  menu_type: string;
  order_index: number;
  link_type: 'Internal Page' | 'External URL';
  created_at?: string;
}

export interface SiteSettings {
  id?: string;
  site_title: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at?: string;
}
