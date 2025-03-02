import { LucideIcon } from "lucide-react";

export interface Stat {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  bgColor: string;
  iconColor: string;
}


export interface Schedule {
  text: string;
  time: string;
  location: string;
  urgent?: boolean;
}