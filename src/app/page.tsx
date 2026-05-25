import Link from "next/link";

// Static-export entry point: pick a language (saved preference → browser → English)
// and redirect. Visible links are the no-JS fallback.
const REDIRECT = `(function(){try{var s=localStorage.getItem('lang');}catch(e){}var n=(navigator.language||'').toLowerCase();var lang=(s==='he'||s==='en')?s:(n.indexOf('he')===0?'he':'en');location.replace('/'+lang+'/');})();`;

export default function RootRedirect() {
  return (
    <main className="page" style={{ textAlign: "center" }}>
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <h1 className="hero" style={{ fontSize: 22, marginTop: 40 }}>
        Algorithms 2 — Interactive Notes
      </h1>
      <p style={{ marginTop: 16 }}>
        <Link href="/en/">English</Link>
        {" · "}
        <Link href="/he/">עברית</Link>
      </p>
    </main>
  );
}
