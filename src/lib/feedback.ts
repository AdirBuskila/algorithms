// Feedback mail address, assembled at runtime so it never appears as one literal in the
// source or in the pre-rendered HTML (a light defence against address scrapers).
export function feedbackAddress(): string {
  return ["adirbu98", "gmail.com"].join("@");
}

export function feedbackHref(subject: string, body?: string): string {
  return (
    "mailto:" +
    feedbackAddress() +
    "?subject=" +
    encodeURIComponent(subject) +
    (body ? "&body=" + encodeURIComponent(body) : "")
  );
}
