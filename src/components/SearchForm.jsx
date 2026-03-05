export default function SearchForm({
  value,
  filters,
  setFilterValue,
  searchData,
}) {
  const activeFilter = Object.keys(filters).find((key) => filters[key]) || "Назив";
  
  return (
    <div className="mt-2 mb-4">
      <div className="input-group flex-fill">
        <input
          id={`search`}
          className="form-control"
          type="text"
          placeholder="Пребарајте..."
          onChange={(e) => searchData(e, activeFilter)}
          value={value}
        ></input>
        {!value && (
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        )}
        {value && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            title={
              value
                ? `Избриши`
                : `Внесете вредност за да можете да ја избришете`
            }
            onClick={() => setFilterValue(activeFilter, "")}
            disabled={!value}
          >
            <i className="bi bi-x-lg"></i>
            <span className="visually-hidden">Избриши</span>
          </button>
        )}
      </div>
      <div className="form-text mx-3 pt-2">
        Пребарајте низ сите јавни претпријатија во регистарот со едноставни
        поими како: <em>електрани, железница, патишта, шуми, Скопје</em> и сл.
      </div>
    </div>
  );
}
