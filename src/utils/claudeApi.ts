const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

interface ContentBlock {
  type: 'text' | 'document' | 'image'
  text?: string
  source?: {
    type: 'base64'
    media_type: string
    data: string
  }
  title?: string
}

async function callClaude(content: ContentBlock[], systemPrompt?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY no está configurada')

  const body = {
    model: MODEL,
    max_tokens: 4096,
    ...(systemPrompt && { system: systemPrompt }),
    messages: [{ role: 'user', content }],
  }

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error Claude API (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

// ── Extracción de cotización desde documento ──────────────────────────────────
export async function extraerCotizacion(
  base64: string,
  mediaType: string,
  nombreArchivo: string
): Promise<string> {
  const isImage = mediaType.startsWith('image/')
  const isPdf = mediaType === 'application/pdf'

  let fileBlock: ContentBlock

  if (isImage || isPdf) {
    fileBlock = {
      type: isPdf ? 'document' : 'image',
      source: { type: 'base64', media_type: mediaType, data: base64 },
      ...(isPdf && { title: nombreArchivo }),
    }
  } else {
    // Para Word/Excel enviamos como texto (ya fue convertido por fileParser)
    fileBlock = { type: 'text', text: `Contenido del archivo "${nombreArchivo}":\n${base64}` }
  }

  const textBlock: ContentBlock = {
    type: 'text',
    text: `Analiza este documento de cotización y extrae TODOS los ítems con sus precios.
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "proveedor": "nombre del proveedor si aparece",
  "fecha": "fecha de la cotización si aparece",
  "condicionPago": "condición de pago si aparece",
  "plazoEntrega": "plazo de entrega si aparece",
  "items": [
    {
      "descripcion": "descripción del ítem",
      "cantidad": número,
      "unidad": "unidad de medida",
      "precioUnitario": número,
      "precioTotal": número
    }
  ],
  "total": número total de la cotización
}
Si algún campo no está disponible usa null. Los precios deben ser números sin símbolos de moneda.`,
  }

  const rawText = await callClaude([fileBlock, textBlock])
  return rawText
}

// ── Recomendación de proveedor ─────────────────────────────────────────────────
export async function generarRecomendacion(resumen: string): Promise<string> {
  const content: ContentBlock[] = [
    {
      type: 'text',
      text: `Eres un asistente de compras empresarial. Analiza las siguientes cotizaciones comparadas y da una recomendación clara y profesional sobre qué proveedor elegir y por qué.

${resumen}

Considera: precio total, cantidad de ítems con mejor precio, condiciones de pago y plazo de entrega.
Responde en 3-4 oraciones directas en español.`,
    },
  ]
  return callClaude(content)
}

// ── Generación de Orden de Compra formal ──────────────────────────────────────
export async function generarTextoOC(datos: {
  numero: string
  proveedor: string
  items: { descripcion: string; cantidad: number; unidad: string; precioUnitario: number; precioTotal: number }[]
  total: number
  condicionPago?: string
  notas?: string
}): Promise<string> {
  const itemsTexto = datos.items
    .map(
      (i) =>
        `- ${i.descripcion}: ${i.cantidad} ${i.unidad} x $${i.precioUnitario.toLocaleString()} = $${i.precioTotal.toLocaleString()}`
    )
    .join('\n')

  const content: ContentBlock[] = [
    {
      type: 'text',
      text: `Redacta una Orden de Compra formal y profesional con los siguientes datos:

Número de OC: ${datos.numero}
Proveedor: ${datos.proveedor}
Ítems:
${itemsTexto}
Total: $${datos.total.toLocaleString()}
${datos.condicionPago ? `Condición de pago: ${datos.condicionPago}` : ''}
${datos.notas ? `Notas: ${datos.notas}` : ''}

Incluye: encabezado formal, datos del pedido, tabla de ítems, totales, condiciones de entrega y pago, y cierre profesional. En español.`,
    },
  ]
  return callClaude(content)
}
