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
  order_index?: number; // 0-based index for norming table lookup
}

export interface DimensionResult {
  dimension_id: string;
  name: string;
  rawScore: number;
  normedScore: number; // Interpreted score from norming table
  normalizedScore: number; // 1-10
}

export interface ScoringCompetency {
  id: string;
  name: string;
  dimensions: {
    dimension_id: string;
    weight: number;
  }[];
  definition?: string;
  inter_alejado?: string;
  inter_cercano?: string;
  inter_adecuado?: string;
  profile_alejado?: string;
  profile_cercano?: string;
  profile_adecuado?: string;
  empathy?: string;
  areas_for_improvement?: string;
}

export interface CompetencyResult {
  competency_id: string;
  name: string;
  score: number; // 1-10 (weighted average of dimensions)
  level: 'Alejado' | 'Cercano' | 'Adecuado';
  interpretation?: string;
  profile?: string;
  empathy?: string;
  areas_for_improvement?: string;
}

export interface ScoringOutput {
  dimensions: DimensionResult[];
  competencies: CompetencyResult[];
}
