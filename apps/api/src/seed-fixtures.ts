export type DoctorFixture = {
  email: string;
  displayName: string;
  specialty: string;
  bio: string;
  photoFile: string;
  offerings: { name: string; priceAmd: number; durationMinutes: number }[];
};

export type ClinicFixture = {
  adminEmail: string;
  adminName: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  description: string;
  coverFile: string;
  doctors: DoctorFixture[];
};

const weekdayWindow = { startMinute: 9 * 60, endMinute: 17 * 60 };

export const scheduleWeekdays = [1, 2, 3, 4, 5];
export const scheduleWindow = weekdayWindow;

export const patientEmail = "patient@hippocrates.local";
export const patientName = "Արամ Հովհաննիսյան";

export const clinics: ClinicFixture[] = [
  {
    adminEmail: "admin.areg@hippocrates.local",
    adminName: "Նարե Արեգյան",
    name: "Արեգ Ստոմատոլոգիա",
    district: "Կենտրոն",
    address: "Աբովյան 18, Երևան",
    phone: "+374 10 500 101",
    description: "Թերապևտիկ և վիրաբուժական ընդունելություն հանգիստ, լուսավոր կաբինետում։",
    coverFile: "cover-areg.jpg",
    doctors: [
      {
        email: "doctor.ani@hippocrates.local",
        displayName: "Անի Հակոբյան",
        specialty: "Թերապևտ",
        bio: "Զբաղվում է կարիեսով, վերականգնումով և կանխարգելիչ խնամքով։",
        photoFile: "portrait-ani.jpg",
        offerings: [
          { name: "Խորհրդատվություն", priceAmd: 8000, durationMinutes: 30 },
          { name: "Մաքրում", priceAmd: 15000, durationMinutes: 40 },
        ],
      },
      {
        email: "doctor.gor@hippocrates.local",
        displayName: "Գոռ Պետրոսյան",
        specialty: "Վիրաբույժ",
        bio: "Ատամի հեռացում և փոքր վիրաբուժական միջամտություններ։",
        photoFile: "portrait-gor.jpg",
        offerings: [
          { name: "Վիրաբուժական խորհրդատվություն", priceAmd: 10000, durationMinutes: 30 },
          { name: "Ատամի հեռացում", priceAmd: 25000, durationMinutes: 40 },
        ],
      },
    ],
  },
  {
    adminEmail: "admin.nairi@hippocrates.local",
    adminName: "Սոնա Նաիրյան",
    name: "Նաիրի Դենտ",
    district: "Արաբկիր",
    address: "Կոմիտաս 42, Երևան",
    phone: "+374 10 500 202",
    description: "Օրթոդոնտիա և իմպլանտացիա մեկ հասցեում, նախնական պլանով։",
    coverFile: "cover-nairi.jpg",
    doctors: [
      {
        email: "doctor.mane@hippocrates.local",
        displayName: "Մանե Սարգսյան",
        specialty: "Օրթոդոնտ",
        bio: "Կծվածքի շտկում դեռահասների և մեծահասակների համար։",
        photoFile: "portrait-mane.jpg",
        offerings: [
          { name: "Օրթոդոնտիկ խորհրդատվություն", priceAmd: 12000, durationMinutes: 40 },
          { name: "Կապիչների հսկողություն", priceAmd: 18000, durationMinutes: 30 },
        ],
      },
      {
        email: "doctor.levon@hippocrates.local",
        displayName: "Լևոն Ավետիսյան",
        specialty: "Իմպլանտոլոգ",
        bio: "Իմպլանտի պլանավորում և վերականգնում բացատրելի քայլերով։",
        photoFile: "portrait-levon.jpg",
        offerings: [
          { name: "Իմպլանտի խորհրդատվություն", priceAmd: 15000, durationMinutes: 40 },
          { name: "Վերահսկիչ այց", priceAmd: 8000, durationMinutes: 20 },
        ],
      },
    ],
  },
  {
    adminEmail: "admin.varpet@hippocrates.local",
    adminName: "Հասմիկ Վարպետյան",
    name: "Վարպետ Ատամ",
    district: "Աջափնյակ",
    address: "Շիրազի 7, Երևան",
    phone: "+374 10 500 303",
    description: "Մանկական ընդունելություն և օրթոպեդիկ վերականգնում ընտանեկան կլինիկայում։",
    coverFile: "cover-varpet.jpg",
    doctors: [
      {
        email: "doctor.lilit@hippocrates.local",
        displayName: "Լիլիթ Գրիգորյան",
        specialty: "Մանկական ստոմատոլոգ",
        bio: "Երեխաների առաջին այցը դարձնում է հանգիստ և կարճ։",
        photoFile: "portrait-lilit.jpg",
        offerings: [
          { name: "Մանկական զննում", priceAmd: 7000, durationMinutes: 30 },
          { name: "Կանխարգելիչ մշակում", priceAmd: 12000, durationMinutes: 30 },
        ],
      },
      {
        email: "doctor.armen@hippocrates.local",
        displayName: "Արմեն Մկրտչյան",
        specialty: "Օրթոպեդ",
        bio: "Պսակներ և վերականգնում, երբ ատամը պետք է պահել։",
        photoFile: "portrait-armen.jpg",
        offerings: [
          { name: "Օրթոպեդիկ խորհրդատվություն", priceAmd: 10000, durationMinutes: 30 },
          { name: "Պսակի չափագրում", priceAmd: 20000, durationMinutes: 50 },
        ],
      },
    ],
  },
];

export const questions = [
  {
    title: "Սպիտակեցումը վնասո՞ւմ է էմալը",
    body: "Ուզում եմ հասկանալ, արդյոք սպիտակեցումը անվտանգ է զգայուն ատամների դեպքում։",
    category: "Թերապիա",
    doctorEmail: "doctor.ani@hippocrates.local",
    answer: "Զգայուն ատամների դեպքում նախ ստուգում ենք էմալը և ընտրում ենք մեղմ եղանակ։ Առանց զննման սպիտակեցում չենք սկսում։",
  },
  {
    title: "Ե՞րբ հեռացնել իմաստության ատամը",
    body: "Իմաստության ատամը երբեմն ցավում է։ Պարտադի՞ր է հեռացնել, եթե դեռ ամբողջովին դուրս չի եկել։",
    category: "Վիրաբուժություն",
    doctorEmail: "doctor.gor@hippocrates.local",
    answer: "Հեռացումը պետք է, երբ ատամը սխալ է դիրքավորված, բորբոքում է առաջացնում կամ վնասում է հարևան ատամը։ Նկարը ցույց է տալիս, արդյոք սպասելը անվտանգ է։",
  },
];
