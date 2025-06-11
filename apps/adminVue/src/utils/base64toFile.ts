export const base64toFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const matchResult = arr[0].match(/:(.*?);/);
  if (!matchResult) {
    throw new Error('Invalid data URL format');
  }
  const mime = matchResult[1];
  const suffix = mime.split('/')[1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i += 1) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime,
  });
};

export default base64toFile;
