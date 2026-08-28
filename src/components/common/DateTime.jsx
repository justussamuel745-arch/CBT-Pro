import './DateTime.css';
import { formatDateTime } from '../../scripts/utils/dateTimeOp.js';


export function DateTime({ iso }){
  const [ date, time ] = formatDateTime(iso);
  
  return (
    <div className="datetime">
      <i className="fa-regular fa-calendar" aria-hidden="true"></i>
      <span>{date}</span>
      <span className="sep">•</span>
      <i className="fa-regular fa-clock" aria-hidden="true"></i>
      <span>{time}</span>
    </div>
  )
}