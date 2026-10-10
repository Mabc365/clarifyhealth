import { Heart, Activity, Wind, Brain, Soup, Bone, type LucideIcon } from "lucide-react";

export type CategoryId = "heart" | "metabolism" | "lungs" | "mind" | "digestion" | "bones";

export const CATEGORIES: { id: CategoryId; icon: LucideIcon; label: Record<string, string> }[] = [
  { id: "heart", icon: Heart, label: { en: "Heart & blood", es: "Corazón y sangre" } },
  { id: "metabolism", icon: Activity, label: { en: "Hormones & sugar", es: "Hormonas y azúcar" } },
  { id: "lungs", icon: Wind, label: { en: "Lungs & sleep", es: "Pulmones y sueño" } },
  { id: "mind", icon: Brain, label: { en: "Mind & brain", es: "Mente y cerebro" } },
  { id: "digestion", icon: Soup, label: { en: "Stomach & kidneys", es: "Estómago y riñones" } },
  { id: "bones", icon: Bone, label: { en: "Bones, joints & skin", es: "Huesos, articulaciones y piel" } },
];

const MAP: Record<string, CategoryId> = {
  "high-blood-pressure": "heart", "high-cholesterol": "heart", "heart-disease": "heart", stroke: "heart", anemia: "heart",
  "type-2-diabetes": "metabolism", "pre-diabetes": "metabolism", "thyroid-disease": "metabolism",
  asthma: "lungs", copd: "lungs", "sleep-apnea": "lungs",
  anxiety: "mind", depression: "mind", adhd: "mind", migraines: "mind",
  "acid-reflux": "digestion", ibs: "digestion", "kidney-disease": "digestion", "chronic-kidney-disease": "digestion",
  arthritis: "bones", osteoporosis: "bones", "eczema-psoriasis": "bones",
};

export const getCategory = (topicId: string) => CATEGORIES.find((c) => c.id === MAP[topicId]);
export const categoryLabel = (c: { label: Record<string, string> }, lang: string) => c.label[lang] ?? c.label.en;
