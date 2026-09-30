import { EXAM_CONFIG } from '@lib/config/app.js';

export const hasEditExpires = (countdown) => {
  const { days, hours, minutes } = countdown
  const timeInMinutes = (days * 24 * 60) + (hours * 60) + (minutes)
  if (timeInMinutes <= EXAM_CONFIG.EDIT_LOCK_MINUTES) return true
  return false
}