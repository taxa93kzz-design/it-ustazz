import type { LessonPlan, LessonPlanFormValues } from "@/types/lesson-plan";

export function generateLessonPlan(values: LessonPlanFormValues): LessonPlan {
  const common = {
    school: values.school,
    teacher: values.teacher,
    date: values.date,
    grade: values.grade,
    presentCount: values.presentCount,
    absentCount: values.absentCount,
    section: values.section,
    topic: values.topic,
    lessonNumber: values.lessonNumber,
    learningGoal: values.learningGoal,
    lessonGoal: values.lessonGoal,
    duration: values.duration,
    specialNeeds: values.specialNeeds,
    assessmentMethods: values.assessmentMethods,
    reflectionMethod: values.reflectionMethod,
    homework: values.homework,
    resources: values.resources,
  };
  return {
    ...common,
    interactiveResources: [],
    stages: [
      {
        id: crypto.randomUUID(),
        stage: "Сабақтың басы",
        minutes: values.startMinutes,
        teacherActivity: `Оқушылармен сәлемдеседі, сабаққа қатысуды тексереді және жағымды психологиялық ахуал қалыптастырады. Өткен тақырыпты қысқаша қайталап, «${values.topic}» тақырыбы мен сабақ мақсатын таныстырады.`,
        studentActivity: "Жұмыс орнын дайындайды, сұрақтарға жауап береді, өз пікірін білдіреді және сабақ мақсатымен танысады.",
        assessment: "Мақтау, ауызша кері байланыс.",
        resources: "Интерактивті тақта, презентация.",
      },
      {
        id: crypto.randomUUID(),
        stage: "Сабақтың ортасы",
        minutes: values.middleMinutes,
        teacherActivity: `«${values.topic}» тақырыбын нақты мысалдармен түсіндіреді. Жеке, жұптық және компьютерде орындалатын практикалық тапсырма береді.\n\nДескриптор:\n- тапсырма шартын анықтайды;\n- қажетті әрекеттерді орындайды;\n- нәтижені тексеріп, қорытынды жасайды.${values.specialNeeds ? `\n\nЕБҚ оқушысына қолдау: ${values.specialNeeds}` : ""}`,
        studentActivity: "Анықтамаларды оқиды, тапсырманы орындайды, компьютерде жұмыс істейді, нәтижесін талдайды және өз жұмысын бағалайды.",
        assessment: `${values.assessmentMethods}. Дескриптор бойынша бағалау.`,
        resources: values.resources,
      },
      {
        id: crypto.randomUUID(),
        stage: "Сабақтың соңы",
        minutes: values.endMinutes,
        teacherActivity: `Сабақты қорытындылайды. «${values.reflectionMethod}» әдісі арқылы рефлексия өткізеді.\n\nҮй тапсырмасы:\n${values.homework}`,
        studentActivity: "Өз жұмысын бағалайды, рефлексия сұрақтарына жауап береді және үй тапсырмасын жазып алады.",
        assessment: "Өзін-өзі бағалау, мұғалімнің қорытынды кері байланысы.",
        resources: "Рефлексия парағы, күнделік.",
      },
    ],
  };
}
