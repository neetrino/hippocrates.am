type ClinicCopy = { name: string; district: string; address: string; description: string };
type DoctorCopy = { name: string; specialty: string; bio: string };
type ReviewCopy = { body: string; reply: string };

export const clinicLocaleCopy: Record<string, { en: ClinicCopy; ru: ClinicCopy }> = {
  "Արեգ Ստոմատոլոգիա": {
    en: {
      name: "Areg Stomatology",
      district: "Kentron",
      address: "Abovyan 18, Yerevan",
      description: "Therapy and surgery in a calm, bright office.",
    },
    ru: {
      name: "Арег Стоматология",
      district: "Кентрон",
      address: "Абовяна 18, Ереван",
      description: "Терапевтический и хирургический приём в спокойном светлом кабинете.",
    },
  },
  "Նաիրի Դենտ": {
    en: {
      name: "Nairi Dent",
      district: "Arabkir",
      address: "Komitas 42, Yerevan",
      description: "Orthodontics and implants at one address, with a treatment plan.",
    },
    ru: {
      name: "Наири Дент",
      district: "Арабкир",
      address: "Комитаса 42, Ереван",
      description: "Ортодонтия и импланты по одному адресу, с планом лечения.",
    },
  },
  "Վարպետ Ատամ": {
    en: {
      name: "Varpet Atam",
      district: "Ajapnyak",
      address: "Shiraz 7, Yerevan",
      description: "Children's visits and prosthetic care in a family clinic.",
    },
    ru: {
      name: "Варпет Атам",
      district: "Аджапняк",
      address: "Шираза 7, Ереван",
      description: "Детский приём и ортопедическое восстановление в семейной клинике.",
    },
  },
};

export const doctorLocaleCopy: Record<string, { en: DoctorCopy; ru: DoctorCopy }> = {
  "Անի Հակոբյան": {
    en: { name: "Ani Hakobyan", specialty: "Therapist", bio: "Treats cavities, restoration, and preventive care." },
    ru: { name: "Ани Акопян", specialty: "Терапевт", bio: "Занимается кариесом, восстановлением и профилактикой." },
  },
  "Գոռ Պետրոսյան": {
    en: { name: "Gor Petrosyan", specialty: "Surgeon", bio: "Tooth extraction and minor surgical procedures." },
    ru: { name: "Гор Петросян", specialty: "Хирург", bio: "Удаление зубов и небольшие хирургические вмешательства." },
  },
  "Մանե Սարգսյան": {
    en: { name: "Mane Sargsyan", specialty: "Orthodontist", bio: "Bite correction for teenagers and adults." },
    ru: { name: "Мане Саргсян", specialty: "Ортодонт", bio: "Исправление прикуса у подростков и взрослых." },
  },
  "Լևոն Ավետիսյան": {
    en: { name: "Levon Avetisyan", specialty: "Implantologist", bio: "Implant planning and restoration, explained step by step." },
    ru: { name: "Левон Аветисян", specialty: "Имплантолог", bio: "Планирование импланта и восстановление понятными шагами." },
  },
  "Լիլիթ Գրիգորյան": {
    en: { name: "Lilit Grigoryan", specialty: "Pediatric dentist", bio: "Keeps a child's first visit calm and short." },
    ru: { name: "Лилит Григорян", specialty: "Детский стоматолог", bio: "Делает первый визит ребёнка спокойным и коротким." },
  },
  "Արմեն Մկրտչյան": {
    en: { name: "Armen Mkrtchyan", specialty: "Prosthodontist", bio: "Crowns and restoration when the tooth should be kept." },
    ru: { name: "Армен Мкртчян", specialty: "Ортопед", bio: "Коронки и восстановление, когда зуб нужно сохранить." },
  },
};

export const reviewLocaleCopy: Record<string, { en: ReviewCopy; ru: ReviewCopy }> = {
  "Ընդունելությունը հանգիստ էր, ժամը պահեցին, և բացատրեցին հաջորդ քայլը։": {
    en: {
      body: "The visit was calm, they kept the appointment time, and they explained the next step.",
      reply: "Thank you. We look forward to your next visit.",
    },
    ru: {
      body: "Приём прошёл спокойно, время выдержали и объяснили следующий шаг.",
      reply: "Спасибо. Ждём вас на следующем визите.",
    },
  },
};
