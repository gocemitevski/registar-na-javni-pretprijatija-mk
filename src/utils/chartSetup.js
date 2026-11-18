// Central Chart.js setup. Importing "chart.js/auto" registers every
// controller, element and plugin, which is roughly twice the code the app
// actually uses. Register only what the charts render: bar charts
// (OverviewChart, FilteredChart) and the company line chart.
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export default Chart;
