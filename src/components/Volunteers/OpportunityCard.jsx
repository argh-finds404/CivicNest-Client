import { Link } from"react-router";

const TYPE_CONFIG = {
 cleanup_event: {
 color:"bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
 icon:"ri-leaf-line",
 label:"Cleanup Event",
 },
 feeding_drive: {
 color:"bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
 icon:"ri-restaurant-line",
 label:"Feeding Drive",
 },
 issue_help: {
 color:"bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
 icon:"ri-alert-line",
 label:"Issue Help",
 },
};

export default function OpportunityCard({ opportunity: opp }) {
 const cfg = TYPE_CONFIG[opp.type] || TYPE_CONFIG.issue_help;

 return (
 <div className="flex items-start gap-4 p-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-gray-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg hover:border-teal-400/50 hover:shadow-md transition-all">
 {/* Image or icon */}
 {opp.image ? (
 <img
 src={opp.image}
 alt={opp.title}
 className="w-16 h-16 rounded-xl object-cover flex-shrink-0"/>
 ) : (
 <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
 <i className={`${cfg.icon} text-2xl tracking-tight text-gray-400`} />
 </div>
 )}

 {/* Content */}
 <div className="flex-grow min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span
 className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}
 >
 {cfg.label}
 </span>
 {opp.skills?.slice(0, 2).map((s) => (
 <span
 key={s}
 className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:text-slate-300">
 {s}
 </span>
 ))}
 </div>

 <h3
 className="font-semibold text-gray-900 dark:text-white text-[13px] line-clamp-1 tracking-tight"style={{ fontFamily:"HKGrotesk, sans-serif"}}
 >
 {opp.title}
 </h3>

 <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5 line-clamp-1">
 📍 {opp.location || opp.area}
 {opp.date &&`· 📅 ${new Date(opp.date).toLocaleDateString("en-GB", { day:"numeric", month:"short"})}`}
 {opp.time &&`· ${opp.time}`}
 </p>

 {opp.spotsLeft !== null && opp.spotsLeft !== undefined && (
 <p
 className={`text-xs font-semibold mt-1 ${opp.spotsLeft <= 5 ?"text-red-500":"text-teal-600"}`}
 >
 {opp.spotsLeft <= 0 ?"Spots full":`${opp.spotsLeft} spots left`}
 </p>
 )}
 </div>

 {/* CTA */}
 <Link
 to={opp.link}
 className="flex-shrink-0 px-3 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors whitespace-nowrap self-center">
 {opp.actionLabel} →
 </Link>
 </div>
 );
}
