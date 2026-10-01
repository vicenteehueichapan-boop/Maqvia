import { ReactNode } from "react";
import { type PublicationValues } from "@/lib/publication-validation";

export type Field = keyof PublicationValues;

export interface StepProps {
  values: PublicationValues;
  update: (field: Field, value: string) => void;
  mark: (field: Field) => void;
  fieldState: (field: Field) => { "aria-invalid": boolean; "aria-describedby"?: string };
  issue: (field: Field) => ReactNode;
}
