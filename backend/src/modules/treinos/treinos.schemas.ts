/** Schemas usados pelo Fastify/AJV (erros de tipo e limites geram HTTP 400). */
const exercicio = {
  type: 'object',
  required: ['id', 'nome', 'categoria', 'equipamento', 'series', 'repeticoes', 'carga'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer', minimum: 1 },
    nome: { type: 'string', minLength: 1, maxLength: 255 },
    categoria: { type: 'string', maxLength: 255 },
    equipamento: { type: 'string', maxLength: 255 },
    tipo: { type: 'string', enum: ['musculacao', 'cardio'] },
    series: { type: 'integer', minimum: 0 },
    repeticoes: { type: 'integer', minimum: 0 },
    carga: { type: 'number', minimum: 0 },
    tempoMinutos: { type: 'number', minimum: 0 },
  },
} as const

export const corpoTreinoSchema = {
  body: {
    type: 'object',
    required: ['nome', 'exercicios'],
    additionalProperties: false,
    properties: {
      nome: { type: 'string', minLength: 1, maxLength: 120 },
      exercicios: { type: 'array', maxItems: 300, items: exercicio },
    },
  },
} as const

export const paginacaoSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      search: { type: 'string', maxLength: 100, default: '' },
    },
    additionalProperties: false,
  },
} as const
