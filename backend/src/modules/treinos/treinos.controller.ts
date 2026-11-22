import type { FastifyReply, FastifyRequest } from 'fastify'
import * as service from './treinos.service'
import type { DadosTreino, QueryPaginacao } from './treinos.types'

type ComId = { Params: { id: string } }
type Corpo = { Body: DadosTreino }

export async function listar() {
  return service.listarTreinos()
}

export async function paginar(request: FastifyRequest<{ Querystring: QueryPaginacao }>) {
  return service.paginarTreinos(request.query)
}

export async function buscar(request: FastifyRequest<ComId>, reply: FastifyReply) {
  const treino = await service.buscarTreino(request.params.id)
  if (!treino) return reply.code(404).send({ erro: 'Treino não encontrado' })
  return treino
}

export async function criar(request: FastifyRequest<Corpo>, reply: FastifyReply) {
  return reply.code(201).send(await service.criarTreino(request.body))
}

export async function atualizar(request: FastifyRequest<ComId & Corpo>) {
  return service.editarTreino(request.params.id, request.body)
}

export async function excluir(request: FastifyRequest<ComId>, reply: FastifyReply) {
  await service.removerTreino(request.params.id)
  return reply.code(204).send()
}
