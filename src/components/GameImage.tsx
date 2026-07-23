import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

type GameImageProps = {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
  effect?: 'blur'
  visibleByDefault?: boolean
}

/** 顯示具有一致灰階水墨處理的遊戲圖片。 */
export function GameImage({
  src,
  alt,
  className = '',
  wrapperClassName,
  effect = 'blur',
  visibleByDefault = false,
}: GameImageProps) {
  return (
    <LazyLoadImage
      alt={alt}
      className={`grayscale contrast-75 brightness-75 transition duration-300 ${className}`}
      effect={effect}
      loading={visibleByDefault ? 'eager' : 'lazy'}
      src={src}
      visibleByDefault={visibleByDefault}
      wrapperClassName={wrapperClassName}
    />
  )
}
