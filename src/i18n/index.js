import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const getInitialLanguage = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/(mk|en)(\/|$)/);
  if (match) {
    return match[1];
  }
  return "mk";
};

const resources = {
  mk: {
    translation: {
      app: {
        title: "Регистар на јавни претпријатија и трговски друштва во државна сопственост на Р. С. Македонија",
        description: "Интерактивен регистар на јавни претпријатија и трговски друштва во државна сопственост на Република Северна Македонија, според податоци на",
        ministry: "Министерството за финансии"
      },
      header: { project: "За изработката", shareOn: "Сподели на {{title}}" },
      footer: {
        sourceCode: "Изворниот код",
        license: "GPL-3.0",
        madeBy: "Изработено од",
        author: "Гоце Митевски",
        availableOn: "е достапен на GitHub под лиценцата"
      },
      nav: {
        home: "Почетна",
        registry: "Регистар",
        year: "Година",
        quarter: "Квартал",
        all: "Сите",
        sorting: "Подредување",
        order: "Редослед",
        reset: "Врати ги основните вредности"
      },
      search: {
        placeholder: "Пребарајте...",
        clear: "Избриши",
        clearTitle: "Внесете вредност за да можете да ја избришете",
        hint: "Пребарајте низ сите јавни претпријатија во регистарот со едноставни поими како: {{keywords}} и сл.",
        keywords: "електрани, железница, патишта, шуми, Скопје"
      },
      common: {
        loading: "Вчитување...",
        error: "Грешка при вчитување на податоците:"
      },
      filters: {
        id: "Реден број",
        quarter: "Квартал",
        sort: "Подредување",
        order: "Редослед"
      },
      summary: {
        explore: "Истражи",
        positiveResult: "Оствариле позитивен финансиски резултат",
        income: "Оствариле приход",
        earnedMore: "Заработиле повеќе од што потрошиле",
        negativeResult: "Оствариле негативен финансиски резултат",
        noIncome: "Не оствариле приход",
        spentMore: "Потрошиле повеќе од што заработиле",
        quickFacts: "Брзи факти за {{year}} година",
        quickFactsQuarter: "Брзи факти за квартал {{quarter}} на {{year}} година"
      },
      breadcrumbs: {
        home: "Почетна",
        registry: "Регистар",
        quickFacts: "Брзи факти за {{year}} година",
        quickFactsQuarter: "Брзи факти за квартал {{quarter}} на {{year}} година"
      },
      cards: {
        income: "Приходи",
        expenses: "Расходи",
        "financial-result": "Финансиски резултат",
        total: "Вкупно",
        company_singular: "јавно претпријатие или трговско друштво",
        company_plural: "јавни претпријатија или трговски друштва"
      },
      sort: {
        id: "Реден број",
        income: "Приходи",
        expenses: "Расходи",
        "financial-result": "Финансиски резултат",
      },
      order: {
        desc: "Опаѓачки",
        asc: "Растечки"
      },
      toplists: {
        title: "Топ-листи",
        titleYear: "за {{year}}",
        titleQuarter: "за квартал {{quarter}} на {{year}}",
        highestIncome: "Највисоки приходи",
        lowestIncome: "Најниски приходи",
        highestExpenses: "Највисоки расходи",
        lowestExpenses: "Најниски расходи",
        bestResult: "Најдобри финансиски резултати",
        worstResult: "Најлоши финансиски резултати"
      },
      company: {
        notFound: "Претпријатието не е пронајдено",
        notFoundDesc: "Проверете ја уште еднаш адресата за да бидете сигурен дека е точна. Можеби сте направил мала грешка при пишувањето, или пак старата страница веќе не постои!",
        allYears: "Сите години",
        allQuarters: "Сите квартали",
        chartTitle: "Графички приказ на приходи, расходи и финансиски резултати",
        noData: "Нема податоци за избраната година.",
        year: "Година",
        quarter: "Квартал",
        prevCompany: "Претходно претпријатие",
        nextCompany: "Следно претпријатие",
        website: "Мрежно место на {{name}}"
      }
    }
  },
  en: {
    translation: {
      app: {
        title: "Registry of public enterprises and trading companies in state ownership of R. N. Macedonia",
        description: "Interactive registry of public enterprises and trading companies in state ownership of the Republic of North Macedonia, according to data of",
        ministry: "Ministry of Finance"
      },
      header: { project: "About", shareOn: "Share on {{title}}" },
      footer: {
        sourceCode: "The source code",
        license: "GPL-3.0",
        madeBy: "Made by",
        author: "Goce Mitevski",
        availableOn: "is available on GitHub under the"
      },
      nav: {
        home: "Home",
        registry: "Registry",
        year: "Year",
        quarter: "Quarter",
        all: "All",
        sorting: "Sort by",
        order: "Order",
        reset: "Reset to defaults"
      },
      search: {
        placeholder: "Search...",
        clear: "Clear",
        clearTitle: "Enter a value so you can clear it",
        hint: "Search all public enterprises in the registry with keywords like: {{keywords}}",
        keywords: "electricity, railways, roads, forests, Skopje"
      },
      common: {
        loading: "Loading...",
        error: "Error loading data:"
      },
      summary: {
        explore: "Explore",
        positiveResult: "Achieved positive financial result",
        income: "With income",
        earnedMore: "Earned more than they spent",
        negativeResult: "Achieved negative financial result",
        noIncome: "Without income",
        spentMore: "Spent more than they earned",
        quickFacts: "Quick Facts for {{year}}",
        quickFactsQuarter: "Quick Facts for Q{{quarter}} of {{year}}"
      },
      breadcrumbs: {
        home: "Home",
        registry: "Registry",
        quickFacts: "Quick Facts for {{year}}",
        quickFactsQuarter: "Quick Facts for Q{{quarter}} of {{year}}"
      },
      cards: {
        income: "Income",
        expenses: "Expenses",
        "financial-result": "Financial Result",
        total: "Total",
        company_singular: "public enterprise",
        company_plural: "public enterprises"
      },
      filters: {
        id: "Record Number",
        quarter: "Quarter",
        sort: "Sort by",
        order: "Order"
      },
      sort: {
        id: "Record Number",
        income: "Income",
        expenses: "Expenses",
        "financial-result": "Financial Result",
      },
      order: {
        desc: "Descending",
        asc: "Ascending"
      },
      toplists: {
        title: "Top Lists",
        titleYear: "for {{year}}",
        titleQuarter: "for Q{{quarter}} of {{year}}",
        highestIncome: "Highest incomes",
        lowestIncome: "Lowest incomes",
        highestExpenses: "Highest expenses",
        lowestExpenses: "Lowest expenses",
        bestResult: "Best financial results",
        worstResult: "Worst financial results"
      },
      company: {
        notFound: "Company not found",
        notFoundDesc: "Double-check the address to make sure it's right. You might've just had a little typo, or maybe the old one isn't there anymore!",
        allYears: "All years",
        allQuarters: "All quarters",
        chartTitle: "Graphical display of income, expenses and financial results",
        noData: "No data for the selected year.",
        year: "Year",
        quarter: "Quarter",
        prevCompany: "Previous company",
        nextCompany: "Next company",
        website: "Website of {{name}}"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "mk",
  interpolation: { escapeValue: false }
});

export default i18n;

export const getPathWithLang = (lang, path) => {
  const cleanPath = path.replace(/^\/(mk|en)\//, "/");
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
};
