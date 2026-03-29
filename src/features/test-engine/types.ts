export type QuestionType = 'forced_choice' | 'likert' | string

export interface Option {
  id: string
  text: string
  value: number
}

export interface Question {
  id: string
  test_id: string
  text: string
  type: QuestionType
  order_index: number
  active: boolean
  options: Option[]
}

export interface TestPayload {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  questions: Question[]
}

export interface CandidateContext {
  candidateId: string
  personName: string | null
  processName: string | null
  clientId: string | null
  tests: TestPayload[]
}
