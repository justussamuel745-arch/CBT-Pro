import { openDB } from "./db";
import { url } from '../../../scripts/utilis/url.js';;

async function saveImage(imageUrl) {
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

export async function saveAllImages(data) {
  for (let i = 0; i < data.length; i++) {
    try {
      if (!data[i].image || !data[i].image?.url) {
        continue
      }
      const path = data[i].id
      const extention = data[i].image?.url.slice(-3)
      const result = await saveImage(`${url}/images/questions/${path}.${extention}`)

    } catch (err) {
      console.log(err);
    }
  }
}