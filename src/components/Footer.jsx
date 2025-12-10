export default function Footer() {
  return (
    <div className="bg-primary text-light py-4">
      <footer className="container">
        <div className="row g-3">
          <div className="col-xxl-6">
            <a
              className="link-light"
              rel="noopener"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk"
            >
              Изворниот код
            </a>{" "}
            е достапен на GitHub под лиценцата „
            <a
              className="link-light"
              rel="noopener"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk?tab=GPL-3.0-1-ov-file"
            >
              GPL-3.0
            </a>
            “.
          </div>
          <div className="col-xxl-6 text-xxl-end">
            Изработено од{" "}
            <a
              className="link-light"
              rel="noopener"
              href="https://www.gocemitevski.com/"
            >
              Гоце Митевски
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
