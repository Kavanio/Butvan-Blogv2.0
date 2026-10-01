/**
 * 相册与照片业务模型
 * 对应 Java: AlbumVO & PhotoWallVO
 */

export interface PhotoVO {
  id: number;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  location?: string;
  takenAt?: string;
  width?: number;
  height?: number;
  albumId?: number;
  albumTitle?: string;
  albumSlug?: string;
  createdAt?: string;
}

export interface AlbumVO {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  photoCount?: number;
  photos?: PhotoVO[];
}
