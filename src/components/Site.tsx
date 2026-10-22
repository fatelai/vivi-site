import { useEffect, useState } from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import type { SiteQuery, SiteQueryVariables } from "../../tina/__generated__/types";

type Props = { query: string; variables: SiteQueryVariables; data: SiteQuery };

// 把「按 Enter 換行」的文字轉成 <br />
const Lines = ({ text }: { text?: string | null }) => (
  <>
    {(text ?? "").split("\n").map((line, i) => (
      <span key={i}>{i > 0 && <br />}{line}</span>
    ))}
  </>
);

// 後台存的圖片路徑是 /uploads/xxx.jpg，放在 GitHub Pages 子路徑時要加上前綴
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const asset = (src?: string | null) => (src && src.startsWith("/") ? BASE + src : src ?? "");

// 後台「網站配色」蓋過 global.css 的顏色變數；只接受 #RRGGBB，沒填的沿用預設色
const HEX = /^#[0-9a-f]{6}$/i;
const themeCSS = (theme?: { button?: string | null; background?: string | null; section?: string | null } | null) => {
  const vars: string[] = [];
  if (theme?.button && HEX.test(theme.button)) vars.push(`--accent:${theme.button}`);
  if (theme?.background && HEX.test(theme.background)) vars.push(`--ground:${theme.background}`);
  if (theme?.section && HEX.test(theme.section)) vars.push(`--panel:${theme.section}`);
  return vars.length ? `:root{${vars.join(";")}}` : "";
};

// 把 YouTube / Instagram 網址轉成可以嵌入的播放器網址；認不得的網址回傳 null
const embedUrl = (url?: string | null) => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt[1]}`, kind: "youtube" };
  const ig = url.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel)\/([\w-]+)/);
  if (ig) return { src: `https://www.instagram.com/${ig[1]}/${ig[2]}/embed`, kind: "instagram" };
  return null;
};

// 頌缽聲波：同心圓，越外圈越淡
const Rings = ({ radii, className }: { radii: number[]; className: string }) => (
  <svg className={className} viewBox="0 0 600 600" aria-hidden="true">
    {radii.map((r, i) => (
      <circle key={r} cx="300" cy="300" r={r} style={{ strokeOpacity: 0.55 - i * 0.1 }} />
    ))}
  </svg>
);

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
  </svg>
);

const NAV = [["#about", "關於 Vivi"], ["#sessions", "課程"], ["#upcoming", "近期場次"], ["#listen", "聆聽"], ["#visit", "交通與預約"]];

export default function Site(props: Props) {
  const { data } = useTina(props);
  const { brand, hero, quote, about, classes, journey, schedule, videos, testimonials, gallery, cta, signup, theme, contact } = data.site;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 所有「預約」按鈕都連到後台設定的 LINE 連結，另開分頁
  const signupLink = { href: signup?.url || "#", target: "_blank", rel: "noopener" };

  return (
    <>
      <style>{themeCSS(theme)}</style>

      {/* 導覽列 */}
      <header className={`nav${scrolled || menuOpen ? " scrolled" : ""}`}>
        <div className="wrap nav-inner">
          <a href="#top" className="logo" data-tina-field={tinaField(brand)}>
            <em>{brand?.name}</em> <span>{brand?.suffix}</span>
          </a>
          <button className="nav-toggle" aria-label="開啟選單" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
          <nav className={`nav-links${menuOpen ? " open" : ""}`} aria-label="主選單">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a className="btn btn-sm" {...signupLink} data-tina-field={tinaField(signup, "url")}>LINE 預約</a>
          </nav>
        </div>
      </header>

      {/* 主視覺 */}
      <section className="hero" id="top">
        <div className="wrap hero-inner">
          <div className="hero-text">
            <p className="eyebrow" data-tina-field={tinaField(hero, "eyebrow")}>{hero?.eyebrow}</p>
            <h1 data-tina-field={tinaField(hero, "title")}><Lines text={hero?.title} /></h1>
            <p className="hero-sub" data-tina-field={tinaField(hero, "subtitle")}>{hero?.subtitle}</p>
            <div className="actions">
              <a className="btn" {...signupLink} data-tina-field={tinaField(hero, "primaryLabel")}>{hero?.primaryLabel}</a>
              <a className="btn btn-ghost" href="#listen" data-tina-field={tinaField(hero, "secondaryLabel")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4" /></svg>
                {hero?.secondaryLabel}
              </a>
            </div>
            <p className="hero-meta">
              {classes?.items?.map((c, i) => (
                <span key={i}>{i > 0 && <i aria-hidden="true">·</i>}{c?.title}</span>
              ))}
            </p>
          </div>
          <div className="hero-art" data-tina-field={tinaField(hero, "image")}>
            <Rings className="rings" radii={[120, 170, 220, 270, 298]} />
            {hero?.image && <img src={asset(hero.image)} alt="Vivi 在課堂中手持頌缽，學員躺在地墊上聆聽" />}
          </div>
        </div>
      </section>

      {/* 一句話 */}
      {quote?.text && (
        <section className="quote">
          <div className="wrap">
            <p className="eyebrow" data-tina-field={tinaField(quote, "author")}>— {quote.author}</p>
            <blockquote data-tina-field={tinaField(quote, "text")}><Lines text={quote.text} /></blockquote>
          </div>
        </section>
      )}

      {/* 關於 Vivi */}
      <section className="section" id="about">
        <div className="wrap about">
          <div className="about-art">
            {about?.image && <img className="about-main" src={asset(about.image)} alt="地上的頌缽與燭光" data-tina-field={tinaField(about, "image")} />}
            {about?.image2 && <img className="about-arch" src={asset(about.image2)} alt={`${brand?.name ?? ""} 敲奏頌缽`} data-tina-field={tinaField(about, "image2")} />}
          </div>
          <div>
            <p className="eyebrow" data-tina-field={tinaField(about, "eyebrow")}>{about?.eyebrow}</p>
            <h2 data-tina-field={tinaField(about, "heading")}><Lines text={about?.heading} /></h2>
            {about?.paragraphs?.map((p, i) => (
              <p className="body" key={i} data-tina-field={tinaField(about, "paragraphs", i)}>{p}</p>
            ))}
            <ol className="timeline">
              {about?.timeline?.map((t, i) => (
                <li key={i} data-tina-field={tinaField(t)}><span>{t?.year}</span>{t?.text}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 課程 */}
      <section className="section panel" id="sessions">
        <div className="wrap">
          <div className="head-row">
            <div>
              <p className="eyebrow" data-tina-field={tinaField(classes, "eyebrow")}>{classes?.eyebrow}</p>
              <h2 data-tina-field={tinaField(classes, "heading")}><Lines text={classes?.heading} /></h2>
            </div>
            <p data-tina-field={tinaField(classes, "intro")}>{classes?.intro}</p>
          </div>
          {classes?.items?.map((c, i) => (
            <article className={`offer${i % 2 ? " flip" : ""}`} key={i}>
              {c?.image && <img src={asset(c.image)} alt={c.title ?? ""} data-tina-field={tinaField(c, "image")} />}
              <div>
                <p className="num">{String(i + 1).padStart(2, "0")}</p>
                <h3 data-tina-field={tinaField(c, "title")}>{c?.title}</h3>
                <p className="body" data-tina-field={tinaField(c, "description")}>{c?.description}</p>
                <dl className="facts">
                  <div><dt>時長</dt><dd data-tina-field={tinaField(c, "duration")}>{c?.duration}</dd></div>
                  <div><dt>方式</dt><dd data-tina-field={tinaField(c, "tag")}>{c?.tag}</dd></div>
                  <div><dt>費用</dt><dd data-tina-field={tinaField(c, "price")}>{c?.price}</dd></div>
                </dl>
                {c?.linkLabel && (
                  <a className="text-link" {...(i === 0 ? { href: "#upcoming" } : signupLink)} data-tina-field={tinaField(c, "linkLabel")}>
                    {c.linkLabel}<Arrow />
                  </a>
                )}
              </div>
            </article>
          ))}
          {classes?.note && <p className="note" data-tina-field={tinaField(classes, "note")}>{classes.note}</p>}
        </div>
      </section>

      {/* 一場音療的流程 */}
      <section className="section">
        <div className="wrap">
          <div className="head-center">
            <p className="eyebrow" data-tina-field={tinaField(journey, "eyebrow")}>{journey?.eyebrow}</p>
            <h2 data-tina-field={tinaField(journey, "heading")}><Lines text={journey?.heading} /></h2>
          </div>
          <ol className="steps">
            {journey?.steps?.map((s, i, all) => (
              <li key={i} data-tina-field={tinaField(s)}>
                <svg viewBox="0 0 96 96" aria-hidden="true">
                  <circle cx="48" cy="48" r="10" className={i === all.length - 1 ? "hollow" : "dot"} />
                  {[24, 36, 46].slice(0, Math.min(i + 1, 3)).map((r, k) => (
                    <circle key={r} cx="48" cy="48" r={r} className="ring" style={{ strokeOpacity: 0.45 - k * 0.13 }} />
                  ))}
                </svg>
                <h3>{s?.title}</h3>
                <p>{s?.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 近期場次 */}
      <section className="section panel" id="upcoming">
        <div className="wrap narrow">
          <div className="head-row">
            <div>
              <p className="eyebrow" data-tina-field={tinaField(schedule, "eyebrow")}>{schedule?.eyebrow}</p>
              <h2 data-tina-field={tinaField(schedule, "heading")}><Lines text={schedule?.heading} /></h2>
            </div>
            <p data-tina-field={tinaField(schedule, "note")}>{schedule?.note}</p>
          </div>
          <ul className="program">
            {schedule?.items?.map((s, i) => (
              <li key={i} data-tina-field={tinaField(s)}>
                <div className="when"><strong>{s?.date}</strong><span>{s?.time}</span></div>
                <div className="what"><h3>{s?.title}</h3><p>{s?.note}</p></div>
                <a className="btn btn-outline btn-sm" {...signupLink}>預約</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 聆聽：影片，沒有影片時整個區塊不顯示 */}
      {!!videos?.items?.length && (
        <section className="section" id="listen">
          <div className="wrap listen">
            <div className="listen-text">
              <p className="eyebrow" data-tina-field={tinaField(videos, "eyebrow")}>{videos?.eyebrow}</p>
              <h2 data-tina-field={tinaField(videos, "heading")}><Lines text={videos?.heading} /></h2>
              <p className="body" data-tina-field={tinaField(videos, "intro")}>{videos?.intro}</p>
            </div>
            <div className="videos">
              {videos.items.map((v, i) => {
                const embed = embedUrl(v?.url);
                return (
                  <figure key={i} data-tina-field={tinaField(v)}>
                    {embed
                      ? <iframe className={`video-${embed.kind}`} src={embed.src} title={v?.title ?? "影片"} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
                      : <div className="video-missing">請貼上 YouTube 或 Instagram 網址</div>}
                    {v?.title && <figcaption>{v.title}</figcaption>}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 學員回饋 */}
      <section className="section panel" id="testimonials">
        <div className="wrap">
          <div className="head-center">
            <p className="eyebrow" data-tina-field={tinaField(testimonials, "eyebrow")}>{testimonials?.eyebrow}</p>
            <h2 data-tina-field={tinaField(testimonials, "heading")}><Lines text={testimonials?.heading} /></h2>
          </div>
          <div className="voices">
            {testimonials?.items?.map((t, i) => (
              <figure key={i} data-tina-field={tinaField(t)}>
                <span aria-hidden="true">“</span>
                <blockquote>{t?.quote}</blockquote>
                <figcaption>{t?.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 照片帶 */}
      {!!gallery?.images?.length && (
        <section className="gallery" aria-label="上課現場照片">
          <div className="wrap gallery-grid">
            {gallery.images.map((g, i) => g?.src && (
              <img key={i} src={asset(g.src)} alt={g.alt ?? ""} data-tina-field={tinaField(g)} />
            ))}
          </div>
        </section>
      )}

      {/* 交通與預約 */}
      <section className="section" id="visit">
        <div className="wrap">
          <div className="visit">
            <Rings className="visit-rings" radii={[90, 150, 210, 270]} />
            <div className="visit-text">
              <h2 data-tina-field={tinaField(cta, "heading")}>{cta?.heading}</h2>
              <p data-tina-field={tinaField(cta, "text")}>{cta?.text}</p>
              <a className="btn btn-dark" {...signupLink} data-tina-field={tinaField(cta, "button")}>{cta?.button}</a>
            </div>
            <dl className="visit-info" id="contact">
              {contact?.address && <div><dt>地址</dt><dd data-tina-field={tinaField(contact, "address")}>{contact.address}</dd></div>}
              {contact?.line && <div><dt>LINE</dt><dd data-tina-field={tinaField(contact, "line")}>{contact.line}</dd></div>}
              {contact?.email && <div><dt>EMAIL</dt><dd data-tina-field={tinaField(contact, "email")}>{contact.email}</dd></div>}
              {contact?.phone && <div><dt>電話</dt><dd data-tina-field={tinaField(contact, "phone")}>{contact.phone}</dd></div>}
              {contact?.socials?.map((s, i) => (
                <div key={i} data-tina-field={tinaField(s)}>
                  <dt>{s?.label?.toUpperCase()}</dt>
                  <dd><a href={s?.url ?? "#"} target="_blank" rel="noopener">{s?.handle || s?.url}</a></dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 頁尾 */}
      <footer className="footer">
        <div className="wrap footer-inner">
          <a href="#top" className="logo"><em>{brand?.name}</em> <span>{brand?.suffix}</span></a>
          <p>
            <span data-tina-field={tinaField(contact, "tagline")}>{contact?.tagline}</span>
            <span data-tina-field={tinaField(contact, "copyright")}>{contact?.copyright}</span>
          </p>
        </div>
      </footer>
    </>
  );
}
