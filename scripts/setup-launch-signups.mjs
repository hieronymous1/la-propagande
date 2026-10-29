import { createLaunchSignupClient, LAUNCH_SIGNUP_TYPE } from '../lib/shopify-launch-signups.js';
const admin = await createLaunchSignupClient();
const query = 'query SignupDefinition($type: String!) { metaobjectDefinitionByType(type: $type) { id name access { admin storefront } } }';
let result = await admin(query, { type: LAUNCH_SIGNUP_TYPE });
if (!result.metaobjectDefinitionByType) {
  const created = await admin(`mutation CreateSignupDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id access { storefront } } userErrors { message } }
  }`, { definition: {
    name: 'Launch notification signup', type: LAUNCH_SIGNUP_TYPE, displayNameKey: 'email',
    access: { storefront: 'NONE' },
    fieldDefinitions: [
      { key: 'email', name: 'Email', type: 'single_line_text_field', required: true },
      { key: 'consent', name: 'Launch notification consent', type: 'boolean', required: true },
      { key: 'consented_at', name: 'Consent recorded at', type: 'date_time', required: true },
      { key: 'source', name: 'Source', type: 'single_line_text_field' },
    ],
  } });
  if (created.metaobjectDefinitionCreate?.userErrors?.length) throw new Error(JSON.stringify(created.metaobjectDefinitionCreate.userErrors));
  result = await admin(query, { type: LAUNCH_SIGNUP_TYPE });
}
if (result.metaobjectDefinitionByType?.access?.storefront !== 'NONE') throw new Error('Signup definition is not private; no subscriber data was written.');
console.log(JSON.stringify(result.metaobjectDefinitionByType));
