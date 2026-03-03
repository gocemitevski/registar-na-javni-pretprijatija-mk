export default function DefinitionListTotal({ title, total, icon, color }) {

  return (
    <dl className="hstack gap-2 mb-0">
      <dt className="hstack gap-2 mb-0">
        <i className={`bi ${icon} text-${color}`}></i>
        <span>{title}</span>
      </dt>
      <dd className="mb-0 flex-fill text-end">
        {total}
      </dd>
    </dl>
  );
}
