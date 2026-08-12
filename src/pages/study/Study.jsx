import { Routes, Route } from 'react-router'
import Subjects  from './Subjects'
import Config from './Config';
import Mode from './Mode';
import Search from './Search';
import { ProtectStudyRoute } from '../../routes/ProtectStudyRoute'

export default function Study(){
  return (
    <Routes>
      <Route path="/" element={<Subjects />} />
      <Route path="/config" element={<Config />} />
      <Route path="/mode" element={
        <ProtectStudyRoute>
          <Mode />
        </ProtectStudyRoute>
      } />
      <Route path="/search" element={<Search />} />
    </Routes>
  )
}