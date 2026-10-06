import { SectionCard, SliderField } from "./FormControls";

function AudienceSection({
  predictionData,
  updateField,
  fieldErrors,
}) {
  return (
    <SectionCard
      index="03 — AUDIENCE & PERFORMANCE"
      title="Tell the AI how audiences may respond to your movie."
      subtitle="Adjust the sliders to describe your project's expected audience and market conditions."
    >
      <div className="audience-intro">
        <div className="audience-intro-icon">📊</div>

        <div>
          <strong>Audience Intelligence</strong>
          <p>
            These values help the prediction engine understand
            your movie's expected market position.
          </p>
        </div>
      </div>

      <div className="intel-grid cols-2 slider-grid">

        {/* RATING */}

        <SliderField
          label="IMDb / Audience Rating"
          hint="Expected audience or critic rating."
          tooltip="Use a realistic expected score, not the rating you hope for as the filmmaker."
          min="0"
          max="10"
          step="0.1"
          value={predictionData.rating}
          onChange={(e) =>
            updateField("rating", e.target.value)
          }
          display={`${Number(
            predictionData.rating || 0
          ).toFixed(1)} / 10`}
          error={fieldErrors?.rating}
        />


        {/* STAR POWER */}

        <SliderField
          label="Star Power"
          hint="Audience attention your cast may attract."
          tooltip="How recognizable and commercially attractive are the main actors?"
          min="0"
          max="10"
          step="1"
          value={predictionData.star_power}
          onChange={(e) =>
            updateField("star_power", e.target.value)
          }
          display={`${Number(
            predictionData.star_power || 0
          ).toFixed(1)} / 10`}
          error={fieldErrors?.star_power}
        />


        {/* COMPETITION */}

        <SliderField
          label="Competition"
          hint="Major or similar releases competing around your release date."
          tooltip="Higher values mean a more crowded theatrical or streaming window."
          min="0"
          max="10"
          step="1"
          value={predictionData.competition}
          onChange={(e) =>
            updateField("competition", e.target.value)
          }
          display={`${Number(
            predictionData.competition || 0
          ).toFixed(1)} / 10`}
          error={fieldErrors?.competition}
        />


        {/* RUNTIME */}

        <SliderField
          label="Runtime"
          hint="Estimated movie duration."
          tooltip="Most theatrical features are commonly around 90–140 minutes."
          min="60"
          max="240"
          step="1"
          value={predictionData.runtime}
          onChange={(e) =>
            updateField("runtime", e.target.value)
          }
          display={`${predictionData.runtime || 60} min`}
          error={fieldErrors?.runtime}
        />

      </div>
    </SectionCard>
  );
}

export default AudienceSection;