export interface RawResponse {
  question_id: string;
  order_index: number;
  value: number; // 1-5 for Likert
}

export interface ScoringDimension {
  id: string;
  name: string;
  code: string;
  formula?: string;
  min_score?: number; // Theoretical min
  max_score?: number; // Theoretical max
}

export interface DimensionResult {
  dimension_id: string;
  name: string;
  rawScore: number;
  normalizedScore: number; // 1-10
}

export interface ScoringCompetency {
  id: string;
  name: string;
  dimensions: {
    dimension_id: string;
    weight: number;
  }[];
}

export interface CompetencyResult {
  competency_id: string;
  name: string;
  score: number; // 1-10 (weighted average of dimensions)
}

export interface ScoringOutput {
  dimensions: DimensionResult[];
  competencies: CompetencyResult[];
}
