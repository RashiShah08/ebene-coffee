import { StreetMap } from './StreetMap'

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=12+Church+Street+Bengaluru+560001'

const DETAILS = [
  { label: 'Find us', lines: ['12 Church Street', 'Bengaluru 560001'] },
  { label: 'Open', lines: ['Daily', '8am — 10pm'] },
  { label: 'After six', lines: ['Espresso cocktails', 'Vinyl on Fridays'] },
]

/**
 * Visit — the reserve banner and the after-dark panel merged into one, framed
 * as wayfinding: where the shop is, when it is open, and the two things you
 * can do about it.
 */
export function VisitSection({ onReserve }) {
  return (
    <section className="visit-section reveal" id="visit">
      <div className="visit-head">
        <div>
          <p className="kicker">Visit</p>
          <h2>Stay awhile.</h2>
        </div>
        <p className="visit-lead">
          Walk in for coffee, or reserve a corner for the conversations that deserve more time. After six the bar turns
          to espresso cocktails, plates made for passing around, and a record on.
        </p>
      </div>

      <div className="visit-body">
        <figure className="visit-map">
          <StreetMap />
          <figcaption>Between Brigade Road and St Marks Road</figcaption>
        </figure>

        <div className="visit-details">
          <dl>
            {DETAILS.map(({ label, lines }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  {lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </dd>
              </div>
            ))}
            <div>
              <dt>Call</dt>
              <dd>
                <a href="tel:+918040002100">+91 80 4000 2100</a>
              </dd>
            </div>
          </dl>

          <div className="visit-actions">
            <button className="button button-light" onClick={onReserve}>
              Make a reservation <i>↗</i>
            </button>
            <a className="text-link" href={MAPS_URL} target="_blank" rel="noreferrer noopener">
              Get directions <i>↗</i>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
