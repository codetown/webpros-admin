/** 读取文件为 dataURL */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** 拆分文件名与扩展名 */
export function splitFileName(filename: string): { name: string; ext: string } {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0) return { name: filename, ext: "bin" };
  return { name: filename.slice(0, dotIndex), ext: filename.slice(dotIndex + 1).toLowerCase() };
}

/** 触发浏览器下载 dataURL 内容 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
