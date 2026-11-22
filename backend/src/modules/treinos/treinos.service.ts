
import { randomUUID } from 'node:crypto'
import * as repository from './treinos.repository'
import type { DadosTreino, QueryPaginacao, ResultadoPaginado } from './treinos.types'

export class ErroNegocio extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
  }
}

function validar(dados: DadosTreino): DadosTreino {
  const nome = dados.nome.trim()

  if (!nome) {
    throw new ErroNegocio('O treino precisa ter um nome.', 400)
  }

  const ids = dados.exercicios.map((exercicio) => exercicio.id)

  if (new Set(ids).size !== ids.length) {
    throw new ErroNegocio(
      'Um exercício não pode aparecer duas vezes no treino.',
      400,
    )
  }

  for (const exercicio of dados.exercicios) {
    // Compatibilidade com exercícios antigos sem a propriedade "tipo".
    const categoria = exercicio.categoria.toLowerCase().trim()

    const cardio =
      exercicio.tipo === 'cardio' ||
      categoria.includes('cardio') ||
      categoria.includes('cardiovascular')

    if (cardio) {
      if (
        exercicio.tempoMinutos === undefined ||
        exercicio.tempoMinutos <= 0
      ) {
        throw new ErroNegocio(
          `Informe um tempo válido para o exercício "${exercicio.nome}".`,
          400,
        )
      }
    } else if (
      exercicio.series <= 0 ||
      exercicio.repeticoes <= 0
    ) {
      throw new ErroNegocio(
        `O exercício "${exercicio.nome}" precisa de pelo menos 1 série e 1 repetição.`,
        400,
      )
    }
  }

  return { nome, exercicios: dados.exercicios }
}

export const listarTreinos = repository.listar
export const buscarTreino = repository.buscarPorId

export async function paginarTreinos(
  query: QueryPaginacao,
): Promise<ResultadoPaginado> {
  const page = query.page ?? 1
  const limit = query.limit ?? 10
  const search = (query.search ?? '').trim()

  const offset = (page - 1) * limit

  if (!Number.isSafeInteger(offset)) {
    throw new ErroNegocio('Página muito grande.', 400)
  }

  const { data, total } = await repository.listarPaginado(
    search,
    limit,
    offset,
  )

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function criarTreino(dados: DadosTreino) {
  const valido = validar(dados)

  if (await repository.existeNome(valido.nome)) {
    throw new ErroNegocio(
      'Já existe um treino com esse nome.',
      409,
    )
  }

  return repository.inserir(randomUUID(), valido)
}

export async function editarTreino(
  id: string,
  dados: DadosTreino,
) {
  const valido = validar(dados)

  if (!(await repository.buscarPorId(id))) {
    throw new ErroNegocio('Treino não encontrado', 404)
  }

  if (await repository.existeNome(valido.nome, id)) {
    throw new ErroNegocio(
      'Já existe um treino com esse nome.',
      409,
    )
  }

  const atualizado = await repository.atualizar(id, valido)

  if (!atualizado) {
    throw new ErroNegocio('Treino não encontrado', 404)
  }

  return repository.buscarPorId(id)
}

export async function removerTreino(id: string) {
  if (!(await repository.buscarPorId(id))) {
    throw new ErroNegocio('Treino não encontrado', 404)
  }

  if ((await repository.contar()) <= 1) {
    throw new ErroNegocio(
      'É necessário manter pelo menos um treino',
      400,
    )
  }

  const excluido = await repository.excluir(id)

  if (!excluido) {
    throw new ErroNegocio('Treino não encontrado', 404)
  }
}
