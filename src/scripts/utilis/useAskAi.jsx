import { useCallback, useContext } from 'react'
import UserContext from '../../context/UserContext';
import { saveUser } from '../../hooks/services/indexedDB/users';
import { decrypt, encrypt } from './crypto';
import { fetchWithAuth } from './fetch';

export function useAskAi() {
  const { token, setToken, userInfo, setUserInfo } = useContext(UserContext);

  const onAskAi = useCallback(async ({ questionId, message }) => {
    if (!token) throw new Error('No token found')

    const response = await fetchWithAuth(token, setToken, '/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({
        questionId: questionId ?? undefined,
        question: message,
      }),
    })

    const d = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw { status: response.status, error: d.error || 'Failed to generate response' }
    }

    const data = decrypt(d.reply)

    let nextUserInfo = userInfo;
    setUserInfo(prev => {
      nextUserInfo = { ...prev, aiCredits: data.creditsLeft }
      return nextUserInfo
    })

    const blob = nextUserInfo.blob
    delete nextUserInfo.blob
    const encryptedInfo = {
      ...nextUserInfo,
      accessToken: token
    }
    const success = await saveUser({
      "info": encrypt(encryptedInfo),
      blob,
      id: 'current-user'
    })

    return data.answer
  }, [token, setToken, userInfo, setUserInfo])

  return onAskAi
}