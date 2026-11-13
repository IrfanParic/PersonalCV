import imageMetadata from '../Data/image-metadata.json';

interface PortfolioImage {
  src: string;
  srcset?: string;
  width?: number;
  height?: number;
}

const images: Record<string, PortfolioImage> = imageMetadata;

/** Original assets remain the fallback for images without generated variants. */
export function imageFor(path: string): PortfolioImage {
  return images[path] ?? { src: path };
}
