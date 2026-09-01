import { MemoryRouter } from 'react-router';
import { it, expect, describe, vi } from 'vitest';
import UserEvent from '@testing-library/user-event';
import { screen, render, waitFor, act } from '@testing-library/react';

import { CountdownTimer } from '../../../src/components/CountdownTimer';


const {
  mockSubmitScheduledExam 
} = vi.hoisted(() => ({
  mockSubmitScheduledExam: vi.fn()
}))

vi.mock('../../../src/stores/practiceStore', () => ({
  practiceStore: selector => selector({
    calculateScore: vi.fn()
  })
}))
vi.mock('../../../src/stores/scheduledExamStore', () => ({
  scheduledExamStore: selector => selector({
    submitScheduledExam: mockSubmitScheduledExam
  })
}))
vi.mock('../../../src/stores/examStore', () => ({
  examStore: {
    getState: vi.fn(() => ({
      examConfig: {
        examType: 'scheduled'
      }
    }))
  }
}))

import { practiceStore } from '../../../src/stores/practiceStore';
import { scheduledExamStore } from '../../../src/stores/scheduledExamStore';
import { examStore } from '../../../src/stores/examStore';


describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  
  it('should set up time interval', () => {
    const mockOnFinish = vi.fn()
    const spy = vi.spyOn(globalThis, 'setInterval')
    render(
      <MemoryRouter>
        <CountdownTimer onFinish={mockOnFinish} hours={1} minutes={30} skipAutoSubmit={false} />
      </MemoryRouter>
    )

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('should call the onFinish immediately the timer reaches 0', () => {
    const mockOnFinish = vi.fn()
    render(
      <MemoryRouter>
        <CountdownTimer onFinish={mockOnFinish} hours={0} minutes={10} skipAutoSubmit={false} />
      </MemoryRouter>
    )

    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 10)
    })

    expect(mockOnFinish).toHaveBeenCalled()
    
  })

  it('should clear the interval when page umount', () => {
    const spy = vi.spyOn(globalThis, 'clearInterval')
    const mockOnFinish = vi.fn()
    const { 
      unmount 
    } = render(
      <MemoryRouter>
        <CountdownTimer onFinish={mockOnFinish} hours={0} minutes={10} skipAutoSubmit={false} />
      </MemoryRouter>
    )

    unmount()

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('should not run the clean up if skipAutoSubmit is true', () => {
    const mockOnFinish = vi.fn()
    const { 
      unmount 
    } = render(
      <MemoryRouter>
        <CountdownTimer onFinish={mockOnFinish} hours={0} minutes={10} skipAutoSubmit={true} />
      </MemoryRouter>
    )

    unmount()
    const calculateScore = practiceStore(state => state.calculateScore)

    expect(calculateScore).not.toHaveBeenCalled()
  
  })


  it('should run the right submission process when components umount', () => {
    const mockOnFinish = vi.fn()

    const { 
      unmount 
    } = render(
      <MemoryRouter>
        <CountdownTimer onFinish={mockOnFinish} hours={0} minutes={10} skipAutoSubmit={false} />
      </MemoryRouter>
    )

    unmount()
    const submitScheduledExam = scheduledExamStore(state => state.submitScheduledExam)
    expect(submitScheduledExam).toHaveBeenCalled()
  })

  
})