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

/** Known services follow the UI language. A clinic-written name stays as stored. */
export function localizedServiceName(name: string, label: (key: ServiceMessageKey) => string): string {
  if (Object.prototype.hasOwnProperty.call(serviceMessages, name)) {
    return label(serviceMessages[name as keyof typeof serviceMessages]);
  }
  return name;
}
