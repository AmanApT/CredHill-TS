"use client";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const ApexChart: React.FC = () => {
  const [chartOptions] = useState({
    chart: {
      id: "basic-area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },

    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  });
  const [chartSeries] = useState([
    {
      name: "series-1",
      data: [30, 40, 45, 50, 49, 60],
    },
  ]);
  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="area"
          width="100%"
          height="200px" // Set a fixed height if dynamic height isn't working.
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default ApexChart;
