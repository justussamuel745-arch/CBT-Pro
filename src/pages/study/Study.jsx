import { Routes, Route } from 'react-router'
import Subjects  from './Subjects'
import Config from './Config';
import Search from './Search';
import Notes from './Notes';

export default function Study(){
  return (
    <Routes>
      <Route path="/" element={<Subjects />} />
      <Route path="/config" element={<Config />} />
      <Route path="/search" element={<Search />} />
      <Route path="/notes" element={<Notes />} />
    </Routes>
  )
}