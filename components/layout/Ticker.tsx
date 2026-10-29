const TICKER = [
  'FOR THE DREAMERS OF YESTERDAY',
  'FOR THE VISIONARIES OF TOMORROW',
  'FOR THE MISFITS WHO TURN CHAOS INTO BEAUTY',
  'FOR THE ROCKSTARS BORN IN THE WRONG CENTURY',
  'FOR THE REBEL MINDS, DEFIANT AND UNTAMED',
  'WELCOME TO THE REVOLUTION',
  'FROM BEIRUT TO PARIS, FOR THE WORLD',
  'ARE YOU BRAINWASHED YET ?',
  'READ 1984 !',
  'THE OLD WORLD IS DYING AND THE NEW WORLD STRUGGLES TO BE BORN',
  'NOW IS THE TIME OF MONSTERS',
  'THE REVOLUTION WILL NOT BE TELEVISED',
  'WAKE UP !',
  'ANGER IS A GIFT',
  'F#CK THE SYSTEM !!!',
];

export default function Ticker({ className = '' }: { className?: string }) {
  return (
    <div className={`lp-ticker py-3 ${className}`} aria-hidden="true">
      {/* Longer copy than the original six lines, so the loop runs slower to keep the same reading speed. */}
      <div className="lp-ticker__track lp-title text-[17px] text-[var(--lp-color-primary-400)]" style={{ animationDuration: '120s' }}>
        {[...TICKER, ...TICKER].map((line, i) => (
          <span key={`${line}-${i}`} className="flex items-center gap-10">
            {line}
            <span className="h-[6px] w-[6px] bg-[var(--lp-color-primary-700)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
