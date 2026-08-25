import { EDIT_LOCK_MINUTES } from '../constant/time.js';

export const hasEditExpires = (countdown) => {
  const { days, hours, minutes } = countdown
  const timeInMinutes = (days * 24 * 60) + (hours * 60) + (minutes)
  if (timeInMinutes <= EDIT_LOCK_MINUTES) return true
  return false
}