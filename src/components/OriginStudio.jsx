import { useState } from 'react'
import { DRINKS, ORIGINS } from '../menu'

/**
 * The beans.
 *
 * The old version put an abstract gradient sphere where the farm should be —
 * a shape standing in for a place. This shows the two real things instead:
 * what a buyer would actually ask (altitude, varietal, process, harvest,
 * producer) and the cup the lot ends up in, photographed.
 */
export function OriginStudio({ images, onAdd }) {
  const [active, setActive] = useState(0)
  const origin = ORIGINS[active]
  const drink = DRINKS.find((d) => d.name === origin.becomes)

  return (
    <section className="origin-studio reveal" id="origin">
      <header className="origin-head">
        <div>
          <p className="kicker">The beans</p>
          <h2>
            Three farms.<br />
            No middlemen.
          </h2>
        </div>
        <p className="origin-intro">
          We buy three lots a year, directly, and we name the people who grew them. When a lot runs out it comes off
          the menu until the next harvest — which is the honest way round, even when it is the inconvenient one.
        </p>
      </header>

      <div className="origin-tabs" role="tablist" aria-label="Coffee origins">
        {ORIGINS.map((item, i) => (
          <button
            key={item.id}
            role="tab"
            id={`origin-tab-${i}`}
            aria-selected={i === active}
            aria-controls="origin-panel"
            className={i === active ? 'active' : ''}
            onClick={() => setActive(i)}
          >
            <i>{item.index}</i>
            <b>{item.id}</b>
            <span>{item.place}</span>
          </button>
        ))}
      </div>

      <div className="origin-panel" id="origin-panel" role="tabpanel" aria-labelledby={`origin-tab-${active}`}>
        <div className="origin-lede">
          <h3>
            {origin.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h3>
          <p className="origin-copy">{origin.copy}</p>

          <ul className="origin-notes">
            {origin.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="origin-facts">
          <dl className="origin-spec">
            {origin.spec.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div className="origin-producer">
              <dt>Grown by</dt>
              <dd>{origin.producer}</dd>
            </div>
          </dl>

          <div className="origin-profile">
            <p className="origin-profile-label">In the cup</p>
            {origin.profile.map(([label, value]) => (
              <div className="profile-row" key={label}>
                <span>{label}</span>
                {/* aria-hidden on the bar: the number beside it already says
                    it, and a decorative meter read twice is noise. */}
                <span className="profile-bar" aria-hidden="true">
                  <i style={{ '--fill': `${value}%`, '--tone': origin.tone }} />
                </span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>

        {/* The point of the section: this bean is not an abstraction, it is
            the drink you can order two sections down. */}
        <figure className="origin-cup">
          <img src={images[drink.img]} alt={drink.name} loading="lazy" width="900" height="1125" />
          <figcaption>
            <span>Becomes</span>
            <b>{drink.name}</b>
            <button type="button" onClick={() => onAdd(drink)}>
              Add to order <i>+</i>
            </button>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
