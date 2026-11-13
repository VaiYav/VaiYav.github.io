/**
 * The résumé game is shown in local development, and in a production build only
 * when PUBLIC_RESUME_GAME=on. It stays off the live site until it is ready.
 */
export const gameEnabled: boolean = import.meta.env.DEV || import.meta.env.PUBLIC_RESUME_GAME === 'on';
