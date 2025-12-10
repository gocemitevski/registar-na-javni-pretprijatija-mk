export default function SearchForm({
  value,
  index,
  filters,
  setFilters,
  searchData,
}) {
  return (
    <form className="mt-2 mb-4">
      <div className="input-group flex-fill">
        <input
          id={`search`}
          className="form-control"
          type="text"
          placeholder="Пребарајте..."
          onChange={(e) => searchData(e, index)}
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
            type="reset"
            title={
              value
                ? `Избриши`
                : `Внесете вредност за да можете да ја избришете`
            }
            onClick={() =>
              setFilters({
                ...filters,
                [index]: "",
              })
            }
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
    </form>
  );
}
