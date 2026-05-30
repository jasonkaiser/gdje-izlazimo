export interface AiEventGenerateResponse {
  name: string;
  description: string;
  eventDateTime?: string | null;
  confidence?: number | null;
}