import { 
  RawResponse, 
  ScoringDimension, 
  ScoringCompetency, 
  ScoringOutput,
  DimensionResult,
  CompetencyResult
} from './types';

/**
 * Pure function scoring engine.
 * No side effects, deterministic mathematical logic.
 */
export const scoringEngine = {
  
  /**
   * Evaluates a string formula like "36 - (Q1 + Q5) + (Q3)".
   * Replaces Q{order_index} with the corresponding response value.
   */
  evaluateFormula(formula: string, responses: RawResponse[]): number {
    // Replace Q{n} with response value where n is the order_index
    let expression = formula;
    
    // Sort responses by order_index descending to avoid partial replacement (e.g., Q10 replaced by Q1)
    const sorted = [...responses].sort((a, b) => b.order_index - a.order_index);
    
    sorted.forEach(r => {
      const regex = new RegExp(`Q${r.order_index}\\b`, 'g');
      expression = expression.replace(regex, r.value.toString());
    });

    // Simple expression evaluation (safer than eval if we only have numbers and basic math)
    // For now, using Function constructor for simplicity, but strictly limited to math.
    try {
      // Remove any non-math characters for security
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      // eslint-disable-next-line no-new-func
      return new Function(`return ${sanitized}`)();
    } catch (e) {
      console.error(`Error evaluating formula: ${formula}`, e);
      return 0;
    }
  },

  /**
   * Normalizes a raw score to a standard 1-10 scale using Min-Max scaling.
   * 
   * Formula: ((raw - min) / (max - min)) * 9 + 1
   * 
   * Features:
   * - Prevents division by zero (returns median 5.5 if max === min).
   * - Clamps output strictly between 1.00 and 10.00.
   * - Deterministic rounding (2 decimal places).
   */
  normalize(raw: number, min: number, max: number): number {
    if (max === min) return 5.5; // Neutral midpoint fallback
    
    // Scale to [0, 1]
    const clampedRaw = Math.min(Math.max(raw, min), max);
    const scaled = (clampedRaw - min) / (max - min);
    
    // Transform to [1, 10]
    const norm = (scaled * 9) + 1;
    
    return Number(norm.toFixed(2));
  },

  /**
   * Main entry point for scoring.
   */
  process(
    responses: RawResponse[],
    dimensions: ScoringDimension[],
    competencies: ScoringCompetency[]
  ): ScoringOutput {
    // 1. Calculate Dimension Scores
    const dimensionResults: DimensionResult[] = dimensions.map(d => {
      let rawScore = 0;
      
      if (d.formula) {
        rawScore = this.evaluateFormula(d.formula, responses);
      } else {
        // Simple sum fallback if no formula provided
        rawScore = responses.reduce((acc, r) => acc + r.value, 0);
      }

      // If min/max not provided, assume 1-5 * number of questions in formula or full test
      const min = d.min_score ?? 12; // Default for BFQ subdimensions usually 12 questions? 
      const max = d.max_score ?? 60; // Just placeholders if not in DB

      return {
        dimension_id: d.id,
        name: d.name,
        rawScore,
        normalizedScore: this.normalize(rawScore, min, max)
      };
    });

    // 2. Calculate Competency Scores (Weighted Average of Normalized Dimension Scores)
    const competencyResults: CompetencyResult[] = competencies.map(c => {
      let totalWeightedScore = 0;
      let totalWeight = 0;

      c.dimensions.forEach(cd => {
        const dimResult = dimensionResults.find(dr => dr.dimension_id === cd.dimension_id);
        if (dimResult) {
          totalWeightedScore += dimResult.normalizedScore * cd.weight;
          totalWeight += cd.weight;
        }
      });

      const score = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      return {
        competency_id: c.id,
        name: c.name,
        score: Number(score.toFixed(2))
      };
    });

    return {
      dimensions: dimensionResults,
      competencies: competencyResults
    };
  }
};
