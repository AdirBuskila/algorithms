export default function Visualization({
  file,
  height,
  title,
}: {
  file: string;
  height: number;
  title: string;
}) {
  // Root-relative path into public/visualizations/. If you deploy under a
  // GitHub Pages subpath, prefix this with your basePath.
  const src = `/visualizations/${file}`;
  return (
    <figure className="viz">
      <iframe
        className="viz-frame"
        src={src}
        style={{ height: `${height}px` }}
        loading="lazy"
        title={title}
      />
      <figcaption className="viz-cap">
        ↑ Interactive — step through with the buttons or the ◀ ▶ arrow keys
        (click the widget first).
      </figcaption>
    </figure>
  );
}
