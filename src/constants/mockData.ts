export const MOCK_USERS = [
  {
    id: "1",
    email: "smerx620@gmail.com",
    username: "admin",
    password: "admin",
    firstName: "Дмитрий",
    lastName: "Тепляшин",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "student@example.com",
    username: "student",
    password: "student",
    firstName: "Иван",
    lastName: "Иванов",
    role: "student" as const,
    grade: "11",
    parentPhone: "+79001234567",
  },
];

export const CONTACT_INFO = {
  name: "Дмитрий Андреевич Тепляшин",
  phone: "+7 904 123-75-34",
  telegram: "@IRK_Dmitry_Teplyashin",
  email: "smerx620@gmail.com",
  company: "ГК Форус",
  location: "Иркутск",
  consultationPrice: 1000,
  availableSlots: 3,
};

export const ACHIEVEMENTS = {
  studentsCount: 85,
  egeScore: 92,
  experienceYears: 5,
  averageStudentScore: 74,
};

// Рабочие изображения (замените на ваши реальные фото при публикации)
export const PHOTOS = {
  profile: "https://i.ibb.co/KvnnGnZ/photo-2025-08-21-20-06-59.jpg",
  profile2: "https://i.ibb.co/VWT6ddkk/image.png",
  baikal: "https://i.ibb.co/Gf0dhTg9/photo-2025-08-21-20-18-47.jpg",
  vladivostok: "https://i.ibb.co/xKpfxCLf/photo-2025-08-21-20-19-26.jpg",
};

// Генерируем реалистичные результаты для 40 учеников со средним баллом 74
export const generateStudentResults = (): number[] => {
  const results: number[] = [];
  const target = 74;

  // Распределение баллов: больше результатов около среднего
  const distributions = [
    { range: [65, 69], weight: 0.15 },
    { range: [70, 74], weight: 0.35 },
    { range: [75, 79], weight: 0.25 },
    { range: [80, 84], weight: 0.15 },
    { range: [85, 94], weight: 0.1 },
  ];

  for (let i = 0; i < 40; i++) {
    const rand = Math.random();
    let cumWeight = 0;

    for (const dist of distributions) {
      cumWeight += dist.weight;
      if (rand <= cumWeight) {
        const score =
          Math.floor(Math.random() * (dist.range[1] - dist.range[0] + 1)) +
          dist.range[0];
        results.push(score);
        break;
      }
    }
  }

  // Корректируем для достижения точного среднего
  const currentAvg = results.reduce((a, b) => a + b, 0) / results.length;
  const diff = target - currentAvg;

  if (Math.abs(diff) > 0.5) {
    const adjustIndex = Math.floor(Math.random() * results.length);
    results[adjustIndex] = Math.max(
      65,
      Math.min(94, results[adjustIndex] + Math.round(diff * results.length))
    );
  }

  return results.sort((a, b) => b - a);
};
