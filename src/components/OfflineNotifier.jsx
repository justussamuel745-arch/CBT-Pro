import { useEffect, memo } from 'react';
import { scheduledExamStore } from '../stores/scheduledExamStore';
import { authStore } from '../stores/authStore';
import { getOfflineNotification, addOfflineNotification } from '../hooks/services/indexedDB/offlineNotifications';
import { showNotification } from '../services/offlineNotificationService';
import { useNotifications } from '../context/NotificationContext';

const getReminderDate = (examDate, reminder) => {
  const date = new Date(examDate);

  const reminderTime = {
    none: 0,
    '1h': 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
  };

  if (!(reminder in reminderTime)) {
    throw new Error(`Invalid reminder: ${reminder}`);
  }

  date.setTime(
    date.getTime() - reminderTime[reminder]
  );

  return date.toISOString();
};

const updateReminderStatus = (examId) => {
  scheduledExamStore.setState(state => ({
    upcomingExams: state.upcomingExams.map(e =>
    (
      e._id === examId ? { ...e, reminderSent: true } : e
    )
    )
  }))
}

const notificationListener = async (setNotifications, setUnreadCount) => {
  console.log('listening')
  const now = new Date().toISOString();
  let upcomingExams = scheduledExamStore.getState().upcomingExams ?? []
  upcomingExams = upcomingExams.filter(exam =>
    (!exam.reminderSent && exam.examDate > now && exam.status === 'scheduled')
  )
  if (upcomingExams.length === 0) return
  for (const exam of upcomingExams) {
    if (exam.reminder.toLowerCase() === 'none') continue
    const alreadyCreated = await getOfflineNotification(exam._id)
    if (Boolean(alreadyCreated)) {
      updateReminderStatus(exam._id)
      continue
    }
    
    const reminderDate = getReminderDate(exam.examDate, exam.reminder)
    if (now >= reminderDate) {
      const subjects = exam.subjects.join(', ');
      const notification = {
        action: "",
        createdAt: new Date().toISOString(),
        isRead: false,
        title: `Upcoming Exam: ${exam.name}`,
        message: `Your scheduled exam "${exam.name}" is ${exam.reminder} away. The exam covers ${subjects} and is scheduled for ${exam.duration} minutes, with a target score of ${exam.targetScore}. Difficulty level: ${exam.difficulty}. Please review your preparation, ensure you have a stable environment, and be ready to begin at the scheduled time. Your progress and performance will be recorded after completion.`,
        readAt: null,
        type: "exam",
        offline: true,
        status: "pending",
        scheduledAt: exam.examDate,
        userId: exam.userId,
        _id: exam._id
      };
      await addOfflineNotification(notification)
      setNotifications(prev => ([...prev, notification]))
      setUnreadCount(prev => prev + 1)
      await showNotification({
        title: notification.title,
        body: notification.body
      }).catch(() => {})
      updateReminderStatus(exam._id)
    }
  }

}

const productionTest = () => {
  // Test suite during production
    if (import.meta.env.VITE_ENV === 'production') {
      (async () => {
        const result = await showNotification({
          title: 'Upcoming Exam: JAMB Mock 1',
          body: 'Your scheduled exam "JAMB Mock 1" is 1h away. The exam covers English and Mathematics and is scheduled for 120 minutes, with a target score of 160. Difficulty level: Mixed. Please review your preparation, ensure you have a stable environment, and be ready to begin at the scheduled time. Your progress and performance will be recorded after completion.'
        })
        console.log('This is a production test');
        console.log('Offline Notification Test');
        console.log(result);
      })()
    }
}

export const OfflineNotifier = memo(function OfflineNotifier() {
  const { setNotifications, setUnreadCount } = useNotifications();
  const token = authStore(state => state.token)
  const upcomingExams = scheduledExamStore(state => state.upcomingExams)
  useEffect(() => {
    if (!token) return
    productionTest()
    
    // start after 1 minute
    const intervalId = setInterval(() => notificationListener(setNotifications, setUnreadCount), 1000 * 60)
    
    // run immediately page get loaded
    notificationListener(setNotifications, setUnreadCount)
    
    return () => clearInterval(intervalId);
  }, [token, upcomingExams])
  
  return null
})

/* action: ""
createdAt: "2026-08-20T15:03:26.102Z"
deletedAt: null
icon: null
isRead: true
link: "/"
message: "Your exam "JAMB Mock 3" has been successfully scheduled for Friday, 21 August 2026 at 16:29. You will be tested on English, Mathematics, Physics, Economics, with a duration of 120 minutes and a target score of 200/400. The difficulty is set to Mixed. ↵↵To prepare, review your notes and focus on the topics you find most difficult. Make sure you have a stable internet connection before the exam begins, and try to start on time so you have the full exam duration available. After completing the exam, review your result and use the performance breakdown to identify areas that need more practice. Good luck with your preparation!"
readAt: "2026-08-20T15:04:26.361Z"
title: "Exam Scheduled Successfully"
type: "exam"
updatedAt: "2026-08-20T15:04:26.369Z"
userId: "6a1ac6d191c8f782938d37f9"
__v: 0
_id: "6a87173e055a5abc9a5b68d7" 
*/