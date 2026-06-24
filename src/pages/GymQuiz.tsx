import { useState } from "react";

interface GymData {
  equipment: string;
  experience: string;
  frequency: string;
  goal: string;
  bench: string;
  weakest: string;
}

export default function GymQuiz({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GymData>({
    equipment: "",
    experience: "",
    frequency: "",
    goal: "",
    bench: "",
    weakest: "",
  });

  const update = <K extends keyof GymData>(key: K, value: GymData[K]) => {
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
            <h1 className="text-2xl mb-6">Do you have equipment?</h1>
            {["Full gym", "Home weights", "No equipment"].map((e) => (
              <button
                key={e}
                onClick={() => {
                  update("equipment", e);
                  setStep(e === "No equipment" ? 6 : 2);
                }}
                className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition"
              >
                {e}
              </button>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-xl mb-4">Training experience</h1>
            {["<6 months", "6-12 months", "1-2 years", "2+ years"].map((e) => (
              <button key={e} onClick={() => { update("experience", e); setStep(3); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-xl mb-4">Training frequency</h1>
            {["1-2", "3", "4", "5", "6+"].map((e) => (
              <button key={e} onClick={() => { update("frequency", e); setStep(4); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e} days/week
              </button>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-xl mb-4">Main goal</h1>
            {["Muscle", "Fat loss", "Strength", "Athletic"].map((e) => (
              <button key={e} onClick={() => { update("goal", e); setStep(5); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="text-xl mb-4">Bench press</h1>
            {["<40kg", "40-60kg", "60-80kg", "80-100kg", "100kg+"].map((e) => (
              <button key={e} onClick={() => { update("bench", e); setStep(6); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="text-xl mb-4">Weakest area</h1>
            {["Chest", "Back", "Shoulders", "Arms", "Legs"].map((e) => (
              <button key={e} onClick={() => { update("weakest", e); setStep(7); }} className="block w-full p-4 mb-3 border rounded-xl hover:bg-cream transition">
                {e}
              </button>
            ))}
          </>
        )}

        {step === 7 && (
          <div className="text-center">
            <h1 className="text-2xl mb-6">Setup Complete</h1>
            <button onClick={finish} className="bg-dark text-white px-6 py-3 rounded-xl hover:scale-105 transition">
              Finish Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
