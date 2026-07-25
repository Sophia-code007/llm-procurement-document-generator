export function downloadAsDocx(htmlContent, fileName) {
  const wordContent = htmlToWordDoc(htmlContent)
  const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  triggerDownload(blob, fileName)
}

export function downloadTextAsDocx(textContent, fileName) {
  const escapedText = escapeXml(textContent)
  const wordContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<?mso-application progid="Word.Document"?>\n<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"><w:body><w:p><w:r><w:t xml:space="preserve">' + escapedText + '</w:t></w:r></w:p></w:body></w:wordDocument>'
  const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  triggerDownload(blob, fileName)
}

export function downloadMultilineAsDocx(text, fileName) {
  const lines = text.split('\n').filter(function(l) { return l.trim() })
  const paragraphs = lines.map(function(line) {
    return '<w:p><w:r><w:t xml:space="preserve">' + escapeXml(line) + '</w:t></w:r></w:p>'
  }).join('\n')
  const wordContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<?mso-application progid="Word.Document"?>\n<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"><w:body>' + paragraphs + '</w:body></w:wordDocument>'
  const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  triggerDownload(blob, fileName)
}

export function downloadStructuredDocx(title, sections, fileName) {
  const parts = ['<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:rPr><w:sz w:val="36"/><w:b/></w:rPr><w:t xml:space="preserve">' + escapeXml(title) + '</w:t></w:r></w:p>']
  sections.forEach(function(sec) {
    parts.push('<w:p><w:r><w:rPr><w:sz w:val="30"/><w:b/></w:rPr><w:t xml:space="preserve">' + escapeXml(sec.title) + '</w:t></w:r></w:p>')
    if (sec.fields) {
      sec.fields.forEach(function(f) {
        const line = f.label + '：' + (f.value || '未填写')
        parts.push('<w:p><w:r><w:t xml:space="preserve">' + escapeXml(line) + '</w:t></w:r></w:p>')
      })
    }
    if (sec.text) {
      const lines = sec.text.split('\n').filter(function(l) { return l.trim() })
      lines.forEach(function(line) {
        parts.push('<w:p><w:r><w:t xml:space="preserve">' + escapeXml(line) + '</w:t></w:r></w:p>')
      })
    }
  })
  const wordContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<?mso-application progid="Word.Document"?>\n<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"><w:body>' + parts.join('\n') + '</w:body></w:wordDocument>'
  const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  triggerDownload(blob, fileName)
}

function htmlToWordDoc(html) {
  const paragraphs = []
  const divRegex = /<(h[1-6]|p|div)[^>]*>([\s\S]*?)<\/\1>/gi
  let match
  while ((match = divRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const text = extractText(match[2])
    if (!text.trim()) continue
    let size = '24', bold = false
    if (tag === 'h1') { size = '36'; bold = true }
    else if (tag === 'h2') { size = '30'; bold = true }
    else if (tag === 'h3') { size = '26'; bold = true }
    const rpr = '<w:rPr><w:sz w:val="' + size + '"/>' + (bold ? '<w:b/>' : '') + '</w:rPr>'
    paragraphs.push('<w:p><w:r>' + rpr + '<w:t xml:space="preserve">' + escapeXml(text) + '</w:t></w:r></w:p>')
  }
  if (paragraphs.length === 0) {
    const text = extractText(html)
    if (text) paragraphs.push('<w:p><w:r><w:t xml:space="preserve">' + escapeXml(text) + '</w:t></w:r></w:p>')
  }
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<?mso-application progid="Word.Document"?>\n<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"><w:body>' + paragraphs.join('\n') + '</w:body></w:wordDocument>'
}

function extractText(html) {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}

function escapeXml(text) {
  if (!text) return ''
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function triggerDownload(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(function() { window.URL.revokeObjectURL(url) }, 100)
}
