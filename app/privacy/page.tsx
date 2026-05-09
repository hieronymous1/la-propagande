import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default function PrivacyPage() {
  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>MODULE: PRIVACY.txt / LAST EDIT: 04.14.26</StatusStrip>
      <Panel>
        <PanelTitleBar title="PRIVACY POLICY" meta="LA PROPAGANDE — PARIS / BEIRUT" />
        <div className="space-y-3 p-3 text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
          <p className="m-0">This page is being updated. For inquiries contact us directly.</p>
          <p className="m-0">We collect only the information necessary to process your orders and communicate with you. Your personal data will never be sold to third parties.</p>
          <p className="m-0">Data we collect includes: name, email address, shipping address, and payment information. Payment data is handled securely through our payment processor and is never stored on our servers.</p>
          <p className="m-0">We may use your email to send order updates and, with your consent, occasional dispatches from HQ. You can unsubscribe at any time.</p>
          <p className="m-0">For data removal requests or any privacy-related concerns, contact us directly and we will respond within 30 days.</p>
        </div>
      </Panel>
    </div>
  );
}
