export interface ILoginViewModel {
  status: 'pending-ui-02'
}

/** 保留 UI-02 尚未開始前的 view-model 邊界。 */
export function useLoginViewModel(): ILoginViewModel {
  return { status: 'pending-ui-02' }
}
