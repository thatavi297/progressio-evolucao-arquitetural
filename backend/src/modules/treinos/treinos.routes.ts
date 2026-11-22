import type { FastifyInstance } from 'fastify'
import * as controller from './treinos.controller'
import { corpoTreinoSchema, paginacaoSchema } from './treinos.schemas'

export async function rotasTreinos(app: FastifyInstance) {
  app.get('/treinos', controller.listar)
  // A rota literal deve existir antes de /treinos/:id.
  app.get('/treinos/paginated', { schema: paginacaoSchema }, controller.paginar)
  app.get('/treinos/:id', controller.buscar)
  app.post('/treinos', { schema: corpoTreinoSchema }, controller.criar)
  app.put('/treinos/:id', { schema: corpoTreinoSchema }, controller.atualizar)
  app.delete('/treinos/:id', controller.excluir)
}
