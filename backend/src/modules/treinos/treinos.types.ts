export interface ExercicioTreino {
  id: number
  nome: string
  categoria: string
  equipamento: string
  tipo?: 'musculacao' | 'cardio'
  series: number
  repeticoes: number
  carga: number
  tempoMinutos?: number
}

export interface Treino {
  id: string
  nome: string
  exercicios: ExercicioTreino[]
  criadoEm: string
}

export type DadosTreino = Pick<Treino, 'nome' | 'exercicios'>
export type QueryPaginacao = { page?: number; limit?: number; search?: string }
export type ResultadoPaginado = {
  data: Treino[]
  total: number
  page: number
  limit: number
  totalPages: number
}
