import Icon from "../Icon";

export function SectionCard({
  index,
  title,
  subtitle,
  children,
}) {
  return (
    <section className="intel-card">

      <header className="intel-card-header">
        <div className="intel-card-title-area">

          <span className="intel-index">
            {index}
          </span>

          <h3>{title}</h3>

          {subtitle && (
            <p>{subtitle}</p>
          )}

        </div>
      </header>

      <div className="intel-card-body">
        {children}
      </div>

    </section>
  );
}


export function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="field-error">
      <span>!</span>
      {message}
    </p>
  );
}


export function InputField({
  label,
  hint,
  suffix,
  showLeadingSymbol = true,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  tooltip,
  min,
  max,
  step,
}) {
  return (
    <div
      className={`input-field large-field ${
        error ? "has-error" : ""
      }`}
    >

      <div className="field-label-row">

        <label>
          {label}
        </label>

        {tooltip && (
          <span
            className="info-tip"
            data-tip={tooltip}
            title={tooltip}
          >
            <Icon type="info" />
          </span>
        )}

      </div>

      {hint && (
        <p className="field-hint">
          {hint}
        </p>
      )}

      <div className="input-wrapper">

      {type === "number" && showLeadingSymbol && (
  <span className="input-leading-symbol">₹</span>
)}

        <input
          type={type}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          aria-invalid={Boolean(error)}
        />

        {suffix && (
          <span className="input-suffix">
            {suffix}
          </span>
        )}

      </div>

      <FieldError message={error} />

    </div>
  );
}


export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
  error,
  tooltip,
}) {
  return (
    <div
      className={`input-field large-field ${
        error ? "has-error" : ""
      }`}
    >

      <div className="field-label-row">

        <label>
          {label}
        </label>

        {tooltip && (
          <span
            className="info-tip"
            data-tip={tooltip}
            title={tooltip}
          >
            <Icon type="info" />
          </span>
        )}

      </div>

      {hint && (
        <p className="field-hint">
          {hint}
        </p>
      )}

      <div className="input-wrapper select-wrapper">

        <select
          value={value ?? ""}
          onChange={onChange}
          aria-invalid={Boolean(error)}
        >
          {options.map(
            ([optionValue, optionLabel]) => (
              <option
                key={optionValue}
                value={optionValue}
              >
                {optionLabel}
              </option>
            )
          )}
        </select>

        <span className="select-arrow">
          ↓
        </span>

      </div>

      <FieldError message={error} />

    </div>
  );
}


export function SliderField({
  label,
  hint,
  tooltip,
  min,
  max,
  step,
  value,
  onChange,
  display,
  error,
}) {
  return (
    <div
      className={`slider-field ${
        error ? "has-error" : ""
      }`}
    >

      <div className="field-label-row">

        <label>
          {label}
        </label>

        {tooltip && (
          <span
            className="info-tip"
            data-tip={tooltip}
            title={tooltip}
          >
            <Icon type="info" />
          </span>
        )}

      </div>

      {hint && (
        <p className="field-hint">
          {hint}
        </p>
      )}

      <div className="slider-control">

        <input
          className="prediction-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={onChange}
          aria-invalid={Boolean(error)}
        />

        <div className="slider-scale">
          <span>{min}</span>
          <span>{max}</span>
        </div>

      </div>

      <div className="slider-value">
        {display}
      </div>

      <FieldError message={error} />

    </div>
  );
}