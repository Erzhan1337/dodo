import type { Option } from "@/features/sort-products/model/types";
import {
  ChartBarDecreasing,
  ChartBarIncreasing,
  Star,
} from "lucide-react"

export const options:Option[] = [
  { name: "по рейтингу", value: "rating", icon: <Star /> },
  { name: "по цене", value: "asc", icon: <ChartBarIncreasing /> },
  { name: "по цене", value: "desc", icon: <ChartBarDecreasing /> },
]