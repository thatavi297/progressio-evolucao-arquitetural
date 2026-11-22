import { useEffect, useState } from 'react'

import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import type { Workout, WorkoutExercise } from '../types/Workout'
import TreinosNavegacao from '../features/treinos/components/TreinosNavegacao'
import { registrarTreino } from '../services/workoutStorage'
import {
  listarTreinosPaginados,
  cadastrarTreino,
  atualizarTreino,
  deletarTreino,
} from '../services/treinosApi'

function obterDataAtual() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function ehCardio(exercicio: WorkoutExercise) {
  if (exercicio.tipo === 'cardio') return true
  const categoria = exercicio.categoria?.toLowerCase().trim() ?? ''
  return categoria.includes('cardio') || categoria.includes('cardiovascular')
}

function descreverErro(erro: unknown) {
  return erro instanceof Error
    ? erro.message
    : 'Não foi possível concluir a operação. Confira a API.'
}

function Workouts() {
  const navigate = useNavigate()
  const [treinos, setTreinos] = useState<Workout[]>([])
  const [treinoSelecionadoId, setTreinoSelecionadoId] = useState('')
  const [novoTreino, setNovoTreino] = useState('')
  const [nomeTreino, setNomeTreino] = useState('')
  const [dataTreino, setDataTreino] = useState(obterDataAtual())
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | ''>('')
  const [carregando, setCarregando] = useState(true)
  const [erroApi, setErroApi] = useState('')
  const [processando, setProcessando] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [pesquisaDigitada, setPesquisaDigitada] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pesquisaDigitada.trim() !== pesquisa) {
        setPagina(1)
        setPesquisa(pesquisaDigitada.trim())
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [pesquisaDigitada, pesquisa])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        setCarregando(true)
        setErroApi('')
        const resultado = await listarTreinosPaginados(pagina, 10, pesquisa)
        if (!ativo) return
        // Se a última ficha de uma página foi excluída, retorna à anterior.
        if (pagina > Math.max(1, resultado.totalPages)) {
          setPagina(Math.max(1, resultado.totalPages))
          return
        }
        const dados = resultado.data
        setTreinos(dados)
        setTotal(resultado.total)
        setTotalPaginas(resultado.totalPages)
        const selecionado = dados.find((treino) => treino.id === treinoSelecionadoId) ?? dados[0]
        if (selecionado) {
          setTreinoSelecionadoId(selecionado.id)
          setNomeTreino(selecionado.nome)
        } else {
          setTreinoSelecionadoId('')
          setNomeTreino('')
        }
      } catch (erro) {
        if (ativo) setErroApi(descreverErro(erro))
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void carregar()
    return () => { ativo = false }
  }, [pagina, pesquisa, recarga])

  const treinoSelecionado =
    treinos.find((treino) => treino.id === treinoSelecionadoId) ?? null

  function selecionarTreino(treino: Workout) {
    if (processando) return
    setTreinoSelecionadoId(treino.id)
    setNomeTreino(treino.nome)
    setMensagem('')
  }

  async function executarOperacao(
    operacao: () => Promise<void>,
    sucesso: string,
  ) {
    if (processando) return
    setProcessando(true)
    setMensagem('')
    try {
      await operacao()
      setTipoMensagem('sucesso')
      setMensagem(sucesso)
    } catch (erro) {
      setTipoMensagem('erro')
      setMensagem(descreverErro(erro))
    } finally {
      setProcessando(false)
    }
  }

  function adicionarNovoTreino() {
    const nome = novoTreino.trim()
    if (!nome) {
      setTipoMensagem('erro')
      setMensagem('Digite um nome para o treino.')
      return
    }
    if (treinos.some((treino) => treino.nome.toLowerCase() === nome.toLowerCase())) {
      setTipoMensagem('erro')
      setMensagem('Já existe um treino com esse nome.')
      return
    }
    void executarOperacao(async () => {
      const criado = await cadastrarTreino({ nome, exercicios: [] })
      setNovoTreino('')
      setTreinoSelecionadoId(criado.id)
      setNomeTreino(criado.nome)
      setPesquisaDigitada('')
      setPesquisa('')
      // A ordenação é crescente pela data, então a ficha nova está na última página.
      const contagem = await listarTreinosPaginados(1, 1, '')
      setPagina(Math.max(1, Math.ceil(contagem.total / 10)))
      setRecarga((atual) => atual + 1)
    }, 'Novo treino criado com sucesso.')
  }

  function salvarNome() {
    if (!treinoSelecionado) return
    const nome = nomeTreino.trim()
    if (!nome) {
      setTipoMensagem('erro')
      setMensagem('O treino precisa ter um nome.')
      return
    }
    if (treinos.some((treino) =>
      treino.id !== treinoSelecionado.id && treino.nome.toLowerCase() === nome.toLowerCase()
    )) {
      setTipoMensagem('erro')
      setMensagem('Já existe um treino com esse nome.')
      return
    }
    void executarOperacao(async () => {
      const atualizado = await atualizarTreino(treinoSelecionado.id, {
        nome,
        exercicios: treinoSelecionado.exercicios,
      })
      setTreinos((anteriores) => anteriores.map((treino) =>
        treino.id === atualizado.id ? atualizado : treino
      ))
      setNomeTreino(atualizado.nome)
      setRecarga((atual) => atual + 1)
    }, 'Nome do treino atualizado.')
  }

  function removerTreinoAtual() {
    if (!treinoSelecionado) return
    void executarOperacao(async () => {
      await deletarTreino(treinoSelecionado.id)
      setTreinoSelecionadoId('')
      setNomeTreino('')
      setRecarga((atual) => atual + 1)
    }, 'Treino excluído.')
  }

  function alterarExercicio(
    exercicioId: number,
    campo: 'series' | 'repeticoes' | 'carga' | 'tempoMinutos',
    valor: number,
  ) {
    setTreinos((anteriores) => anteriores.map((treino) =>
      treino.id !== treinoSelecionadoId ? treino : {
        ...treino,
        exercicios: treino.exercicios.map((exercicio) =>
          exercicio.id === exercicioId ? { ...exercicio, [campo]: valor } : exercicio
        ),
      }
    ))
    setMensagem('')
  }

  function removerExercicio(exercicioId: number) {
    if (!treinoSelecionado) return
    const exercicios = treinoSelecionado.exercicios.filter(
      (exercicio) => exercicio.id !== exercicioId
    )
    void executarOperacao(async () => {
      const atualizado = await atualizarTreino(treinoSelecionado.id, {
        nome: treinoSelecionado.nome,
        exercicios,
      })
      setTreinos((anteriores) => anteriores.map((treino) =>
        treino.id === atualizado.id ? atualizado : treino
      ))
    }, 'Exercício removido do treino.')
  }

  function validarTreino() {
    if (!treinoSelecionado) return false
    const invalido = treinoSelecionado.exercicios.some((exercicio) => {
      if (ehCardio(exercicio)) {
        return !exercicio.tempoMinutos || exercicio.tempoMinutos <= 0
      }
      return exercicio.series <= 0 || exercicio.repeticoes <= 0 || exercicio.carga < 0
    })
    if (invalido) {
      setTipoMensagem('erro')
      setMensagem('Confira os dados dos exercícios antes de continuar.')
      return false
    }
    return true
  }

  function salvarAlteracoes() {
    if (!treinoSelecionado || !validarTreino()) return
    void executarOperacao(async () => {
      const atualizado = await atualizarTreino(treinoSelecionado.id, {
        nome: treinoSelecionado.nome,
        exercicios: treinoSelecionado.exercicios,
      })
      setTreinos((anteriores) => anteriores.map((treino) =>
        treino.id === atualizado.id ? atualizado : treino
      ))
    }, 'Alterações salvas com sucesso.')
  }

  function registrar() {
    if (!treinoSelecionado) return
    if (treinoSelecionado.exercicios.length === 0) {
      setTipoMensagem('erro')
      setMensagem('Adicione exercícios antes de registrar o treino.')
      return
    }
    if (!dataTreino) {
      setTipoMensagem('erro')
      setMensagem('Informe a data do treino.')
      return
    }
    if (!validarTreino()) return

    void executarOperacao(async () => {
      const atualizado = await atualizarTreino(treinoSelecionado.id, {
        nome: treinoSelecionado.nome,
        exercicios: treinoSelecionado.exercicios,
      })
      setTreinos((anteriores) => anteriores.map((treino) =>
        treino.id === atualizado.id ? atualizado : treino
      ))
      // Histórico de progresso permanece no localStorage; fichas são salvas no MySQL.
      registrarTreino(atualizado.exercicios, dataTreino, {
        id: atualizado.id,
        nome: atualizado.nome,
      })
    }, 'Treino registrado! Seus dados foram adicionados ao histórico.')
  }

  const totalSeries =
    treinoSelecionado
      ?.exercicios.reduce(
        (total, exercicio) =>
          ehCardio(exercicio)
            ? total
            : total +
              exercicio.series,
        0,
      ) ?? 0

  const totalTempoCardio =
    treinoSelecionado
      ?.exercicios.reduce(
        (total, exercicio) =>
          ehCardio(exercicio)
            ? total +
              (
                exercicio.tempoMinutos ??
                0
              )
            : total,
        0,
      ) ?? 0

  return (
    <div className="workouts-page">
      <section className="workouts-heading">
        <div>
          <span className="section-label">
            MEUS TREINOS
          </span>

          <h2>
            Minhas fichas
          </h2>

          <p>
            Organize seus exercícios
            em treinos diferentes e
            registre sua evolução a
            cada sessão.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() =>
            navigate('/exercicios')
          }
        >
          <Plus size={18} />

          Adicionar exercício
        </button>
      </section>

      {carregando && (
        <p role="status">Carregando fichas de treino...</p>
      )}

      {erroApi && (
        <div className="workout-message workout-message-error" role="alert">
          Erro ao carregar os treinos: {erroApi}. Verifique se o Fastify está ligado na porta 3333.
        </div>
      )}

      {!carregando && !erroApi && treinos.length === 0 && (
        <p>Nenhuma ficha de treino encontrada.</p>
      )}

      {processando && (
        <p role="status">Salvando alterações...</p>
      )}

      <TreinosNavegacao
        pesquisa={pesquisaDigitada}
        onPesquisa={setPesquisaDigitada}
        pagina={pagina}
        totalPaginas={totalPaginas}
        total={total}
        carregando={carregando}
        onPagina={setPagina}
      />

      <section className="workout-manager">
        <div className="workout-tabs">
          {treinos.map(
            (treino) => (
              <button
                key={treino.id}
                className={
                  treino.id ===
                  treinoSelecionadoId
                    ? 'workout-tab workout-tab-active'
                    : 'workout-tab'
                }
                disabled={processando}
                onClick={() =>
                  selecionarTreino(
                    treino,
                  )
                }
              >
                <Dumbbell size={17} />

                {treino.nome}

                <span>
                  {
                    treino
                      .exercicios
                      .length
                  }
                </span>
              </button>
            ),
          )}
        </div>

        <div className="create-workout">
          <input
            type="text"
            placeholder="Ex: Treino B — Costas"
            value={novoTreino}
            onChange={(event) =>
              setNovoTreino(
                event.target.value,
              )
            }
          />

          <button
            disabled={carregando || processando || Boolean(erroApi)}
            onClick={
              adicionarNovoTreino
            }
          >
            <Plus size={18} />

            Criar treino
          </button>
        </div>
      </section>

      {treinoSelecionado && (
        <>
          <section className="workout-name-card">
            <div>
              <span className="section-label">
                TREINO SELECIONADO
              </span>

              <div className="workout-name-edit">
                <input
                  value={nomeTreino}
                  onChange={(event) =>
                    setNomeTreino(
                      event.target
                        .value,
                    )
                  }
                />

                <button
                  disabled={processando}
                  onClick={
                    salvarNome
                  }
                >
                  <Pencil
                    size={17}
                  />

                  Salvar nome
                </button>
              </div>
            </div>

            <button
              className="delete-workout-button"
              disabled={processando}
              onClick={
                removerTreinoAtual
              }
            >
              <Trash2 size={18} />

              Excluir treino
            </button>
          </section>

          <section className="workout-summary">
            <div>
              <span>
                Exercícios
              </span>

              <strong>
                {
                  treinoSelecionado
                    .exercicios
                    .length
                }
              </strong>
            </div>

            <div>
              <span>
                Total de séries
              </span>

              <strong>
                {totalSeries}
              </strong>
            </div>

            <div>
              <span>
                Tempo de cardio
              </span>

              <strong>
                {totalTempoCardio} min
              </strong>
            </div>
          </section>

          {treinoSelecionado
            .exercicios.length === 0 ? (
            <section className="empty-workout">
              <div className="empty-workout-icon">
                <Dumbbell
                  size={34}
                />
              </div>

              <h3>
                Este treino está vazio
              </h3>

              <p>
                Vá até o catálogo e
                escolha exercícios para
                adicionar nesta ficha.
              </p>

              <button
                className="primary-action"
                onClick={() =>
                  navigate(
                    '/exercicios',
                  )
                }
              >
                <Plus size={18} />

                Explorar exercícios
              </button>
            </section>
          ) : (
            <section className="workout-list">
              {treinoSelecionado
                .exercicios.map(
                  (
                    exercicio,
                    index,
                  ) => {
                    const cardio =
                      ehCardio(
                        exercicio,
                      )

                    return (
                      <article
                        className="workout-card"
                        key={
                          exercicio.id
                        }
                      >
                        <div className="workout-card-number">
                          {index + 1}
                        </div>

                        <div className="workout-card-main">
                          <div className="workout-card-header">
                            <div>
                              <span className="exercise-category">
                                {
                                  exercicio.categoria
                                }
                              </span>

                              <h3>
                                {
                                  exercicio.nome
                                }
                              </h3>

                              <p>
                                {
                                  exercicio.equipamento
                                }
                              </p>
                            </div>

                            <button
                              className="remove-exercise-button"
                              onClick={() =>
                                removerExercicio(
                                  exercicio.id,
                                )
                              }
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          </div>

                          {cardio ? (
                            <div className="workout-fields workout-fields-cardio">
                              <div className="workout-field">
                                <label>
                                  Tempo
                                </label>

                                <div className="workout-weight-input">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                      exercicio
                                        .tempoMinutos ??
                                      0
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      alterarExercicio(
                                        exercicio.id,
                                        'tempoMinutos',
                                        Number(
                                          event
                                            .target
                                            .value,
                                        ),
                                      )
                                    }
                                  />

                                  <span>
                                    min
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="workout-fields">
                              <div className="workout-field">
                                <label>
                                  Séries
                                </label>

                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    exercicio.series
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    alterarExercicio(
                                      exercicio.id,
                                      'series',
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                    )
                                  }
                                />
                              </div>

                              <div className="workout-field">
                                <label>
                                  Repetições
                                </label>

                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    exercicio.repeticoes
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    alterarExercicio(
                                      exercicio.id,
                                      'repeticoes',
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                    )
                                  }
                                />
                              </div>

                              <div className="workout-field">
                                <label>
                                  Carga atual
                                </label>

                                <div className="workout-weight-input">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="Ex: 55"
                                    value={
                                      exercicio.carga === 0 ? '' : exercicio.carga
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      alterarExercicio(
                                        exercicio.id,
                                        'carga',
                                        Number(
                                          event
                                            .target
                                            .value,
                                        ),
                                      )
                                    }
                                  />

                                  <span>
                                    kg
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  },
                )}
            </section>
          )}

          {treinoSelecionado
            .exercicios.length >
            0 && (
            <section className="workout-actions">
              <div className="workout-save-area">
                <button
                  className="save-workout-button"
                  onClick={
                    salvarAlteracoes
                  }
                >
                  <Save size={18} />

                  Salvar alterações
                </button>
              </div>

              <div className="register-workout-card">
                <div>
                  <span className="section-label">
                    REGISTRAR TREINO
                  </span>

                  <h3>
                    Finalizou o treino?
                  </h3>

                  <p>
                    Registre suas
                    cargas e tempos para
                    acompanhar sua
                    evolução.
                  </p>
                </div>

                <div className="register-workout-controls">
                  <div className="workout-date-field">
                    <label>
                      Data
                    </label>

                    <div>
                      <CalendarDays
                        size={18}
                      />

                      <input
                        type="date"
                        value={
                          dataTreino
                        }
                        onChange={(
                          event,
                        ) =>
                          setDataTreino(
                            event
                              .target
                              .value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <button
                    className="register-workout-button"
                    onClick={
                      registrar
                    }
                  >
                    <CheckCircle2
                      size={19}
                    />

                    Registrar treino
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {mensagem && (
        <div
          className={
            tipoMensagem ===
            'sucesso'
              ? 'workout-message workout-message-success'
              : 'workout-message workout-message-error'
          }
          role="alert"
        >
          <span>
            {mensagem}
          </span>
        </div>
      )}
    </div>
  )
}

export default Workouts