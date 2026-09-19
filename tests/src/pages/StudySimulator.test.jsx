import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudySimulator from '../../../src/pages/StudySimulator'; // adjust path to match your project structure

/* ------------------------------------------------------------------ */
/* Hoisted mutable mock state — reassigned per test via helpers below */
/* ------------------------------------------------------------------ */
const { mockExamState, mockSearchParams, mockNavigate } = vi.hoisted(() => {
  return {
    mockExamState: { current: null },
    mockSearchParams: { current: new URLSearchParams('mode=study') },
    mockNavigate: vi.fn(),
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
  ModalStripe: () => null,
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
  decrypt: (body) => body, // pass-through for tests
}));
vi.mock('../../../src/scripts/data/subjectsData.js', () => ({
  subjectsData: [{ id: 'eng-1', name: 'English' }],
}));

const mockRequestAuth = vi.fn();
vi.mock('../../../src/scripts/utils/request', () => ({
  request: { auth: (...args) => mockRequestAuth(...args) },
}));

vi.mock('../../../src/hooks/services/indexedDB/questions', () => ({
  saveQuestions: vi.fn().mockResolvedValue(undefined),
  getQuestions: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../../src/hooks/services/indexedDB/images', () => ({
  saveAllImages: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../src/hooks/services/indexedDB/bookmarks.js', () => ({
  addBookmark: vi.fn().mockResolvedValue(undefined),
  deleteBookmark: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../src/stores/studyStore', () => ({
  studyStore: (selector) =>
    selector({ studyConfig: { subject: 'English', years: [2020], topics: [] } }),
}));
vi.mock('../../../src/stores/userStore', () => ({
  userStore: (selector) => selector({ userId: 'user-1' }),
}));
vi.mock('../../../src/stores/examStore', () => ({
  examStore: { getState: () => mockExamState.current },
}));

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
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

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParams.current = new URLSearchParams('mode=study');
  mockRequestAuth.mockResolvedValue({ body: [] });
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
        { qsId: 'q1', subject: 'English', userAnswers: ['a'], correctAnswers: ['a'] }, // correct
        { qsId: 'q2', subject: 'English', userAnswers: ['b'], correctAnswers: ['a'] }, // wrong
      ],
    };

    render(<StudySimulator />);

    // First question was answered correctly, so its answer card should already show.
    await waitFor(() => {
      expect(screen.getByTestId('answer-card')).toHaveTextContent('Correct: A');
    });

  });
});

/* ================================================================== */
/* 2. Study mode: fetching and rendering questions                    */
/* ================================================================== */
describe('StudySimulator — study mode data loading', () => {
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
});

/* ================================================================== */
/* 3. Navigation between questions                                    */
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
/* 4. Answering a question updates progress/status                    */
/* ================================================================== */
describe('StudySimulator — answer selection and progress tracking', () => {
  it('marks the selected option correct and reveals the answer card', async () => {
    const user = userEvent.setup();
    const questions = [makeQuestion('q1')]; // single question, correct answer is "a"
    mockRequestAuth.mockResolvedValue({ body: questions });

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('A naming word'));

    await user.click(screen.getByText('A naming word')); // correct option

    // Answer card should now appear with the correct answer.
    expect(await screen.findByTestId('answer-card')).toHaveTextContent('Correct: A');

    // "Show Answer" should now be disabled since the question has been answered.
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
});

/* ================================================================== */
/* 5. Crossing subject boundaries with Next/Prev                      */
/* ================================================================== */
describe('StudySimulator — switching subjects when a subject is exhausted', () => {
  // Two subjects, reachable only through review mode (study mode only ever
  // loads a single subject's worth of questions).
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
      answers: [],
    };
  }

  it('moves into the next subject once the current subject\'s last question is passed, and wraps back to the first subject after the last one', async () => {
    const user = userEvent.setup();
    setUpTwoSubjects();

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('English Q1'));

    // Still inside English: 1 -> 2
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('English Q2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();

    // English is exhausted (was on its last question) -> jumps into Maths
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Maths Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();

    // Maths (the last subject) is exhausted too -> wraps back to the first subject
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('English Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('moves into the previous subject\'s last question when Prev is pressed at the start of a subject, and stops at the very first question', async () => {
    const user = userEvent.setup();
    setUpTwoSubjects();

    render(<StudySimulator />);
    await waitFor(() => screen.getByText('English Q1'));

    // Jump into Maths first (only 1 question, so it's both the first and last there)
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Maths Q1')).toBeInTheDocument();

    // Maths' first question -> Prev should fall back into English's last question
    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('English Q2')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();

    // Still inside English: 2 -> 1
    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('English Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    // Already at the very first question of the very first subject -> Prev is a no-op
    await user.click(screen.getByRole('button', { name: /prev/i }));
    expect(screen.getByText('English Q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });
});
