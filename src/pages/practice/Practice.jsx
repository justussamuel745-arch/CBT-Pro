import { Routes, Route } from 'react-router';
import Subjects from './Subjects';
import Config from './Config';
import Score from './Score';
import Review from './Review';
import { ProtectExamRoutes } from '../../routes/ProtectExamRoutes';

export default function Practice() {
  return (
    <Routes>
      <Route path="/" element={<Subjects />} />
      <Route element={<ProtectExamRoutes />}>
        <Route path="/config" element={<Config />} />
      </Route>
      <Route path="/score" element={<Score />} />
      <Route path="/review" element={<Review />} />
    </Routes>
  )
}