import {
  SectionCard,
  InputField,
  SelectField,
  SliderField,
} from "./FormControls";

function ShortFilmSection({
  movieName,
  setMovieName,
  predictionData,
  updateField,
  fieldErrors,
}) {
  return (
    <>
      {/* ============================================= */}
      {/* SHORT FILM PROFILE */}
      {/* ============================================= */}

      <SectionCard
        index="01 — SHORT FILM PROFILE"
        title="Tell us about your short film."
        subtitle="Enter the basic details of the film you are planning to create."
      >
        <div className="intel-grid cols-2">

          <InputField
            label="Short Film Title"
            hint="Enter the working title of your film."
            placeholder="Example: The Last Letter"
            type="text"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            error={fieldErrors?.movieName}
          />

          <SelectField
            label="Genre"
            hint="Choose the main genre of your film."
            value={predictionData.genre}
            onChange={(e) =>
              updateField("genre", e.target.value)
            }
            options={[
              ["Drama", "Drama"],
              ["Comedy", "Comedy"],
              ["Thriller", "Thriller"],
              ["Horror", "Horror"],
              ["Romance", "Romance"],
              ["Action", "Action"],
              ["Crime", "Crime"],
              ["Documentary", "Documentary"],
              ["Animation", "Animation"],
              ["Experimental", "Experimental"],
              ["Social", "Social"],
              ["Other", "Other"],
            ]}
            error={fieldErrors?.genre}
          />

          <SelectField
            label="Language"
            hint="Primary language spoken in the film."
            value={predictionData.original_language}
            onChange={(e) =>
              updateField(
                "original_language",
                e.target.value
              )
            }
            options={[
              ["ta", "Tamil"],
              ["en", "English"],
              ["hi", "Hindi"],
              ["te", "Telugu"],
              ["ml", "Malayalam"],
              ["kn", "Kannada"],
              ["other", "Other"],
            ]}
            error={fieldErrors?.original_language}
          />

          <InputField
            label="Duration"
            hint="Enter the expected final runtime of your short film."
            placeholder="Example: 12"
            suffix="MIN"
            showLeadingSymbol={false}
            type="number"
            min="1"
            step="1"
            value={predictionData.duration || ""}
            onChange={(e) =>
              updateField("duration", e.target.value)
            }
            error={fieldErrors?.duration}
          />

        </div>
      </SectionCard>


      {/* ============================================= */}
      {/* PRODUCTION BUDGET */}
      {/* ============================================= */}

      <SectionCard
        index="02 — PRODUCTION BUDGET"
        title="What is your estimated production budget?"
        subtitle="Enter the total amount you realistically plan to spend on making your short film."
      >
        <div className="budget-input-single">

          <InputField
            label="Production Budget"
            hint="Enter the total estimated cost of making the short film."
            placeholder="Example: 50000"
            suffix="₹ INR"
            type="number"
            min="0"
            step="1000"
            value={predictionData.budget || ""}
            onChange={(e) =>
              updateField("budget", e.target.value)
            }
            error={fieldErrors?.budget}
          />

        </div>
      </SectionCard>


      {/* ============================================= */}
      {/* CREATIVE STRENGTH */}
      {/* ============================================= */}

      <SectionCard
        index="03 — CREATIVE STRENGTH"
        title="How strong is the creative side of your film?"
        subtitle="These ratings are for planning context and are not inputs to the festival-circulation model."
      >
        <div className="intel-grid cols-2">

          <SliderField
            label="Story Strength"
            hint="How strong and engaging is the story?"
            tooltip="Consider the structure, characters, conflict and overall storytelling."
            min="1"
            max="10"
            step="1"
            value={predictionData.story_strength || 5}
            onChange={(e) =>
              updateField(
                "story_strength",
                e.target.value
              )
            }
            display={`${predictionData.story_strength || 5} / 10`}
            error={fieldErrors?.story_strength}
          />

          <SliderField
            label="Originality"
            hint="How fresh or distinctive is the concept?"
            tooltip="Consider whether the concept offers a new idea, perspective or treatment."
            min="1"
            max="10"
            step="1"
            value={predictionData.originality || 5}
            onChange={(e) =>
              updateField(
                "originality",
                e.target.value
              )
            }
            display={`${predictionData.originality || 5} / 10`}
            error={fieldErrors?.originality}
          />

          <SliderField
            label="Acting / Performance"
            hint="Expected quality of the performances."
            tooltip="Consider casting, performance quality and how naturally the actors fit their characters."
            min="1"
            max="10"
            step="1"
            value={predictionData.acting_score || 5}
            onChange={(e) =>
              updateField(
                "acting_score",
                e.target.value
              )
            }
            display={`${predictionData.acting_score || 5} / 10`}
            error={fieldErrors?.acting_score}
          />

          <SliderField
            label="Visual Quality"
            hint="Expected cinematography and visual presentation."
            tooltip="Consider camera work, lighting, composition and visual style."
            min="1"
            max="10"
            step="1"
            value={predictionData.visual_quality || 5}
            onChange={(e) =>
              updateField(
                "visual_quality",
                e.target.value
              )
            }
            display={`${predictionData.visual_quality || 5} / 10`}
            error={fieldErrors?.visual_quality}
          />

          <SliderField
            label="Emotional Impact"
            hint="How strongly could the film connect with viewers?"
            tooltip="Consider whether the film can create emotion, empathy, tension, surprise or reflection."
            min="1"
            max="10"
            step="1"
            value={predictionData.emotional_impact || 5}
            onChange={(e) =>
              updateField(
                "emotional_impact",
                e.target.value
              )
            }
            display={`${predictionData.emotional_impact || 5} / 10`}
            error={fieldErrors?.emotional_impact}
          />

        </div>
      </SectionCard>


      {/* ============================================= */}
      {/* AUDIENCE & DISTRIBUTION */}
      {/* ============================================= */}

      <SectionCard
        index="04 — AUDIENCE & DISTRIBUTION"
        title="How do you plan to reach your audience?"
        subtitle="These details are for planning context and do not affect the model score."
      >
        <div className="intel-grid cols-2">

          <SelectField
            label="Target Audience"
            hint="Who is your primary audience?"
            value={predictionData.target_audience || ""}
            onChange={(e) =>
              updateField(
                "target_audience",
                e.target.value
              )
            }
            options={[
              ["general", "General Audience"],
              ["youth", "Youth"],
              ["students", "Students"],
              ["families", "Families"],
              ["film_lovers", "Film Enthusiasts"],
              ["regional", "Regional Audience"],
              ["international", "International Audience"],
              ["niche", "Niche / Specific Community"],
            ]}
            error={fieldErrors?.target_audience}
          />

          <SliderField
            label="Expected Audience Rating"
            hint="Your realistic expectation of how viewers may rate the film."
            min="1"
            max="10"
            step="0.1"
            value={predictionData.rating || 7}
            onChange={(e) =>
              updateField("rating", e.target.value)
            }
            display={`${Number(
              predictionData.rating || 7
            ).toFixed(1)} / 10`}
            error={fieldErrors?.rating}
          />

          <SelectField
            label="Primary Release Platform"
            hint="Where do you mainly plan to release the film?"
            value={
              predictionData.distribution_platform || ""
            }
            onChange={(e) =>
              updateField(
                "distribution_platform",
                e.target.value
              )
            }
            options={[
              ["youtube", "YouTube"],
              ["instagram", "Instagram"],
              ["festivals", "Film Festivals"],
              ["ott", "OTT / Short Film Platform"],
              ["multiple", "Multiple Platforms"],
              ["other", "Other"],
            ]}
            error={
              fieldErrors?.distribution_platform
            }
          />

          <SelectField
            label="Existing Audience Reach"
            hint="How large is your current online audience?"
            value={predictionData.social_reach || ""}
            onChange={(e) =>
              updateField(
                "social_reach",
                e.target.value
              )
            }
            options={[
              ["none", "No Existing Audience"],
              ["small", "Small — Under 1K"],
              ["growing", "Growing — 1K–10K"],
              ["established", "Established — 10K–100K"],
              ["large", "Large — 100K+"],
            ]}
            error={fieldErrors?.social_reach}
          />

          <SelectField
            label="Promotion Plan"
            hint="How much promotion are you planning?"
            value={predictionData.promotion_plan || ""}
            onChange={(e) =>
              updateField(
                "promotion_plan",
                e.target.value
              )
            }
            options={[
              ["organic", "Organic / Word of Mouth"],
              ["social", "Social Media Promotion"],
              ["paid", "Paid Digital Promotion"],
              ["influencer", "Creator / Influencer Promotion"],
              ["full", "Multiple Promotion Methods"],
            ]}
            error={fieldErrors?.promotion_plan}
          />

          <SelectField
            label="Festival Submission"
            hint="Are you planning to submit the film to festivals?"
            value={
              predictionData.festival_submission || ""
            }
            onChange={(e) =>
              updateField(
                "festival_submission",
                e.target.value
              )
            }
            options={[
              ["yes", "Yes — Festival Circuit"],
              ["maybe", "Maybe"],
              ["no", "No — Online Release"],
            ]}
            error={
              fieldErrors?.festival_submission
            }
          />

        </div>
      </SectionCard>
    </>
  );
}

export default ShortFilmSection;