import { openDB } from "./db";

export async function saveImage(imageUrl) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }

  const blob = await response.blob();

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readwrite");

    const store = transaction.objectStore("images");

    const request = store.put({
      id: imageUrl,
      blob,
    });

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getImage(imageUrl) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readonly");

    const store = transaction.objectStore("images");

    const request = store.get(imageUrl);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearImages() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("images", "readwrite");

    const store = transaction.objectStore("images");

    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveAllImages(questions) {
  const imagePromises = questions
    .map(item => item?.image?.url)
    .filter(Boolean)
    .map(imageUrl =>
      saveImage(imageUrl).catch(err => {
        console.error(
          `Failed to save image: ${imageUrl}`,
          err
        );
      })
    );

  await Promise.all(imagePromises);
}