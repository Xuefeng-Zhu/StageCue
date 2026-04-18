import JSZip from 'jszip'

export interface ParsedSlide {
  index: number
  title: string
  notes: string
}

export interface ParsedPresentation {
  title: string
  slides: ParsedSlide[]
}

/**
 * Extract plain text from an XML string by stripping all tags.
 * Handles <a:p> paragraph breaks as newlines and <a:r> runs as inline text.
 */
function extractTextFromXml(xml: string): string {
  // Split on paragraph boundaries (<a:p>) to preserve line breaks
  const paragraphs = xml.split(/<a:p\b[^>]*>/i)
  const lines: string[] = []

  for (const para of paragraphs) {
    // Extract text from <a:t> tags within this paragraph
    const textMatches = para.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi)
    if (textMatches) {
      const lineText = textMatches
        .map((m) => m.replace(/<\/?a:t[^>]*>/gi, ''))
        .join('')
      lines.push(lineText)
    }
  }

  return lines
    .filter((l) => l.length > 0)
    .join('\n')
    .trim()
}

/**
 * Try to extract a slide title from slide XML.
 * Looks for shapes with placeholder type "title" or "ctrTitle".
 */
function extractSlideTitle(slideXml: string): string {
  // Look for title placeholder shapes
  // <p:ph type="title"/> or <p:ph type="ctrTitle"/>
  const titlePattern = /<p:sp\b[\s\S]*?<p:ph[^>]*type="(?:title|ctrTitle)"[\s\S]*?<\/p:sp>/gi
  const matches = slideXml.match(titlePattern)

  if (matches && matches.length > 0) {
    const text = extractTextFromXml(matches[0])
    if (text) return text
  }

  return ''
}

/**
 * Parse a PPTX file (ArrayBuffer) and extract slide titles and notes.
 */
export async function parsePptx(buffer: ArrayBuffer): Promise<ParsedPresentation> {
  const zip = await JSZip.loadAsync(buffer)

  // Try to get presentation title from docProps/core.xml
  let presentationTitle = 'Imported Presentation'
  const coreXml = zip.file('docProps/core.xml')
  if (coreXml) {
    const coreText = await coreXml.async('text')
    const titleMatch = coreText.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i)
    if (titleMatch && titleMatch[1].trim()) {
      presentationTitle = titleMatch[1].trim()
    }
  }

  // Find all slide files (ppt/slides/slide1.xml, slide2.xml, ...)
  const slideFiles: { index: number; path: string }[] = []
  zip.forEach((path) => {
    const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/)
    if (match) {
      slideFiles.push({ index: parseInt(match[1], 10), path })
    }
  })
  slideFiles.sort((a, b) => a.index - b.index)

  const slides: ParsedSlide[] = []

  for (const { index, path } of slideFiles) {
    // Extract slide title
    const slideXml = await zip.file(path)!.async('text')
    let title = extractSlideTitle(slideXml)
    if (!title) {
      title = `Slide ${index}`
    }

    // Extract notes from corresponding notesSlide
    let notes = ''
    const notesPath = `ppt/notesSlides/notesSlide${index}.xml`
    const notesFile = zip.file(notesPath)
    if (notesFile) {
      const notesXml = await notesFile.async('text')
      // Notes XML contains the notes text in <a:t> tags,
      // but also contains the slide number placeholder.
      // The notes body is typically in the second <p:sp> shape.
      // We extract all text and filter out just the slide number.
      const rawNotes = extractTextFromXml(notesXml)
      // Remove standalone slide number lines (just a number matching the slide index)
      notes = rawNotes
        .split('\n')
        .filter((line) => line.trim() !== String(index))
        .join('\n')
        .trim()
    }

    slides.push({ index, title, notes })
  }

  return { title: presentationTitle, slides }
}
