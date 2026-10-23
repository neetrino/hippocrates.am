const serviceMessages = {
  "service.consult": "consult",
  "service.cleaning": "cleaning",
  "service.surgicalConsult": "surgicalConsult",
  "service.extraction": "extraction",
  "service.orthodonticConsult": "orthodonticConsult",
  "service.braceCheck": "braceCheck",
  "service.implantConsult": "implantConsult",
  "service.followUp": "followUp",
  "service.childExam": "childExam",
  "service.preventive": "preventive",
  "service.prostheticConsult": "prostheticConsult",
  "service.crownPrep": "crownPrep",
  "Խորհրդատվություն": "consult",
  "Մաքրում": "cleaning",
  "Վիրաբուժական խորհրդատվություն": "surgicalConsult",
  "Ատամի հեռացում": "extraction",
  "Օրթոդոնտիկ խորհրդատվություն": "orthodonticConsult",
  "Կապիչների հսկողություն": "braceCheck",
  "Իմպլանտի խորհրդատվություն": "implantConsult",
  "Վերահսկիչ այց": "followUp",
  "Մանկական զննում": "childExam",
  "Կանխարգելիչ մշակում": "preventive",
  "Օրթոպեդիկ խորհրդատվություն": "prostheticConsult",
  "Պսակի չափագրում": "crownPrep",
} as const;

export type ServiceMessageKey = (typeof serviceMessages)[keyof typeof serviceMessages];

const englishAliases: Record<string, ServiceMessageKey> = {
  consultation: "consult",
  consult: "consult",
  cleaning: "cleaning",
  "tooth extraction": "extraction",
  extraction: "extraction",
  "surgical consultation": "surgicalConsult",
  "orthodontic consultation": "orthodonticConsult",
  "brace check": "braceCheck",
  "implant consultation": "implantConsult",
  "follow-up": "followUp",
  "follow-up visit": "followUp",
  "children's exam": "childExam",
  "preventive care": "preventive",
  "prosthodontic consultation": "prostheticConsult",
  "crown preparation": "crownPrep",
};

const serviceByName = new Map<string, ServiceMessageKey>(
  Object.entries(serviceMessages).map(([name, key]) => [name.toLowerCase(), key]),
);

for (const [name, key] of Object.entries(englishAliases)) serviceByName.set(name, key);

/** Known services follow the UI language. A clinic-written name stays as stored. */
export function localizedServiceName(name: string, label: (key: ServiceMessageKey) => string): string {
  const key = serviceByName.get(name.trim().toLowerCase());
  return key ? label(key) : name;
}
