export const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      resolve(reader.result);
    } else {
      reject(new Error('读取文件失败'));
    }
  };
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

export default fileToBase64;
