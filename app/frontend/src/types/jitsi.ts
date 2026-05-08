/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Partial type definition for the Jitsi Meet External API.
 * Based on: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/
 */
export interface JitsiApi {
  addEventListener: (event: string, callback: (event: any) => void) => void
  removeEventListener: (event: string, callback: (event: any) => void) => void
  executeCommand: (command: string, ...args: any[]) => void
  dispose: () => void
  getParticipantsInfo: () => any[]
  // Add other methods as needed
}

export interface JitsiIncomingMessageEvent {
  from: string
  nick: string
  message: string
}
