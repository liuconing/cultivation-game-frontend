/* eslint-disable react/display-name */

import { memo } from 'react';

/** 把hook的return object,利用HOC inject到component中 */
export function bind<P, T extends object>(
  Component: React.FunctionComponent<P>,
  useViewModelHook: (props?: any) => T,
): React.FunctionComponent<any> {
  return memo((props) => {
    if (typeof useViewModelHook !== 'function') {
      throw Error('Error occur at bind function ViewModel Must be a function');
    }

    const viewModel = useViewModelHook(props) ?? {};
    return <Component {...viewModel} {...props} />;
  });
}
