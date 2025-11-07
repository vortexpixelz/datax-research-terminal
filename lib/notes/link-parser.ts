/**
 * Note Link Parser
 * Extracts and parses WikiLink references from note content
 */

export interface ParsedLink {
  title: string
  alias?: string
  start: number
  end: number
}

/**
 * Extract all WikiLinks from note content
 * Supports [[Note Title]] and [[Note Title|Display Text]] syntax
 */
export function extractLinks(content: string): ParsedLink[] {
  const links: ParsedLink[] = []
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

  let match
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    links.push({
      title: match[1].trim(),
      alias: match[2]?.trim(),
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return links
}

/**
 * Replace a WikiLink with new content
 */
export function replaceLink(
  content: string,
  link: ParsedLink,
  newLink: string
): string {
  return content.substring(0, link.start) + newLink + content.substring(link.end)
}

/**
 * Create a WikiLink from title and optional alias
 */
export function createLink(title: string, alias?: string): string {
  if (alias) {
    return `[[${title}|${alias}]]`
  }
  return `[[${title}]]`
}

/**
 * Get unique note titles referenced in content
 */
export function getReferencedTitles(content: string): string[] {
  const links = extractLinks(content)
  return [...new Set(links.map((link) => link.title))]
}

/**
 * Check if content contains a link to a specific note
 */
export function containsLink(content: string, title: string): boolean {
  const links = extractLinks(content)
  return links.some((link) => link.title === title)
}

/**
 * Replace all occurrences of a note title in links
 * Useful when renaming a note
 */
export function renameLinkedNote(
  content: string,
  oldTitle: string,
  newTitle: string
): string {
  const links = extractLinks(content)

  // Sort by start position in reverse to maintain correct positions
  const sortedLinks = links.sort((a, b) => b.start - a.start)

  let result = content
  for (const link of sortedLinks) {
    if (link.title === oldTitle) {
      const newLink = createLink(newTitle, link.alias)
      result = replaceLink(result, link, newLink)
    }
  }

  return result
}

/**
 * Format note content for display by replacing WikiLinks with markdown links
 */
export function formatContentForDisplay(
  content: string,
  onLinkClick?: (title: string) => void
): string {
  const links = extractLinks(content)

  // Sort by start position in reverse to maintain correct positions
  const sortedLinks = links.sort((a, b) => b.start - a.start)

  let result = content
  for (const link of sortedLinks) {
    const displayText = link.alias || link.title
    const markdownLink = `[${displayText}](/notes?q=${encodeURIComponent(link.title)})`
    result = replaceLink(result, link, markdownLink)
  }

  return result
}

/**
 * Get backlinks - find all notes that link to a given note
 * This is a client-side helper; server should handle the actual queries
 */
export function suggestNotesForLink(
  content: string,
  existingNotes: string[]
): string[] {
  const referenced = getReferencedTitles(content)
  return existingNotes.filter(
    (note) =>
      referenced.some((ref) => note.toLowerCase().includes(ref.toLowerCase())) ||
      referenced.some((ref) => ref.toLowerCase().includes(note.toLowerCase()))
  )
}
