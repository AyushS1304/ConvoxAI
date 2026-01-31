// API Response Types matching backend models

export interface APIResponse {
  status: string;
  message: string;
  model_info?: {
    llm_model: string | string[];
    whisper_model: string;
    rag_enabled: boolean;
  };
}

export interface SummaryResponse {
  status?: string;
  summary: string;
  transcript?: string;
  duration_minutes?: number;
  no_of_participants?: number;
  sentiment?: 'Positive' | 'Negative' | 'Neutral';
  key_aspects?: string[];
  metadata?: {
    file_name: string;
    file_size: number;
    processing_time: number;
  };
}

export interface ModelTestRequest {
  user_choice: number;
  query: string;
}

export interface ErrorResponse {
  error: string;
  status_code: number;
}
