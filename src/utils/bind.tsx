import { memo, type FunctionComponent } from 'react'

/**
 * 將無外部 props 的 ViewModel 與 ViewController 綁定。
 */
export function bind<ViewModel extends object>(
  Component: FunctionComponent<ViewModel>,
  useViewModelHook: () => ViewModel,
): FunctionComponent {
  const BoundComponent = () => {
    const viewModel = useViewModelHook()
    return <Component {...viewModel} />
  }

  BoundComponent.displayName = `Bound${Component.name || 'View'}`
  return memo(BoundComponent)
}
