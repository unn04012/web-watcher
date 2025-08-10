export type CrawlDto = {
  /**
   * crawler URL
   */
  url: string;
  /**
   * crawler name
   */
  name: string;
  /**
   * crawler description
   */
  description?: string;

  /**
   * crawler tags for what users can search for
   * e.g. ['news', 'sports', 'technology']
   */
  tags?: string[];

  /**
   * crawler keywords for what users can search for
   */
  keyword: string[];

  /**
   * crawler category filters for what users can search for
   */
  categoryFilters: string[];
};

export type CrawlResult = {
  url: string;
  title: string;
  content: string;
  extractedText: string;
  metadata: {
    crawledAt: Date;
    contentHash: string;
    links: string[];
    images: string[];
  };
  posts?: Post[];
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author?: string;
  publishedAt?: Date;
  category?: string;
  url: string;
  contentHash: string;
};
