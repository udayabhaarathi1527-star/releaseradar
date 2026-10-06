function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function validateShortFilmPrediction(data) {
  const errors = {};

  if (data.budget === "" || Number.isNaN(Number(data.budget))) {
    errors.budget = "Enter a production budget.";
  } else if (Number(data.budget) < 0) {
    errors.budget = "Budget cannot be negative.";
  }

  const duration = Number(data.duration);
  if (data.duration === "" || Number.isNaN(duration)) {
    errors.duration = "Enter the runtime in minutes.";
  } else if (duration < 1 || duration > 180) {
    errors.duration = "Duration must be between 1 and 180 minutes.";
  }

  if (!String(data.genre || "").trim()) {
    errors.genre = "Select a genre.";
  }

  if (!String(data.original_language || "").trim()) {
    errors.original_language = "Select a language.";
  }

  if (!String(data.story_strength || "").trim()) {
    errors.story_strength = "Rate the story strength.";
  }

  if (!String(data.originality || "").trim()) {
    errors.originality = "Rate the originality.";
  }

  if (!String(data.acting_score || "").trim()) {
    errors.acting_score = "Rate the acting score.";
  }

  if (!String(data.visual_quality || "").trim()) {
    errors.visual_quality = "Rate the visual quality.";
  }

  if (!String(data.emotional_impact || "").trim()) {
    errors.emotional_impact = "Rate the emotional impact.";
  }

  return errors;
}

export function validatePrediction(data) {
  const errors = {};

  const budget = Number(data.budget);

  if (data.budget === "" || Number.isNaN(budget)) {
    errors.budget = "Enter a production budget.";
  } else if (budget < 0) {
    errors.budget = "Budget cannot be negative.";
  }

  const rating = Number(data.rating);

  if (data.rating === "" || Number.isNaN(rating)) {
    errors.rating = "Enter an expected rating.";
  } else if (rating < 0 || rating > 10) {
    errors.rating = "Rating must be between 0 and 10.";
  }

  const starPower = Number(data.star_power);

  if (data.star_power === "" || Number.isNaN(starPower)) {
    errors.star_power = "Enter a star power score.";
  } else if (starPower < 0 || starPower > 10) {
    errors.star_power =
      "Star power must be between 0 and 10.";
  }

  const competition = Number(data.competition);

  if (
    data.competition === "" ||
    Number.isNaN(competition)
  ) {
    errors.competition =
      "Enter a competition score.";
  } else if (competition < 0 || competition > 10) {
    errors.competition =
      "Competition must be between 0 and 10.";
  }

  const month = Number(data.release_month);

  if (
    data.release_month === "" ||
    Number.isNaN(month)
  ) {
    errors.release_month =
      "Select a release month.";
  } else if (month < 1 || month > 12) {
    errors.release_month =
      "Release month must be between 1 and 12.";
  }

  const year = Number(data.release_year);

  if (
    data.release_year === "" ||
    Number.isNaN(year)
  ) {
    errors.release_year =
      "Enter a release year.";
  } else if (year < 1950 || year > 2100) {
    errors.release_year =
      "Enter a reasonable year between 1950 and 2100.";
  }

  const runtime = Number(data.runtime);

  if (
    data.runtime === "" ||
    Number.isNaN(runtime)
  ) {
    errors.runtime = "Enter a runtime.";
  } else if (runtime < 60 || runtime > 240) {
    errors.runtime =
      "Runtime must be between 60 and 240 minutes.";
  }

  if (!data.genre) {
    errors.genre = "Select a genre.";
  }

  if (
    !String(
      data.production_company || ""
    ).trim()
  ) {
    errors.production_company =
      "Enter a production company.";
  }

  if (!data.original_language) {
    errors.original_language =
      "Select an original language.";
  }

  return errors;
}

export function getActiveStep(data, hasResult) {
  if (hasResult) return 4;

  const hasProfile =
    Boolean(data.genre) &&
    Boolean(data.original_language) &&
    Boolean(data.release_month) &&
    Boolean(data.release_year);

  const hasBudget =
    data.budget !== "" &&
    Boolean(
      String(
        data.production_company || ""
      ).trim()
    );

  const hasAudience =
    data.rating !== "" &&
    data.runtime !== "" &&
    data.star_power !== "" &&
    data.competition !== "";

  if (
    hasProfile &&
    hasBudget &&
    hasAudience
  ) {
    return 4;
  }

  if (hasProfile && hasBudget) {
    return 3;
  }

  if (hasProfile) {
    return 2;
  }

  return 1;
}

export function normalizeProbabilityValue(value) {
  const parsed = Number(String(value ?? 0).replace(/%/g, ""));

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  const normalized = parsed > 1 ? parsed : parsed * 100;
  return clamp(normalized, 0, 100);
}

export function formatProbabilityValue(value) {
  const normalized = normalizeProbabilityValue(value);
  return `${normalized.toFixed(1)}%`;
}

export function meaningFromProbability(
  probability
) {
  const score = num(probability);

  if (score >= 75) {
    return {
      headline: "Strong success potential",
      body:
        "Based on the information provided, your movie shows a strong potential for success. The estimated profile compares favorably with historically stronger releases.",
      band: "SUCCESS",
    };
  }

  if (score >= 50) {
    return {
      headline: "Moderate success potential",
      body:
        "Based on the information provided, your movie has a viable path, but results will depend on execution, positioning, and release strategy.",
      band: "MODERATE",
    };
  }

  return {
    headline: "High-risk project",
    body:
      "Based on the information provided, this project currently carries a lower estimated success probability. Treat this as a planning signal, not a verdict on the story.",
    band: "LOW PROBABILITY",
  };
}

export function deriveSuccessFactors(data) {
  const budget = num(data.budget);
  const rating = num(data.rating, 5);
  const starPower = num(data.star_power, 5);
  const competition = num(data.competition, 5);
  const runtime = num(data.runtime, 120);
  const month = num(data.release_month, 6);

  /*
   * Budget efficiency is now based only on
   * the single production budget amount.
   */
  const budgetEfficiency = Math.round(
    clamp(
      budget >= 20_000_000
        ? 88
        : budget >= 5_000_000
        ? 78
        : budget >= 500_000
        ? 68
        : 58,
      28,
      94
    )
  );

  const scaleScore =
    budget >= 20_000_000
      ? 82
      : budget >= 500_000
      ? 70
      : 58;

  const marketPotential = Math.round(
    clamp(
      scaleScore +
        starPower * 1.4 -
        competition * 1.8,
      24,
      94
    )
  );

  const runtimeFit =
    runtime >= 90 && runtime <= 140
      ? 8
      : 0;

  const audienceAppeal = Math.round(
    clamp(
      rating * 7.2 +
        starPower * 2.1 +
        runtimeFit,
      22,
      96
    )
  );

  const competitionLevel = Math.round(
    clamp(
      competition * 10,
      0,
      100
    )
  );

  const seasonalLift = [
    5,
    6,
    7,
    11,
    12,
  ].includes(month)
    ? 12
    : 0;

  const releaseTiming = Math.round(
    clamp(
      62 +
        seasonalLift -
        competition * 3.2,
      22,
      92
    )
  );

  return [
    {
      key: "budget",
      label: "Budget Strength",
      score: budgetEfficiency,
      explanation:
        budgetEfficiency >= 70
          ? "Your production budget provides a stronger financial scale for the selected project profile."
          : "The current production budget is relatively limited for the selected project profile.",
    },
    {
      key: "market",
      label: "Market Potential",
      score: marketPotential,
      explanation:
        marketPotential >= 70
          ? "Scale, genre positioning, and visibility inputs suggest a commercially reachable audience."
          : "Current scale and competitive pressure point to a more constrained commercial window.",
    },
    {
      key: "audience",
      label: "Audience Appeal",
      score: audienceAppeal,
      explanation:
        audienceAppeal >= 70
          ? "Expected rating and cast attention combine into a relatively strong audience signal."
          : "Audience conversion may depend more on story, festival exposure, and targeted promotion.",
    },
    {
      key: "competition",
      label: "Competition Level",
      score: competitionLevel,
      explanation:
        competitionLevel >= 70
          ? "A crowded release window can reduce theatrical visibility and discovery."
          : "Competitive pressure looks manageable, which can help a smaller title find its audience.",
    },
    {
      key: "timing",
      label: "Release Timing",
      score: releaseTiming,
      explanation:
        releaseTiming >= 70
          ? "The selected window has historically supported stronger theatrical attention."
          : "This month may require a more deliberate release strategy to stand out.",
    },
  ];
}

function riskLevel(score) {
  if (score >= 67) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function deriveRisks(data) {
  const budget = num(data.budget);
  const rating = num(data.rating, 5);
  const starPower = num(data.star_power, 5);
  const competition = num(data.competition, 5);

  const financialScore = clamp(
    (budget < 100_000 ? 35 : 0) +
      (budget > 80_000_000 ? 22 : 10),
    12,
    92
  );

  const marketScore = clamp(
    38 +
      competition * 4.8 -
      starPower * 1.5,
    14,
    94
  );

  const audienceScore = clamp(
    88 -
      rating * 5.4 -
      starPower * 2.2,
    12,
    92
  );

  const competitionScore = clamp(
    competition * 9.2,
    8,
    96
  );

  return [
    {
      label: "Financial Risk",
      level: riskLevel(financialScore),
      note:
        "Capital recovery depends on production scale, distribution reach, and audience demand.",
    },
    {
      label: "Market Risk",
      level: riskLevel(marketScore),
      note:
        "Demand may shift with genre trends and nearby theatrical traffic.",
    },
    {
      label: "Audience Risk",
      level: riskLevel(audienceScore),
      note:
        "Expected reception and cast attention influence word-of-mouth velocity.",
    },
    {
      label: "Competition Risk",
      level: riskLevel(competitionScore),
      note:
        "Similar or major titles can crowd screens, press, and audience attention.",
    },
  ];
}

export function deriveRecommendations(data) {
  const budget = num(data.budget);
  const rating = num(data.rating, 5);
  const starPower = num(data.star_power, 5);
  const competition = num(data.competition, 5);
  const runtime = num(data.runtime, 120);

  const cards = [];

  if (competition >= 7) {
    cards.push({
      title: "Release window pressure",
      body:
        "Consider moving the release window or strengthening your release strategy so the film is not lost among larger titles.",
    });
  } else {
    cards.push({
      title: "Protect the quiet window",
      body:
        "Competitive pressure looks manageable. Use this space to build awareness early with targeted press, festivals, or community screenings.",
    });
  }

  if (starPower <= 4) {
    cards.push({
      title: "Build attention without star power",
      body:
        "Focus on story, genre positioning, festival exposure, and strong promotional material. Independent films can travel on craft and concept.",
    });
  } else {
    cards.push({
      title: "Use cast attention deliberately",
      body:
        "Your cast profile can open doors. Align stills, interviews, and premiere plans around the people most likely to drive discovery.",
    });
  }

  if (budget < 500_000) {
    cards.push({
      title: "Make every rupee count",
      body:
        "Consider a targeted release strategy and prioritize high-impact production spending. Concentrate the budget on the scenes, sound, and design audiences will remember.",
    });
  } else if (rating < 6.5) {
    cards.push({
      title: "Raise expected audience quality",
      body:
        "A realistic but stronger reception profile usually requires more time in story, editing, and test screenings before you lock the film.",
    });
  } else if (runtime > 150) {
    cards.push({
      title: "Watch runtime risk",
      body:
        "Longer runtimes can reduce screening frequency. Confirm that every extra minute earns its place with audiences and exhibitors.",
    });
  } else {
    cards.push({
      title: "Sharpen the go-to-market plan",
      body:
        "The profile is balanced. Next, define the first audience, the first cities or platforms, and the one message you want the market to remember.",
    });
  }

  return cards.slice(0, 3);
}