import { useState } from "react";

interface GolfData {
  handicap: string;
  fh: string;
  gir: string;
  shotShape: string;
}

export default function GolfQuiz({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GolfData>({
    handicap: "",
    fh: "",
    gir: "",
    shotShape: "",
  });

  const update = <K extends keyof GolfData>(key: K, value: GolfData[K]) => {
    setData({ ...data, [key]: value });
  };

  const finish = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-xl">
        {step === 1 && (
          <>
            <h1 className="text-2xl mb-6">Handicap / Score</h1>
            {["0-5", "6-12", "13-20", "20+"].map((e) => (
              <button key={e} onClick={() => { update("handicap", e); setStep(2); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl mb-6">Fairways hit (per round)</h1>
            {["0-3", "4-6", "7-9", "10-12", "13-14"].map((e) => (
              <button key={e} onClick={() => { update("fh", e); setStep(3); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl mb-6">GIR (greens in regulation)</h1>
            {["0-3", "4-6", "7-9", "10-12", "13-18"].map((e) => (
              <button key={e} onClick={() => { update("gir", e); setStep(4); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-2xl mb-6">Shot shape</h1>
            {["Slice", "Fade", "Straight", "Draw", "Hook"].map((e) => (
              <button key={e} onClick={() => { update("shotShape", e); setStep(5); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 5 && (
          <div className="text-center">
            <h1 className="text-2xl mb-6">Setup Complete</h1>
            <button onClick={finish} className="bg-dark text-white px-6 py-3 rounded-xl hover:scale-105 transition">
              Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
