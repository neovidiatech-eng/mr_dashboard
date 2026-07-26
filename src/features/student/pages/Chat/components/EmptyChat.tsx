import { Send } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export default function EmptyChat({
  title,
  description,
}: Props) {

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">

      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
        <Send className="w-6 h-6 text-slate-400" />
      </div>

      <div>
        <h4 className="text-lg font-bold text-slate-700">
          {title}
        </h4>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}