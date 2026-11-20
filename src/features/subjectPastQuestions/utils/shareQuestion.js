import { createQuestionShareImage } from './shareQuestionImage'

// Result codes returned by the share helpers, so the UI decides what to tell the user.
export const SHARE_RESULT = {
  linkShared: 'link-shared',
  linkCopied: 'link-copied',
  imageShared: 'image-shared',
  imageSaved: 'image-saved',
}

const getTitle = (subject) => `${subject} JAMB past question | CBT Pro`
const getIntro = (subject) => `Try this ${subject} JAMB past question on CBT Pro.`

const canNativeShare = (data) =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (navigator.canShare?.(data) ?? true)

export const supportsNativeShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const input = document.createElement('textarea')
  input.value = text
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  if (!copied) throw new Error('Clipboard copy failed')
}

export function downloadFile(file) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  URL.revokeObjectURL(url)
}

// Shares only the URL. Apps turn a plain URL into a tappable link.
export async function shareQuestionLink({ url, subject }) {
  const data = { title: getTitle(subject), text: getIntro(subject), url }
  if (canNativeShare(data)) {
    await navigator.share(data)
    return SHARE_RESULT.linkShared
  }

  await copyText(url)
  return SHARE_RESULT.linkCopied
}

// Shares the question image. The URL goes inside `text` (not `url`) because many apps drop `url`
// when files are attached, whereas text becomes the caption and links in it stay tappable.
export async function shareQuestionImage({ question, subject, url }) {
  const file = await createQuestionShareImage({ question, subject })
  const text = `${getIntro(subject)}\n${url}`
  const data = { title: getTitle(subject), text, files: [file] }

  if (canNativeShare(data) && navigator.canShare?.(data)) {
    await navigator.share(data)
    return SHARE_RESULT.imageShared
  }

  await copyText(text)
  downloadFile(file)
  return SHARE_RESULT.imageSaved
}
