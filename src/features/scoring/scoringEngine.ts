import { 
  RawResponse, 
  ScoringDimension, 
  ScoringCompetency, 
  ScoringOutput,
  DimensionResult,
  CompetencyResult
} from './types';

import { Parser } from 'expr-eval';
import { BIG_FIVE_NORMING } from './normingTables';

/**
 * Pure function scoring engine.
 */
export const scoringEngine = {
  
  /**
   * Validates if a formula string is syntactically correct.
   */
  validateFormula(formula: string): { isValid: boolean; error?: string } {
    try {
      Parser.parse(formula);
      return { isValid: true };
    } catch (e: any) {
      return { isValid: false, error: e.message };
    }
  },

  /**
   * Evaluates a string formula like "36 - (Q1 + Q5) + (Q3)" or "D1 + D2".
   * Uses expr-eval for safe, non-eval execution.
   */
  evaluateFormula(formula: string, responses: RawResponse[], dimensionValues: Record<string, number> = {}): number {
    try {
      const parser = new Parser();
      const expr = parser.parse(formula);
      
      // Map variables (Q1, Q2...) to their numeric values
      const variables: Record<string, number> = { ...dimensionValues };
      responses.forEach(r => {
        variables[`Q${r.order_index}`] = r.value;
      });

      // Execute with variables
      return expr.evaluate(variables);
    } catch (e) {
      console.error(`Error evaluating formula: ${formula}`, e);
      return 0;
    }
  },

  /**
   * Applies norming tables to a raw score.
   */
  norm(raw: number, type: 'subdimension' | 'dimension', index: number, gender: 0 | 1): number {
    const tableSet = type === 'subdimension' ? BIG_FIVE_NORMING.subdimensions : BIG_FIVE_NORMING.dimensions;
    const tableIndex = (index * 2) + gender;
    const table = tableSet[tableIndex];

    if (!table) return raw;

    const offset = type === 'subdimension' ? 12 : 24;
    const lookupIndex = Math.max(0, Math.min(Math.round(raw) - offset, table.length - 1));
    
    return table[lookupIndex];
  },

  /**
   * Normalizes a normed score (usually 20-80 range) to 1-10.
   * BIG FIVE interpreted scores typically range from 27 to 73 in the matrices.
   */
  normalize(normed: number): number {
    // Map 20-80 range (standard T-score-like) to 1-10
    // Based on BIGFIVE.js: nivel(val) does Math.round(val/10)
    // Here we want a finer grain 1-10
    const min = 20;
    const max = 80;
    const scaled = (normed - min) / (max - min);
    const result = (scaled * 9) + 1;
    return Number(Math.max(1, Math.min(10, result)).toFixed(2));
  },

  /**
   * Main entry point for scoring.
   */
  process(
    responses: RawResponse[],
    dimensions: ScoringDimension[],
    competencies: ScoringCompetency[],
    gender: number = 0
  ): ScoringOutput {
    const genderIdx = gender === 1 ? 1 : 0;
    const dimensionResults: DimensionResult[] = [];
    const calculatedValues: Record<string, number> = {};

    // Helper to calculate a dimension
    const calculateDim = (d: ScoringDimension) => {
      // If already calculated, skip
      if (dimensionResults.find(res => res.dimension_id === d.id)) return;

      const rawScore = d.formula
        ? this.evaluateFormula(d.formula, responses, calculatedValues)
        : responses.reduce((acc, r) => acc + r.value, 0);

      // Identify type and table index based on code (D1-D11 are sub, D12-D16 are dim)
      const codeMatch = d.code?.match(/D(\d+)/);
      const dNum = codeMatch ? parseInt(codeMatch[1]) : 0;

      let type: 'subdimension' | 'dimension' = 'subdimension';
      let tableIndex = 0;

      if (dNum >= 1 && dNum <= 11) {
        type = 'subdimension';
        tableIndex = dNum - 1;
      } else if (dNum >= 12 && dNum <= 16) {
        type = 'dimension';
        tableIndex = dNum - 12;
      } else {
        // Fallback if code doesn't match D1-D16
        type = 'subdimension';
        tableIndex = 0;
      }

      const normedScore = this.norm(rawScore, type, tableIndex, genderIdx);
      const normalizedScore = this.normalize(normedScore);

      dimensionResults.push({
        dimension_id: d.id,
        name: d.name,
        rawScore,
        normedScore,
        normalizedScore
      });

      // Store rawScore in the map for future dependencies (using its code D1, D2...)
      if (d.code) {
        calculatedValues[d.code] = rawScore;
      }
    };

    // Split dimensions into those that use Q (Level 1) and those that use D (Level 2)
    const level1 = dimensions.filter(d => !d.formula || !d.formula.includes('D'));
    const level2 = dimensions.filter(d => d.formula?.includes('D'));

    // Process Level 1 first
    level1.forEach(d => calculateDim(d));
    // Process Level 2 (now they have access to calculatedValues from Level 1)
    level2.forEach(d => calculateDim(d));

    // 2. Calculate Competency Scores
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

      const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const score = Number(rawScore.toFixed(2));

      // 3. Determine Interpretation Level
      let level: 'Alejado' | 'Cercano' | 'Adecuado' = 'Alejado';
      let interpretation = '';
      let profile = '';

      if (score >= 7.6) {
        level = 'Adecuado';
        interpretation = c.inter_adecuado || '';
        profile = c.profile_adecuado || '';
      } else if (score >= 4.6) {
        level = 'Cercano';
        interpretation = c.inter_cercano || '';
        profile = c.profile_cercano || '';
      } else {
        level = 'Alejado';
        interpretation = c.inter_alejado || '';
        profile = c.profile_alejado || '';
      }

      return {
        competency_id: c.id,
        name: c.name,
        score,
        level,
        interpretation,
        profile,
        empathy: c.empathy,
        areas_for_improvement: c.areas_for_improvement
      };
    });

    return {
      dimensions: dimensionResults,
      competencies: competencyResults
    };
  }
};
