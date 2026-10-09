/** Taille lisible en français : « 850 Ko », « 7,2 Mo ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '').replace('.', ',')} Mo`;
}
