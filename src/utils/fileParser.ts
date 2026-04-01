/**
 * Converts a File to base64 string and returns mediaType.
 * For Excel/Word files that can't be sent natively to Claude,
 * we read them as base64 and pass text hint.
 */
export async function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // dataUrl = "data:<mediaType>;base64,<data>"
      const [header, data] = dataUrl.split(',')
      const mediaType = header.replace('data:', '').replace(';base64', '')
      resolve({ base64: data, mediaType })
    }
    reader.onerror = () => reject(new Error('Error leyendo archivo'))
    reader.readAsDataURL(file)
  })
}

export function getFileMediaType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
  }
  return map[ext ?? ''] ?? file.type ?? 'application/octet-stream'
}

export function isValidCotizacionFile(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  const mediaType = getFileMediaType(file)
  return validTypes.includes(mediaType)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
