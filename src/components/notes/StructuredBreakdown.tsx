import { Pill, ClipboardList, CalendarClock, AlertTriangle, Stethoscope } from "lucide-react";

interface Med { name?: string; dose?: string; frequency?: string; purpose?: string }
interface FollowUp { what?: string; when?: string }

export interface Structured {
  diagnosis?: string;
  medications?: Med[];
  tests_ordered?: string[];
  follow_ups?: FollowUp[];
  red_flags?: string[];
}

export default function StructuredBreakdown({ data }: { data: Structured | null | undefined }) {
  if (!data) return null;
  const hasAny =
    data.diagnosis || data.medications?.length || data.tests_ordered?.length ||
    data.follow_ups?.length || data.red_flags?.length;
  if (!hasAny) return <p className="text-[13px] text-muted-foreground">No structured details extracted.</p>;

  return (
    <div className="space-y-4">
      {data.diagnosis && (
        <Section icon={<Stethoscope className="h-3.5 w-3.5" />} label="Diagnosis">
          <p className="text-[14px]">{data.diagnosis}</p>
        </Section>
      )}

      {!!data.medications?.length && (
        <Section icon={<Pill className="h-3.5 w-3.5" />} label="Medications">
          <ul className="space-y-1.5">
            {data.medications.map((m, i) => (
              <li key={i} className="text-[14px]">
                <span className="font-medium">{m.name || "—"}</span>
                {(m.dose || m.frequency) && (
                  <span className="text-muted-foreground"> · {[m.dose, m.frequency].filter(Boolean).join(" · ")}</span>
                )}
                {m.purpose && <div className="text-[12px] text-muted-foreground">For: {m.purpose}</div>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!!data.tests_ordered?.length && (
        <Section icon={<ClipboardList className="h-3.5 w-3.5" />} label="Tests ordered">
          <ul className="list-disc pl-5 space-y-1 text-[14px]">
            {data.tests_ordered.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Section>
      )}

      {!!data.follow_ups?.length && (
        <Section icon={<CalendarClock className="h-3.5 w-3.5" />} label="Follow-ups">
          <ul className="space-y-1 text-[14px]">
            {data.follow_ups.map((f, i) => (
              <li key={i}>
                {f.what}
                {f.when && <span className="text-muted-foreground"> · {f.when}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!!data.red_flags?.length && (
        <Section icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600" />} label="Watch for">
          <ul className="list-disc pl-5 space-y-1 text-[14px]">
            {data.red_flags.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[1.2px] text-muted-foreground mb-1.5">
        {icon}<span>{label}</span>
      </div>
      {children}
    </div>
  );
}