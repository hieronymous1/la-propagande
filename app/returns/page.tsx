import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default function ReturnsPage() {
  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>MODULE: RETURNS.txt / LAST EDIT: 04.14.26</StatusStrip>
      <Panel>
        <PanelTitleBar title="RETURNS POLICY" meta="LA PROPAGANDE — PARIS / BEIRUT" />
        <div className="space-y-3 p-3 text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
          <p className="m-0">This page is being updated. For inquiries contact us directly.</p>
          <p className="m-0">We accept returns on unworn, unwashed items within 14 days of delivery. Items must be returned in their original condition with all tags attached.</p>
          <p className="m-0">To initiate a return, contact us via email or through our social channels. We will provide return instructions and a shipping label where applicable.</p>
          <p className="m-0">Sale items and limited-edition pieces are final sale and are not eligible for return or exchange.</p>
          <p className="m-0">Refunds will be processed to the original payment method within 5 to 10 business days of receiving the returned item.</p>
        </div>
      </Panel>
    </div>
  );
}
