/**
 * 后端通用响应契约类型定义
 * 对应 Java 后端: Result<T> 与 PageResult
 */

export interface Result<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface PageResult<T = unknown> {
  records: T[];
  total: number;
  page: number;
  size: number;
  totalPages?: number;
}
