import SocialLinks from '@/components/contact/SocialLinks';

export default function SocialStrip() {
  return (
    <section className="bg-lp-red px-4 py-6 md:px-5 md:pb-24">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5">
        <p className="font-retro-computer text-[20px] text-black md:text-[24px]">
          join the Revolution
        </p>
        <SocialLinks />
      </div>
    </section>
  );
}
