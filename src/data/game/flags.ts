export interface GameFlagEnv {
  readonly DEV?: boolean;
  readonly PUBLIC_RESUME_GAME?: string;
}

/**
 * The résumé game is shown in local development, and in a production build only
 * when PUBLIC_RESUME_GAME is exactly "on". It stays off the live site until it is ready.
 */
export const isGameEnabled = (env: GameFlagEnv): boolean => env.DEV === true || env.PUBLIC_RESUME_GAME === 'on';

export const gameEnabled: boolean = isGameEnabled(import.meta.env);
