# Регистар на јавни претпријатија и трговски друштва во државна сопственост на Р. С. Македонија

Интерактивна веб-апликација за прегледување на финансиските податоци на јавните претпријатија и трговските друштва во Република Северна Македонија.

[![Регистар на јавни претпријатија и трговски друштва во државна сопственост на Р. С. Македонија](public/registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-mk-1200x675.webp)](https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk)

## Технологии

- **React 19** со React Compiler
- **Vite 7** - алатка за изградба
- **Bootstrap 5** + **SCSS** - библиотека за каскадни стилови
- **React Router DOM 7** - рутирање
- **xlsx** - парсирање на податоци од Excel/ODS
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

Преглед на изградбената верзија локално:

```bash
npm run preview
```

## Линтирање

```bash
npm run lint
```

## Податоци

Податоците се наоѓаат во директориумот `public/ods/` во форматот „ODS“ (OpenDocument Spreadsheet).

## Параметри на „URL“

Апликацијата користи параметри на „URL“ за чување на состојбата:

- `:lang` - јазик (MK, EN)
- `:year` - избрана година
- `:quarter` - избран квартал (0 = Сите квартали)
- `:sort` - подредување (id, income, expenses, financial-result)
- `:order` - редослед (asc, desc)
- `:filter` - филтер за филтрирани страни (positive-result, negative-result, income, no-income, earned-more, spent-more)

Пример: `/mk/filtered/positive-result?year=2025&quarter=1`

## Патеки

- `/` - Главна страница со преглед
- `/:lang` - Главна страница со преглед
- `/:lang/filtered/:filter` - Филтрирани компании
- `/:lang/registry` - Регистaр на сите компании
- `/:lang/company/:company` - Детали за компанија
- `/:lang/about` - За проектот

## Лиценца

Авторските права на Гоце Митевски се дефинирани преку лиценцата [CC BY-NC-SA 4.0](https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk?tab=License-1-ov-file).
