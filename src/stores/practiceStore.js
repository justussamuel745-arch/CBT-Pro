import { create } from 'zustand';
import { authStore } from './authStore';
import { userStore } from './userStore';
import { examStore } from './examStore';
import { encrypt, decrypt } from '../scripts/utils/crypto';
import { submitHistory } from '../scripts/utils/submitHistory';
import { request } from '../scripts/utils/request';
import { saveQuestions } from '../hooks/services/indexedDB/questions';
import { saveAllImages } from '../hooks/services/indexedDB/images';
import { getRandomQuestions } from '../hooks/services/examQuestions';

export const practiceStore = create(set => ({
  /*========
    STORE
  ==========*/
  examResults: null,

  /*========
    ACTION
  ==========*/

  setExamResults: (examResults) => set({
    examResults
  }),

  getQuesNo: (event) => {
    const subName = event.target.dataset.subname;
    let qsNo = Number(event.target.value);
    const { isActivated } = authStore.getState()
    if (!isActivated) {
      if (subName === 'English') {
        qsNo = 60
      } else {
        qsNo = 40
      }
    }
    
    examStore.setState(state => ({
      examConfig : {
        ...state.examConfig,
        subjects: state.examConfig.subjects.map(sub =>
          sub.name === subName ? { ...sub, qsNo } : sub
        )
      }
    }))
  },

  setHours: (event) => {
    examStore.setState(state => ({
      examConfig: {
        ...state.examConfig,
        hours: Number(event.target.value)
      }
    }))
  },

  setMinutes: (event) => {
    examStore.setState(state => ({
      examConfig: {
        ...state.examConfig,
        minutes: Number(event.target.value)
      }
    }))
  },

  calculateScore: (timeTaken, timeAllocated) => {
    const userId = userStore.getState().userInfo?._id
    const answers = examStore.getState().answers
    const examQuestions = examStore.getState().examQuestions
    console.log(examQuestions);
    const bookmarksRaw = JSON.parse(localStorage.getItem('bookmarks'))
    let bookmarks = bookmarksRaw ? decrypt(bookmarksRaw) : []
    const subjectStats = {};

    let totalCorrect = 0;
    let totalQuestions = 0;

    // Calculate correct answers per subject
    answers.forEach(({ id, subject, userAnswers, isBookmarked }) => {
      const question = examQuestions.find((q) => q.id === id);

      if (!question) return;

      if (isBookmarked) {
        bookmarks = bookmarks.filter(bmk => bmk.id !== id)
        bookmarks.push({
          userId,
          ...question
        })
        localStorage.setItem('bookmarks', JSON.stringify(encrypt(bookmarks)));
      }

      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          obtained: 0,
          total: 0,
        };
      }

      subjectStats[subject].total++;
      totalQuestions++;

      const userAnswer = userAnswers.join("");
      const correctAnswers = [...question.correctAnswers].sort();

      if (correctAnswers.includes(userAnswer)) {
        subjectStats[subject].obtained++;
        totalCorrect++;
      }
    });

    // Calculate percentage for each subject
    const performance = {};

    Object.entries(subjectStats).forEach(([subject, { obtained, total }]) => {
      performance[subject] = Math.round((obtained / total) * 100);
    });

    // Calculate overall score
    const obtained = Object.values(performance).reduce(
      (sum, score) => sum + score,
      0
    );
    const result =  {
      message: "Exam submitted successfully",
      examType: "JAMB",
      subjects: Object.keys(subjectStats),

      score: {
        obtained,
        over: Object.keys(subjectStats).length * 100,
      },

      percentage: totalQuestions
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0,

      performance,
      timeTaken,
      timeAllocated,
    };
    
    set({
      examResults: result
    })

    submitHistory(result)
  },
  
  getPracticeQuestions: async (reqData) => {
    const isActivated = authStore.getState().isActivated
    let data;
    if (navigator.onLine){
      let response;
      if (!isActivated){
        const newReqData = { subjects: reqData.subjects.map(data => data.name) }
        response = await request.auth('/api/exam/fixedExam', {
          method: 'POST',
          body: JSON.stringify(newReqData)
        });
      } else {
        response = await request.auth('/api/exam', {
          method: 'POST',
          body: JSON.stringify(reqData)
        });
      }
      data = decrypt(response.body)
      
      // Saving question to indexDB
      await saveQuestions(data)
      await saveAllImages(data)
      
    } else {
      const offlineInfo = reqData.subjects.map(sub => {
        return ({
          subject: sub.name,
          amount: sub.qsNo
        })
      })
      const indexDbData = await getRandomQuestions(offlineInfo)
      if (indexDbData.insufficientSubjects.length) {
        const details = indexDbData.insufficientSubjects
          .map(({ subject, available, requested }) => {
            return available === 0
              ? `<li><strong>${subject}</strong>: Not available</li>`
              : `<li><strong>${subject}</strong>: ${available} of ${requested} questions available</li>`;
          })
          .join('');
        
        throw new Error(
          `<p>Some selected subjects are not fully available in offline mode.</p>
           <ul>${details}</ul>
           <p>Connect to the internet to stay updated with the latest questions, or start the exam online.</p>`
        );
      } else {
        data = indexDbData.questions
      }
    }
    examStore.setState({
      examQuestions: data
    })
    
    return data
  }

}))