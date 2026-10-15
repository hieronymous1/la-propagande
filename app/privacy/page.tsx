import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default function PrivacyPage() {
  return (
    <div className="lp-shell lp-page-pad space-y-3">
        <StatusStrip>MODULE PRIVACY.txt · LAST EDIT 14.10.26</StatusStrip>
      <Panel>
        <PanelTitleBar title="PRIVACY POLICY" meta="LA PROPAGANDE — PARIS / BEIRUT" />
        <div className="lp-body lp-prose p-4 md:p-6">
          <p className="m-0">This page is being updated. For inquiries contact us directly.</p>
          <p className="m-0">We collect only the information necessary to process your orders and communicate with you. Your personal data will never be sold to third parties.</p>
          <p className="m-0">Data we collect includes: name, email address, shipping address, and payment information. Payment data is handled securely through our payment processor and is never stored on our servers.</p>
          <p className="m-0">We may use your email to send order updates and, with your consent, occasional dispatches from HQ. You can unsubscribe at any time.</p>
          <p className="m-0">If you sign up for the launch notification, we use the email you provide to let you know when ordering opens. The launch form asks for your consent and sends your email to our configured form service.</p>
          <p className="m-0">When visitor counting is enabled, an anonymous browser cookie helps count no more than one visit per browser every 24 hours. The cookie lasts up to one year. The counter stores a hashed browser identifier for 24 hours and a cumulative visit total; it does not store your email or IP address.</p>
          <p className="m-0">Instagram posts load here only when you choose to load them. Instagram may then use cookies or receive information about your visit under its own privacy policy.</p>
          <p className="m-0">For data removal requests or any privacy-related concerns, contact us directly and we will respond within 30 days.</p>
        </div>
      </Panel>
    </div>
  );
}
