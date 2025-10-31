export type CanvasFormat =
  | 'Instagram Post (Square 1080x1080)'
  | 'Instagram Post (Portrait 1080x1350)'
  | 'Instagram Story (1080x1920)'
  | 'Landscape (1920x1080)'
  | 'A4 Document (2480x3508)';

export type StyleTheme =
  | 'Minimalist & Clean'
  | 'Bold & Modern'
  | 'Elegant & Corporate'
  | 'Fun & Playful'
  | 'AI Choice';

export type FlyerType =
  | 'Event Announcement'
  | 'Product Promotion'
  | 'Grand Opening'
  | 'Workshop or Seminar'
  | 'Hiring Ad';

export interface FlyerOptions {
  flyerType: FlyerType;
  topic: string;
  primaryText: string;
  detailsBlock: string;
  ctaText: string;
  brandName: string;
  canvasFormat: CanvasFormat;
  styleTheme: StyleTheme;
  primaryColor: string;
  accentColor: string;
}

export interface ImageFile {
  name: string;
  dataUrl: string;
}