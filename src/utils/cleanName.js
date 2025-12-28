export function cleanName(name) {
  return name.replace(/[„|“|.|-|,]/g, '').replace(/\s-\s/gi, '-').replace(/[^0-9a-z]/gi, '-').toLowerCase();
}
