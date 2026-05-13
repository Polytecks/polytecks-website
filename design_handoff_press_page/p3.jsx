/* global React, PRESS_ITEMS, PUBLICATIONS, TopNav, Footer, PressContact, FeaturedCarousel */

const PRESS_PAGE_SIZE = 10;
const PUB_PAGE_SIZE = 10;

function PagerArrows({ page, totalPages, onChange, theme }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const cls = theme === "light" ? "fc-btn fc-btn-light" : "fc-btn";
  return (
    <div className="p3-arrows">
      <button
        className={cls}
        aria-label="Previous page"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      <button
        className={cls}
        aria-label="Next page"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
    </div>
  );
}

function PressRow({ item }) {
  return (
    <a className="p3-press-row" href={item.href}>
      <div className="p3-press-left">
        <span className="p3-press-date">{item.date}</span>
        <span className="p3-press-outlet">{item.outlet}</span>
      </div>
      <div className="p3-press-mid">
        <h3 className="p3-press-title">
          {item.fabricated ? <span className="fab-tag">FAB</span> : null}
          {item.title}
        </h3>
        {item.type === "podcast" ? (
          <span className="p3-press-tag podcast">Podcast</span>
        ) : (
          <span className="p3-press-tag">Article</span>
        )}
      </div>
      <div className="p3-press-arrow">→</div>
    </a>
  );
}

function PubBlock({ pub, n }) {
  return (
    <article className="p3-pub-block">
      <div className="p3-pub-num">{String(n).padStart(2, "0")}</div>
      <div className="p3-pub-body">
        <div className="p3-pub-authors">
          {pub.authors.join(", ")}
          {pub.fabricated ? <span className="fab-tag-light" style={{ marginLeft: 10 }}>FAB</span> : null}
        </div>
        <h3 className="p3-pub-title">{pub.title}</h3>
        <div className="p3-pub-foot">
          <em className="p3-pub-journal">{pub.journal}</em>
          <span className="p3-pub-vol">Vol. {pub.volume} · {pub.pages} · {pub.year}</span>
          <a className="p3-pub-doi" href={`https://doi.org/${pub.doi}`}>doi:{pub.doi} ↗</a>
        </div>
        <div className="p3-pub-aff">{pub.affiliation}</div>
      </div>
    </article>
  );
}

function PressSection() {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(PRESS_ITEMS.length / PRESS_PAGE_SIZE));
  const start = (page - 1) * PRESS_PAGE_SIZE;
  const items = PRESS_ITEMS.slice(start, start + PRESS_PAGE_SIZE);

  return (
    <section className="p3-press-section">
      <div className="p3-section-head">
        <span className="section-eyebrow">Articles</span>
        <div className="p3-section-row">
          <h2 className="p3-section-title">
            In the <em>conversation.</em>
          </h2>
          <PagerArrows page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <div className="p3-press-list">
        {items.map(item => <PressRow key={item.id} item={item} />)}
      </div>
    </section>
  );
}

function PubSection() {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(PUBLICATIONS.length / PUB_PAGE_SIZE));
  const start = (page - 1) * PUB_PAGE_SIZE;
  const items = PUBLICATIONS.slice(start, start + PUB_PAGE_SIZE);

  return (
    <section className="p3-pub-section">
      <div className="p3-section-head p3-section-head-light">
        <span className="section-eyebrow light">Publications</span>
        <div className="p3-section-row">
          <h2 className="p3-section-title-light">
            And in the <em>record.</em>
          </h2>
          <PagerArrows page={page} totalPages={totalPages} onChange={setPage} theme="light" />
        </div>
      </div>
      <div className="p3-pub-list">
        {items.map((pub, i) => <PubBlock key={pub.id} pub={pub} n={start + i + 1} />)}
      </div>
    </section>
  );
}

function PressPageP3() {
  return (
    <>
      <TopNav />
      <main>
        {/* Header — dark */}
        <section className="page-head">
          <div className="eyebrow">Press &amp; Publications</div>
          <h1 className="display-h1">
            Capturing signals from the body. <em>Generating signals in the world.</em>
          </h1>
        </section>

        {/* Featured carousel — dark */}
        <FeaturedCarousel items={PRESS_ITEMS} />

        {/* PRESS section — leads. Dark. */}
        <PressSection />

        {/* PUBLICATIONS section — light. */}
        <PubSection />

        <PressContact />
      </main>
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PressPageP3 />);
