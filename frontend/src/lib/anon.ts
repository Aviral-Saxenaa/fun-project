export function getAnonymousId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("ghosted_anon_id")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("ghosted_anon_id", id)
  }
  return id
}
