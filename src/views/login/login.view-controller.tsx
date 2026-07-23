import { bind } from '@/utils'
import {
  useLoginViewModel,
  type ILoginViewModel,
} from './login.view-model'

/** UI-02 尚未開始，此元件暫不掛入路由。 */
export function loginViewController({ status }: ILoginViewModel) {
  return <div data-status={status} />
}

export default bind(loginViewController, useLoginViewModel)
