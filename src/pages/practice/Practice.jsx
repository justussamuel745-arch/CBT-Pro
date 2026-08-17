import { Routes, Route } from 'react-router';
import Subjects from './Subjects';
import Config from './Config';
import Mode from './Mode';
import Score from './Score';
import Review from './Review';
import { ProtectPracticeRoutes } from '../../routes/ProtectPracticeRoutes';

export default function Practice() {
  return (
    <Routes>
      <Route path="/" element={<Subjects />} />
      <Route element={<ProtectPracticeRoutes />}>
        <Route path="/config" element={<Config />} />
        <Route path="/mode" element={<Mode />} />
      </Route>
      <Route path="/score" element={<Score />} />
      <Route path="/review" element={<Review />} />
    </Routes>
  )
}