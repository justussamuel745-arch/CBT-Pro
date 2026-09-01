import { it, expect, describe, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import UserEvent from '@testing-library/user-event';
import { render, screen, act, waitFor } from '@testing-library/react';

import ExamSimulator from '../../../src/pages/ExamSimulator'

import { questions } from '../utils/questions';

const {
  mockPracticeStore,
  mockAuth
} = vi.hoisted(() => ({
  mockPracticeStore: vi.fn(),
  mockAuth: vi.fn()
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


vi.mock('../../../src/scripts/utils/request', () => ({
  request: {
    auth: mockAuth
  }
}))


vi.mock('../../../src/scripts/utils/crypto', () => ({
  decrypt: vi.fn((value) => value)
}))




import { practiceStore } from '../../../src/stores/practiceStore';
import { scheduledExamStore } from '../../../src/stores/scheduledExamStore';
import { examStore } from '../../../src/stores/examStore';
import { request } from '../../../src/scripts/utils/request';
import { decrypt } from '../../../src/scripts/utils/crypto';


describe('ExamSimulator Page', () => {
  beforeEach(() => {
    examStore.setState({
      offline: null,
      loadError: null
    })
      
    vi.clearAllMocks()
  })

  beforeAll(() => {
    examStore.setState({
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
        examType: 'scheduled'
      }
    })
    
    mockAuth.mockResolvedValue({
      body: {
        examId: 'test_id',
        questions
      }
    })
  })


  describe('General Test', () => {
    it('should quickly navigate user to their selected question number selected from the navigator modal', async () => {
      const user = UserEvent.setup()
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })

      const navigatorBtn = screen.getByRole('button', {
        name: '≡'
      })

      await user.click(navigatorBtn)

      const qsNoBtn = screen.getByTestId('navigator-2')
      await user.click(qsNoBtn)
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    }, 10000)

    it('should store exactly the answers the user picked', async () => {
      const user = UserEvent.setup()
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })

      const optBtn = screen.getByTestId('selected-option-a')

      await user.click(optBtn)
      const answers = examStore.getState().answers
      const selected = answers.find(a => a.userAnswers.length > 0).userAnswers[0].trim()

      expect(selected.toLowerCase()).toBe('a')
      
    })
  })
  
  describe('Scheduled Exam', () => {
    it('questions should be retrived from the scheduledExamStore provided function', async () => {
      const spy = vi.spyOn(scheduledExamStore.getState(), 'getExamQuestions')
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })

      mockAuth.mockImplementationOnce(() => new Promise(() => {}))

      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should called the submitScheduledExam function during auto submit', async () => {
      vi.useFakeTimers()
      const original = scheduledExamStore.getState()?.submitScheduledExam
      const mock = vi.fn()
      scheduledExamStore.setState({
        submitScheduledExam: mock
      })
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

      expect(mock).toHaveBeenCalled()
      vi.useRealTimers()
      scheduledExamStore.setState({
        submitScheduledExam: original
      })

    })

    it('should call the submitScheduledExam function during manual submisssion', async () => {
      const user = UserEvent.setup()
      const original = scheduledExamStore.getState()?.submitScheduledExam
      const mock = vi.fn()
      scheduledExamStore.setState({
        submitScheduledExam: mock
      })
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })

      const button = screen.getByRole('button', {
        name: 'Submit Exam'
      })

      await user.click(button)

      // modal
      const modalButton = screen.getByRole('button', {
        name: 'Yes, Submit Exam'
      })

      await user.click(modalButton)
      
      expect(mock).toHaveBeenCalled()
      scheduledExamStore.setState({
        submitScheduledExam: original
      })
    })
    
    it('should display the offline page when user tries to submit without internet connection', async () => {
      const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

      const user = UserEvent.setup()
      
      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })
      
      mockAuth.mockImplementationOnce(() => {
        throw new Error('Test Error')
      })

      const button = screen.getByRole('button', {
        name: 'Submit Exam'
      })

      await user.click(button)

      const modalButton = screen.getByRole('button', {
        name: 'Yes, Submit Exam'
      })

      await user.click(modalButton)

      expect(screen.getByText("Check your Wi-Fi or mobile data and try again. Anything you'd already loaded is still available below.")).toBeInTheDocument()
      spy.mockRestore()
    })

    it('onRetry should submit the exam when the user is connected to the internet', async () => {
      const mockOnRetry = vi.fn()
      examStore.setState({
        offline: {
          onRetry: mockOnRetry
        }
      })
      const user = UserEvent.setup()

      const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByText("Your connection is back. Tap below to continue where you left off.")).toBeInTheDocument()

      const button = screen.getByRole('button', {
        name: 'Try Again'
      })

      await user.click(button)

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalled()
      })

      
      spy.mockRestore()
    })

    it('should not call the wrong function during failed submisssion retry', async () => {
      const user = UserEvent.setup()
      
      const originalRetry = scheduledExamStore.getState()?.retrySubmission
      const mockRetrySubmission = vi.fn()
      scheduledExamStore.setState({
        retrySubmission: mockRetrySubmission
      })

      const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

      render(
        <MemoryRouter>
          <ExamSimulator />
        </MemoryRouter>
      )

      await act(async () => {
        await Promise.resolve()
      })

      mockAuth.mockImplementation(() => {
        throw new Error("Test error")
      })
      
      const button = screen.getByRole('button', {
        name: 'Submit Exam'
      })

      await user.click(button)

      const modalButton = screen.getByRole('button', {
        name: 'Yes, Submit Exam'
      })

      await user.click(modalButton)

      act(() => {
        spy.mockReturnValue(true)
        window.dispatchEvent(new Event('online'))
      })

      
      const retryButton = await screen.findByRole('button', {
        name: 'Try Again'
      })

      await user.click(retryButton)

      await waitFor(() => {
        expect(mockRetrySubmission).toHaveBeenCalled()
      })

      expect(mockCalculateScore).not.toHaveBeenCalled()


      scheduledExamStore.setState({
        retrySubmission: originalRetry
      })

      spy.mockRestore()

    })
  })
})