import { Post } from './crawler.types';

export type AnalysisRequest = {
  content: string;
  posts: Post[];
  keywords?: string[];
  categoryFilters?: string[];
  previousAnalysis?: AnalysisResult;
};

export type AnalysisResult = {
  hasNewContent: boolean;
  matchedKeywords: string[];
  matchedCategories: string[];
  newPosts: Post[];
  relevantChanges: ContentChange[];
  summary: string;
  confidence: number;
};

export type ContentChange = {
  type: 'new_post' | 'updated_post' | 'category_match' | 'keyword_match';
  post: Post;
  reason: string;
  confidence: number;
};
