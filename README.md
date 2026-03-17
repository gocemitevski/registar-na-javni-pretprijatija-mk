# Регистар на јавни претпријатија и трговски друштва

Интерактивна веб-апликација за прегледување на финансиските податоци на јавните претпријатија и трговските друштва во Република Северна Македонија.

## Технологии

- **React 19** со React Compiler
- **Vite 7** - алатка за изградба
- **Bootstrap 5** + **SCSS** - библиотека за каскадни стилови
- **React Router DOM 7** - рутирање
- **xlsx** - парсирање на Excel/ODS податоци
- **Chart.js** - графици

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

Апликацијата користи URL параметри за чување на состојба:

- `:lang` - јазик (mk, en)
- `:year` - избрана година
- `:quarter` - избран квартал (0 = сите квартали)
- `:sort` - подредување (id, income, expenses, financial-result)
- `:order` - редослед (asc, desc)
- `:filter` - филтер за филтрирани страни (positive-result, negative-result, income, no-income, earned-more, spent-more)

Пример: `/mk/filtered/positive-result?year=2025&quarter=1`

## Патеки

- `/` - Главна страница со преглед
- `/:lang` - Главна страница со преглед
- `/:lang/filtered/:filter` - Филтрирани компании
- `/:lang/registry` - Регистер на сите компании
- `/:lang/company/:company` - Детали за компанија
- `/:lang/about` - За проектот

## Лиценца

[CC BY-NC-SA 4.0](https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk?tab=License-1-ov-file)
