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
  if (theme?.button && HEX.test(theme.button)) vars.push(`--sage:${theme.button}`, `--sage-dark:color-mix(in srgb, ${theme.button} 75%, #000)`);
  if (theme?.background && HEX.test(theme.background)) vars.push(`--cream:${theme.background}`);
  if (theme?.section && HEX.test(theme.section)) vars.push(`--sand:${theme.section}`);
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

export default function Site(props: Props) {
  const { data } = useTina(props);
  const { brand, hero, about, classes, schedule, videos, testimonials, cta, signup, theme, contact } = data.site;

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
        <div className="container nav-inner">
          <a href="#top" className="logo" data-tina-field={tinaField(brand)}>
            {brand?.name} <span>{brand?.suffix}</span>
          </a>
          <button className="nav-toggle" aria-label="開啟選單" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
          <nav className={`nav-links${menuOpen ? " open" : ""}`}>
            {[["#about", "關於 Vivi"], ["#classes", "課程"], ["#schedule", "近期場次"], ["#videos", "影片"],["#testimonials", "學員回饋"], ["#contact", "聯絡"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a className="btn btn-primary btn-sm" {...signupLink} data-tina-field={tinaField(signup, "url")}>LINE 預約</a>
          </nav>
        </div>
      </header>

      {/* 主視覺 */}
      <section className="hero" id="top">
        <div className="hero-bg" data-tina-field={tinaField(hero, "image")}>
          {hero?.image && <img src={asset(hero.image)} alt="頌缽聲音療癒" />}
        </div>
        <div className="container hero-content">
          <p className="eyebrow" data-tina-field={tinaField(hero, "eyebrow")}>{hero?.eyebrow}</p>
          <h1 data-tina-field={tinaField(hero, "title")}><Lines text={hero?.title} /></h1>
          <p className="hero-sub" data-tina-field={tinaField(hero, "subtitle")}><Lines text={hero?.subtitle} /></p>
          <div className="hero-actions">
            <a className="btn btn-primary" {...signupLink} data-tina-field={tinaField(hero, "primaryLabel")}>{hero?.primaryLabel}</a>
            <a href="#classes" className="btn btn-ghost" data-tina-field={tinaField(hero, "secondaryLabel")}>{hero?.secondaryLabel}</a>
          </div>
        </div>
      </section>

      {/* 關於我 */}
      <section className="section" id="about">
        <div className="container about">
          <div className="about-img" data-tina-field={tinaField(about, "image")}>
            {about?.image && <img src={asset(about.image)} alt={brand?.name ?? ""} />}
          </div>
          <div className="about-text">
            <p className="eyebrow" data-tina-field={tinaField(about, "eyebrow")}>{about?.eyebrow}</p>
            <h2 data-tina-field={tinaField(about, "heading")}>{about?.heading}</h2>
            {about?.paragraphs?.map((p, i) => (
              <p key={i} data-tina-field={tinaField(about, "paragraphs", i)}>{p}</p>
            ))}
            <ul className="stats">
              {about?.stats?.map((s, i) => (
                <li key={i} data-tina-field={tinaField(s)}><strong>{s?.value}</strong><span>{s?.label}</span></li>
              ))}
            </ul>
            <div className="certs">
              {about?.certs?.map((c, i) => (
                <span key={i} data-tina-field={tinaField(about, "certs", i)}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 課程 */}
      <section className="section section-alt" id="classes">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow" data-tina-field={tinaField(classes, "eyebrow")}>{classes?.eyebrow}</p>
            <h2 data-tina-field={tinaField(classes, "heading")}>{classes?.heading}</h2>
            <p data-tina-field={tinaField(classes, "intro")}>{classes?.intro}</p>
          </div>
          <div className="cards">
            {classes?.items?.map((c, i) => (
              <article className="card" key={i}>
                {c?.image && <img src={asset(c.image)} alt={c.title ?? ""} data-tina-field={tinaField(c, "image")} />}
                <div className="card-body">
                  {c?.tag && <span className="tag" data-tina-field={tinaField(c, "tag")}>{c.tag}</span>}
                  <h3 data-tina-field={tinaField(c, "title")}>{c?.title}</h3>
                  <p data-tina-field={tinaField(c, "description")}>{c?.description}</p>
                  <div className="card-meta">
                    <span data-tina-field={tinaField(c, "duration")}>{c?.duration}</span>
                    <span data-tina-field={tinaField(c, "price")}>{c?.price}</span>
                  </div>
                  <a className="btn btn-primary btn-block" {...signupLink}>LINE 預約</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 近期場次 */}
      <section className="section" id="schedule">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow" data-tina-field={tinaField(schedule, "eyebrow")}>{schedule?.eyebrow}</p>
            <h2 data-tina-field={tinaField(schedule, "heading")}>{schedule?.heading}</h2>
            <p data-tina-field={tinaField(schedule, "note")}>{schedule?.note}</p>
          </div>
          <ul className="sessions">
            {schedule?.items?.map((s, i) => (
              <li key={i} data-tina-field={tinaField(s)}>
                <div className="session-when"><strong>{s?.date}</strong><span>{s?.time}</span></div>
                <div className="session-what"><h3>{s?.title}</h3>{s?.note && <p>{s.note}</p>}</div>
                <a className="btn btn-primary btn-sm" {...signupLink}>預約</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 影片：沒有影片時整個區塊不顯示 */}
      {!!videos?.items?.length && (
        <section className="section" id="videos">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow" data-tina-field={tinaField(videos, "eyebrow")}>{videos?.eyebrow}</p>
              <h2 data-tina-field={tinaField(videos, "heading")}>{videos?.heading}</h2>
              <p data-tina-field={tinaField(videos, "intro")}>{videos?.intro}</p>
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
      <section className="section section-alt" id="testimonials">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow" data-tina-field={tinaField(testimonials, "eyebrow")}>{testimonials?.eyebrow}</p>
            <h2 data-tina-field={tinaField(testimonials, "heading")}>{testimonials?.heading}</h2>
          </div>
          <div className="quotes">
            {testimonials?.items?.map((t, i) => (
              <blockquote key={i} data-tina-field={tinaField(t)}>
                <p>「{t?.quote}」</p>
                <cite>— {t?.author}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 行動呼籲 */}
      <section className="cta">
        <div className="container cta-inner">
          <h2 data-tina-field={tinaField(cta, "heading")}>{cta?.heading}</h2>
          <p data-tina-field={tinaField(cta, "text")}>{cta?.text}</p>
          <a className="btn btn-light" {...signupLink} data-tina-field={tinaField(cta, "button")}>{cta?.button}</a>
        </div>
      </section>

      {/* 頁尾 / 聯絡 */}
      <footer className="footer" id="contact">
        <div className="container footer-inner">
          <div>
            <a href="#top" className="logo">{brand?.name} <span>{brand?.suffix}</span></a>
            <p data-tina-field={tinaField(contact, "tagline")}>{contact?.tagline}</p>
          </div>
          <div>
            <h4>聯絡方式</h4>
            {contact?.address && <p data-tina-field={tinaField(contact, "address")}>地址：{contact.address}</p>}
            {contact?.email && <p data-tina-field={tinaField(contact, "email")}>Email：{contact.email}</p>}
            {contact?.phone && <p data-tina-field={tinaField(contact, "phone")}>電話：{contact.phone}</p>}
            {contact?.line && <p data-tina-field={tinaField(contact, "line")}>LINE：{contact.line}</p>}
          </div>
          <div>
            <h4>追蹤我</h4>
            <p>
              {contact?.socials?.map((s, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  <a href={s?.url ?? "#"} target="_blank" rel="noopener" data-tina-field={tinaField(s)}>{s?.label}</a>
                </span>
              ))}
            </p>
          </div>
        </div>
        <p className="copyright" data-tina-field={tinaField(contact, "copyright")}>{contact?.copyright}</p>
      </footer>
    </>
  );
}
