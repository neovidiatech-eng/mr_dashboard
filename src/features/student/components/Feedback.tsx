import { motion } from "framer-motion";
import { Quote, Star, StarIcon } from "lucide-react";

type TeacherFeedbackProps = {
  message: string;
  rating: number;
};

export default function TeacherFeedback({
  message,
  rating,
}: TeacherFeedbackProps) {
  const percentage = (rating / 5) * 100;

  const getRatingTheme = (r: number) => {
    if (r >= 4.5) return { color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-500", label: "Excellent", star: "fill-emerald-400 text-emerald-400" };
    if (r >= 3.5) return { color: "#84cc16", bg: "bg-lime-50", text: "text-lime-500", label: "Very Good", star: "fill-lime-400 text-lime-400" };
    if (r >= 2.5) return { color: "#fbbf24", bg: "bg-amber-50", text: "text-amber-500", label: "Good", star: "fill-amber-400 text-amber-400" };
    if (r >= 1.5) return { color: "#f97316", bg: "bg-orange-50", text: "text-orange-500", label: "Fair", star: "fill-orange-400 text-orange-400" };
    return { color: "#ef4444", bg: "bg-red-50", text: "text-red-500", label: "Needs Work", star: "fill-red-400 text-red-400" };
  };

  const theme = getRatingTheme(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="
      relative overflow-hidden
      rounded-[32px]
      bg-white
      border border-slate-100
      p-5
      shadow-[0_10px_40px_rgba(0,0,0,0.08)]
      h-full flex flex-col
    "
    >
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-100 rounded-full -ml-24 -mb-24 blur-3xl" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        {/* Icon */}
        <motion.div
          whileHover={{
            rotate: 10,
            scale: 1.05,
          }}
          className={`
          w-12 h-12 rounded-xl
          bg-gradient-to-br
          from-${theme.color.startsWith("#fb") ? "yellow" : theme.bg.split("-")[1]}-100 to-${theme.color.startsWith("#fb") ? "orange" : theme.bg.split("-")[1]}-200
          flex items-center justify-center
          shadow-md
        `}
        >
          <Star
            className={theme.text + " " + theme.star.split(" ")[0]}
            size={24}
          />
        </motion.div>

        {/* Text */}
        <div>
          <div
            className="
            mt-1 inline-flex items-center gap-2
           text-primary
            px-3 py-1 rounded-full
            text-lg font-black uppercase tracking-wider
          "
          >
            Session Feedback
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 relative z-10">
        {/* Donut Rating */}
        <div className="relative flex items-center justify-center py-2">
          {/* Glow */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
            className={`
            absolute w-[120px] h-[120px]
            rounded-full ${theme.bg} blur-3xl
          `}
          />

          {/* Donut */}
          <motion.div
            animate={{
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
            }}
            className="relative"
          >
            <div
              className="
              w-[130px] h-[130px]
              rounded-full
              flex items-center justify-center
              relative
              shadow-xl
              border-[8px]
              border-slate-100
            "
              style={{
                background: `conic-gradient(
                  ${theme.color} 0% ${percentage}%,
                  #e2e8f0 ${percentage}% 100%
                )`,
              }}
            >
              {/* Inner Circle */}
              <div
                className="
                w-[95px] h-[100px]
                rounded-full bg-white
                flex flex-col items-center justify-center
                shadow-inner
              "
              >


                {/* Rating */}
                <h2 className="text-3xl text-primary tracking-tight">
                  {rating}
                </h2>

                {/* Stars */}
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={10}
                      className={
                        i <= Math.round(rating)
                          ? theme.star
                          : "text-slate-300"
                      }
                    />
                  ))}
                </div>

                <p className={`${theme.text} font-black text-[10px] uppercase tracking-widest mt-2`}>
                  {theme.label}
                </p>
              </div>

              {/* Floating Star */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 18,
                  ease: "linear",
                }}
                className="absolute inset-0"
              >
                <span className={`absolute top-3 left-10 ${theme.text}`}>
                  <StarIcon size={16} fill="currentColor" />
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feedback */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="
          relative bg-slate-50
          rounded-[24px]
          p-4
          border border-slate-100
          shadow-sm
        "
        >
          {/* Quote */}
          <div className="flex items-center gap-2 text-blue-400 opacity-40 mb-2">
            <Quote size={16} fill="currentColor" />
          </div>

          {/* Message */}
          <p className="text-primary leading-relaxed text-base font-semibold">
            {message}
          </p>


        </motion.div>
      </div>
    </motion.div>
  );
}