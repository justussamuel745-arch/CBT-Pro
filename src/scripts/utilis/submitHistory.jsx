import { fetchWithAuth } from './fetch.js';

export async function on(token, setToken, setHistoryData) {
      const unsavedHistory =
        JSON.parse(localStorage.getItem('unsavedHistory')) || [];

      if (!unsavedHistory || unsavedHistory.length === 0 || !Array.isArray(unsavedHistory)) {
        return;
      }

      const failedHistory = [];

      for (const history of unsavedHistory) {
        if (!history || typeof history !== 'object') {
          continue;
        }

        try {
          const response = await fetchWithAuth(
            token,
            setToken,
            '/api/history/submit',
            {
              method: 'POST',
              body: JSON.stringify(history)
            }
          );

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          setHistoryData(data)

          // Success: do nothing.
          // Since we don't push it into failedHistory,
          // it will be removed from localStorage.

        } catch {
          // Keep this one for the next retry.
          failedHistory.push(history);
        }
      }

      if (failedHistory.length === 0) {
        localStorage.removeItem('unsavedHistory');
      } else {
        localStorage.setItem(
          'unsavedHistory',
          JSON.stringify(failedHistory)
        );
      }
    }