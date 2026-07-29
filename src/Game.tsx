import { useEffect, useState } from "react";

const prizes = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000,
  250000, 500000, 1000000,
];

function decode(str: string) {
  const t = document.createElement("textarea");
  t.innerHTML = str;
  return t.value;
}

function Game(props: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState("");
  const [locked, setLocked] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [quit, setQuit] = useState(false);
  const [payout, setPayout] = useState(0);

  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    async function load() {
      try {
        const cid = props.category.id;
        const diff = props.difficulty;
        const url = `https://opentdb.com/api.php?amount=15&category=${cid}&difficulty=${diff}&type=multiple`;

        let data = await fetch(url).then((r) => r.json());

        if (data.response_code === 5) {
          await new Promise((r) => setTimeout(r, 5000));
          data = await fetch(url).then((r) => r.json());
        }

        const results = data.results || [];

        if (results.length < 15) {
          setLoadErr(
            "This category does not have enough questions. Please pick another.",
          );
          setLoading(false);
          return;
        }

        const built = results.map((q: any) => {
          const opts = [q.correct_answer, ...q.incorrect_answers].map(decode);
          opts.sort(() => Math.random() - 0.5);
          return {
            question: decode(q.question),
            correct: decode(q.correct_answer),
            options: opts,
            difficulty: q.difficulty,
          };
        });

        setQuestions(built);
        setLoading(false);
      } catch {
        setLoadErr("Something went wrong while loading questions.");
        setLoading(false);
      }
    }
    load();
  }, [props.category, props.difficulty]);

  useEffect(() => {
    if (loading) return;
    if (questions.length === 0) return;
    if (gameOver || won || quit) return;
    if (locked) return;

    let t = 15;
    if (idx >= 5 && idx < 10) t = 30;
    if (idx >= 10) t = 45;
    setSeconds(t);

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          let safe = 0;
          if (idx >= 5 && idx < 10) safe = 1000;
          if (idx >= 10) safe = 32000;
          setPayout(safe);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [idx, questions, loading, gameOver, won, quit, locked]);

  function pickOption(opt: string) {
    if (locked) return;
    setPicked(opt);
    setLocked(true);
    setShowResult(true);

    const q = questions[idx];
    const right = opt === q.correct;

    setTimeout(() => {
      if (right) {
        if (idx === prizes.length - 1) {
          setPayout(prizes[idx]);
          setWon(true);
        } else {
          setIdx(idx + 1);
          setPicked("");
          setLocked(false);
          setShowResult(false);
        }
      } else {
        let safe = 0;
        if (idx >= 5 && idx < 10) safe = 1000;
        if (idx >= 10) safe = 32000;
        setPayout(safe);
        setGameOver(true);
      }
    }, 1400);
  }

  function withdraw() {
    if (locked) return;
    const earned = idx === 0 ? 0 : prizes[idx - 1];
    setPayout(earned);
    setQuit(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center p-5">
        <p>Loading questions...</p>
      </div>
    );
  }

  if (loadErr !== "") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center p-5">
        <p className="text-red-300">{loadErr}</p>
        <button
          onClick={props.onExit}
          className="bg-yellow-300 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (won || gameOver || quit) {
    let heading = "Game Over";
    if (won) heading = "You are a Millionaire!";
    if (quit) heading = "You walked away";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center p-5">
        <h1 className="text-4xl text-yellow-300 font-semibold">{heading}</h1>
        <p className="text-2xl text-white">
          You won ${payout.toLocaleString()}
        </p>
        <button
          onClick={props.onExit}
          className="bg-yellow-300 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400"
        >
          Play Again
        </button>
      </div>
    );
  }

  const current = questions[idx];
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen grid gap-6 p-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
          <button
            onClick={props.onExit}
            className="text-blue-100 hover:text-yellow-300"
          >
            ← Home
          </button>
          <div className="text-yellow-300 font-semibold">
            {props.category.name}
          </div>
          <div
            className={
              "rounded-full px-4 py-2 font-bold min-w-[70px] text-center border-2 " +
              (seconds <= 5
                ? "border-red-500 text-red-300 animate-pulse"
                : "border-blue-500 text-blue-100 bg-[#12225a]")
            }
          >
            {seconds}s
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-5">
          <div className="flex justify-between text-blue-100 text-sm">
            <span>Question {idx + 1} of 15</span>
            <span
              className={
                "px-3 py-0.5 rounded-full font-bold text-xs " +
                (current.difficulty === "easy"
                  ? "bg-green-400/20 text-green-400"
                  : current.difficulty === "medium"
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-red-400/20 text-red-300")
              }
            >
              {current.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="text-2xl leading-snug text-white">
            {current.question}
          </h2>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {current.options.map((op: string, i: number) => {
              let cls =
                "flex items-center gap-3 bg-[#12225a] border-2 border-[#2d3f8a] text-white px-4 py-3 rounded-lg text-left transition hover:bg-[#1a2f7a] hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-85";
              if (showResult) {
                if (op === current.correct) {
                  cls += " !bg-green-400/25 !border-green-400";
                } else if (op === picked) {
                  cls += " !bg-red-400/25 !border-red-400";
                }
              }
              return (
                <button
                  key={op}
                  className={cls}
                  disabled={locked}
                  onClick={() => pickOption(op)}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-300 text-slate-900 font-bold flex-shrink-0">
                    {letters[i]}
                  </span>
                  <span className="flex-1">{op}</span>
                </button>
              );
            })}
          </div>

          <button
            disabled={locked}
            onClick={withdraw}
            className="self-end bg-transparent text-red-300 border border-red-300 px-5 py-2 rounded-lg hover:bg-red-300/15 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-5">
        <h3 className="text-center text-yellow-300 mb-4 tracking-wide font-semibold">
          Prize Ladder
        </h3>
        <ul className="list-none p-0 m-0 flex flex-col gap-1">
          {prizes
            .slice()
            .reverse()
            .map((amt, i) => {
              const step = prizes.length - 1 - i;
              const active = step === idx;
              const isSafe = step + 1 === 5 || step + 1 === 10;
              const passed = step < idx;

              let cls =
                "flex items-center justify-between px-3 py-2 rounded-md text-sm text-blue-100";
              if (active)
                cls += " !bg-yellow-300 !text-slate-900 font-semibold";
              if (isSafe && !active) cls += " text-white font-semibold";
              if (passed) cls += " opacity-55";

              return (
                <li key={step} className={cls}>
                  <span
                    className={
                      active
                        ? "text-slate-900 font-semibold min-w-[26px]"
                        : isSafe
                          ? "text-green-400 font-semibold min-w-[26px]"
                          : "text-yellow-300 font-semibold min-w-[26px]"
                    }
                  >
                    {step + 1}
                  </span>
                  <span>${amt.toLocaleString()}</span>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

export default Game;
