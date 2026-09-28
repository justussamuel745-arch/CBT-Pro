import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudySimulator from '../../../src/pages/simulator/StudySimulator';

/* ------------------------------------------------------------------ */
/* Hoisted mutable mock state                                         */
/* ------------------------------------------------------------------ */
const { mockExamState, mockSearchParams, mockNavigate, mockStudyStore } = vi.hoisted(() => {
  return {
    mockExamState: { current: null },
    mockSearchParams: { current: new URLSearchParams('mode=study') },
    mockNavigate: vi.fn(),
    mockStudyStore: vi.fn()
  };
});

/* ------------------------------------------------------------------ */
/* Module mocks                                                       */
/* ------------------------------------------------------------------ */
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams.current],
  Navigate: () => <div data-testid="redirect" />,
}));

vi.mock('../../../src/components/MarkdownContent', () => ({
  MarkdownContent: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../../src/components/Calculator.jsx', () => ({ Calculator: () => null }));
vi.mock('../../../src/components/AstraAIModal', () => ({ AstraAIModal: () => null }));
vi.mock('../../../src/components/common/Image', () => ({ Image: () => null }));
vi.mock('../../../src/components/ReportQuestionModal', () => ({
  ReportQuestionModal: () => null,
}));
vi.mock('../../../src/components/Loading', () => ({ Loading: () => <div>Loading…</div> }));

vi.mock('../../../src/components/NotificationSystem', () => ({
  ModalStripe: ({ title, body, primaryLabel, onPrimary, onClose, closeLabel }) => (
    <div data-testid="modal-stripe">
      <h2>{title}</h2>
      <p>{body}</p>
      {primaryLabel && <button onClick={onPrimary}>{primaryLabel}</button>}
      <button onClick={onClose}>{closeLabel || 'Close'}</button>
    </div>
  ),
  CSS: [''],
}));

vi.mock('../../../src/components/AnswerCard', () => ({
  AnswerCard: ({ correctAnswers }) => (
    <div data-testid="answer-card">Correct: {correctAnswers}</div>
  ),
}));

vi.mock('../../../src/scripts/utils/formatName', () => ({
  formatName: (name) => name,
}));
vi.mock('../../../src/scripts/utils/crypto', () => ({
  decrypt: (body) => body,
}));
vi.mock('../../../src/scripts/data/subjectsData.js', () => ({
  subjectsData: [
    { 
      id: 'eng-1', 
      name: 'English',
      topics: [
        'vowel',
        'consonants',
        'antoynms',
        'synoynms'
      ],
      years: Array.from({ length: 2025 - 1983 + 1 }, (_, index) => String(1983 + index))
    }
  ],
}));

const mockRequestAuth = vi.fn();
vi.mock('../../../src/scripts/utils/request', () => ({
  request: { auth: (...args) => mockRequestAuth(...args) },
}));

const mockAddBookmark = vi.fn().mockResolvedValue(undefined);
const mockDeleteBookmark = vi.fn().mockResolvedValue(undefined);
const mockLoadQuestions = vi.fn();
vi.mock('../../../src/hooks/services/indexedDB/questions', () => ({
  saveQuestions: vi.fn().mockResolvedValue(undefined),
  loadQuestionsInBackground: (...args) => mockLoadQuestions(...args),
}));
vi.mock('../../../src/hooks/services/indexedDB/images', () => ({
  saveAllImages: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../src/hooks/services/indexedDB/bookmarks.js', () => ({
  addBookmark: (...args) => mockAddBookmark(...args),
  deleteBookmark: (...args) => mockDeleteBookmark(...args),
}));

vi.mock('../../../src/stores/studyStore', () => ({
  studyStore: mockStudyStore,
}));

mockStudyStore.mockImplementation(
  (selector) =>
    selector({ studyConfig: { subject: 'English', years: [2020], topics: [] } })
)

vi.mock('../../../src/stores/userStore', () => ({
  userStore: (selector) => selector({ userId: 'user-1' }),
}));
vi.mock('../../../src/stores/examStore', () => ({
  examStore: { getState: () => mockExamState.current },
}));

/* ------------------------------------------------------------------ */
/* Fixtures & helpers                                                  */
/* ------------------------------------------------------------------ */
function makeQuestion(id, overrides = {}) {
  return {
    id,
    subject: 'English',
    year: 2020,
    topic: 'Grammar',
    question: 'What is a noun?',
    options: [
      { id: 'a', option: 'A naming word' },
      { id: 'b', option: 'A doing word' },
    ],
    correctAnswers: ['a'],
    explanation: { text: 'A noun names a person, place or thing.' },
    ...overrides,
  };
}

/**
 * Gives a test manual control over `loadQuestionsInBackground`:
 * the test decides exactly when each question "arrives" from IndexedDB.
 */
function createQuestionStream() {
  let options = null;
  let resolveDone;
  let rejectDone;
  const done = new Promise((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });

  mockLoadQuestions.mockImplementation((_filters, opts) => {
    options = opts;
    return done;
  });

  return {
    // Wait until the component has actually started loading.
    ready: () => waitFor(() => expect(options).not.toBeNull()),
    get options() {
      return options;
    },
    emit: (question, position) =>
      act(async () => {
        await options.onQuestion(question, position);
      }),
    complete: (questions) =>
      act(async () => {
        await options.onComplete(questions);
        resolveDone(questions);
      }),
    fail: (error) =>
      act(async () => {
        rejectDone(error);
        // let the component's catch block run
        await done.catch(() => {});
      }),
  };
}

const goOffline = () =>
  Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParams.current = new URLSearchParams('mode=study');
  mockRequestAuth.mockResolvedValue({ body: [] });
  mockLoadQuestions.mockResolvedValue([]);
});

/* ================================================================== */
/* 1. Review mode: scoring existing answers on load                   */
/* ================================================================== */
describe('StudySimulator — review mode data loading', () => {
  it('marks a previously-answered question as correct or wrong based on stored answers', async () => {
    mockSearchParams.current = new URLSearchParams('mode=review');

    const q1 = makeQuestion('q1');
    const q2 = makeQuestion('q2', { correctAnswers: ['a'] });

    mockExamState.current = {
      examQuestions: [q1, q2],
      examConfig: { subjects: [{ name: 'English', qsNo: 2 }] },
      answers: [
        { id: 'q1', subject: 'English', userAnswers: ['a'] },
        { id: 'q2', subject: 'English', userAnswers: ['b'] },
      ],
    };

    render(<StudySimulator />);

    await waitFor(() => {
      expect(screen.getByTestId('answer-card')).toHaveTextContent('Correct: A');
    });
  });

  it('has every question available immediately — no loading placeholders and no background loader', async () => {
    mockSearchParams.current = new URLSearchParams('mode=review');

    mockExamState.current = {
      examQuestions: [makeQuestion('q1'), makeQuestion('q2')],
      examConfig: { subjects: [{ name: 'English', qsNo: 2 }] },
      answers: [{ id: 'q1', subject: 'English', userAnswers: [] }],
    };

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('Question 1 of 2'));

    expect(screen.queryAllByLabelText(/is loading/i)).toHaveLength(0);
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
    expect(mockLoadQuestions).not.toHaveBeenCalled();
  });
});

/* ================================================================== */
/* 2. Study mode (online): fetching and rendering questions           */
/* ================================================================== */
describe('StudySimulator — study mode data loading (online)', () => {
  it('loads questions from the API when online and renders the first one', async () => {
    const questions = [makeQuestion('q1'), makeQuestion('q2')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    render(<StudySimulator />);

    await waitFor(() => {
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });
    expect(mockRequestAuth).toHaveBeenCalledWith(
      '/api/study',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('shows everything at once online: no IndexedDB streaming and no loading placeholders', async () => {
    mockRequestAuth.mockResolvedValue({ body: [makeQuestion('q1'), makeQuestion('q2')] });

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('Question 1 of 2'));

    expect(mockLoadQuestions).not.toHaveBeenCalled();
    expect(screen.queryAllByLabelText(/is loading/i)).toHaveLength(0);
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });
});

/* ================================================================== */
/* 3. Study mode (offline): progressive loading                       */
/* ================================================================== */
describe('StudySimulator — study mode progressive loading (offline)', () => {
  const originalOnLine = window.navigator.onLine;

  beforeEach(goOffline);

  afterEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: originalOnLine,
      configurable: true,
    });
  });

  it('asks the loader for the study filters with a 100-question limit', async () => {
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();

    expect(mockLoadQuestions).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'English', years: [2020], topics: [] }),
      expect.objectContaining({ limit: 100 })
    );
    expect(mockRequestAuth).not.toHaveBeenCalled();
  });

  it('displays the page as soon as the first question arrives, while the rest are still loading', async () => {
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();

    // Nothing has arrived yet → no question page.
    expect(screen.queryByText(/Question \d+ of \d+/)).not.toBeInTheDocument();

    await stream.emit(makeQuestion('q1', { question: 'First question' }), 1);

    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 100')).toBeInTheDocument();
  });

  it('shows a disabled spinner slot in the navigator for every question that has not loaded', async () => {
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(makeQuestion('q1'), 1);

    // Two navigators are rendered (side panel + mobile modal).
    const pendingTwo = screen.getAllByLabelText('Question 2 is loading');
    expect(pendingTwo).toHaveLength(2);
    pendingTwo.forEach((btn) => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('pending');
    });

    // Slot 1 is loaded and clickable.
    expect(screen.getAllByRole('button', { name: '1' })[0]).toBeEnabled();
  });

  it('turns a pending navigator slot into a clickable number once that question arrives', async () => {
    const user = userEvent.setup();
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(makeQuestion('q1', { question: 'First question' }), 1);
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();

    await stream.emit(makeQuestion('q2', { question: 'Second question' }), 2);

    expect(screen.queryAllByLabelText('Question 2 is loading')).toHaveLength(0);
    await user.click(screen.getAllByRole('button', { name: '2' })[0]);

    expect(screen.getByText('Second question')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 100')).toBeInTheDocument();
  }, 10000);

  it('disables Next with a loading state while the next question is not ready, then enables it when it arrives', async () => {
    const user = userEvent.setup();
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(makeQuestion('q1', { question: 'First question' }), 1);

    const loadingNext = screen.getByRole('button', { name: 'Loading' });
    expect(loadingNext).toBeDisabled();
    expect(loadingNext).toHaveClass('is-loading');
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();

    await stream.emit(makeQuestion('q2', { question: 'Second question' }), 2);

    const next = screen.getByRole('button', { name: /next/i });
    expect(next).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Loading' })).not.toBeInTheDocument();

    await user.click(next);
    expect(screen.getByText('Second question')).toBeInTheDocument();

    // Question 3 hasn't loaded, so Next goes back to its loading state.
    expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled();
  }, 10000);

  it('lets the user go back to earlier questions while later ones are still loading', async () => {
    const user = userEvent.setup();
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(makeQuestion('q1', { question: 'First question' }), 1);
    await stream.emit(makeQuestion('q2', { question: 'Second question' }), 2);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Second question')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('First question')).toBeInTheDocument();
  });

  it('keeps answers given to early questions as more questions stream in', async () => {
    const user = userEvent.setup();
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(makeQuestion('q1'), 1);

    await user.click(screen.getByText('A naming word'));
    expect(await screen.findByTestId('answer-card')).toHaveTextContent('Correct: A');

    await stream.emit(makeQuestion('q2', { question: 'Second question' }), 2);

    // Still on question 1, still answered.
    expect(screen.getByText('Question 1 of 100')).toBeInTheDocument();
    expect(screen.getByTestId('answer-card')).toHaveTextContent('Correct: A');
  });

  it('removes the loading placeholders and shrinks the total to the real count when loading completes', async () => {
    const stream = createQuestionStream();
    const q1 = makeQuestion('q1');
    const q2 = makeQuestion('q2', { question: 'Second question' });

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(q1, 1);
    await stream.emit(q2, 2);
    expect(screen.getByText('Question 1 of 100')).toBeInTheDocument();

    await stream.complete([q1, q2]);

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.queryAllByLabelText(/is loading/i)).toHaveLength(0);
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('tells the user when fewer than 100 questions were available offline', async () => {
    const stream = createQuestionStream();
    const q1 = makeQuestion('q1');

    mockStudyStore.mockImplementationOnce(
      (selector) =>
        selector({ studyConfig: { subject: 'English', years: [2020, 2021, 2022, 2023, 2024, 2025], topics: ['vowel'] } })
    )

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(q1, 1);

    expect(screen.queryByText('Available Offline Questions')).not.toBeInTheDocument();

    await stream.complete([q1]);

    expect(await screen.findByText('Available Offline Questions')).toBeInTheDocument();
    // The question page is still displayed behind the modal.
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
  });

  it('keeps the questions that already loaded and stops the spinners if loading fails midway', async () => {
    const stream = createQuestionStream();

    render(<StudySimulator />);
    await stream.ready();
    await stream.emit(makeQuestion('q1', { question: 'First question' }), 1);

    await stream.fail(new Error('IndexedDB blew up'));

    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    expect(screen.queryAllByLabelText(/is loading/i)).toHaveLength(0);
    expect(screen.queryByTestId('modal-stripe')).not.toBeInTheDocument();
  });

  // NOTE: requires the AbortController edits (`signal` passed to the loader,
  // `controller.abort()` in the effect cleanup).
  it('aborts background loading when the page is left', async () => {
    const stream = createQuestionStream();

    const { unmount } = render(<StudySimulator />);
    await stream.ready();
    expect(stream.options.signal.aborted).toBe(false);

    unmount();

    expect(stream.options.signal.aborted).toBe(true);
  });
});

/* ================================================================== */
/* 4. Navigation between questions                                    */
/* ================================================================== */
describe('StudySimulator — question navigation', () => {
  it('moves to the next and previous question when the nav buttons are clicked', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1'), makeQuestion('q2')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('Question 1 of 2'));

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });
});

/* ================================================================== */
/* 5. Answering a question updates progress/status                    */
/* ================================================================== */
describe('StudySimulator — answer selection and progress tracking', () => {
  it('marks the selected option correct and reveals the answer card', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('A naming word'));

    await user.click(screen.getByText('A naming word'));

    expect(await screen.findByTestId('answer-card')).toHaveTextContent('Correct: A');
    expect(screen.getByRole('button', { name: /show answer/i })).toBeDisabled();
  });

  it('disables further answering once "Show Answer" reveals the solution', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    render(<StudySimulator />);
    await waitFor(() => screen.getByRole('button', { name: /show answer/i }));

    await user.click(screen.getByRole('button', { name: /show answer/i }));

    expect(await screen.findByTestId('answer-card')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show answer/i })).toBeDisabled();
  });

  it('does not let you change your answer once a question has been answered', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('A doing word'));

    await user.click(screen.getByText('A naming word'));
    await screen.findByTestId('answer-card');

    await user.click(screen.getByText('A doing word'));

    expect(screen.getByTestId('answer-card')).toHaveTextContent('Correct: A');
  });
});

/* ================================================================== */
/* 6. Crossing subject boundaries with Next/Prev                      */
/* ================================================================== */
describe('StudySimulator — switching subjects when a subject is exhausted', () => {
  function setUpTwoSubjects() {
    mockSearchParams.current = new URLSearchParams('mode=review');

    const englishQs = [
      makeQuestion('e1', { subject: 'English', question: 'English Q1' }),
      makeQuestion('e2', { subject: 'English', question: 'English Q2' }),
    ];
    const mathsQs = [
      makeQuestion('m1', { subject: 'Maths', question: 'Maths Q1' }),
    ];

    mockExamState.current = {
      examQuestions: [...englishQs, ...mathsQs],
      examConfig: {
        subjects: [
          { name: 'English', qsNo: 2 },
          { name: 'Maths', qsNo: 1 },
        ],
      },
      // The page bails out of review mode unless at least one answer exists
      // (it checks `globalAnswers?.length`). Include a placeholder entry.
      answers: [{ id: 'e1', subject: 'English', userAnswers: [] }],
    };
  }

  it("moves into the next subject once the current subject's last question is passed, and wraps back to the first subject after the last one", async () => {
    const user = userEvent.setup();
    setUpTwoSubjects();

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('English Q1'));

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('English Q2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Maths Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('English Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it("moves into the previous subject's last question when Prev is pressed at the start of a subject, and stops at the very first question", async () => {
    const user = userEvent.setup();
    setUpTwoSubjects();

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('English Q1'));

    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Maths Q1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('English Q2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('English Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('English Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('jumps straight to a question when it is picked from the question navigator', async () => {
    const user = userEvent.setup();
    setUpTwoSubjects();

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('English Q1'));

    const navButtons = screen.getAllByRole('button', { name: '2' });
    await user.click(navButtons[0]);

    expect(screen.getByText('English Q2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
  });
});

/* ================================================================== */
/* 7. Bookmarking                                                      */
/* ================================================================== */
describe('StudySimulator — bookmarking a question', () => {
  // The bookmark button has no `title`/`aria-label` on the page, so it's
  // located as the last `.mode-icon-btn` inside `.mode-header-actions`.
  const getBookmarkButton = (container) =>
    container.querySelector('.mode-header-actions > .mode-icon-btn:last-child');

  it('saves a bookmark for the current question and marks the button active', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    const { container } = render(<StudySimulator />);
    await waitFor(() => screen.getByText('A naming word'));

    const bookmarkBtn = getBookmarkButton(container);
    expect(bookmarkBtn).not.toHaveClass('active');

    await user.click(bookmarkBtn);

    expect(mockAddBookmark).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'bmkq1user-1', userId: 'user-1' })
    );
    expect(bookmarkBtn).toHaveClass('active');
  });

  it('removes the bookmark on a second click', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1')];
    mockRequestAuth.mockResolvedValue({ body: questions });

    const { container } = render(<StudySimulator />);
    await waitFor(() => screen.getByText('A naming word'));

    const bookmarkBtn = getBookmarkButton(container);

    await user.click(bookmarkBtn);
    await user.click(bookmarkBtn);

    expect(mockDeleteBookmark).toHaveBeenCalledWith('bmkq1user-1');
    expect(bookmarkBtn).not.toHaveClass('active');
  });
});

/* ================================================================== */
/* 8. Error / empty-state modals                                       */
/* ================================================================== */
/*
 * These were skipped earlier because the page used to crash with
 * `activeSubject === undefined` when a modal was showing. The page now
 * renders <SimulatorSkeleton /> instead of the question UI whenever an
 * error modal is active (except for "available_questions"), so the modal
 * can be observed again.
 */
describe('StudySimulator — load failures', () => {
  const originalOnLine = window.navigator.onLine;

  afterEach(() => {
    Object.defineProperty(window.navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  it('shows a "Questions Not Found" modal when offline with nothing cached, without crashing the page', async () => {
    goOffline();
    // Default mock: the loader finishes without ever emitting a question.
    mockLoadQuestions.mockResolvedValue([]);

    render(<StudySimulator />);

    expect(await screen.findByText('Questions Not Found')).toBeInTheDocument();
    expect(screen.queryByText(/Question \d+ of \d+/)).not.toBeInTheDocument();
  });

  it('lets the user retry after a failed load', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true });
    mockRequestAuth.mockRejectedValueOnce({ status: 500 });

    render(<StudySimulator />);
    // A 5xx response maps to the "Server Error" modal.
    await screen.findByText('Server Error');

    mockRequestAuth.mockResolvedValueOnce({ body: [makeQuestion('q1')] });
    await user.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => screen.getByText('Question 1 of 1'));
  });
});
