import { it, expect, describe, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import UserEvent from '@testing-library/user-event';
import { render, screen, act, waitFor } from '@testing-library/react';

import ExamSimulator from '../../../src/pages/ExamSimulator'

import { questions } from '../utils/questions';

const {
  mockPracticeStore,
  mockScheduledExamStore,
  mockExamStore
} = vi.hoisted(() => ({
  mockPracticeStore: vi.fn(),
  mockScheduledExamStore: vi.fn(),
  mockExamStore: vi.fn()
}))


vi.mock('../../../src/stores/practiceStore', () => ({
  practiceStore: mockPracticeStore
}))

const mockGetPracticeQuestions = vi.fn(() => 'default')
const mockCalculateScore = vi.fn()

mockPracticeStore.mockImplementation(selector => selector({
  calculateScore: mockCalculateScore
}))

mockCalculateScore.mockResolvedValue(null)

mockPracticeStore.getState = vi.fn(() => ({
  getPracticeQuestions: mockGetPracticeQuestions
}))

mockGetPracticeQuestions.mockResolvedValue(questions)



vi.mock('../../../src/stores/scheduledExamStore', () => ({
  scheduledExamStore: mockScheduledExamStore
}))

const mockSubmitScheduledExam = vi.fn()

mockScheduledExamStore.mockImplementation(selector => selector({
  submitScheduledExam: mockSubmitScheduledExam
}))

const mockGetExamQuestions = vi.fn()

mockScheduledExamStore.getState = vi.fn(() => ({
  getExamQuestions: mockGetExamQuestions
}))

mockGetExamQuestions.mockResolvedValue(questions)

vi.mock('../../../src/stores/examStore', () => ({
  examStore: mockExamStore
}))

const mockSetAnswers = vi.fn()

const examStorage = {
  examConfig: {
    hours: 0,
    minutes: 10,
    subjects: [{
      name: 'Economics',
      qsNo: 2
    },{
      name: 'Mathematics',
      qsNo: 2
    }],
    examType: 'practice'
  },
  answers: [],
  setAnswers: mockSetAnswers,
  offline: null,
  setOffline: vi.fn(),
  loadError: null,
  setLoadError: vi.fn()
}

const mockExamStoreGetState = vi.fn(() => examStorage)

mockExamStore.getState = mockExamStoreGetState


import { practiceStore } from '../../../src/stores/practiceStore';
import { scheduledExamStore } from '../../../src/stores/scheduledExamStore';
import { examStore } from '../../../src/stores/examStore';


describe('ExamSimulator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('Practice Exam', () => {
    mockExamStore.mockImplementation(selector => selector(examStorage))
  
  
    it('should with the loading component first', () => {
      mockGetPracticeQuestions.mockImplementationOnce(() => new Promise(() => {}))
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )
      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    })

    it('should immediately remove the loading state after the questions has  been loaded', async () => {
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await waitFor(() => {
        const button = screen.getByTestId('simulator')
        expect(button).toBeInTheDocument()
      })
    })

    it('retry modal button should reload the questions again ', async () => {
      mockGetPracticeQuestions.mockImplementationOnce(() => {
        throw new Error('Test Error')
      })
      const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      const user = UserEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Questions')).toBeInTheDocument()
      })

      const button = screen.getByRole('button', {
        name: 'Reload'
      })

      await user.click(button)

      expect(mockGetPracticeQuestions).toHaveBeenCalledTimes(2)
      

      spy.mockRestore()
    })

    it('should not submit the exam when user click the go back button', async () => {
    render(
      <MemoryRouter>
        <ExamSimulator />
      </MemoryRouter>
    )

    const user = UserEvent.setup()
    
    const button = await screen.findByRole('button', {
      name: '← Back'
    })

    await user.click(button)

    expect(mockCalculateScore).not.toHaveBeenCalled()
    expect(mockExamStoreGetState).not.toHaveBeenCalled()
  })

  it('move to the next or previous question according to the user action', async () => {
    render(
      <MemoryRouter>
        <ExamSimulator />
      </MemoryRouter>
    )
    const user = UserEvent.setup()

    const nextButton = await screen.findByRole('button', {
      name: 'Next →'
    })
    await user.click(nextButton)

    expect(screen.getByText('Question 2 of 2'))

    const prevButton = screen.getByRole('button', {
      name: '← Prev'
    })

    await user.click(prevButton)
    expect(screen.getByText('Question 1 of 2'))
    
  })

  it('should move to the next subject on the next click when they are in the last question number for that subject', async () => {
    render(
      <MemoryRouter>
        <ExamSimulator />
      </MemoryRouter>
    )

    const user = UserEvent.setup()
    const nextButton = await screen.findByRole('button', {
      name: 'Next →'
    })

    await user.click(nextButton)
    await user.click(nextButton)
    await user.click(nextButton)
    
    const subjectElement = screen.getByTestId('subject-item-mathematics')

    expect(subjectElement.classList.contains('active')).toBe(true)

  })

  it('should submit the exam immediately time has been exhausted', async () => {
    vi.useFakeTimers()

    render(
      <MemoryRouter>
        <ExamSimulator />
      </MemoryRouter>
    )

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 10)
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockExamStoreGetState).toHaveBeenCalled()
    
    expect(mockCalculateScore).toHaveBeenCalled()
    
  })


  })
})