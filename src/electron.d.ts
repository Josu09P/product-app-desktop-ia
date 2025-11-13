// types/electron.d.ts
export {}

declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => void
      windowControls: {
        minimize: () => void
        toggleMaximize: () => void
        close: () => void
      }
    }
  }
}
