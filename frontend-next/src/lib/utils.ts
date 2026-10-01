/**
 * 工具函数库：哈希倾斜角计算、SVG 邮票齿孔生成、类名合并
 */

/**
 * 根据标题字符串的字符编码计算唯一的确定性微倾斜角度（-3deg ~ 3deg）
 */
export function getTitleTilt(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const degree = (hash % 14 - 7) % 7 - 3;
  return `${degree}deg`;
}

/**
 * 根据宽度和高度通过圆弧（Arc）穿孔数学算法生成逼真的法式复古邮票打孔边缘 SVG Path
 */
export function generateStampPerforationPath(width: number, height: number): string {
  const scale = Math.sqrt(width / 92);
  const radius = 5 * scale;
  const step = 15 * scale;

  const getPoints = (dimension: number) => {
    const count = Math.max(1, Math.floor((dimension - step) / step));
    const start = (dimension - (count - 1) * step) / 2;
    return Array.from({ length: count }, (_, idx) => start + idx * step);
  };

  let path = "M 0 0 ";

  // 顶边穿孔
  for (const x of getPoints(width)) {
    path += `L ${x - radius} 0 A ${radius} ${radius} 0 0 0 ${x + radius} 0 `;
  }
  path += `L ${width} 0 `;

  // 右边穿孔
  for (const y of getPoints(height)) {
    path += `L ${width} ${y - radius} A ${radius} ${radius} 0 0 0 ${width} ${y + radius} `;
  }
  path += `L ${width} ${height} `;

  // 底边穿孔（反向）
  for (const x of [...getPoints(width)].reverse()) {
    path += `L ${x + radius} ${height} A ${radius} ${radius} 0 0 0 ${x - radius} ${height} `;
  }
  path += `L 0 ${height} `;

  // 左边穿孔（反向）
  for (const y of [...getPoints(height)].reverse()) {
    path += `L 0 ${y + radius} A ${radius} ${radius} 0 0 0 0 ${y - radius} `;
  }
  path += "Z";

  return path;
}
