import { describe, it, expect } from 'vitest';
import { scoringEngine } from '../scoringEngine';
import { RawResponse, ScoringDimension, ScoringCompetency } from '../types';

describe('Scoring Engine', () => {
  
  describe('evaluateFormula', () => {
    it('should correctly evaluate simple addition formula', () => {
      const responses: RawResponse[] = [
        { question_id: 'q1', order_index: 1, value: 5 },
        { question_id: 'q2', order_index: 2, value: 4 }
      ];
      const formula = "Q1 + Q2";
      expect(scoringEngine.evaluateFormula(formula, responses)).toBe(9);
    });

    it('should handle Big Five style formulas with subtractions', () => {
      // 36 - (Q1 + Q2) + (Q3)
      const responses: RawResponse[] = [
        { question_id: 'q1', order_index: 1, value: 5 },
        { question_id: 'q2', order_index: 2, value: 5 },
        { question_id: 'q3', order_index: 3, value: 1 }
      ];
      const formula = "36 - (Q1 + Q2) + (Q3)";
      // 36 - 10 + 1 = 27
      expect(scoringEngine.evaluateFormula(formula, responses)).toBe(27);
    });

    it('should correctly handle multi-digit order indices (Q10 vs Q1)', () => {
      const responses: RawResponse[] = [
        { question_id: 'q1', order_index: 1, value: 1 },
        { question_id: 'q10', order_index: 10, value: 5 }
      ];
      const formula = "Q10 + Q1";
      expect(scoringEngine.evaluateFormula(formula, responses)).toBe(6);
    });
  });

  describe('normalize', () => {
    it('should normalize to 1 when score is min', () => {
      expect(scoringEngine.normalize(10, 10, 50)).toBe(1);
    });

    it('should normalize to 10 when score is max', () => {
      expect(scoringEngine.normalize(50, 10, 50)).toBe(10);
    });

    it('should normalize to 5.5 when score is in the middle', () => {
      expect(scoringEngine.normalize(30, 10, 50)).toBe(5.5);
    });

    it('should clamp scores that exceed max to 10', () => {
      expect(scoringEngine.normalize(60, 10, 50)).toBe(10);
    });

    it('should clamp scores that are below min to 1', () => {
      expect(scoringEngine.normalize(5, 10, 50)).toBe(1);
    });

    it('should return 5.5 midpoint if max equals min to avoid division by zero', () => {
      expect(scoringEngine.normalize(10, 10, 10)).toBe(5.5);
    });
  });

  describe('process (Integration)', () => {
    it('should process full test results correctly', () => {
      const responses: RawResponse[] = [
        { question_id: 'q1', order_index: 1, value: 5 },
        { question_id: 'q2', order_index: 2, value: 1 }
      ];

      const dimensions: ScoringDimension[] = [
        { 
          id: 'dim1', 
          name: 'Dinamismo', 
          code: 'bf_din', 
          formula: 'Q1 + Q2', 
          min_score: 2, 
          max_score: 10 
        }
      ];

      const competencies: ScoringCompetency[] = [
        {
          id: 'comp1',
          name: 'Liderazgo',
          dimensions: [{ dimension_id: 'dim1', weight: 1 }]
        }
      ];

      const result = scoringEngine.process(responses, dimensions, competencies);

      expect(result.dimensions[0].rawScore).toBe(6); // 5 + 1
      expect(result.dimensions[0].normalizedScore).toBe(5.5); // mid point of 2-10
      expect(result.competencies[0].score).toBe(5.5);
    });

    it('should apply weights to competencies', () => {
      const responses: RawResponse[] = [
        { question_id: 'q1', order_index: 1, value: 5 } // Max
      ];

      const dimensions: ScoringDimension[] = [
        { id: 'dim1', name: 'D1', code: 'd1', formula: 'Q1', min_score: 1, max_score: 5 }, // Norm = 10
        { id: 'dim2', name: 'D2', code: 'd2', formula: 'Q1', min_score: 1, max_score: 10 } // Raw=5, Norm = 5
      ];

      const competencies: ScoringCompetency[] = [
        {
          id: 'comp1',
          name: 'C1',
          dimensions: [
            { dimension_id: 'dim1', weight: 80 },
            { dimension_id: 'dim2', weight: 20 }
          ]
        }
      ];

      const result = scoringEngine.process(responses, dimensions, competencies);
      
      // Expected: (10 * 0.8) + (5 * 0.2) = 8 + 1 = 9
      expect(result.competencies[0].score).toBe(9);
    });

    it('should return 0 for competencies with no dimensions', () => {
      const responses: RawResponse[] = [{ question_id: 'q1', order_index: 1, value: 5 }];
      const dimensions: ScoringDimension[] = [{ id: 'd1', name: 'D1', code: 'd1', formula: 'Q1', min_score: 1, max_score: 5 }];
      const competencies: ScoringCompetency[] = [
        { id: 'c1', name: 'Empty Comp', dimensions: [] }
      ];

      const result = scoringEngine.process(responses, dimensions, competencies);
      expect(result.competencies[0].score).toBe(0);
    });

    it('should handle zero-weight dimensions by ignoring them', () => {
      const responses: RawResponse[] = [{ question_id: 'q1', order_index: 1, value: 5 }];
      const dimensions: ScoringDimension[] = [{ id: 'd1', name: 'D1', code: 'd1', formula: 'Q1', min_score: 1, max_score: 5 }];
      const competencies: ScoringCompetency[] = [
        { id: 'c1', name: 'Zero Weight', dimensions: [{ dimension_id: 'd1', weight: 0 }] }
      ];

      const result = scoringEngine.process(responses, dimensions, competencies);
      expect(result.competencies[0].score).toBe(0);
    });
  });
});
