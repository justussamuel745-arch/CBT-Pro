import cryptoJs from "crypto-js";

const secretKey = import.meta.env.VITE_CRYPTO_SECRET_KEY

export function encrypt(data) {
  try {
    return cryptoJs.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

export function decrypt(cipherText) {
  try {
    const bytes = cryptoJs.AES.decrypt(cipherText, secretKey);

    const decrypted = bytes.toString(cryptoJs.enc.Utf8);

    if (!decrypted) {
      return null;
    }

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}