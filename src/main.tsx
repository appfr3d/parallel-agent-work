import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import '@kilden/designsystem/styles.css';
import './styles.css';
import type { Article } from '../shared/news';

const API = '/api';
const categories = ['Alle saker', 'Utvikling', 'Design', 'Strategi', 'Arbeidsliv'] as const;
type CategoryFilter = (typeof categories)[number];
type IconName = 'search' | 'arrow' | 'back' | 'menu' | 'close';
const dateFormat = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long' });

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></>,
    arrow: <><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></>,
    back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ArticleCard({ article, large = false, onOpen }: { article: Article; large?: boolean; onOpen: (slug: string) => void }) {
  return <button className={`article-card ${large ? 'article-card--large' : ''}`} onClick={() => onOpen(article.slug)}>
    <span className="card-image-wrap"><img src={article.image} alt={article.imageAlt} className="card-image" loading="lazy" /><span className="image-arrow"><Icon name="arrow" size={18}/></span></span>
    <span className="card-copy"><span className="eyebrow">{article.category}</span><span className="card-title">{article.title}</span><span className="card-subtitle">{article.subtitle}</span><span className="card-meta">{dateFormat.format(new Date(article.publishedAt))} <i>·</i> {article.readTime}</span></span>
  </button>;
}

function Header({ onHome, onCategory, activeCategory, onSearch }: {
  onHome: () => void;
  onCategory: Dispatch<SetStateAction<CategoryFilter>>;
  activeCategory: CategoryFilter;
  onSearch: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
    <div className="topline"><span>NYHETER FRA KONSULENT-NORGE</span><span className="topline-date">OSLO · {new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div>
    <header className="masthead"><button className="wordmark" onClick={onHome} aria-label="BG, til forsiden"><span className="brand-mark">BG</span><span className="brand-name">BEKK'S GANG<span className="brand-dot">.</span></span></button><span className="masthead-note">Det skjer i konsulent-Norge</span><div className="masthead-actions"><button className="icon-button search-toggle" onClick={onSearch} aria-label="Søk"><Icon name="search"/></button><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Lukk meny' : 'Åpne meny'}><Icon name={menuOpen ? 'close' : 'menu'}/><span>{menuOpen ? 'LUKK' : 'MENY'}</span></button></div></header>
    <nav className={`category-nav ${menuOpen ? 'category-nav--open' : ''}`} aria-label="Kategorier">{categories.map((category) => <button key={category} className={activeCategory === category ? 'nav-link is-active' : 'nav-link'} onClick={() => { onCategory(category); setMenuOpen(false); }}>{category}</button>)}<span className="nav-rule"/><span className="nav-tagline">NÆRT. NYSGJERRIG. NORSK.</span></nav>
  </>;
}

function Footer({ onHome }: { onHome: () => void }) {
  return <footer className="footer"><button className="footer-brand" onClick={onHome}>BG<span>.</span></button><div><p>BEKK'S GANG</p><small>Fiktive nyheter. Ekte nysgjerrighet.</small></div><span className="footer-right">LAGET FOR Å LÆRE SAMMEN <span>✳</span></span></footer>;
}

function Home({ articles, category, setCategory, openArticle, openSearch }: {
  articles: Article[];
  category: CategoryFilter;
  setCategory: Dispatch<SetStateAction<CategoryFilter>>;
  openArticle: (slug: string) => void;
  openSearch: () => void;
}) {
  const visible = useMemo(() => category === 'Alle saker' ? articles : articles.filter((item) => item.category.toLowerCase() === category.toLowerCase()), [articles, category]);
  const lead = visible[0];
  const rest = visible.slice(1);
  return <>
    <section className="intro"><div className="intro-kicker"><span className="kicker-line"/> SISTE NYTT <span className="kicker-date">· OPPDATERT I DAG</span></div><h1>Det skjer mer<br/>enn du <em>tror.</em></h1><p>Små og store historier fra folka som bygger, former og tenker fram Norges neste løsning.</p><button className="round-link" onClick={openSearch} aria-label="Søk i BG"><Icon name="search" size={19}/></button><span className="intro-aside">NYE PERSPEKTIVER<br/>HVER UKE <b>↘</b></span></section>
    {lead ? <>
      <section className="lead-section"><div className="section-label"><span>FORSIDEN</span><span>01 — {String(articles.length).padStart(2,'0')}</span></div><ArticleCard article={lead} large onOpen={openArticle}/>{rest.length > 0 && <aside className="lead-aside"><span className="aside-label">FLERE SAKER</span>{rest.slice(0, 3).map((article, index) => <button className="aside-story" key={article.id} onClick={() => openArticle(article.slug)}><span className="aside-index">0{index + 2}</span><span><b>{article.title}</b><small>{article.category} <i>·</i> {article.readTime}</small></span><Icon name="arrow" size={16}/></button>)}<div className="aside-note"><span>✳</span> En liten avis om<br/>store ideer.</div></aside>}</section>
      <section className="latest-section"><div className="section-heading"><div><span className="eyebrow">BLA VIDERE</span><h2>Flere perspektiver<span>.</span></h2></div><span className="section-count">{String(visible.length).padStart(2,'0')} SAKER</span></div><div className="article-grid">{rest.map((article) => <ArticleCard key={article.id} article={article} onOpen={openArticle}/>)}</div></section>
    </> : <div className="empty-state"><span>✳</span><h2>Ingen saker i denne kategorien ennå.</h2><button onClick={() => setCategory('Alle saker')}>Se alle sakene <Icon name="arrow" size={16}/></button></div>}
  </>;
}

function ArticlePage({ article, allArticles, openArticle, onBack }: {
  article: Article;
  allArticles: Article[];
  openArticle: (slug: string) => void;
  onBack: () => void;
}) {
  const more = allArticles.filter((item) => item.slug !== article.slug).slice(0, 2);
  return <>
    <button className="back-link" onClick={onBack}><Icon name="back" size={16}/> TILBAKE TIL FORSIDEN</button>
    <article className="article-page"><div className="article-heading"><span className="eyebrow">{article.category} <i>·</i> {dateFormat.format(new Date(article.publishedAt))}</span><h1>{article.title}</h1><p className="article-subtitle">{article.subtitle}</p><div className="byline"><span className="author-avatar">{article.author.split(' ').map((part) => part[0]).join('')}</span><span><b>{article.author}</b><small>{article.role} <i>·</i> {article.readTime}</small></span></div></div><figure className="article-hero-image"><img src={article.image} alt={article.imageAlt}/><figcaption>{article.imageAlt} <span>ILLUSTRASJON</span></figcaption></figure><div className="article-body-wrap"><aside className="article-share"><span>DEL SAKEN</span><button aria-label="Kopier lenke" onClick={() => navigator.clipboard?.writeText(window.location.href)}>↗</button></aside><div className="article-body">{article.body.map((paragraph, index) => index === 0 ? <p className="article-lead" key={paragraph}>{paragraph}</p> : <p key={paragraph}>{paragraph}</p>)}<div className="article-endmark">✳</div></div></div></article>
    <section className="latest-section related-section"><div className="section-heading"><div><span className="eyebrow">LES OGSÅ</span><h2>Flere perspektiver<span>.</span></h2></div><button className="text-link" onClick={onBack}>ALLE SAKER <Icon name="arrow" size={16}/></button></div><div className="article-grid">{more.map((item) => <ArticleCard key={item.id} article={item} onOpen={openArticle}/>)}</div></section>
  </>;
}

function SearchDialog({ articles, close, openArticle }: {
  articles: Article[];
  close: () => void;
  openArticle: (slug: string) => void;
}) {
  const [query, setQuery] = useState('');
  const result = articles.filter((article) => `${article.title} ${article.subtitle} ${article.category}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { document.body.classList.add('no-scroll'); return () => document.body.classList.remove('no-scroll'); }, []);
  return <div className="search-overlay" onMouseDown={(event) => event.target === event.currentTarget && close()}><div className="search-dialog"><div className="search-dialog-head"><span className="eyebrow">SØK I BG</span><button className="icon-button" onClick={close} aria-label="Lukk søk"><Icon name="close"/></button></div><label className="search-field"><Icon name="search"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hva leter du etter?" /></label><div className="search-results">{result.length ? result.map((article) => <button key={article.id} onClick={() => openArticle(article.slug)}><span className="eyebrow">{article.category}</span><b>{article.title}</b><Icon name="arrow" size={16}/></button>) : <p>Ingen treff. Prøv et annet søk.</p>}</div><span className="search-hint">{result.length} {result.length === 1 ? 'SAK' : 'SAKER'} I ARKIVET</span></div></div>;
}

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('Alle saker');
  const [slug, setSlug] = useState(() => window.location.pathname.split('/').filter(Boolean).pop() || '');
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let isActive = true;
    const loadArticles = async () => {
      try {
        const response = await fetch(`${API}/articles`);
        if (!response.ok) throw new Error('API error');
        const data: Article[] = await response.json();
        if (isActive) setArticles(data);
      } catch {
        if (isActive) setArticles([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    void loadArticles();
    return () => { isActive = false; };
  }, []);
  useEffect(() => { const handlePop = () => setSlug(window.location.pathname.split('/').filter(Boolean).pop() || ''); window.addEventListener('popstate', handlePop); return () => window.removeEventListener('popstate', handlePop); }, []);
  function goHome() { history.pushState({}, '', '/'); setSlug(''); setCategory('Alle saker'); window.scrollTo(0, 0); }
  function openArticle(nextSlug: string) { history.pushState({}, '', `/sak/${nextSlug}`); setSlug(nextSlug); setSearchOpen(false); window.scrollTo(0, 0); }
  const currentArticle = articles.find((item) => item.slug === slug);
  const isArticlePath = window.location.pathname.startsWith('/sak/');
  return <div className="site-shell"><a className="skip-link" href="#main">Hopp til hovedinnhold</a><div className="site-frame"><Header onHome={goHome} onCategory={setCategory} activeCategory={category} onSearch={() => setSearchOpen(true)}/><main id="main" tabIndex={-1}>{loading ? <div className="loading-state">HENTER SISTE NYTT<span>✳</span></div> : isArticlePath && !currentArticle ? <div className="empty-state"><span>✳</span><h2>{articles.length ? 'Denne saken ble ikke funnet.' : 'Får ikke kontakt med redaksjonen.'}</h2><button onClick={goHome}>Til forsiden <Icon name="arrow" size={16}/></button></div> : currentArticle ? <ArticlePage article={currentArticle} allArticles={articles} openArticle={openArticle} onBack={goHome}/> : <Home articles={articles} category={category} setCategory={setCategory} openArticle={openArticle} openSearch={() => setSearchOpen(true)}/>}</main><Footer onHome={goHome}/></div>{searchOpen && <SearchDialog articles={articles} close={() => setSearchOpen(false)} openArticle={openArticle}/>}</div>;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element');
createRoot(rootElement).render(<App/>);
