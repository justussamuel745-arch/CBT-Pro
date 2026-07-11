import { useState, memo } from 'react';
import './Image.css';


export const Image = memo(function Image({ id }) {
  const [imgExt, setImgExt] = useState('jpg');
  
  return (
    <img
      src={`/images/questions/${id}.${imgExt}`}
      className="question-image"
      onError={(e) => {
        if (imgExt === 'jpg') {
          // jpg failed, try png
          setImgExt('png');
        } else {
          // png also failed, hide it
          e.target.style.display = 'none';
        }
      }}
      alt="Question image"
    />
  )
})