/**
 * 获取当前时间日期字符串
 */
export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 获取星期几
 */
export function getDayOfWeek(): string {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekDays[new Date().getDay()];
}
