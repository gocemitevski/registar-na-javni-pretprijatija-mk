import Icon from "./Icon";

export default function Link({ href, value }) {
  return href ? (
    <a
      className="link-body-emphasis"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span>{value}</span>
      <p className="d-inline-flex mb-0">
        <Icon name="box-arrow-up-right" className="fs-xs opacity-50 ms-2" />
      </p>
    </a>
  ) : (
    <span>{value}</span>
  );
}
