// Fail closed: ordering is enabled only when NEXT_PUBLIC_COMMERCE_ENABLED is exactly 'true'.
// Unset, misspelled or any other value keeps the demo notice and disables cart routes.
export const COMMERCE_ENABLED = process.env.NEXT_PUBLIC_COMMERCE_ENABLED === 'true';
export const DEMO_MESSAGE = 'Demo version — ordering is not available yet.';
