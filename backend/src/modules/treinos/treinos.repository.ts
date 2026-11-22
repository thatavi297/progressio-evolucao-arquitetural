
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '../../database/connection'
import type { DadosTreino, Treino } from './treinos.types'

type TreinoRow = RowDataPacket & {
  id: string
  nome: string
  exercicios: unknown
  criadoEm: Date | string
}

type ContagemRow = RowDataPacket & {
  total: number
}

function mapearTreino(row: TreinoRow): Treino {
  return {
    id: row.id,
    nome: row.nome,
    exercicios:
      typeof row.exercicios === 'string'
        ? JSON.parse(row.exercicios) as Treino['exercicios']
        : row.exercicios as Treino['exercicios'],
    criadoEm: new Date(row.criadoEm).toISOString(),
  }
}

const colunas = 'id, nome, exercicios, criado_em AS criadoEm'

export async function listar(): Promise<Treino[]> {
  const [rows] = await pool.execute<TreinoRow[]>(
    `SELECT ${colunas} FROM treinos ORDER BY criado_em ASC, id ASC`,
  )

  return rows.map(mapearTreino)
}

export async function buscarPorId(
  id: string,
): Promise<Treino | null> {
  const [rows] = await pool.execute<TreinoRow[]>(
    `SELECT ${colunas} FROM treinos WHERE id = ?`,
    [id],
  )

  return rows[0] ? mapearTreino(rows[0]) : null
}

// Verifica nomes duplicados em toda a tabela do MySQL.
export async function existeNome(
  nome: string,
  ignorarId?: string,
): Promise<boolean> {
  const [rows] = await pool.execute<
    (RowDataPacket & { id: string })[]
  >(
    `SELECT id FROM treinos
     WHERE LOWER(TRIM(nome)) = LOWER(?)
       AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [nome, ignorarId ?? null, ignorarId ?? null],
  )

  return rows.length > 0
}

export async function contar(): Promise<number> {
  const [rows] = await pool.execute<ContagemRow[]>(
    'SELECT COUNT(*) AS total FROM treinos',
  )

  return rows[0].total
}

export async function listarPaginado(
  search: string,
  limit: number,
  offset: number,
) {
  const filtro = `%${search}%`

  const [rows] = await pool.execute<TreinoRow[]>(
    `SELECT ${colunas}
     FROM treinos
     WHERE nome LIKE ?
     ORDER BY criado_em ASC, id ASC
     LIMIT ? OFFSET ?`,
    [filtro, limit, offset],
  )

  const [contagens] = await pool.execute<ContagemRow[]>(
    'SELECT COUNT(*) AS total FROM treinos WHERE nome LIKE ?',
    [filtro],
  )

  return {
    data: rows.map(mapearTreino),
    total: contagens[0].total,
  }
}

export async function inserir(
  id: string,
  dados: DadosTreino,
) {
  await pool.execute<ResultSetHeader>(
    'INSERT INTO treinos (id, nome, exercicios) VALUES (?, ?, ?)',
    [id, dados.nome, JSON.stringify(dados.exercicios)],
  )

  return buscarPorId(id)
}

export async function atualizar(
  id: string,
  dados: DadosTreino,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE treinos SET nome = ?, exercicios = ? WHERE id = ?',
    [dados.nome, JSON.stringify(dados.exercicios), id],
  )

  return result.affectedRows > 0
}

export async function excluir(
  id: string,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM treinos WHERE id = ?',
    [id],
  )

  return result.affectedRows > 0
}
