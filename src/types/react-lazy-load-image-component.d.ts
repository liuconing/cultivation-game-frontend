declare module 'react-lazy-load-image-component' {
  import type { ImgHTMLAttributes } from 'react'

  export type LazyLoadImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    effect?: 'blur' | 'black-and-white' | 'opacity'
  }

  export function LazyLoadImage(props: LazyLoadImageProps): JSX.Element
}

declare module 'react-lazy-load-image-component/src/effects/blur.css'
