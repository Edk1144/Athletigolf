import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Flag, Flame, MessageCircle, Save, Trophy, UserPlus, Users } from "lucide-react";
import GolfCoursePicker from "@/components/GolfCoursePicker";
import { Button, Card, PageHeader, StatCard } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { todayIso } from "@/lib/dates";
import { supabase } from "@/lib/supabase";
import type { FairwayResult, GolfCourseDetail, GolfCourseTee, Round, RoundHole, TeeShotLocation } from "@/lib/types";

type Step = "setup" | "holes" | "review" | "saved";

type LivePlayer = {
  id: string;
  name: string;
  handicap: string;
  type: "friend" | "guest";
};

type LiveGame =
  | "stroke_play"
  | "medal"
  | "stableford"
  | "match_play"
  | "skins"
  | "four_ball_stroke"
  | "four_ball_match"
  | "foursomes";

const liveGameOptions: Array<{ id: LiveGame; label: string; detail: string }> = [
  { id: "stroke_play", label: "Stroke play", detail: "Gross total" },
  { id: "medal", label: "Medal", detail: "Strict gross/net scoring" },
  { id: "stableford", label: "Stableford", detail: "Handicap points" },
  { id: "match_play", label: "Match play", detail: "Hole-by-hole match" },
  { id: "skins", label: "Skins", detail: "Hole prize carries" },
  { id: "four_ball_stroke", label: "4BBB Stroke", detail: "Best ball total" },
  { id: "four_ball_match", label: "4BBB Match", detail: "Best ball match" },
  { id: "foursomes", label: "Foursomes", detail: "Alternate shot pairing" },
];

type Hole = {
  par: number;
  yardage: number | null;
  meters: number | null;
  handicap: number | null;
  score: string;
  fairway: FairwayResult;
  teeShotLocation: "" | TeeShotLocation;
  gir: boolean;
  putts: string;
  penaltyShots: string;
  chipShots: string;
  greensideBunkerShots: string;
  recoveryShotType: "" | "chip" | "sand";
};

const createHoles = (count: number): Hole[] =>
  Array.from({ length: count }, () => ({
    par: 4,
    yardage: null,
    meters: null,
    handicap: null,
    score: "",
    fairway: "na",
    teeShotLocation: "",
    gir: false,
    putts: "",
    penaltyShots: "",
    chipShots: "",
    greensideBunkerShots: "",
    recoveryShotType: "",
  }));

const parseStat = (value: string) => Number(value || 0);
const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
};
const needsRecoveryChoice = (hole: Hole) =>
  parseStat(hole.chipShots) > 0 &&
  parseStat(hole.greensideBunkerShots) > 0 &&
  hole.putts.trim() !== "" &&
  hole.recoveryShotType === "";

export default function RoundTracker() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("setup");
  const [existingRoundId, setExistingRoundId] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<"completed" | "unfinished">("completed");
  const [holesPlayed, setHolesPlayed] = useState<9 | 18>(18);
  const [roundName, setRoundName] = useState("");
  const [visibility, setVisibility] = useState<"private" | "friends">("friends");
  const [ownHandicap, setOwnHandicap] = useState("");
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerHandicap, setNewPlayerHandicap] = useState("");
  const [selectedGames, setSelectedGames] = useState<LiveGame[]>(["stroke_play"]);
  const [playerHoleScores, setPlayerHoleScores] = useState<Record<string, string[]>>({});
  const [course, setCourse] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<GolfCourseDetail | null>(null);
  const [selectedTee, setSelectedTee] = useState<GolfCourseTee | null>(null);
  const [competition, setCompetition] = useState(false);
  const [teeColour, setTeeColour] = useState("");
  const [playingPartners, setPlayingPartners] = useState("");
  const [averageDrivingDistance, setAverageDrivingDistance] = useState("");
  const [longestDrive, setLongestDrive] = useState("");
  const [teeShotQuality, setTeeShotQuality] = useState("");
  const [date, setDate] = useState(todayIso());
  const [notes, setNotes] = useState("");
  const [holes, setHoles] = useState<Hole[]>(createHoles(18));
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [recoveryPromptIndex, setRecoveryPromptIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const resumeId = new URLSearchParams(window.location.search).get("resume");
    if (!resumeId) return;

    let cancelled = false;
    async function loadDraft() {
      setSaveError("");
      const [{ data: round }, { data: holeRows }] = await Promise.all([
        supabase.from("rounds").select("*").eq("id", resumeId).maybeSingle(),
        supabase.from("round_holes").select("*").eq("round_id", resumeId).order("hole_number", { ascending: true }),
      ]);

      if (cancelled || !round) return;

      const loadedRound = round as Round;
      const targetHoles = loadedRound.target_holes === 9 ? 9 : 18;
      setExistingRoundId(loadedRound.id);
      setSavedStatus(loadedRound.status === "completed" ? "completed" : "unfinished");
      setHolesPlayed(targetHoles);
      setRoundName(loadedRound.round_name || "");
      setCourse(loadedRound.course || "");
      setSelectedCourse(
        loadedRound.golf_course_external_id
          ? {
              id: loadedRound.golf_course_external_id,
              cachedCourseId: loadedRound.golf_course_id || null,
              clubName: loadedRound.course || "Saved course",
              courseName: loadedRound.course || "Saved course",
              location: null,
              city: null,
              state: null,
              country: null,
              tees: [],
            }
          : null
      );
      setSelectedTee(
        loadedRound.golf_course_tee_id || loadedRound.tee_name
          ? {
              id: loadedRound.golf_course_tee_id || "saved-tee",
              gender: "unknown",
              teeName: loadedRound.tee_name || loadedRound.tee_colour || "Saved tee",
              courseRating: loadedRound.course_rating ?? null,
              slopeRating: loadedRound.slope_rating ?? null,
              bogeyRating: null,
              totalYards: loadedRound.total_yards ?? null,
              totalMeters: loadedRound.total_meters ?? null,
              numberOfHoles: loadedRound.target_holes || null,
              parTotal: loadedRound.par_total ?? null,
              holes: [],
            }
          : null
      );
      setCompetition(loadedRound.is_competition);
      setTeeColour(loadedRound.tee_name || loadedRound.tee_colour || "");
      setPlayingPartners(loadedRound.playing_partners || "");
      setAverageDrivingDistance(loadedRound.average_driving_distance?.toString() || "");
      setLongestDrive(loadedRound.longest_drive?.toString() || "");
      setTeeShotQuality(loadedRound.tee_shot_quality || "");
      setDate(loadedRound.date || todayIso());
      setNotes(loadedRound.notes || "");
      setHoles(toDraftHoles(targetHoles, (holeRows as RoundHole[]) || []));
      setCurrentHoleIndex(0);
      setStep("holes");
    }

    loadDraft();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateHole = <K extends keyof Hole>(index: number, field: K, value: Hole[K]) => {
    const updatedHole = { ...holes[index], [field]: value };
    if (field === "par" && value === 3) {
      updatedHole.fairway = "na";
      updatedHole.teeShotLocation = "";
    }
    if (field === "fairway" && (value === "hit" || value === "na")) {
      updatedHole.teeShotLocation = "";
    }
    setHoles((prev) => prev.map((hole, i) => (i === index ? updatedHole : hole)));

    if (needsRecoveryChoice(updatedHole)) {
      setRecoveryPromptIndex(index);
    }
  };

  const applyTeeToHoles = (tee: GolfCourseTee | null, nextHolesPlayed = holesPlayed) => {
    if (!tee?.holes?.length) return;
    setHoles((prev) => {
      const base = prev.length === nextHolesPlayed ? prev : createHoles(nextHolesPlayed);
      return base.map((hole, index) => {
        const courseHole = tee.holes.find((item) => item.holeNumber === index + 1);
        if (!courseHole) return hole;
        return {
          ...hole,
          par: courseHole.par || hole.par,
          yardage: courseHole.yardage,
          meters: courseHole.meters,
          handicap: courseHole.handicap,
          fairway: (courseHole.par || hole.par) === 3 ? "na" : hole.fairway,
          teeShotLocation: (courseHole.par || hole.par) === 3 ? "" : hole.teeShotLocation,
        };
      });
    });
  };

  const handleCourseSelected = (courseDetail: GolfCourseDetail, tee: GolfCourseTee | null) => {
    setSelectedCourse(courseDetail);
    setCourse(courseDetail.courseName || courseDetail.clubName);
    setSelectedTee(tee);
    if (tee) {
      setTeeColour(tee.teeName);
      applyTeeToHoles(tee);
    }
  };

  const handleTeeSelected = (tee: GolfCourseTee | null) => {
    setSelectedTee(tee);
    if (tee) {
      setTeeColour(tee.teeName);
      applyTeeToHoles(tee);
    }
  };

  const addLivePlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    const player: LivePlayer = {
      id: `guest-${Date.now()}`,
      name,
      handicap: newPlayerHandicap.trim(),
      type: "guest",
    };
    setLivePlayers((prev) => [...prev, player]);
    setPlayerHoleScores((prev) => ({
      ...prev,
      [player.id]: Array.from({ length: holesPlayed }, () => ""),
    }));
    setPlayingPartners((prev) => {
      const names = prev
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return [...new Set([...names, name])].join(", ");
    });
    setNewPlayerName("");
    setNewPlayerHandicap("");
  };

  const removeLivePlayer = (playerId: string) => {
    setLivePlayers((prev) => prev.filter((player) => player.id !== playerId));
    setPlayerHoleScores((prev) => {
      const next = { ...prev };
      delete next[playerId];
      return next;
    });
  };

  const toggleGame = (game: LiveGame) => {
    setSelectedGames((prev) => {
      if (prev.includes(game)) {
        const next = prev.filter((item) => item !== game);
        return next.length ? next : ["stroke_play"];
      }
      return [...prev, game];
    });
  };

  const updatePlayerHoleScore = (playerId: string, holeIndex: number, score: string) => {
    setPlayerHoleScores((prev) => {
      const current = prev[playerId] || Array.from({ length: holesPlayed }, () => "");
      return {
        ...prev,
        [playerId]: current.map((value, index) => (index === holeIndex ? score : value)),
      };
    });
  };

  const startRound = () => {
    const nextHoles = createHoles(holesPlayed);
    setPlayerHoleScores(
      livePlayers.reduce<Record<string, string[]>>((acc, player) => {
        acc[player.id] = Array.from({ length: holesPlayed }, () => "");
        return acc;
      }, {})
    );
    if (selectedTee?.holes?.length) {
      setHoles(
        nextHoles.map((hole, index) => {
          const courseHole = selectedTee.holes.find((item) => item.holeNumber === index + 1);
          if (!courseHole) return hole;
          return {
            ...hole,
            par: courseHole.par || hole.par,
            yardage: courseHole.yardage,
            meters: courseHole.meters,
            handicap: courseHole.handicap,
            fairway: (courseHole.par || hole.par) === 3 ? "na" : hole.fairway,
          };
        })
      );
    } else {
      setHoles(nextHoles);
    }
    setCurrentHoleIndex(0);
    setSaveError("");
    setStep("holes");
  };

  const stats = useMemo(() => {
    const completed = holes.filter((hole) => hole.score !== "");
    const totalPar = completed.reduce((sum, hole) => sum + hole.par, 0);
    const totalScore = completed.reduce((sum, hole) => sum + Number(hole.score), 0);
    const totalPutts = completed.reduce((sum, hole) => sum + parseStat(hole.putts), 0);
    const fairwayHoles = completed.filter((hole) => hole.par !== 3);
    const fairwaysHit = fairwayHoles.filter((hole) => hole.fairway === "hit").length;
    const girs = completed.filter((hole) => hole.gir).length;
    const scrambleChances = completed.filter((hole) => !hole.gir);
    const successfulScrambles = scrambleChances.filter(
      (hole) => Number(hole.score) <= hole.par
    ).length;
    const penaltyShots = completed.reduce(
      (sum, hole) => sum + parseStat(hole.penaltyShots),
      0
    );
    const chipShots = completed.reduce((sum, hole) => sum + parseStat(hole.chipShots), 0);
    const greensideBunkerShots = completed.reduce(
      (sum, hole) => sum + parseStat(hole.greensideBunkerShots),
      0
    );
    const frontNine = holes
      .slice(0, 9)
      .filter((hole) => hole.score !== "")
      .reduce((sum, hole) => sum + Number(hole.score), 0);
    const backNine = holes
      .slice(9, 18)
      .filter((hole) => hole.score !== "")
      .reduce((sum, hole) => sum + Number(hole.score), 0);

    return {
      holesCompleted: completed.length,
      totalPar,
      totalScore,
      scoreToPar: totalScore - totalPar,
      totalPutts,
      fairwaysHit,
      fairwaysPossible: fairwayHoles.length,
      girs,
      penaltyShots,
      chipShots,
      greensideBunkerShots,
      scrambleChances: scrambleChances.length,
      successfulScrambles,
      frontNine,
      backNine,
      fairwayPercent: fairwayHoles.length
        ? Math.round((fairwaysHit / fairwayHoles.length) * 100)
        : 0,
      girPercent: completed.length ? Math.round((girs / completed.length) * 100) : 0,
      scramblePercent: scrambleChances.length
        ? Math.round((successfulScrambles / scrambleChances.length) * 100)
        : null,
    };
  }, [holes]);

  const formatToPar = (score: number) => {
    if (!stats.holesCompleted) return "-";
    if (score === 0) return "E";
    return score > 0 ? `+${score}` : `${score}`;
  };

  const currentHole = holes[currentHoleIndex];
  const currentHoleScore =
    currentHole && currentHole.score !== "" ? Number(currentHole.score) - currentHole.par : null;
  const liveLeaderboard = useMemo(() => {
    const ownerCompleted = holes.filter((hole) => hole.score !== "");
    const ownerScore = ownerCompleted.reduce((sum, hole) => sum + Number(hole.score), 0);
    const ownerPar = ownerCompleted.reduce((sum, hole) => sum + hole.par, 0);
    const rows = [
      {
        id: "owner",
        name: "You",
        score: ownerCompleted.length ? ownerScore : null,
        toPar: ownerCompleted.length ? ownerScore - ownerPar : null,
        holes: ownerCompleted.length,
      },
      ...livePlayers.map((player) => {
        const scores = playerHoleScores[player.id] || [];
        const completedScores = scores
          .map((score, index) => ({ score: score === "" ? null : Number(score), par: holes[index]?.par ?? 4 }))
          .filter((item) => item.score !== null);
        const total = completedScores.reduce((sum, item) => sum + (item.score ?? 0), 0);
        const par = completedScores.reduce((sum, item) => sum + item.par, 0);
        return {
          id: player.id,
          name: player.name,
          score: completedScores.length ? total : null,
          toPar: completedScores.length ? total - par : null,
          holes: completedScores.length,
        };
      }),
    ];
    return rows.sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return a.score - b.score;
    });
  }, [holes, livePlayers, playerHoleScores]);
  const selectedGameLabels = selectedGames
    .map((game) => liveGameOptions.find((option) => option.id === game)?.label || game)
    .join(", ");

  const goToNextHole = () => {
    setSaveError("");
    setCurrentHoleIndex((index) => Math.min(index + 1, holesPlayed - 1));
  };

  const goToPreviousHole = () => {
    setSaveError("");
    setCurrentHoleIndex((index) => Math.max(index - 1, 0));
  };

  const reviewRound = () => {
    if (!stats.holesCompleted) {
      setSaveError("Enter at least one hole before finishing the round.");
      return;
    }
    setSaveError("");
    setStep("review");
  };

  const finishRound = async (status: "completed" | "unfinished" = "completed") => {
    if (!user) return;
    if (!stats.holesCompleted) {
      setSaveError("Enter at least one hole before saving the round.");
      return;
    }
    if (status === "completed" && stats.holesCompleted !== holesPlayed) {
      setSaveError("Complete every hole before saving as a finished round, or save it as unfinished.");
      return;
    }
    const unresolvedRecoveryIndex = holes.findIndex(needsRecoveryChoice);
    if (unresolvedRecoveryIndex >= 0) {
      setRecoveryPromptIndex(unresolvedRecoveryIndex);
      setSaveError(`Choose whether hole ${unresolvedRecoveryIndex + 1}'s one-putt came after a chip or bunker shot.`);
      return;
    }

    setSaving(true);
    setSaveError("");

    const liveRoundSummary = buildLiveRoundSummary({
      visibility,
      ownHandicap,
      games: selectedGameLabels,
      players: livePlayers,
      playerScores: playerHoleScores,
      holes,
    });

    const roundPayload = {
        user_id: user.id,
        status,
        target_holes: holesPlayed,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        visibility,
        live_status: status === "completed" ? "finished" : stats.holesCompleted > 0 ? "paused" : "not_started",
        started_at: stats.holesCompleted > 0 ? new Date().toISOString() : null,
        finished_at: status === "completed" ? new Date().toISOString() : null,
        round_name: roundName || null,
        golf_course_id: selectedCourse?.cachedCourseId || null,
        golf_course_external_id: selectedCourse?.id || null,
        golf_course_tee_id: selectedTee?.id?.startsWith("saved-") || selectedTee?.id?.startsWith("api-") ? null : selectedTee?.id || null,
        course: course || null,
        date: date || todayIso(),
        score: stats.totalScore || null,
        fairways_hit: stats.fairwaysHit,
        fairways_possible: stats.fairwaysPossible,
        greens_in_regulation: stats.girs,
        putts: stats.totalPutts,
        penalty_shots: stats.penaltyShots,
        chip_shots: stats.chipShots,
        greenside_bunker_shots: stats.greensideBunkerShots,
        holes_played: stats.holesCompleted,
        tee_colour: teeColour || null,
        tee_name: selectedTee?.teeName || teeColour || null,
        course_rating: selectedTee?.courseRating ?? null,
        slope_rating: selectedTee?.slopeRating ?? null,
        total_yards: selectedTee?.totalYards ?? null,
        total_meters: selectedTee?.totalMeters ?? null,
        par_total: selectedTee?.parTotal ?? stats.totalPar ?? null,
        average_driving_distance: parseOptionalNumber(averageDrivingDistance),
        longest_drive: parseOptionalNumber(longestDrive),
        tee_shot_quality: teeShotQuality || null,
        playing_partners: playingPartners || livePlayers.map((player) => player.name).join(", ") || null,
        scramble_percentage: stats.scramblePercent,
        is_competition: competition,
        notes: [notes, liveRoundSummary].filter(Boolean).join("\n\n") || null,
    };

    const roundResult = existingRoundId
      ? await supabase.from("rounds").update(roundPayload).eq("id", existingRoundId).select("id").single()
      : await supabase.from("rounds").insert(roundPayload).select("id").single();
    const { data: round, error: roundError } = roundResult;

    if (roundError || !round) {
      setSaving(false);
      setSaveError(roundError?.message || "Could not save round.");
      return;
    }

    const holeRows = holes
      .map((hole, index) => ({
        round_id: round.id,
        user_id: user.id,
        hole_number: index + 1,
        par: hole.par,
        score: hole.score === "" ? null : Number(hole.score),
        fairway_result: hole.par === 3 ? "na" : hole.fairway,
        tee_shot_location: hole.par === 3 ? null : hole.teeShotLocation || null,
        gir: hole.gir,
        putts: parseStat(hole.putts),
        yardage: hole.yardage,
        meters: hole.meters,
        handicap: hole.handicap,
        penalty_shots: parseStat(hole.penaltyShots),
        chip_shots: parseStat(hole.chipShots),
        greenside_bunker_shots: parseStat(hole.greensideBunkerShots),
        recovery_shot_type: hole.recoveryShotType || null,
      }))
      .filter((hole) => hole.score !== null);

    if (existingRoundId) {
      const { error: deleteError } = await supabase.from("round_holes").delete().eq("round_id", existingRoundId);
      if (deleteError) {
        setSaving(false);
        setSaveError(deleteError.message);
        return;
      }
    }

    const { error: holesError } = await supabase.from("round_holes").insert(holeRows);
    setSaving(false);

    if (holesError) {
      setSaveError(holesError.message);
      return;
    }

    setSavedStatus(status);
    setStep("saved");
  };

  const resetRound = () => {
    setRoundName("");
    setVisibility("friends");
    setOwnHandicap("");
    setLivePlayers([]);
    setNewPlayerName("");
    setNewPlayerHandicap("");
    setSelectedGames(["stroke_play"]);
    setPlayerHoleScores({});
    setCourse("");
    setSelectedCourse(null);
    setSelectedTee(null);
    setCompetition(false);
    setTeeColour("");
    setPlayingPartners("");
    setAverageDrivingDistance("");
    setLongestDrive("");
    setTeeShotQuality("");
    setExistingRoundId(null);
    setSavedStatus("completed");
    setDate(todayIso());
    setNotes("");
    setHolesPlayed(18);
    setHoles(createHoles(18));
    setCurrentHoleIndex(0);
    setSaveError("");
    setStep("setup");
    navigate("/golf/submit");
  };

  if (step === "saved") {
    return (
      <div className="min-h-screen bg-cream p-6 text-dark">
        <Card className="mx-auto max-w-4xl p-8 text-center">
          <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-golf" />
          <h1 className="mb-3 text-4xl font-semibold">
            {savedStatus === "unfinished" ? "Round Saved As Unfinished" : "Round Saved"}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-black/60">
            {savedStatus === "unfinished"
              ? "It is in Round History and will stay out of scoring averages until you complete it."
              : "Your round and hole-by-hole stats have been logged."}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={resetRound} variant="golf">
              Start New Round
            </Button>
            <Link
              href="/golf"
              className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-5 py-3 font-semibold text-dark transition hover:bg-steel/5"
            >
              View Round History
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-5 text-dark md:p-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Golf Form"
          title="Live Round"
          description="Set the group up, then score hole by hole while you play. Save it unfinished, review it after, or finish it as a scoring round."
          tone="text-golf"
        />

        {step === "setup" ? (
          <Card className="max-w-4xl p-8">
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setHolesPlayed(9)}
                className={`rounded-xl border p-6 text-left transition ${
                  holesPlayed === 9
                    ? "border-golf bg-golf text-white"
                    : "border-line bg-steel/5 text-dark hover:border-golf/30"
                }`}
              >
                <p className="mb-2 text-sm opacity-70">Round Length</p>
                <h2 className="text-3xl font-semibold">9 Holes</h2>
              </button>

              <button
                onClick={() => setHolesPlayed(18)}
                className={`rounded-xl border p-6 text-left transition ${
                  holesPlayed === 18
                    ? "border-golf bg-golf text-white"
                    : "border-line bg-steel/5 text-dark hover:border-golf/30"
                }`}
              >
                <p className="mb-2 text-sm opacity-70">Round Length</p>
                <h2 className="text-3xl font-semibold">18 Holes</h2>
              </button>
            </div>

            <div className="mb-8 rounded-2xl border border-golf/20 bg-golf/5 p-5">
              <div className="mb-5 flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-golf text-white">
                  <Flame className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-golf">Live setup</p>
                  <h2 className="mt-1 text-2xl font-semibold text-dark">Who can follow, who is playing, and what games are running?</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Round visibility"
                  value={visibility}
                  onChange={(value) => setVisibility(value as "private" | "friends")}
                  options={["friends", "private"]}
                />
                <Field label="Your handicap" value={ownHandicap} onChange={setOwnHandicap} type="number" placeholder="Optional" />
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-panel p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-golf" />
                  <h3 className="font-semibold text-dark">Playing partners</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                  <Field label="Guest name" value={newPlayerName} onChange={setNewPlayerName} placeholder="Sam, Jack..." />
                  <Field label="Handicap" value={newPlayerHandicap} onChange={setNewPlayerHandicap} type="number" placeholder="Optional" />
                  <Button type="button" variant="golf" className="self-end" onClick={addLivePlayer}>
                    <UserPlus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-dark px-3 py-1 text-xs font-bold text-white">
                    You{ownHandicap ? ` / HCP ${ownHandicap}` : ""}
                  </span>
                  {livePlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => removeLivePlayer(player.id)}
                      className="rounded-full bg-golf/10 px-3 py-1 text-xs font-bold text-golf transition hover:bg-golf/15"
                    >
                      {player.name}{player.handicap ? ` / HCP ${player.handicap}` : ""} x
                    </button>
                  ))}
                  {!livePlayers.length && <span className="text-sm text-muted">Add guests now. Friend search can plug into this later.</span>}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-muted">Games running</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {liveGameOptions.map((game) => {
                    const active = selectedGames.includes(game.id);
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => toggleGame(game.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-golf bg-golf text-white"
                            : "border-line bg-panel text-dark hover:border-golf/35"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{game.label}</span>
                        <span className={`mt-1 block text-xs ${active ? "text-white/70" : "text-muted"}`}>{game.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Round name" value={roundName} onChange={setRoundName} placeholder="Saturday medal, evening 9..." />
              <GolfCoursePicker
                selectedCourse={selectedCourse}
                selectedTee={selectedTee}
                onCourseSelected={handleCourseSelected}
                onTeeSelected={handleTeeSelected}
              />
              <Field
                label="Course name"
                value={course}
                onChange={(value) => {
                  setCourse(value);
                  if (selectedCourse && value !== selectedCourse.courseName) {
                    setSelectedCourse(null);
                    setSelectedTee(null);
                  }
                }}
              />
              <Field label="Tees played" value={teeColour} onChange={setTeeColour} />
              <Field label="Date" value={date} onChange={setDate} type="date" />
              <Field label="Playing partners" value={playingPartners} onChange={setPlayingPartners} placeholder="Sam, Jack, Dad..." />
              <Field
                label="Average driving distance"
                value={averageDrivingDistance}
                onChange={setAverageDrivingDistance}
                type="number"
              />
              <Field
                label="Longest drive"
                value={longestDrive}
                onChange={setLongestDrive}
                type="number"
              />
              <SelectField
                label="Tee shot quality"
                value={teeShotQuality}
                onChange={setTeeShotQuality}
                options={["", "excellent", "good", "mixed", "poor"]}
              />
              <label className="flex items-center gap-3 rounded-lg border border-line px-5 py-4">
                <input
                  type="checkbox"
                  checked={competition}
                  onChange={(event) => setCompetition(event.target.checked)}
                />
                <span className="font-medium">Competition round</span>
              </label>
              <p className="rounded-lg border border-golf/20 bg-golf/8 px-4 py-3 text-sm leading-relaxed text-muted md:col-span-2">
                For alpha, playing partners are saved as names only. Other players' scorecards can become a group or premium feature later.
              </p>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-black/50">Round notes</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-line px-5 py-4 outline-none focus:border-golf"
                />
              </div>
            </div>

            <Button
              onClick={startRound}
              variant="golf"
              className="mt-8"
            >
              <Flag className="h-4 w-4" />
              Start Hole Entry
            </Button>
          </Card>
        ) : (
          <>
            <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              <StatCard label="Score" value={stats.totalScore || "-"} tone="bg-white" />
              <StatCard label="To Par" value={formatToPar(stats.scoreToPar)} tone="bg-white" />
              <StatCard label="Holes" value={`${stats.holesCompleted}/${holesPlayed}`} tone="bg-white" />
              <StatCard label="Putts" value={stats.totalPutts || "-"} tone="bg-white" />
              <StatCard label="FIR" value={`${stats.fairwayPercent}%`} tone="bg-white" />
              <StatCard label="GIR" value={`${stats.girPercent}%`} tone="bg-white" />
              <StatCard label="Scramble" value={stats.scramblePercent === null ? "-" : `${stats.scramblePercent}%`} tone="bg-white" />
              <StatCard label="Penalties" value={stats.penaltyShots} tone="bg-white" />
            </section>

            {step === "holes" && currentHole && (
              <Card className="p-5 md:p-7">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-golf">
                      Hole {currentHoleIndex + 1} of {holesPlayed}
                    </p>
                    <h2 className="mt-2 text-4xl font-semibold">
                      {currentHole.score ? formatToPar(currentHoleScore ?? 0) : "Not scored"}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Enter the live basics now. Slower detail can be cleaned up in the review step after the round.
                    </p>
                    {(currentHole.yardage || currentHole.handicap) && (
                      <p className="mt-3 text-sm font-semibold text-golf">
                        {currentHole.yardage ? `${currentHole.yardage} yd` : ""}
                        {currentHole.yardage && currentHole.handicap ? " / " : ""}
                        {currentHole.handicap ? `SI ${currentHole.handicap}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
                    {holes.map((hole, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentHoleIndex(index)}
                        className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                          index === currentHoleIndex
                            ? "border-golf bg-golf text-white"
                            : hole.score
                              ? "border-golf/30 bg-golf/10 text-golf"
                              : "border-line bg-white text-muted hover:border-golf/40"
                        }`}
                        aria-label={`Go to hole ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {currentHoleIndex === 8 && holesPlayed === 18 && (
                  <div className="mb-5 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-medium text-dark">
                    Turn after this hole.
                  </div>
                )}

                <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-line bg-panel p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-golf" />
                        <h3 className="font-semibold text-dark">Live leaderboard</h3>
                      </div>
                      <span className="rounded-full bg-golf/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-golf">
                        {visibility === "friends" ? "Friends" : "Private"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {liveLeaderboard.map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-dark">{index + 1}. {player.name}</p>
                            <p className="text-xs text-muted">{player.holes}/{holesPlayed} holes</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-dark">{player.score ?? "-"}</p>
                            <p className="text-xs font-bold text-golf">{player.toPar === null ? "-" : formatToParValue(player.toPar)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-golf/20 bg-golf/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-golf" />
                      <h3 className="font-semibold text-dark">Live round feed</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">
                      V1 keeps this round friends-only and saves the live setup with the round. Comments, photos and reactions can plug into the live round tables once Bolt applies the social scoring migrations.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedGames.map((game) => (
                        <span key={game} className="rounded-full bg-dark px-3 py-1 text-xs font-bold text-white">
                          {liveGameOptions.find((option) => option.id === game)?.label || game}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                  <SelectField
                    label="Par"
                    value={currentHole.par.toString()}
                    onChange={(value) => {
                      const nextPar = Number(value);
                      updateHole(currentHoleIndex, "par", nextPar);
                    }}
                    options={["3", "4", "5"]}
                  />
                  <Field
                    label="Score"
                    type="number"
                    value={currentHole.score}
                    onChange={(value) => updateHole(currentHoleIndex, "score", value)}
                  />
                  <SelectField
                    label="Fairway"
                    value={currentHole.fairway}
                    disabled={currentHole.par === 3}
                    onChange={(value) =>
                      updateHole(currentHoleIndex, "fairway", value as FairwayResult)
                    }
                    options={["na", "hit", "left", "right", "miss"]}
                  />
                  {currentHole.par !== 3 &&
                    currentHole.fairway !== "hit" &&
                    currentHole.fairway !== "na" && (
                      <SelectField
                        label="Where did it finish?"
                        value={currentHole.teeShotLocation}
                        onChange={(value) =>
                          updateHole(currentHoleIndex, "teeShotLocation", value as "" | TeeShotLocation)
                        }
                        options={[
                          "",
                          "rough",
                          "fairway_bunker",
                          "woods",
                          "water",
                          "out_of_bounds",
                          "other_fairway",
                          "other",
                        ]}
                      />
                    )}
                  <label className="flex items-center gap-3 rounded-lg border border-line px-4 py-3">
                    <input
                      type="checkbox"
                      checked={currentHole.gir}
                      onChange={(event) =>
                        updateHole(currentHoleIndex, "gir", event.target.checked)
                      }
                    />
                    <span className="text-sm font-medium">GIR</span>
                  </label>
                  <Field
                    label="Putts"
                    type="number"
                    value={currentHole.putts}
                    onChange={(value) => updateHole(currentHoleIndex, "putts", value)}
                  />
                  {livePlayers.map((player) => (
                    <Field
                      key={player.id}
                      label={`${player.name} score`}
                      type="number"
                      value={playerHoleScores[player.id]?.[currentHoleIndex] || ""}
                      onChange={(value) => updatePlayerHoleScore(player.id, currentHoleIndex, value)}
                    />
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-gold/25 bg-gold/10 p-4">
                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Post-round detail</p>
                    <p className="mt-1 text-sm text-muted">
                      Optional while you play. These are easier to tidy during review when the round is done.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                  <Field
                    label="Penalties"
                    type="number"
                    value={currentHole.penaltyShots}
                    onChange={(value) =>
                      updateHole(currentHoleIndex, "penaltyShots", value)
                    }
                  />
                  <Field
                    label="Chips"
                    type="number"
                    value={currentHole.chipShots}
                    onChange={(value) => updateHole(currentHoleIndex, "chipShots", value)}
                  />
                  <Field
                    label="Bunkers"
                    type="number"
                    value={currentHole.greensideBunkerShots}
                    onChange={(value) =>
                      updateHole(currentHoleIndex, "greensideBunkerShots", value)
                    }
                  />
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-line bg-panel p-3 lg:flex lg:items-center lg:justify-between">
                  <Button
                    variant="secondary"
                    onClick={goToPreviousHole}
                    disabled={currentHoleIndex === 0}
                    className="w-full lg:w-auto"
                  >
                    Previous
                  </Button>
                  <div className="mt-3 flex flex-col gap-3 sm:grid sm:grid-cols-3 lg:mt-0 lg:flex lg:flex-row">
                    <Button
                      variant="secondary"
                      onClick={goToNextHole}
                      disabled={currentHoleIndex === holesPlayed - 1}
                      className="w-full"
                    >
                      Skip Hole
                    </Button>
                    {currentHoleIndex < holesPlayed - 1 ? (
                      <Button variant="golf" onClick={goToNextHole} className="w-full">
                        Next Hole
                      </Button>
                    ) : (
                      <Button variant="golf" onClick={reviewRound} className="w-full">
                        Finish
                      </Button>
                    )}
                    {currentHoleIndex < holesPlayed - 1 && (
                      <Button variant="golf" onClick={reviewRound} className="w-full">
                        Finish
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {step === "review" && (
              <Card className="mb-6 border-golf/20 bg-golf/5">
                <h2 className="mb-2 text-2xl font-semibold text-golf">
                  Review Before Saving
                </h2>
                <p className="text-black/60">
                  Check the summary and hole details below. Skipped holes will stay out
                  of the saved stats.
                </p>
              </Card>
            )}

            {step === "review" && (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-steel/10 text-muted">
                      <tr>
                        <th className="p-4">Hole</th>
                        <th className="p-4">Par</th>
                        <th className="p-4">Yards</th>
                        <th className="p-4">SI</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Fairway</th>
                        <th className="p-4">Tee lie</th>
                        <th className="p-4">GIR</th>
                        <th className="p-4">Putts</th>
                        <th className="p-4">Pen</th>
                        <th className="p-4">Short game</th>
                        <th className="p-4">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holes.map((hole, index) => (
                        <tr key={index} className="border-t border-line">
                          <td className="p-4 font-semibold">{index + 1}</td>
                          <td className="p-4">{hole.par}</td>
                          <td className="p-4">{hole.yardage || "-"}</td>
                          <td className="p-4">{hole.handicap || "-"}</td>
                          <td className="p-4">
                            {hole.score ? (
                              hole.score
                            ) : (
                              <span className="rounded-full bg-steel/10 px-3 py-1 text-xs font-semibold text-muted">
                                Skipped
                              </span>
                            )}
                          </td>
                          <td className="p-4 capitalize">{formatOption(hole.fairway)}</td>
                          <td className="p-4 capitalize">
                            {hole.teeShotLocation ? formatOption(hole.teeShotLocation) : "-"}
                          </td>
                          <td className="p-4">{hole.gir ? "Yes" : "No"}</td>
                          <td className="p-4">{hole.putts || "-"}</td>
                          <td className="p-4">{hole.penaltyShots || "0"}</td>
                          <td className="p-4">
                            {parseStat(hole.chipShots) + parseStat(hole.greensideBunkerShots)}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                setCurrentHoleIndex(index);
                                setStep("holes");
                              }}
                              className="font-semibold text-golf"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {recoveryPromptIndex !== null && holes[recoveryPromptIndex] && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <button
                  className="absolute inset-0 bg-black/45"
                  onClick={() => setRecoveryPromptIndex(null)}
                  aria-label="Close recovery choice"
                />
                <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-golf">
                    Hole {recoveryPromptIndex + 1}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-dark">
                    What recovery shot came before putting?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    This hole has both a greenside bunker shot and a chip shot. Choose the recovery shot that led into putting so it counts as either an up-and-down chance or a sand-save chance, not both.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Button
                      variant="golf"
                      onClick={() => {
                        updateHole(recoveryPromptIndex, "recoveryShotType", "chip");
                        setRecoveryPromptIndex(null);
                      }}
                    >
                      Chip shot
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        updateHole(recoveryPromptIndex, "recoveryShotType", "sand");
                        setRecoveryPromptIndex(null);
                      }}
                    >
                      Bunker shot
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {saveError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                {saveError}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="secondary" onClick={() => setStep("setup")}>
                <ArrowLeft className="h-4 w-4" />
                Back To Setup
              </Button>
              {step === "review" && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => setStep("holes")}
                    variant="secondary"
                  >
                    Back To Hole Entry
                  </Button>
                  <Button
                    onClick={() => finishRound("unfinished")}
                    disabled={saving}
                    variant="secondary"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Unfinished"}
                  </Button>
                  <Button
                    onClick={() => finishRound("completed")}
                    disabled={saving}
                    variant="golf"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Finished Round"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted">{label}</label>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line px-4 py-3 outline-none focus:border-golf"
      />
    </div>
  );
}

function buildLiveRoundSummary({
  visibility,
  ownHandicap,
  games,
  players,
  playerScores,
  holes,
}: {
  visibility: "private" | "friends";
  ownHandicap: string;
  games: string;
  players: LivePlayer[];
  playerScores: Record<string, string[]>;
  holes: Hole[];
}) {
  const lines = [
    "Live round setup",
    `Visibility: ${visibility}`,
    `Games: ${games || "Stroke play"}`,
    ownHandicap ? `Your handicap: ${ownHandicap}` : "",
  ].filter(Boolean);

  if (players.length) {
    lines.push("Playing partners:");
    players.forEach((player) => {
      const scores = (playerScores[player.id] || [])
        .map((score, index) => {
          if (!score) return null;
          const hole = holes[index];
          return `H${index + 1}: ${score}${hole ? ` (par ${hole.par})` : ""}`;
        })
        .filter(Boolean)
        .join(", ");
      lines.push(`- ${player.name}${player.handicap ? `, HCP ${player.handicap}` : ""}${scores ? ` / ${scores}` : ""}`);
    });
  }

  return lines.join("\n");
}

function formatToParValue(score: number) {
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : `${score}`;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-line bg-white px-4 py-3 capitalize outline-none focus:border-golf disabled:bg-steel/5 disabled:text-muted"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function toDraftHoles(count: 9 | 18, rows: RoundHole[]): Hole[] {
  const holes = createHoles(count);
  rows.forEach((row) => {
    const index = row.hole_number - 1;
    if (index < 0 || index >= holes.length) return;
    holes[index] = {
      par: row.par || 4,
      yardage: row.yardage ?? null,
      meters: row.meters ?? null,
      handicap: row.handicap ?? null,
      score: row.score === null || row.score === undefined ? "" : row.score.toString(),
      fairway: row.fairway_result || "na",
      teeShotLocation: row.tee_shot_location || "",
      gir: row.gir,
      putts: row.putts === null || row.putts === undefined ? "" : row.putts.toString(),
      penaltyShots: row.penalty_shots === null || row.penalty_shots === undefined ? "" : row.penalty_shots.toString(),
      chipShots: row.chip_shots === null || row.chip_shots === undefined ? "" : row.chip_shots.toString(),
      greensideBunkerShots:
        row.greenside_bunker_shots === null || row.greenside_bunker_shots === undefined
          ? ""
          : row.greenside_bunker_shots.toString(),
      recoveryShotType: row.recovery_shot_type || "",
    };
  });
  return holes;
}

function formatOption(option: string) {
  if (option === "na") return "N/A";
  return option.replaceAll("_", " ");
}
