export default function Hero() {
  return (
    <section className="bg-lp-red px-4 pt-[35px] md:px-5">
      <div className="mx-auto max-w-[1160px] overflow-hidden">
        <video
          src="https://framerusercontent.com/assets/QAOsJgTTaYmVBecxV6W62Y8uBI.mp4"
          className="h-[260px] w-full object-cover md:h-[621px]"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </section>
  );
}
