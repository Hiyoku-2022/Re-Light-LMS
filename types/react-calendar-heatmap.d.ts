declare module "react-calendar-heatmap" {
    import { ComponentType } from "react";
  
    interface HeatmapValue {
      date: string;
      count: number;
    }
  
    interface CalendarHeatmapProps {
      values: HeatmapValue[];
      startDate: Date;
      endDate: Date;
      classForValue?: (value: HeatmapValue | null) => string;
      tooltipDataAttrs?: (value: HeatmapValue | null) => object;
      showWeekdayLabels?: boolean;
      onClick?: (value: HeatmapValue) => void;
    }
  
    const CalendarHeatmap: ComponentType<CalendarHeatmapProps>;
    export default CalendarHeatmap;
  }
  