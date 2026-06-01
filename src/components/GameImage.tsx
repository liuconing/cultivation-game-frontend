import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

type GameImageProps = {
  src: string
  alt: string
  className?: string
  effect?: 'blur'
}

export function GameImage({
  src,
  alt,
  className = '',
  effect = 'blur',
}: GameImageProps) {
  return (
    <LazyLoadImage
      alt={alt}
      className={`grayscale contrast-75 brightness-75 transition duration-300 ${className}`}
      effect={effect}
      loading="lazy"
      src={src}
    />
  )
}
