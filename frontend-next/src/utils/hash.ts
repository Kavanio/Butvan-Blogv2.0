/**
 * 哈希与字符计算算法工具
 */

export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

/**
 * 依据标题字符编码计算确定性倾斜角度（-8deg ~ 8deg，避开 0deg）
 * 100% 对齐原站 --tilt: -4deg / -7deg / 3deg 等视觉手感
 */
export function getTitleTilt(title: string): string {
  const hash = Math.abs(stringHash(title));
  const magnitudes = [2, 3, 4, 5, 6, 7, 8];
  const mag = magnitudes[hash % magnitudes.length];
  const sign = hash % 2 === 0 ? -1 : 1;
  return `${sign * mag}deg`;
}

/**
 * 依据手记标题计算精致适度的默认微倾角（-3.5deg ~ 3.5deg，避开 0deg）
 * 适合常态拍立得封面卡片微倾摆放，手感自然不过度
 */
export function getNoteTilt(title: string): string {
  const hash = Math.abs(stringHash(title));
  const magnitudes = [1.5, 2, 2.5, 3, 3.5];
  const mag = magnitudes[hash % magnitudes.length];
  const sign = hash % 2 === 0 ? -1 : 1;
  return `${sign * mag}deg`;
}
