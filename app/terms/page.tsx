import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default function TermsPage() {
  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>MODULE: TERMS.txt / LAST EDIT: 04.14.26</StatusStrip>
      <Panel>
        <PanelTitleBar title="TERMS & CONDITIONS" meta="LA PROPAGANDE — PARIS / BEIRUT" />
        <div className="space-y-3 p-3 text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
          <p className="m-0">This page is being updated. For inquiries contact us directly.</p>
          <p className="m-0">By accessing and using this website, you accept and agree to be bound by these terms and conditions. If you do not agree to these terms, please do not use this site.</p>
          <p className="m-0">All content on this website, including text, images, and design, is the intellectual property of La Propagande and may not be reproduced without written permission.</p>
          <p className="m-0">We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>
          <p className="m-0">La Propagande is not liable for any indirect, incidental, or consequential damages arising from the use of this website or the purchase of our products.</p>
        </div>
      </Panel>
    </div>
  );
}
