import { Search } from 'lucide-react'

interface Props {
  pesquisa: string
  onPesquisa: (texto: string) => void
  pagina: number
  totalPaginas: number
  total: number
  carregando: boolean
  onPagina: (pagina: number) => void
}

/** UI isolada do acesso HTTP: a página decide quando consultar a API. */
export default function TreinosNavegacao({
  pesquisa, onPesquisa, pagina, totalPaginas, total, carregando, onPagina,
}: Props) {
  return (
    <section className="treinos-paginacao" aria-label="Busca e paginação de fichas">
      <label className="treinos-pesquisa">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          maxLength={100}
          placeholder="Pesquisar fichas pelo nome..."
          value={pesquisa}
          onChange={(event) => onPesquisa(event.target.value)}
          aria-label="Pesquisar fichas pelo nome"
        />
      </label>
      <div className="treinos-paginacao-info">
        <span role="status">{total} ficha{total === 1 ? '' : 's'} encontrada{total === 1 ? '' : 's'} — Página {totalPaginas ? pagina : 0} de {totalPaginas}</span>
        <div className="treinos-paginacao-acoes">
          <button
            type="button"
            disabled={carregando || pagina <= 1}
            onClick={() => onPagina(pagina - 1)}
          >Anterior</button>
          <button
            type="button"
            disabled={carregando || pagina >= totalPaginas}
            onClick={() => onPagina(pagina + 1)}
          >Próxima</button>
        </div>
      </div>
    </section>
  )
}
