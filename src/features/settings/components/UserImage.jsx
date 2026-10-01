import { memo } from 'react';
import defaultAvatar from '@/assets/images/avatar.jpg';

export const UserImage = memo(function UserImage({ avatarPreview, userInfo }) {
  return (
    <img
      src={avatarPreview || `${userInfo.blob ? URL.createObjectURL(userInfo.blob) : ''}`}
      alt="Profile avatar"
      onError={(e) => { e.target.src = defaultAvatar; }}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
    />
  )
})