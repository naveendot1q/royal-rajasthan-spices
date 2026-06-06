import { CheckCircle2, Circle, Clock } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@rrs/types";

interface OrderTimelineProps {
  currentStatus: typeof ORDER_STATUS_SEQUENCE[number];
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIdx = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);

  return (
    <div className="flex items-start">
      {ORDER_STATUS_SEQUENCE.map((status, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;

        return (
          <div key={status} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {idx < ORDER_STATUS_SEQUENCE.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${isCompleted ? "bg-royal-gold-500" : "bg-gray-200"}`} />
            )}

            {/* Circle */}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCompleted ? "bg-royal-gold-500" :
              isCurrent ? "bg-maroon-500 ring-4 ring-maroon-100" :
              "bg-gray-200"
            }`}>
              {isCompleted ? (
                <CheckCircle2 size={18} className="text-white" />
              ) : isCurrent ? (
                <Clock size={16} className="text-white" />
              ) : (
                <Circle size={16} className="text-gray-400" />
              )}
            </div>

            {/* Label */}
            <p className={`text-xs text-center mt-2 px-1 ${
              isCurrent ? "text-maroon-600 font-semibold" :
              isCompleted ? "text-royal-gold-700 font-medium" :
              "text-gray-400"
            }`}>
              {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
