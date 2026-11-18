import { useTranslation } from "react-i18next";

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div
      className="container my-5 flex-fill loading-skeleton"
      role="status"
      aria-busy="true"
    >
      <span className="visually-hidden">{t("common.loading")}</span>
      <div className="placeholder-glow vstack gap-3" aria-hidden="true">
        <span className="placeholder col-5 col-lg-3 placeholder-lg rounded"></span>
        <div className="row g-3">
          {[0, 1, 2, 3].map((index) => (
            <div className="col-6 col-lg-3" key={index}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <span className="placeholder col-8 placeholder-sm d-block mb-2"></span>
                  <span className="placeholder col-5 placeholder-lg"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {[0, 1].map((index) => (
          <div className="card shadow-sm" key={index}>
            <div className="card-body">
              <span className="placeholder col-6 col-lg-4 placeholder-sm d-block mb-3"></span>
              <span className="placeholder col-12 d-block mb-2"></span>
              <span className="placeholder col-10 d-block mb-2"></span>
              <span className="placeholder col-7 d-block"></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
