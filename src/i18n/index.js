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
        title_short: "Jавни претпријатија и трговски друштва на Р. С. Македонија",
        description: "Интерактивен регистар на јавни претпријатија и трговски друштва во државна сопственост на Република Северна Македонија, според податоци на",
        ministry: "Министерството за финансии",
        lastUpdated: "Податоците се ажурирани на"
      },
      header: { shareOn: "Сподели на {{title}}" },
      footer: {
        sourceCode: "Изворниот код",
        license: "CC BY-NC-SA 4.0",
        madeBy: "Изработено од",
        author: "Гоце Митевски",
        availableOn: "е достапен на GitHub под лиценцата"
      },
      cookieConsent: {
        message: "Ова мрежно место користи т.н. колачиња за подобрување на корисничкото искуство.",
        button: "Во ред"
      },
      nav: {
        home: "Почетна",
        registry: "Регистар",
        about: "За проектот",
        year: "Година",
        quarter: "Квартал",
        all: "Сите квартали",
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
        error: "Грешка при вчитување на податоците:",
        noResults: "Не постојат јавни претпријатија и трговски друштва за внесените параметри или пак, сте направиле некоја грешка при пребарувањето."
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
      titles: {
        home: "Почетна",
        registry: "Регистар",
        about: "За проектот",
        "positive-result": "Оствариле позитивен финансиски резултат",
        "income": "Оствариле приход",
        "earned-more": "Заработиле повеќе отколку што потрошиле",
        "negative-result": "Оствариле негативен финансиски резултат",
        "no-income": "Не оствариле приход",
        "spent-more": "Потрошиле повеќе отколку што заработиле",
        yearQuarter: "во {{year}} година",
        yearQuarterQuarter: "во квартал {{quarter}} на {{year}} година"
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
      },
      about: {
        intro: "Регистарот на јавни претпријатија и трговски друштва во државна сопственост на Р. С. Македонија е изработен за да овозможи увид во работата на јавните претпријатија и трговските друштва во сопственост на Република Северна Македонија.",
        introStrong: "Податоците што ги објавува Министерството за финансии добиваат сосема нова вредност, презентирани како дел од компјутерска презентација.",
        goalTitle: "Цел и придобивки",
        goal: "Целта на проектот е да ги диференцира јавните претпријатија и трговски друштва според нивните приходи, расходи и финансиски резултати, како и да ги открие проблемите во работењето, што инаку не се толку лесно видливи.",
        filters: "Преку едноставни начини на филтрирање, на било кој корисник му е овозможено да го добие бараниот преглед на сегмент од податоците и да донесе заклучок за квалитетот на работењето на одредено јавно претпријатие или трговско друштво. Одделните профилни страници за секое јавно претпријатие или трговско друштво пак, овозможуваат севкупен преглед на работата низ годините за коишто се достапни податоци.",
        visualization: "Користењето на графикони, сумарни вредности и топ-листи го олеснува разбирањето на податоците и го подобрува корисничкото искуство.",
        dataSourceTitle: "Изворни податоци",
        dataSourceData: "Изворните податоци",
        dataSource: "се преземени од Министерството за финансии на Република Северна Македонија и обработени за соодветна презентација во апликацијата.",
        dataSourceLink: "Обработените податоци",
        dataSourceLinkDesc: "се достапни за слободно преземање за сите заинтересирани страни.",
        additionalMaterialsTitle: "Дополнителни материјали",
        additionalMaterials: "Macedonian money, a business background",
        ai: "Вештачка интелигенција",
        aiDesc: "При изработката на проектот се користени различни модели за вештачка интелигенција, како MiniMax M2.5, Gemini и Qwen 3.5, со помош на алатката",
        opencode: "„OpenCode“",
        sourceCodeTitle: "Изворен код",
        sourceCodeDesc: "на оваа компјутерска презентација е објавен на мрежата GitHub и слободно достапен за користење на сите заинтересирани страни под условите предвидени во лиценцата.",
        licenseTitle: "Лиценца за користење",
        licenseDesc: "Изворниот код на оваа компјутерска презентација може слободно да се користи под условите предвидени во лиценцата",
        updatesTitle: "Ажурирање",
        updates: "Податоците се ажурираат повремено, соодветно на објавите на Министерството за финансии на Република Северна Македонија. Датумот на последното ажурирање е назначен во заглавието на секоја страница.",
        responsibilityTitle: "Одговорност",
        responsibility: "Авторот на оваа компјутерска презентација во целост",
        responsibilityStrong: "се иззема од одговорност за можни грешки во изворните или обработените податоци.",
        responsibilityFix: "Доколку сметате дека некаде е направена грешка или пак е потребна исправка, љубезно",
        responsibilityLink: "пријавете",
        responsibilityLinkDesc: "преку системот GitHub.",
        imageAlt: "Промотивна слика за медиумска реупотреба"
      }
    }
  },
  en: {
    translation: {
      app: {
        title: "Registry of Public Enterprises and Trading Companies in State Ownership of R. N. Macedonia",
        title_short: "Public Enterprises and Trading Companies of R. N. Macedonia",
        description: "Interactive registry of public enterprises and trading companies in state ownership of the Republic of North Macedonia, according to data of",
        ministry: "Ministry of Finance",
        lastUpdated: "Data last updated on"
      },
      header: { shareOn: "Share on {{title}}" },
      footer: {
        sourceCode: "The source code",
        license: "CC BY-NC-SA 4.0",
        madeBy: "Made by",
        author: "Goce Mitevski",
        availableOn: "is available on GitHub under the"
      },
      cookieConsent: {
        message: "This website uses cookies to improve user experience.",
        button: "Got it"
      },
      nav: {
        home: "Home",
        registry: "Registry",
        about: "About",
        year: "Year",
        quarter: "Quarter",
        all: "All quarters",
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
        error: "Error loading data:",
        noResults: "No public enterprises or companies match your search criteria, or you may have made an error during your search."
      },
      summary: {
        explore: "Explore",
        positiveResult: "Achieved Positive Financial Result",
        positiveResult_singular: "Achieved Positive Financial Result",
        income: "Earned Income",
        income_singular: "Earned Income",
        earnedMore: "Earned More than They Spent",
        earnedMore_singular: "Earned More than It Spent",
        negativeResult: "Achieved Negative Financial Result",
        negativeResult_singular: "Achieved Negative Financial Result",
        noIncome: "Didn't Earn Income",
        noIncome_singular: "Didn't Earn Income",
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
        "income": "Public Enterprises or Companies that Earned Income",
        "income_singular": "Public Enterprise or Company that Earned Income",
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
      titles: {
        home: "Home",
        registry: "Registry",
        about: "About",
        "positive-result": "Achieved Positive Financial Result",
        "income": "Earned Income",
        "earned-more": "Earned More Than They Spent",
        "negative-result": "Achieved Negative Financial Result",
        "no-income": "Didn't Earn Income",
        "spent-more": "Spent More Than They Earned",
        yearQuarter: "in {{year}}",
        yearQuarterQuarter: "in Q{{quarter}} of {{year}}"
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
      },
      about: {
        intro: "The Registry of Public Enterprises and Trading Companies in State Ownership of R. N. Macedonia has been created to provide insight into the work of public enterprises and trading companies in state ownership of the Republic of North Macedonia.",
        introStrong: "The data published by the Ministry of Finance gains entirely new value, presented as part of a computer presentation.",
        goalTitle: "Goal and Benefits",
        goal: "The goal of the project is to differentiate public enterprises and trading companies according to their income, expenses and financial results, as well as to reveal problems in their operations, which are otherwise not so easily visible.",
        filters: "Through simple filtering methods, any user is able to get the desired overview of a segment of the data and draw conclusions about the quality of operations of a particular public enterprise or trading company. Dedicated profile pages for each public enterprise or trading company also provide a comprehensive overview of operations over the years for which data is available.",
        visualization: "The use of charts, summary values and top-lists facilitates understanding of the data and improves the user experience.",
        dataSourceTitle: "Data Sources",
        dataSourceData: "The source data",
        dataSource: "is taken from the Ministry of Finance of the Republic of North Macedonia and processed for appropriate presentation in the application.",
        dataSourceLink: "The refined dataset",
        dataSourceLinkDesc: "is available for free download for all interested parties.",
        additionalMaterialsTitle: "Additional Materials",
        additionalMaterials: "Macedonian money, a business background",
        ai: "Artificial Intelligence",
        aiDesc: "Various artificial intelligence models, such as MiniMax M2.5, Gemini and Qwen 3.5, were used in the development of the project, using",
        opencode: "OpenCode",
        sourceCodeTitle: "Source Code",
        sourceCodeDesc: "of this computer presentation is published on GitHub and freely available for use by all interested parties under the terms of the license.",
        licenseTitle: "License",
        licenseDesc: "The source code of this computer presentation can be freely used under the terms of the license",
        updatesTitle: "Updates",
        updates: "Data is updated periodically, in accordance with announcements from the Ministry of Finance of the Republic of North Macedonia. The date of the last update is indicated in the header of each page.",
        responsibilityTitle: "Responsibility",
        responsibility: "The author of this computer presentation entirely",
        responsibilityStrong: "accepts no responsibility for possible errors in the source or processed data.",
        responsibilityFix: "If you believe a mistake has been made and a correction is needed, please",
        responsibilityLink: "report it",
        responsibilityLinkDesc: "via the GitHub system.",
        imageAlt: "Promotional image for media reuse"
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
