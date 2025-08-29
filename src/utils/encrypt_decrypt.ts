import * as CryptoJS from 'crypto-js'
import * as dotenv from 'dotenv'

dotenv.config()


/**
 * Encrypt a string using the secret key
 * @param text - string to encrypt
 * @param password - string password for encryption
 * @return {string} encrypted string
 */
export const encryptTextWithPassword = (text: string, password: string) =>
  CryptoJS.AES.encrypt(text, password).toString()


/**
 * Encrypt a string using the secret key
 * @param text - string to encrypt
 * @param password - string password for encryption
 * @return {string} encrypted string
 */
export const decryptTextWithPassword = (text: string, password: string) => {
  const bytes = CryptoJS.AES.decrypt(
    text,
    password,
  )
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Encrypt a string using the secret key
 * @param text - string to encrypt
 * @return {string} encrypted string
 */
export const encryptText = (passwordText: string, postfix) =>
  CryptoJS.AES.encrypt(passwordText, `${process.env.DECRYPTION_PREFIX_KEY}${postfix}`).toString()

/**
 * Decrypt a string using the secret key
 * @param text - string to decrypt
 * @return {string} decrypted string
 */
export const decryptText = (text: string) => {
  const bytes = CryptoJS.AES.decrypt(
    text,
    process.env.ENCRYPT_DECRYPT_PASSWORD,
  )
  return bytes.toString(CryptoJS.enc.Utf8)
}
