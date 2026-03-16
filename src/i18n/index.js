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
      header: { shareOn: "Сподели на {{title}}" },
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
        about: "За проектот",
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
        positiveResult_singular: "Остварило позитивен финансиски резултат",
        income: "Оствариле приход",
        income_singular: "Остварило приход",
        earnedMore: "Заработиле повеќе отколку што потрошиле",
        earnedMore_singular: "Заработило повеќе отколку што потрошило",
        negativeResult: "Оствариле негативен финансиски резултат",
        negativeResult_singular: "Остварило негативен финансиски резултат",
        noIncome: "Не оствариле приход",
        noIncome_singular: "Не остварило приход",
        spentMore: "Потрошиле повеќе отколку што заработиле",
        spentMore_singular: "Потрошило повеќе отколку што заработило",
        quickFacts: "{{year}} година низ бројки",
        quickFactsQuarter: "Квартал {{quarter}} на {{year}} година низ бројки",
        chartTitle: "Тренд на финансиски показатели"
      },
      breadcrumbs: {
        home: "Почетна",
        registry: "Регистар",
        quickFacts: "{{year}} година низ бројки",
        quickFactsQuarter: "Квартал {{quarter}} на {{year}} година низ бројки"
      },
      cards: {
        income: "Приходи",
        expenses: "Расходи",
        "financial-result": "Финансиски резултат",
        total: "Вкупно за {{year}} година",
        totalQuarter: "Вкупно за квартал {{quarter}} на {{year}} година",
        company_singular: "јавно претпријатие или трговско друштво",
        company_plural: "јавни претпријатија или трговски друштва"
      },
      table: {
        total: "Вкупно"
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
      overview: {
        chartTitle: "Финансиски показатели за {{year}} година",
        chartTitleQuarter: "Финансиски показатели за квартал {{quarter}} на {{year}} година"
      },
      filteredChart: {
        "positive-result": "јавни претпријатија или трговски друштва што оствариле позитивен финансиски резултат",
        "positive-result_singular": "јавно претпријатие или трговско друштво што остварило позитивен финансиски резултат",
        "income": "јавни претпријатија или трговски друштва што оствариле приход",
        "income_singular": "јавно претпријатие или трговско друштво што остварило приход",
        "earned-more": "јавни претпријатија или трговски друштва што заработиле повеќе отколку што потрошиле",
        "earned-more_singular": "јавно претпријатие или трговско друштво што заработило повеќе отколку што потрошило",
        "negative-result": "јавни претпријатија или трговски друштва што оствариле негативен финансиски резултат",
        "negative-result_singular": "јавно претпријатие или трговско друштво што остварило негативен финансиски резултат",
        "no-income": "јавни претпријатија или трговски друштва што немале приход",
        "no-income_singular": "јавно претпријатие или трговско друштво што немало приход",
        "spent-more": "јавни претпријатија или трговски друштва што потрошиле повеќе отколку што заработиле",
        "spent-more_singular": "јавно претпријатие или трговско друштво што потрошило повеќе отколку што заработило",
        yearTitle: "во {{year}} година",
        quarterTitle: "во квартал {{quarter}} на {{year}} година"
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
        title: "Registry of Public Enterprises and Trading Companies in State Ownership of R. N. Macedonia",
        description: "Interactive registry of public enterprises and trading companies in state ownership of the Republic of North Macedonia, according to data of",
        ministry: "Ministry of Finance"
      },
      header: { shareOn: "Share on {{title}}" },
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
        about: "About",
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
        positiveResult: "Achieved Positive Financial Result",
        positiveResult_singular: "Achieved Positive Financial Result",
        income: "Made Income",
        income_singular: "Made Income",
        earnedMore: "Earned More than They Spent",
        earnedMore_singular: "Earned More than It Spent",
        negativeResult: "Achieved Negative Financial Result",
        negativeResult_singular: "Achieved Negative Financial Result",
        noIncome: "Didn't Make Income",
        noIncome_singular: "Didn't Make Income",
        spentMore: "Spent More than They Earned",
        spentMore_singular: "Spent More than It Earned",
        quickFacts: "{{year}} in Numbers",
        quickFactsQuarter: "Q{{quarter}} of {{year}} in Numbers",
        chartTitle: "Financial Indicators Trend"
      },
      breadcrumbs: {
        home: "Home",
        registry: "Registry",
        quickFacts: "{{year}} in Numbers",
        quickFactsQuarter: "Q{{quarter}} of {{year}} in Numbers",
      },
      cards: {
        income: "Income",
        expenses: "Expenses",
        "financial-result": "Financial Result",
        total: "Total for {{year}}",
        totalQuarter: "Total for Q{{quarter}} of {{year}}",
        company_singular: "public enterprise or company",
        company_plural: "public enterprises or companies"
      },
      table: {
        total: "Total"
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
        highestIncome: "Highest Incomes",
        lowestIncome: "Lowest Incomes",
        highestExpenses: "Highest Expenses",
        lowestExpenses: "Lowest Expenses",
        bestResult: "Best Financial Results",
        worstResult: "Worst Financial Results"
      },
      overview: {
        chartTitle: "Financial Indicators for {{year}}",
        chartTitleQuarter: "Financial Indicators for Q{{quarter}} of {{year}}"
      },
      filteredChart: {
        "positive-result": "Public Enterprises or Companies that Achieved Positive Financial Result",
        "positive-result_singular": "Public Enterprise or Company that Achieved Positive Financial Result",
        "income": "Public Enterprises or Companies that Made Income",
        "income_singular": "Public Enterprise or Company that Made Income",
        "earned-more": "Public Enterprises or Companies that Earned More Than They Spent",
        "earned-more_singular": "Public Enterprise or Company that Earned More Than It Spent",
        "negative-result": "Public Enterprises or Companies that Achieved Negative Financial Result",
        "negative-result_singular": "Public Enterprise or Company that Achieved Negative Financial Result",
        "no-income": "Public Enterprises or Companies that Had No Income",
        "no-income_singular": "Public Enterprise or Company that Had No Income",
        "spent-more": "Public Enterprises or Companies that Spent More Than They Earned",
        "spent-more_singular": "Public Enterprise or Company that Spent More Than It Earned",
        yearTitle: "in {{year}}",
        quarterTitle: "in Q{{quarter}} of {{year}}"
      },
      company: {
        notFound: "Company Not Found",
        notFoundDesc: "Double-check the address to make sure it's right. You might've just had a little typo, or maybe the old one isn't there anymore!",
        allYears: "All years",
        allQuarters: "All quarters",
        chartTitle: "Graphical Display of Income, Expenses and Financial Results",
        noData: "No data for the selected year.",
        year: "Year",
        quarter: "Quarter",
        prevCompany: "Previous Company",
        nextCompany: "Next Company",
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
  const cleanPath = path.replace(/^\/(mk|en)\/?/, "/");
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
};
