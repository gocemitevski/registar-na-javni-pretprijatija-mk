import { Link } from "react-router-dom";
import { useMemo } from "react";
import { socialLinkButtons } from "../utils/socialLinkButtons";

export default function Header() {
  const socialLinks = useMemo(() => socialLinkButtons(), []);

  return (
    <div className="bg-primary py-4 text-light">
      <header className="container">
        <div className="row">
          <div className="col-xl-8 col-xxl-7">
            <h1 className="h3 pt-xl-4">
              <Link
                className="hstack flex-wrap flex-sm-nowrap align-items-start align-items-md-end link-light link-underline link-underline-opacity-50 gap-0 gap-sm-3 link-offset-1"
                to={`/`}
              >
                {import.meta.env.VITE_APP_META_TITLE}
              </Link>
            </h1>
            <p className="lead pb-xl-3">
              {import.meta.env.VITE_APP_META_DESCRIPTION}
            </p>
          </div>
          <div className="col-xl-4 col-xxl-5">
            <div className="hstack justify-content-xl-end gap-3">
              <button
                className="btn btn-sm btn-outline-light"
                data-bs-target="#zaIzrabotkata"
                data-bs-toggle="offcanvas"
                role="button"
                aria-controls="zaIzrabotkata"
              >
                За изработката
              </button>
              {socialLinks.length ? (
                <ul className="nav justify-content-end">
                  {socialLinks.map((icon, key) => (
                    <li key={key} className="nav-item">
                      <a
                        title={`Сподели на ${icon.title}`}
                        href={icon.href}
                        target="_blank"
                        rel="noopener"
                        className="nav-link link-light"
                      >
                        <i className={`bi ${icon.icon}`}></i>
                        <span className="visually-hidden">{`Сподели на ${icon.title}`}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                ``
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
