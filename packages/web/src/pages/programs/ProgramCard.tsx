import { Link } from "react-router-dom";
import { Calendar, Dumbbell, Flame, Star } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { GOAL_LABELS, LEVEL_LABELS, type Program } from "../../mocks/types";
import { Badge } from "../../components/ui/badge";

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard = ({ program }: ProgramCardProps) => (
  <Link
    to={ROUTES.programDetail(program.slug)}
    className="group flex flex-col overflow-hidden border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
  >
    <div className="relative aspect-[16/10] overflow-hidden">
      <img
        src={program.image}
        alt={program.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute left-0 top-0 flex gap-2 p-3">
        <Badge>{GOAL_LABELS[program.goal]}</Badge>
        <Badge variant="dark">{LEVEL_LABELS[program.level]}</Badge>
      </div>
    </div>

    <div className="flex flex-1 flex-col p-5">
      <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
        <span className="font-semibold text-foreground">{program.rating}</span>
        <span>· {program.enrolled.toLocaleString()} enrolled</span>
      </div>

      <h3 className="font-heading text-xl font-bold uppercase leading-tight tracking-tight">
        {program.title}
      </h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">
        {program.tagline}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
        <div className="flex flex-col items-center gap-1">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-semibold">{program.durationWeeks}w</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Dumbbell className="h-4 w-4 text-primary" />
          <span className="font-semibold">{program.daysPerWeek}x / wk</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Flame className="h-4 w-4 text-primary" />
          <span className="font-semibold">{program.dailyCalories}</span>
        </div>
      </div>
    </div>
  </Link>
);
