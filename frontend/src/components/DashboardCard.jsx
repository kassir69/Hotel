// components/DashboardCard.jsx
const colorMap = {
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-400" },
  red:   { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-700",   dot: "bg-red-400" },
  blue:  { bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-700",  dot: "bg-blue-400" },
  yellow:{ bg: "bg-yellow-50",border: "border-yellow-200",text: "text-yellow-700",dot: "bg-yellow-400" },
};

export default function DashboardCard({ title, amount, color = "blue", subtitle }) {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${c.dot}`}></span>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
      </div>
      <p className={`text-3xl font-bold ${c.text} font-display`}>
        {Number(amount).toLocaleString("fr-FR")} <span className="text-lg font-normal">FCFA</span>
      </p>
      {subtitle && <p className="text-gray-400 text-xs mt-2">{subtitle}</p>}
    </div>
  );
}
