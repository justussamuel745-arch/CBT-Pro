import { useState, memo, useEffect } from 'react';
import { getImage } from '../../hooks/services/indexedDB/images';
import './Image.css';


export const Image = memo(function Image({ imageUrl }) {
  const [offlineImgUrl, setOfflineImageUrl] = useState('')
  
  useEffect(() => {
    if (navigator.onLine) return
    getImage(imageUrl).then((image) => {
      setOfflineImageUrl(URL.createObjectURL(image.blob))
    })
  },[imageUrl, setOfflineImageUrl])
  

  if (!navigator.onLine) {
    return (
      <img
        src={offlineImgUrl}
        className="question-image"
        alt="Question image"
      /> 
    )
  }

  return (
    <img
      src={imageUrl}
      className="question-image"
      alt="Question image"
    />
  )
})