import Fastify from 'fastify'
import cors from '@fastify/cors'
import { pool } from './database/connection'
import { ErroNegocio } from './modules/treinos/treinos.service'
import { rotasTreinos } from './modules/treinos/treinos.routes'

const app = Fastify({ logger: true })

app.setErrorHandler((erro, _request, reply) => {
  if (erro instanceof ErroNegocio) {
    return reply.code(erro.statusCode).send({ erro: erro.message })
  }
  if (erro instanceof Error && 'validation' in erro && erro.validation) {
    return reply.code(400).send({ erro: 'Dados inválidos', detalhes: erro.message })
  }
  app.log.error(erro)
  return reply.code(500).send({ erro: 'Erro interno no servidor' })
})

async function iniciarServidor() {
  try {
    await app.register(cors, {
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
    await app.register(rotasTreinos)
    app.get('/health', async () => {
      await pool.query('SELECT 1')
      return { status: 'ok', mensagem: 'API do Progressio e MySQL funcionando!' }
    })
    await pool.query('SELECT 1')
    await app.listen({ port: Number(process.env.PORT ?? 3333), host: '0.0.0.0' })
  } catch (erro) {
    app.log.error(erro, 'Não foi possível iniciar a API. Configure MySQL e o .env.')
    await pool.end()
    process.exit(1)
  }
}

void iniciarServidor()
