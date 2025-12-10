import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTheme } from "../shared/ThemeContext";

const colorVariants = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600", 
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  emerald: "from-emerald-500 to-emerald-600",
  teal: "from-teal-500 to-teal-600",
  amber: "from-amber-500 to-amber-600"
};

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const { isDarkMode } = useTheme();

  return (
    <Card className={`relative overflow-hidden shadow-lg border-0 hover:shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorVariants[color]} opacity-10 rounded-full transform translate-x-16 -translate-y-16`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className={`text-sm font-medium uppercase tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            <p className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <span className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorVariants[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}