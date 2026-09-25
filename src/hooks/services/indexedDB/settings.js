/*
  Theme.
  Last sync time.
  Other app settings.
*/

import { openDB } from "./db";

export const getUserSettings = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readonly");
    const store = transaction.objectStore("settings");

    const request = store.get(userId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};


export const addUserSettings = async (settings) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");

    const request = store.add(settings);

    request.onsuccess = () => resolve(settings);
    request.onerror = () => reject(request.error);
  });
};


export const updateUserSettings = async (settings) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");

    const request = store.put(settings);

    request.onsuccess = () => resolve(settings);
    request.onerror = () => reject(request.error);
  });
};


export const deleteUserSettings = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");

    const request = store.delete(userId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};


export const clearAllSettings = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");

    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};