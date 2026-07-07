export function formatTime(value?: string) {
  if (!value) return "Not checked yet";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function displayFiberSource(source?: string) {
  if (!source) return "Active Fiber node";
  try {
    const url = new URL(source);
    const isLocal =
      url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "::1";
    return isLocal ? "Active Fiber node" : url.host;
  } catch {
    return source;
  }
}

export function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
