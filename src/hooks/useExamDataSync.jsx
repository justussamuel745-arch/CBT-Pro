import { useEffect } from 'react';
import { scheduledExamStore } from '../stores/scheduledExamStore';
import { userStore } from '../stores/userStore';
import { addUpcomingExams, deleteUserUpcomingExams } from './services/indexedDB/upcomingExams.js';
import { saveExamStats } from './services/indexedDB/examStats';
import { encrypt } from '../scripts/utilis/crypto';

// listen when upcomingExams changes and update the changes in indexDB
export function useExamDataSync() {
  const upcomingExams = scheduledExamStore(state => state.upcomingExams);
  const stats = scheduledExamStore(state => state.stats)

  useEffect(() => {
    const userId = userStore.getState().userInfo?._id
    if (!upcomingExams) return;
    if (scheduledExamStore.getState().isFirstOfflineLoad) {
      return;
    }

    const updateExams = async () => {
      try {
        const encryptedExams = upcomingExams.map((exam) => {
          const {
            _id,
            userId,
            ...examData
          } = exam;
          
          return {
            _id,
            userId,
            data: encrypt(examData),
          };
        });
        if (userId){
          await deleteUserUpcomingExams(userId)
        }
        await addUpcomingExams(encryptedExams);

        console.log('Exam update complete');
      } catch (err) {
        console.error(
          'Error updating offline exams:',
          err
        );
      }
    };

    updateExams();
  }, [upcomingExams]);
  
  useEffect(() => {
    const userId = userStore.getState().userInfo?._id
    const isFirstOfflineLoad = scheduledExamStore.getState().isFirstOfflineLoad
    if (!stats || !userId) return
    (async () => {
      if (isFirstOfflineLoad) {
        scheduledExamStore.setState({
          isFirstOfflineLoad: false
        })
        return
      }
      await saveExamStats(userId, encrypt(stats))
      console.log('stats updated');
    })()
  }, [stats])

  return null;
}