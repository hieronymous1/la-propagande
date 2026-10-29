# Launch notification list

The demo popup saves subscriptions in the existing Shopify store. In Shopify, open **Content → Metaobjects → Launch notification signup** to view the list.

Each record contains the email address, explicit consent, consent timestamp and website source. Repeat submissions update the same record. Subscribers are not given customer accounts. This list is private: Storefront API access is `NONE`, and the API refuses to write if the definition is made public.

Production uses server-only `LAUNCH_SIGNUP_STORAGE=shopify`, `SHOPIFY_APP_CLIENT_ID`, `SHOPIFY_APP_CLIENT_SECRET` and `SHOPIFY_STORE_DOMAIN`. The existing app already has the required metaobject permissions. Credentials are never sent to the browser. `node --env-file=.env.local scripts/setup-launch-signups.mjs` creates the private definition idempotently; it refuses an existing public definition.

The launch announcement must be sent separately to the consented addresses when ordering opens. Saving a signup does not send a confirmation email. FormSubmit is no longer involved in the popup, because requests were blocked from both the hosting server and the owner's browser.

Verification: 36 backend tests, popup rejection/retry/confirmation browser test, lint and typecheck pass. A real test subscription persisted in Shopify in 916 ms. Admin API confirmed the saved record and consent; Storefront API could not read any signup records.

Final production verification: deployed `https://lapropagande-3ougdeinw-hieronymous1s-projects.vercel.app` to `https://www.lapropagande.net`. Retried the form in the owner's original Vivaldi tab, using the brand address for the test. The live popup displayed “Thank you. We will email you when ordering opens.” The same browser had previously shown `ERR_CONNECTION_CLOSED` when it contacted FormSubmit. Production variables were checked for exact values after correcting trailing whitespace from the CLI input.
