import { InputField, SectionCard } from "./FormControls";

function BudgetSection({
  predictionData,
  updateField,
  fieldErrors,
}) {
  return (
    <SectionCard
      index="02 — BUDGET"
      title="Set the total budget for your project."
      subtitle="Enter one exact production budget amount in Indian Rupees."
    >
      <div className="budget-input-single">
        <InputField
          label="Production Budget"
          hint="Enter the total estimated cost of making the movie."
          placeholder="Example: 250000"
          suffix="₹ INR"
          type="number"
          min="0"
          step="1000"
          value={predictionData.budget}
          onChange={(e) =>
            updateField(
              "budget",
              e.target.value
            )
          }
          error={fieldErrors?.budget}
        />
      </div>
    </SectionCard>
  );
}

export default BudgetSection;