import { addMinutes } from '@lib/utils/dateTimeOp.js';
import { EXAM_CONFIG } from '@lib/config/app.js';

export const graceEndsAt = (examDate) => {
  return addMinutes(examDate, EXAM_CONFIG.GRACE_WINDOW_MINUTES)
}