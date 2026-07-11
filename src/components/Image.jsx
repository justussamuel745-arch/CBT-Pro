import { useState, memo, useEffect } from 'react';
import { getImage } from '../hooks/services/indexedDB/images';
import { url } from '../scripts/utilis/url';
import './Image.css';


export const Image = memo(function Image({ id, ext }) {
  const [imgUrl, setImgUrl] = useState('')
  const imgExt = ext 
  ? ext.slice(-3)
  : '.jpg'
  
  useEffect(() => {
    img()
  },[id])
  
  async function img() {
    const path = `images/questions/${id}.${imgExt}`
    const image = await getImage(`${url}/${path}`)
    if (!image) {
      setImgUrl('')
      return
    }
    
    const imageUrl = URL.createObjectURL(image.blob);
    setImgUrl(imageUrl)
  }

  if (!navigator.onLine) {
    return (
      <>
        {
          imgUrl && (
            <img
              src={imgUrl}
              className="question-image"
              alt="Question image"
            /> 
          )
        }
      </>
    )
  }

  return (
    <img
      src={`${url}/images/questions/${id}.${imgExt}`}
      className="question-image"
      onError={(e) => {
        e.target.style.display = 'none';
      }}
      alt="Question image"
    />
  )
})