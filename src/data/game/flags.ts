export interface GameFlagEnv {
  readonly DEV?: boolean;
  readonly PUBLIC_RESUME_GAME?: string;
}

/**
 * The résumé game is on the live site. A production build can leave it out with
 * PUBLIC_RESUME_GAME=off, as a kill switch; development always shows it.
 */
export const isGameEnabled = (env: GameFlagEnv): boolean => env.DEV === true || env.PUBLIC_RESUME_GAME !== 'off';

export const gameEnabled: boolean = isGameEnabled(import.meta.env);
