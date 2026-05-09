import Link from 'next/link';
import Image from 'next/image';

export default function About() {
  return (
    <section className="bg-lp-red px-4 py-[26px] md:px-5">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-10">
        <div className="mx-auto max-w-[761px]">
          <p className="text-[15px] leading-[1.65] text-black md:text-[16px]">
            La Propagande is a young Lebanese brand, born from revolt and war.
            Based between Paris and Beirut, soon in Montreal and across Europe…
            <br />
            <br />
            Rebellious, Raw, Underground.
            <br />
            <br />
            For the dreamers of yesterday.
            <br />
            For the visionaries of tomorrow.
            <br />
            For those who dare to do different
            <br />
            For the misfits who turn chaos into beauty
            <br />
            For the rockstars born in the wrong century.
            <br />
            For the Rebel minds, defiant & untamed.
            <br />
            <br />
            La Propagande is not your usual clothing brand. It dares to be different.
            Will the social experiment go as planned ? from rebellion to revolution.
            <br />
            <br />
            Will you join the movement?
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-end gap-5">
          <video
            src="https://framerusercontent.com/assets/x3yWBhko0EsiAxC5lRfbgkYcccw.mp4"
            className="h-auto w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />

          <Link
            href="/about"
            className="relative inline-flex h-[110px] w-[110px] overflow-hidden md:h-[210px] md:w-[210px]"
            aria-label="Open about"
          >
            <Image
              src="https://framerusercontent.com/images/SH9ezGBVBgE4bs84i0MWrzwPyXM.png?width=2000&height=2000"
              alt="La Propagande symbol"
              fill
              sizes="(max-width: 768px) 110px, 210px"
              className="object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
