import { Question } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface QuestionCardProps {
  question: Question
  currentAnswer?: string
  onSelect: (questionId: string, optionId: string) => void
  disabled?: boolean
}

export function QuestionCard({ question, currentAnswer, onSelect, disabled = false }: QuestionCardProps) {
  const isLikert = question.type === 'likert'
  const handleSelect = disabled ? () => {} : onSelect

  return (
    <Card className={`w-full shadow-sm border-slate-200 transition-opacity ${disabled ? 'opacity-60 pointer-events-none select-none' : ''}`}>
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 mb-4 rounded-t-xl">
        <CardTitle className={`text-xl leading-relaxed text-slate-800 ${isLikert ? 'text-center' : ''}`}>
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={currentAnswer || ""} 
          className={isLikert ? "flex justify-between items-center max-w-xl mx-auto space-x-2 pt-4 pb-6" : "space-y-3"}
        >
          {question.options.map((option) => {
            if (isLikert) {
              return (
                <div key={option.id} className="flex flex-col items-center space-y-3 cursor-pointer" onClick={() => handleSelect(question.id, option.id)}>
                  <Label htmlFor={option.id} className="text-slate-500 text-xs sm:text-sm font-medium cursor-pointer max-w-[80px] text-center">
                    {option.text}
                  </Label>
                  <div className={`p-1 rounded-full transition-all ${currentAnswer === option.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:bg-slate-100'}`}>
                    <RadioGroupItem value={option.id} id={option.id} className="w-6 h-6 border-slate-300" />
                  </div>
                </div>
              )
            }

            // Standard Forced Choice
            return (
              <div 
                key={option.id} 
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  currentAnswer === option.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => handleSelect(question.id, option.id)}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-grow cursor-pointer text-base w-full">
                  {option.text}
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
