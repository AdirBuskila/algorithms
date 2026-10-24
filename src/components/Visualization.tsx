export default function Visualization({
  file,
  height,
  title,
  caption,
}: {
  file: string;
  height: number;
  title: string;
  caption?: string;
}) {
  // Each widget lives at public/visualizations/<name>/index.html (the `file`
  // frontmatter value is "<name>.html"). With trailingSlash:true, static hosts
  // (Vercel, GitHub Pages, `serve`) serve the directory form `/.../<name>/`;
  // `next dev` has no directory-index for public/, so it needs the explicit
  // index.html. If you deploy under a GitHub Pages subpath, prefix with basePath.
  const dir = `/visualizations/${file.replace(/\.html$/, "")}`;
  const src =
    process.env.NODE_ENV === "development" ? `${dir}/index.html` : `${dir}/`;
  return (
    <figure className="viz">
      <iframe
        className="viz-frame"
        src={src}
        style={{ height: `${height}px` }}
        loading="lazy"
        title={title}
      />
      <figcaption className="viz-cap" dir={caption ? "rtl" : undefined}>
        {caption ??
          "↑ Interactive — step through with the buttons or the ◀ ▶ arrow keys (click the widget first)."}
      </figcaption>
    </figure>
  );
}
