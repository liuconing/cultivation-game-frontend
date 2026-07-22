import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

type GameImageProps = {
  src: string
  alt: string
  className?: string
  /** 套用在 LazyLoadImage 外層 wrapper 的類別，定位類（absolute 等）請放這裡。 */
  wrapperClassName?: string
  effect?: 'blur'
  /** 移出可視範圍的裝飾背景請設為 true，避免 lazy load 永遠不觸發。 */
  visibleByDefault?: boolean
}

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
