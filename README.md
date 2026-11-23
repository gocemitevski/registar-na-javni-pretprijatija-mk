# Регистар на јавни претпријатија и трговски друштва во државна сопственост на Р. С. Македонија

Интерактивна веб-апликација за прегледување на финансиските податоци на јавните претпријатија и трговските друштва во Република Северна Македонија.

[![Регистар на јавни претпријатија и трговски друштва во државна сопственост на Р. С. Македонија](public/registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-mk-1200x675.webp)](https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk)

## Технологии

- **React 19** со React Compiler
- **Vite 8** - алатка за изградба
- **Bootstrap 5** + **SCSS** - библиотека за каскадни стилови
- **React Router DOM 7** - рутирање
- **xlsx** - парсирање на податоци од Excel/ODS (само при изградба)
- **Chart.js** - графикони

## Инсталација

```bash
npm install
```

## Развој

```bash
npm run dev
```

## Изградба

```bash
npm run build
```

Изградбата ги генерира и податоците (`public/data/registar.json`), `public/sitemap.xml`, статичните HTML страници за секоја рута и `404.html`.

Преглед на изградбената верзија локално:

```bash
npm run preview
```

## Линтирање

```bash
npm run lint
```

## Податоци

Изворот на податоците е датотеката во директориумот `public/ods/` во форматот „ODS“ (OpenDocument Spreadsheet).

При секое стартување на развојниот сервер и при секоја изградба, `scripts/generate-data.js` ја парсира табелата и генерира `public/data/registar.json`, кој апликацијата го вчитува во прелистувачот. Генерираната датотека не е дел од репозиториумот; за рачно генерирање:

```bash
npm run data
```

## Параметри на „URL“

Апликацијата чува состојба во „URL“:

- Патеки:
  - `:lang` - јазик (mk, en)
  - `:filter` - филтер за филтрирани страни (positive-result, negative-result, income, no-income, earned-more, spent-more)
  - `:company` - slug на компанија
- Query параметри:
  - `year` - избрана година
  - `quarter` - избран квартал (0 = Сите квартали)
  - `sort` - подредување (id, income, expenses, financial-result)
  - `order` - редослед (asc, desc)
  - `currency` - валута (MKD, EUR, USD, GBP)
  - `base` и `compare` - годините што се споредуваат на страницата за споредба

Пример: `/mk/filtered/positive-result?year=2025&quarter=1&currency=EUR`

Пример за споредба: `/mk/compare?base=2024&compare=2025&currency=EUR`

## Патеки

- `/` - Пренасочување кон `/mk`
- `/:lang` - Главна страница со преглед
- `/:lang/registry` - Регистар на сите компании
- `/:lang/compare` - Споредба на финансиски показатели помеѓу две години
- `/:lang/filtered/:filter` - Филтрирани компании
- `/:lang/company/:company` - Детали за компанија
- `/:lang/about` - За проектот
- `*` - Страница „не е пронајдена“ (`NotFound`)

## Лиценца

Авторските права се дефинирани преку лиценцата [CC BY-NC-SA 4.0](https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk?tab=License-1-ov-file).
