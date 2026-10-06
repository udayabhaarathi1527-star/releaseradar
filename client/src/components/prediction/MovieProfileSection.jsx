function MovieProfileSection({
  movieName,
  onMovieNameChange,
  predictionData,
  updateField,
  fieldErrors,
}) {
  return (
    <section className="prediction-section">

      <div className="section-heading">
        <div>
          <span className="section-kicker">
            01
          </span>

          <h3>
            Movie Profile
          </h3>

          <p>
            Tell us about the movie you are planning.
          </p>
        </div>
      </div>

      <div className="form-grid">

        {/* MOVIE NAME */}

        <div className="form-field full-width">

          <label htmlFor="movieName">
            Movie Name
          </label>

          <div className="input-wrapper">

            <span className="input-icon">
              🎬
            </span>

            <input
              id="movieName"
              type="text"
              value={movieName}
              onChange={(e) =>
                onMovieNameChange(e.target.value)
              }
              placeholder="Enter your movie title"
              autoComplete="off"
            />

          </div>

        </div>


        {/* GENRE */}

        <div className="form-field">

          <label htmlFor="genre">
            Genre
          </label>

          <div className="input-wrapper select-wrapper">

            <span className="input-icon">
              🎭
            </span>

            <select
              id="genre"
              value={predictionData.genre}
              onChange={(e) =>
                updateField(
                  "genre",
                  e.target.value
                )
              }
            >
              <option value="Drama">
                Drama
              </option>

              <option value="Action">
                Action
              </option>

              <option value="Comedy">
                Comedy
              </option>

              <option value="Thriller">
                Thriller
              </option>

              <option value="Horror">
                Horror
              </option>

              <option value="Romance">
                Romance
              </option>

              <option value="Adventure">
                Adventure
              </option>

              <option value="Animation">
                Animation
              </option>

              <option value="Crime">
                Crime
              </option>

              <option value="Science Fiction">
                Science Fiction
              </option>
            </select>

          </div>

          {fieldErrors?.genre && (
            <span className="field-error">
              {fieldErrors.genre}
            </span>
          )}

        </div>


        {/* ORIGINAL LANGUAGE */}

        <div className="form-field">

        <label htmlFor="production_company">
  Production Company
</label>

          <div className="input-wrapper select-wrapper">

            <span className="input-icon">
              🌐
            </span>

            <select
              id="original_language"
              value={predictionData.original_language}
              onChange={(e) =>
                updateField(
                  "original_language",
                  e.target.value
                )
              }
            >
              <option value="en">
                English
              </option>

              <option value="ta">
                Tamil
              </option>

              <option value="hi">
                Hindi
              </option>

              <option value="te">
                Telugu
              </option>

              <option value="ml">
                Malayalam
              </option>

              <option value="kn">
                Kannada
              </option>
            </select>

          </div>

          {fieldErrors?.original_language && (
            <span className="field-error">
              {fieldErrors.original_language}
            </span>
          )}

        </div>


        {/* PRODUCTION COMPANY */}

        <div className="form-field full-width">

          <label htmlFor="production_company">
            Production Company
          </label>

          <div className="input-wrapper">

            <span className="input-icon">
              🏢
            </span>

            <input
              id="production_company"
              type="text"
              value={predictionData.production_company}
              onChange={(e) =>
                updateField(
                  "production_company",
                  e.target.value
                )
              }
              placeholder="Enter production company"
              autoComplete="organization"
            />

          </div>

          {fieldErrors?.production_company && (
            <span className="field-error">
              {fieldErrors.production_company}
            </span>
          )}

        </div>

      </div>

    </section>
  );
}

export default MovieProfileSection;