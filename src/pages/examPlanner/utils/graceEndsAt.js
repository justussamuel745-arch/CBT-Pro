import { addMinutes } from '../../../scripts/utilis/dateTimeOp.js';
import { GRACE_WINDOW_MINUTES } from '../constant/time.js';

export const graceEndsAt = (examDate) => {
  return addMinutes(examDate, GRACE_WINDOW_MINUTES)
}