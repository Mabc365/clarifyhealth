// Treatment pathways: general, typical steps. Not medical advice.
import type { Language } from "@/contexts/LanguageContext";

const PATHWAYS: Record<Language, Record<string, string[]>> = {
 "en": {
  "type-2-diabetes": [
   "An A1C, fasting glucose, or glucose tolerance blood test confirms diabetes.",
   "Healthy eating, regular activity, and weight loss if needed, often with metformin.",
   "Other pills or injections like GLP-1 drugs, SGLT2 inhibitors, or insulin may be added.",
   "A1C checks every 3–6 months, plus yearly eye, foot, and kidney exams."
  ],
  "high-blood-pressure": [
   "Several readings above 130/80 at the office or at home confirm it.",
   "Less salt, more activity, limiting alcohol, and weight loss if needed.",
   "Medicines like ACE inhibitors, ARBs, calcium channel blockers, or diuretics.",
   "Home monitoring and regular visits to adjust medicine and check kidneys."
  ],
  "high-cholesterol": [
   "A lipid panel blood test measures LDL, HDL, and triglycerides.",
   "Heart-healthy eating, exercise, and quitting smoking.",
   "Statins are most common; ezetimibe or PCSK9 inhibitors can be added.",
   "Repeat lipid tests 4–12 weeks after starting, then about once a year."
  ],
  "asthma": [
   "A breathing test called spirometry checks how well your lungs work.",
   "A quick-relief inhaler, plus learning and avoiding your triggers.",
   "Daily controller inhalers (steroids), and biologic shots for severe asthma.",
   "A written asthma action plan and regular check-ins on symptoms."
  ],
  "anxiety": [
   "A doctor or therapist talks with you and may use a short questionnaire.",
   "Talk therapy, especially CBT, plus sleep, exercise, and stress skills.",
   "Medicines like SSRIs or SNRIs, sometimes with a psychiatrist.",
   "Regular follow-ups to see what is working and adjust the plan."
  ],
  "depression": [
   "A doctor asks about mood and uses a questionnaire like the PHQ-9.",
   "Talk therapy, antidepressants, or both, plus daily routines and support.",
   "Changing or adding medicines, or treatments like TMS for hard cases.",
   "Follow-ups every few weeks at first; get help right away if you feel unsafe."
  ],
  "heart-disease": [
   "Tests may include an ECG, echocardiogram, stress test, or blood tests.",
   "Lifestyle changes plus medicines like aspirin, statins, or beta blockers.",
   "Procedures like stents or bypass surgery to restore blood flow.",
   "Cardiac rehab and regular visits to protect your heart over time."
  ],
  "kidney-disease": [
   "Blood (eGFR) and urine tests show how well your kidneys filter.",
   "Controlling blood pressure and blood sugar, and avoiding harmful pain pills.",
   "Medicines like SGLT2 inhibitors or ACE inhibitors, and a kidney specialist.",
   "Regular lab checks; dialysis or transplant only if kidneys fail."
  ],
  "thyroid-disease": [
   "A TSH blood test, sometimes with T4, checks thyroid levels.",
   "Low thyroid: a daily levothyroxine pill. High thyroid: medicines to calm it.",
   "For overactive thyroid: radioactive iodine or surgery in some cases.",
   "TSH checks every 6–12 weeks until stable, then about once a year."
  ],
  "acid-reflux": [
   "Often diagnosed from symptoms; sometimes a scope test (endoscopy).",
   "Smaller meals, not eating before bed, and avoiding trigger foods.",
   "Antacids, H2 blockers, or proton pump inhibitors (PPIs).",
   "If symptoms last, a specialist checks for damage; surgery is rare."
  ],
  "stroke": [
   "Emergency brain scans (CT or MRI) find the type of stroke fast. Call 911.",
   "Clot-busting medicine or clot removal if it is caught early enough.",
   "Rehab with physical, speech, and occupational therapy.",
   "Medicines and lifestyle changes to prevent another stroke."
  ],
  "copd": [
   "A spirometry breathing test confirms COPD.",
   "Quitting smoking and using a daily inhaler.",
   "More inhalers, pulmonary rehab, and oxygen if levels are low.",
   "Yearly flu and other vaccines, and regular lung checkups."
  ],
  "arthritis": [
   "An exam, X-rays, and sometimes blood tests find the type.",
   "Movement, weight management, and pain relievers like acetaminophen or NSAIDs.",
   "Physical therapy, joint shots, or drugs that slow rheumatoid arthritis.",
   "Joint replacement surgery for severe damage; regular follow-ups."
  ],
  "osteoporosis": [
   "A bone density scan (DEXA) measures bone strength.",
   "Calcium, vitamin D, weight-bearing exercise, and fall prevention.",
   "Medicines like bisphosphonates or other bone-building drugs.",
   "Repeat bone scans every 1–2 years to track progress."
  ],
  "sleep-apnea": [
   "A sleep study, at a lab or at home, confirms it.",
   "Weight loss, sleeping on your side, and avoiding alcohol at night.",
   "A CPAP machine, a mouth device, or sometimes surgery.",
   "Follow-ups to make sure treatment works and fits well."
  ],
  "ibs": [
   "Diagnosis is based on symptoms after ruling out other problems.",
   "Diet changes (like low-FODMAP), fiber, stress care, and regular meals.",
   "Medicines for diarrhea, constipation, or cramping.",
   "Tracking triggers and adjusting the plan with your doctor."
  ],
  "eczema-psoriasis": [
   "A doctor or dermatologist usually diagnoses it by looking at the skin.",
   "Daily moisturizers, gentle soaps, and steroid creams for flares.",
   "Light therapy, pills, or biologic shots for moderate to severe cases.",
   "Regular skin checks and adjusting treatment during flares."
  ],
  "migraines": [
   "Diagnosis comes from your headache history; scans are rarely needed.",
   "Rest, pain relievers, or triptans at the start of an attack.",
   "Daily preventive medicine or CGRP drugs if migraines are frequent.",
   "A headache diary to track triggers and how treatment works."
  ],
  "anemia": [
   "A complete blood count (CBC) and iron tests find the cause.",
   "Iron-rich foods or supplements, or B12 or folate if low.",
   "IV iron, treating hidden bleeding, or other specialist care.",
   "Repeat blood tests to confirm levels are improving."
  ],
  "adhd": [
   "A doctor or psychologist uses interviews and rating scales.",
   "Behavior strategies, routines, and school or work supports.",
   "Stimulant or non-stimulant medicines.",
   "Regular check-ins to adjust medicine dose and support."
  ],
  "chronic-kidney-disease": [
   "eGFR blood tests and urine albumin tests show kidney function.",
   "Blood pressure and sugar control, and less salt.",
   "Kidney-protecting medicines and care from a nephrologist.",
   "Planning ahead for dialysis or transplant if kidneys keep declining."
  ],
  "pre-diabetes": [
   "An A1C of 5.7–6.4% or a fasting glucose of 100–125 confirms it.",
   "Losing 5–7% of body weight and 150 minutes of activity a week.",
   "A diabetes prevention program; sometimes metformin.",
   "Blood sugar checks every year to catch changes early."
  ]
 },
 "es": {
  "type-2-diabetes": [
   "Un análisis de sangre de glucosa o A1C confirma la diabetes.",
   "Comer sano, hacer ejercicio y bajar de peso si es necesario.",
   "Se pueden usar pastillas o inyecciones si el azúcar sigue alta.",
   "Revisiones de A1C cada 3 a 6 meses y exámenes de ojos y pies."
  ],
  "high-blood-pressure": [
   "Varias lecturas arriba de 130/80 confirman la presión alta.",
   "Comer menos sal, hacer ejercicio y bajar de peso.",
   "Medicinas para ayudar a relajar las arterias y bajar la presión.",
   "Revisar la presión en casa y ver al médico seguido."
  ],
  "high-cholesterol": [
   "Un examen de sangre mide las grasas en la sangre.",
   "Comer alimentos sanos, hacer ejercicio y dejar de fumar.",
   "Las estatinas son las medicinas más comunes para esto.",
   "Repetir el examen de sangre una vez al año."
  ],
  "asthma": [
   "Una prueba de soplar en un tubo mide cómo funcionan los pulmones.",
   "Usar un inhalador de alivio rápido y evitar el polvo o el humo.",
   "Inhaladores diarios para prevenir ataques de asma.",
   "Tener un plan de acción escrito y chequeos regulares."
  ],
  "anxiety": [
   "Un médico habla con usted y puede hacerle preguntas sobre sus miedos.",
   "Terapia para hablar, dormir bien y aprender a manejar el estrés.",
   "Medicinas para ayudar a calmar los nervios.",
   "Citas seguidas para ver si el plan de tratamiento funciona."
  ],
  "depression": [
   "El médico le hace preguntas sobre su ánimo y tristeza.",
   "Terapia, medicinas o ambas, junto con rutinas diarias.",
   "Cambiar las medicinas si el ánimo no mejora.",
   "Pedir ayuda de inmediato si se siente en peligro o muy mal."
  ],
  "heart-disease": [
   "Pruebas como un electrocardiograma o exámenes de sangre.",
   "Cambiar hábitos de vida y tomar medicinas como aspirina.",
   "Cirugías o tubos llamados stents para abrir las arterias.",
   "Rehabilitación del corazón y visitas médicas regulares."
  ],
  "kidney-disease": [
   "Pruebas de sangre y orina muestran qué tan bien limpian los riñones.",
   "Controlar la presión y el azúcar, y no tomar pastillas para el dolor que hagan daño.",
   "Medicinas especiales y ver a un médico de los riñones.",
   "Pruebas de laboratorio regulares para vigilar la salud."
  ],
  "thyroid-disease": [
   "Un examen de sangre TSH revisa los niveles de la tiroides.",
   "Si está baja, una pastilla diaria; si está alta, medicinas para calmarla.",
   "A veces se usa yodo radioactivo o cirugía.",
   "Revisiones de sangre cada pocos meses hasta que esté estable."
  ],
  "acid-reflux": [
   "Se nota por la acidez en la garganta o una prueba con cámara.",
   "Comidas pequeñas, no comer antes de dormir y evitar picantes.",
   "Antiácidos o medicinas que reducen el ácido del estómago.",
   "Si no mejora, un especialista revisa si hay daño."
  ],
  "stroke": [
   "Fotos del cerebro (tomografía) muestran el problema. ¡Llame al 911!",
   "Medicinas para deshacer coágulos si se llega rápido al hospital.",
   "Terapia para volver a hablar, caminar y moverse.",
   "Medicinas y cambios de vida para evitar otro derrame."
  ],
  "copd": [
   "Una prueba de respiración confirma esta enfermedad de los pulmones.",
   "Dejar de fumar y usar un inhalador todos los días.",
   "Más inhaladores, ejercicio especial y oxígeno si falta el aire.",
   "Vacunas contra la gripe y chequeos de pulmón cada año."
  ],
  "arthritis": [
   "Un examen físico y radiografías encuentran el tipo de dolor.",
   "Moverse, cuidar el peso y tomar medicinas para el dolor.",
   "Terapia física, inyecciones en las uniones o medicinas fuertes.",
   "Cirugía para cambiar la unión si hay mucho daño."
  ],
  "osteoporosis": [
   "Un escaneo especial mide qué tan fuertes están los huesos.",
   "Calcio, vitamina D, caminar y evitar caídas.",
   "Medicinas para fortalecer los huesos y evitar que se rompan.",
   "Repetir el escaneo cada 1 o 2 años para ver el progreso."
  ],
  "sleep-apnea": [
   "Un estudio del sueño en casa o en una clínica lo confirma.",
   "Bajar de peso, dormir de lado y no tomar alcohol de noche.",
   "Una máquina de aire (CPAP) o un aparato para la boca.",
   "Citas para asegurar que la máquina funcione bien."
  ],
  "ibs": [
   "Se detecta por los síntomas de dolor de panza y gases.",
   "Cambios en la dieta, más fibra y menos estrés.",
   "Medicinas para la diarrea, el estreñimiento o los calambres.",
   "Anotar qué comidas le hacen daño y hablar con el médico."
  ],
  "eczema-psoriasis": [
   "Un médico nota el problema al ver las manchas en la piel.",
   "Cremas humectantes, jabones suaves y cremas especiales.",
   "Terapia de luz o inyecciones para casos más graves.",
   "Revisar la piel seguido y ajustar las cremas."
  ],
  "migraines": [
   "El médico pregunta sobre sus dolores de cabeza fuertes.",
   "Descanso, medicinas para el dolor o pastillas especiales al empezar.",
   "Medicinas diarias para prevenir si los dolores son muy seguidos.",
   "Llevar un diario de cuándo le duele la cabeza."
  ],
  "anemia": [
   "Un examen de sangre mide el hierro y los glóbulos rojos.",
   "Comer alimentos con hierro o tomar vitaminas.",
   "Hierro por suero o tratar la causa de la pérdida de sangre.",
   "Repetir los exámenes de sangre para ver si mejora."
  ],
  "adhd": [
   "Un médico usa entrevistas para ver cómo se concentra la persona.",
   "Rutinas, ayuda en la escuela o el trabajo y estrategias.",
   "Medicinas que ayudan a poner atención.",
   "Revisiones seguidas para ajustar la dosis de medicina."
  ],
  "chronic-kidney-disease": [
   "Pruebas de sangre y orina miden la función del riñón.",
   "Controlar la presión, el azúcar y comer menos sal.",
   "Medicinas que protegen los riñones y ver al especialista.",
   "Planear para diálisis si los riñones dejan de funcionar."
  ],
  "pre-diabetes": [
   "Un examen de sangre con niveles un poco altos lo confirma.",
   "Bajar un poco de peso y caminar 150 minutos a la semana.",
   "Programas de salud y a veces una medicina llamada metformina.",
   "Revisar el azúcar cada año para que no se vuelva diabetes."
  ]
 },
 "ar": {
  "type-2-diabetes": [
   "يتم التأكد من السكري عن طريق فحص السكر في الدم أو مخزون السكر.",
   "الأكل الصحي، والنشاط البدني، ونقص الوزن، واستعمال دواء الميتفورمين غالباً.",
   "قد يتم إضافة حبوب أخرى أو إبر مثل إبر التنحيف أو الأنسولين.",
   "فحص مخزون السكر كل 3 إلى 6 أشهر، مع فحص سنوي للعين والقدم والكلى."
  ],
  "high-blood-pressure": [
   "يتم التأكد عند وجود عدة قراءات أعلى من 130/80 في العيادة أو البيت.",
   "تقليل الملح، وزيادة النشاط، ونقص الوزن إذا لزم الأمر.",
   "أدوية الضغط التي يصفها الطبيب بانتظام.",
   "مراقبة الضغط في البيت وزيارة الطبيب للتأكد من سلامة الكلى."
  ],
  "high-cholesterol": [
   "فحص دم يقيس مستوى الدهون والكوليسترول الضار والنافع.",
   "تناول طعام صحي للقلب، وممارسة الرياضة، وترك التدخين.",
   "أدوية (الستاتين) هي الأكثر استخداماً، وقد تضاف أدوية أخرى.",
   "إعادة فحص الدهون بعد شهر أو ثلاثة من بدء العلاج، ثم مرة كل سنة."
  ],
  "asthma": [
   "فحص تنفس يسمى (قياس كفاءة الرئة) للتأكد من سلامتها.",
   "استخدام بخاخ الإسعاف السريع والابتعاد عن الأشياء التي تزيد الحساسية.",
   "استخدام بخاخات وقائية يومية، وإبر خاصة للحالات الصعبة.",
   "وضع خطة مكتوبة للعلاج ومتابعة الأعراض مع الطبيب باستمرار."
  ],
  "anxiety": [
   "يتحدث الطبيب معك وقد يستخدم أسئلة قصيرة للتشخيص.",
   "جلسات التحدث مع المختص، مع الاهتمام بالنوم والرياضة وتقليل التوتر.",
   "أدوية خاصة يصفها الطبيب النفسي أحياناً.",
   "متابعة دورية لمعرفة مدى التحسن وتغيير الخطة إذا لزم الأمر."
  ],
  "depression": [
   "يسأل الطبيب عن الحالة المزاجية ويستخدم استبيان خاص.",
   "جلسات التحدث، أو الأدوية، أو كلاهما، مع تنظيم الروتين اليومي.",
   "تغيير الأدوية أو إضافة أنواع أخرى للحالات التي لا تتحسن.",
   "متابعة كل بضعة أسابيع في البداية، وطلب المساعدة فوراً عند الشعور بالخطر."
  ],
  "heart-disease": [
   "تشمل الفحوصات تخطيط القلب، أو تصويره، أو فحص المجهود، أو تحاليل الدم.",
   "تغيير نمط الحياة مع أدوية مثل الأسبرين وأدوية الكوليسترول.",
   "عمليات مثل القسطرة أو دعامات القلب لفتح الشرايين.",
   "برنامج تأهيل القلب وزيارات منتظمة لحماية قلبك مع مرور الوقت."
  ],
  "kidney-disease": [
   "فحوصات الدم والبول تظهر مدى قدرة الكلى على تنظيف الجسم.",
   "التحكم في ضغط الدم وسكر الدم، وتجنب مسكنات الألم القوية.",
   "أدوية تحمي الكلى ومتابعة مع طبيب مختص بالكلى.",
   "فحوصات دورية، وفي الحالات المتأخرة جداً قد نحتاج لغسيل أو زراعة."
  ],
  "thyroid-disease": [
   "فحص دم لهرمونات الغدة الدرقية لمعرفة مستوياتها.",
   "إذا كانت خاملة: حبة يومية. إذا كانت نشطة: أدوية لتهدئتها.",
   "للغدة النشطة جداً: قد يستخدم اليود المشع أو الجراحة أحياناً.",
   "فحص الهرمونات كل شهرين تقريباً حتى تستقر، ثم مرة كل سنة."
  ],
  "acid-reflux": [
   "يعرف الطبيب الحالة من الأعراض، وأحياناً يحتاج لعمل منظار.",
   "تناول وجبات صغيرة، وعدم الأكل قبل النوم، وتجنب الأطعمة المزعجة.",
   "أدوية الحموضة وبخاخات المعدة.",
   "إذا استمرت الأعراض، يجب فحص المعدة؛ والجراحة نادرة جداً."
  ],
  "stroke": [
   "أشعة فورية للرأس (مقطعية أو رنين) لمعرفة نوع الجلطة. اتصل بالإسعاف فوراً.",
   "أدوية لتذويب الجلطة أو إزالتها إذا تم اكتشافها مبكراً.",
   "تأهيل وعلاج طبيعي لتقوية الحركة والكلام.",
   "أدوية وتغيير في الحياة لمنع حدوث جلطة أخرى."
  ],
  "copd": [
   "فحص تنفس يؤكد وجود انسداد في الرئة.",
   "التوقف عن التدخين واستخدام بخاخ يومي.",
   "زيادة البخاخات، والتمارين التنفسية، والأكسجين إذا كان مستواه منخفضاً.",
   "أخذ تطعيم الإنفلونزا سنوياً وفحص الرئة بانتظام."
  ],
  "arthritis": [
   "الفحص السريري، والأشعة، وأحياناً فحص الدم لمعرفة نوع الالتهاب.",
   "الحركة، وإنقاص الوزن، ومسكنات الألم البسيطة.",
   "العلاج الطبيعي، أو إبر المفاصل، أو أدوية خاصة لالتهاب المفاصل الروماتويدي.",
   "عملية تغيير المفصل للحالات المتضررة جداً، مع متابعة دورية."
  ],
  "osteoporosis": [
   "أشعة خاصة تقيس قوة وكثافة العظام.",
   "الكالسيوم، وفيتامين د، ورياضة المشي، والحذر من السقوط.",
   "أدوية خاصة تقوي العظام وتحميها من التكسر.",
   "إعادة فحص كثافة العظام كل سنة أو سنتين لمتابعة التحسن."
  ],
  "sleep-apnea": [
   "دراسة للنوم في المختبر أو في البيت للتأكد من الحالة.",
   "نقص الوزن، والنوم على الجانب، وتجنب التدخين قبل النوم.",
   "جهاز تنفس خاص أثناء النوم (CPAP) أو قطعة للفم.",
   "متابعة للتأكد من أن العلاج يعمل بشكل مريح وصحيح."
  ],
  "ibs": [
   "يتم التشخيص بناءً على الأعراض بعد التأكد من عدم وجود أمراض أخرى.",
   "تغيير نوع الأكل، وزيادة الألياف، وتقليل التوتر، وتنظيم الوجبات.",
   "أدوية لعلاج الإسهال أو الإمساك أو التشنجات.",
   "معرفة الأطعمة التي تتعبك وتعديل الخطة مع طبيبك."
  ],
  "eczema-psoriasis": [
   "يشخص طبيب الجلدية الحالة عن طريق النظر للجلد.",
   "استخدام مرطبات يومية، وصابون لطيف، وكريمات طبية وقت الحاجة.",
   "العلاج بالضوء، أو حبوب، أو إبر خاصة للحالات المتوسطة والصعبة.",
   "فحص الجلد بانتظام وتغيير العلاج عند تهيج الحالة."
  ],
  "migraines": [
   "التشخيص يعتمد على تاريخ الصداع لديك؛ ونادراً ما نحتاج للأشعة.",
   "الراحة، ومسكنات الألم، أو أدوية خاصة عند بدء الصداع.",
   "أدوية وقائية يومية إذا كان الصداع يتكرر كثيراً.",
   "كتابة مفكرة للصداع لمعرفة الأسباب التي تزيده ونجاح العلاج."
  ],
  "anemia": [
   "فحص الدم الشامل وفحص الحديد لمعرفة السبب.",
   "أطعمة غنية بالحديد أو حبوب فيتامينات (حديد، B12، أو فوليك).",
   "حديد عن طريق الوريد، أو علاج النزيف إن وجد، أو زيارة طبيب مختص.",
   "إعادة فحص الدم للتأكد من تحسن مستويات الدم."
  ],
  "adhd": [
   "يستخدم الطبيب مقابلات وأسئلة خاصة للتشخيص.",
   "خطط سلوكية، وتنظيم الوقت، ودعم في المدرسة أو العمل.",
   "أدوية تساعد على التركيز يصفها المختص.",
   "متابعة دورية لتعديل جرعة الدواء وتقديم الدعم اللازم."
  ],
  "chronic-kidney-disease": [
   "فحوصات دم وبول تبين كيفية عمل الكلى.",
   "التحكم في الضغط والسكر وتقليل الملح في الطعام.",
   "أدوية تحمي الكلى ومتابعة مع طبيب كلى مختص.",
   "التخطيط المسبق للغسيل أو الزراعة إذا استمر ضعف الكلى."
  ],
  "pre-diabetes": [
   "يتم التأكد إذا كانت أرقام السكر في الدم قريبة من السكري.",
   "خسارة القليل من الوزن (5-7%) وممارسة الرياضة 150 دقيقة أسبوعياً.",
   "برنامج للوقاية من السكري، وأحياناً دواء الميتفورمين.",
   "فحص السكر كل سنة لملاحظة أي تغييرات مبكرة."
  ]
 },
 "hi": {
  "type-2-diabetes": [
   "खून की जांच (A1C या शुगर टेस्ट) से पता चलता है कि आपको मधुमेह है या नहीं।",
   "अच्छा खाना खाएं, रोज़ कसरत करें और ज़रूरत पड़ने पर वजन घटाएं। अक्सर मेटफोर्मिन दवा दी जाती है।",
   "अगर ज़रूरत हो, तो डॉक्टर अन्य गोलियां, इंजेक्शन या इंसुलिन दे सकते हैं।",
   "हर 3 से 6 महीने में शुगर की जांच कराएं और साल में एक बार आंख, पैर और गुर्दे की जांच कराएं।"
  ],
  "high-blood-pressure": [
   "अगर कई बार जांच करने पर ब्लड प्रेशर 130/80 से ज़्यादा आए, तो यह बीमारी मानी जाती है।",
   "नमक कम खाएं, ज़्यादा चलें-फिरें, शराब से दूर रहें और वजन कम करें।",
   "डॉक्टर ब्लड प्रेशर कम करने के लिए अलग-अलग तरह की दवाइयां दे सकते हैं।",
   "घर पर ब्लड प्रेशर चेक करते रहें और डॉक्टर से मिलकर गुर्दे की सेहत की जांच कराएं।"
  ],
  "high-cholesterol": [
   "खून की जांच (लिपिड प्रोफाइल) से शरीर में वसा या फैट के स्तर का पता चलता है।",
   "दिल के लिए अच्छा खाना खाएं, कसरत करें और धूम्रपान छोड़ दें।",
   "आमतौर पर स्टैटिन दवा दी जाती है, लेकिन ज़रूरत पड़ने पर दूसरी दवाइयां भी जोड़ी जा सकती हैं।",
   "दवा शुरू करने के बाद फिर से टेस्ट कराएं और उसके बाद साल में एक बार जांच कराएं।"
  ],
  "asthma": [
   "फेफड़ों की जांच (स्पायरोमेट्री) से पता चलता है कि आप कितनी अच्छी तरह सांस ले रहे हैं।",
   "सांस फूलने पर इस्तेमाल होने वाला इनहेलर पास रखें और उन चीजों से बचें जिनसे तकलीफ बढ़ती है।",
   "रोज़ाना इस्तेमाल होने वाले इनहेलर और गंभीर स्थिति में इंजेक्शन का उपयोग किया जाता है।",
   "दवा कब और कैसे लेनी है, इसकी एक लिखित योजना बनाएं और डॉक्टर को अपनी स्थिति बताते रहें।"
  ],
  "anxiety": [
   "डॉक्टर या थेरेपिस्ट आपसे बात करके और कुछ सवाल पूछकर आपकी परेशानी समझेंगे।",
   "बातचीत वाली थेरेपी (CBT), अच्छी नींद, कसरत और तनाव कम करने के तरीके अपनाएं।",
   "डॉक्टर की सलाह पर दवाइयां लें और ज़रूरत पड़ने पर मानसिक रोग विशेषज्ञ से मिलें।",
   "समय-समय पर डॉक्टर से मिलते रहें ताकि पता चले कि इलाज कितना काम कर रहा है।"
  ],
  "depression": [
   "डॉक्टर आपके मूड के बारे में पूछेंगे और एक फॉर्म (PHQ-9) भरने को कहेंगे।",
   "बातचीत वाली थेरेपी, दवाइयां, रोज़ाना का सही नियम और अपनों का साथ ज़रूरी है।",
   "अगर स्थिति में सुधार न हो, तो डॉक्टर दवा बदल सकते हैं या अन्य नए तरीके अपना सकते हैं।",
   "शुरुआत में हर कुछ हफ्तों में डॉक्टर से मिलें। अगर मन में बुरे विचार आएं, तो तुरंत मदद लें।"
  ],
  "heart-disease": [
   "ईसीजी (ECG), दिल का स्कैन (इको) या खून की जांच से दिल की बीमारी का पता चलता है।",
   "जीवनशैली बदलें और डॉक्टर की सलाह पर एस्पिरिन या अन्य दवाइयां लें।",
   "खून का बहाव ठीक करने के लिए स्टेंट डालना या बाईपास सर्जरी की जा सकती है।",
   "दिल को सुरक्षित रखने के लिए कसरत कार्यक्रम (रिहैब) में जाएं और डॉक्टर से मिलते रहें।"
  ],
  "kidney-disease": [
   "खून और पेशाब की जांच से पता चलता है कि आपके गुर्दे (किडनी) कितनी अच्छी तरह काम कर रहे हैं।",
   "ब्लड प्रेशर और शुगर को काबू में रखें और बिना डॉक्टर की सलाह के दर्द की दवा न खाएं।",
   "गुर्दे को बचाने वाली दवाइयां लें और गुर्दा रोग विशेषज्ञ से सलाह लें।",
   "नियमित रूप से जांच कराते रहें। अगर गुर्दे काम करना बंद कर दें, तो डायलिसिस या ट्रांसप्लांट की ज़रूरत पड़ती है।"
  ],
  "thyroid-disease": [
   "खून की जांच (TSH और T4) से थायराइड के स्तर का पता चलता है।",
   "थायराइड कम होने पर रोज़ाना एक गोली लें, और ज़्यादा होने पर उसे कम करने की दवा लें।",
   "ज़्यादा थायराइड की स्थिति में कभी-कभी रेडियोधर्मी आयोडीन या सर्जरी की ज़रूरत पड़ती है।",
   "जब तक थायराइड ठीक न हो जाए, हर 6-12 हफ्ते में जांच कराएं, फिर साल में एक बार।"
  ],
  "acid-reflux": [
   "अक्सर लक्षणों से ही इसका पता चल जाता है, पर कभी-कभी पेट की अंदरूनी जांच (एंडोस्कोपी) की जाती है।",
   "थोड़ा-थोड़ा खाना खाएं, सोने से ठीक पहले न खाएं और मिर्च-मसाले वाली चीज़ों से बचें।",
   "एसिड कम करने वाली दवाइयां या सिरप का इस्तेमाल करें।",
   "अगर समस्या बनी रहे, तो विशेषज्ञ से जांच कराएं। सर्जरी की ज़रूरत बहुत कम पड़ती है।"
  ],
  "stroke": [
   "दिमाग का सीटी स्कैन या एमआरआई करके तुरंत स्ट्रोक के प्रकार का पता लगाया जाता है। तुरंत 108 या एम्बुलेंस बुलाएं।",
   "समय पर पता चलने पर थक्का (clot) घोलने वाली दवा दी जाती है या उसे हटाया जाता है।",
   "बोलने और चलने-फिरने की शक्ति वापस पाने के लिए थेरेपी (रिहैब) की मदद लें।",
   "दोबारा स्ट्रोक न हो, इसके लिए दवाइयां लें और स्वस्थ आदतें अपनाएं।"
  ],
  "copd": [
   "सांस की जांच (स्पायरोमेट्री) से फेफड़ों की इस बीमारी का पता चलता है।",
   "धूम्रपान तुरंत छोड़ दें और रोज़ाना इनहेलर का इस्तेमाल करें।",
   "डॉक्टर की सलाह पर ज़्यादा इनहेलर, कसरत और ज़रूरत पड़ने पर ऑक्सीजन का उपयोग करें।",
   "हर साल फ्लू का टीका लगवाएं और फेफड़ों की नियमित जांच कराते रहें।"
  ],
  "arthritis": [
   "शारीरिक जांच, एक्स-रे और खून की जांच से जोड़ों के दर्द का कारण पता चलता है।",
   "हल्की कसरत करें, वजन काबू में रखें और दर्द कम करने वाली दवाएं लें।",
   "फिजिकल थेरेपी, जोड़ों में इंजेक्शन या बीमारी को बढ़ने से रोकने वाली दवाइयां लें।",
   "ज़्यादा खराबी होने पर जोड़ बदलने की सर्जरी (रिप्लेसमेंट) कराएं और डॉक्टर से मिलते रहें।"
  ],
  "osteoporosis": [
   "हड्डियों की मजबूती मापने के लिए एक खास स्कैन (DEXA) किया जाता है।",
   "कैल्शियम, विटामिन डी, हड्डियों के लिए कसरत करें और गिरने से बचें।",
   "हड्डियों को मजबूत बनाने और टूटने से बचाने वाली दवाइयां लें।",
   "हर 1-2 साल में स्कैन कराएं ताकि पता चले कि हड्डियां कितनी मजबूत हुई हैं।"
  ],
  "sleep-apnea": [
   "नींद की जांच (स्लीप स्टडी) से इस बीमारी का पता चलता है।",
   "वजन कम करें, करवट लेकर सोएं और रात में शराब न पिएं।",
   "सोते समय सी-पैप (CPAP) मशीन, मुंह में लगाने वाला उपकरण या कभी-कभी सर्जरी की ज़रूरत होती है।",
   "चेकअप कराते रहें ताकि पता चले कि मशीन सही काम कर रही है।"
  ],
  "ibs": [
   "दूसरी बीमारियों की संभावना न होने पर लक्षणों के आधार पर इसकी पहचान की जाती है।",
   "खाने में बदलाव करें, फाइबर लें, तनाव कम करें और सही समय पर खाना खाएं।",
   "दस्त, कब्ज या पेट में मरोड़ को ठीक करने वाली दवाइयां लें।",
   "किस चीज़ से तकलीफ होती है उस पर ध्यान दें और डॉक्टर के साथ मिलकर इलाज बदलें।"
  ],
  "eczema-psoriasis": [
   "त्वचा विशेषज्ञ (डर्मेटोलॉजिस्ट) त्वचा को देखकर ही इस बीमारी का पता लगा लेते हैं।",
   "रोज़ाना मॉइस्चराइजर लगाएं, हल्के साबुन का इस्तेमाल करें और ज़रूरत होने पर क्रीम लगाएं।",
   "गंभीर स्थिति में लाइट थेरेपी, गोलियां या इंजेक्शन का उपयोग किया जाता है।",
   "अपनी त्वचा की नियमित जांच करें और तकलीफ बढ़ने पर इलाज में बदलाव करें।"
  ],
  "migraines": [
   "सिरदर्द के इतिहास से ही इसका पता चलता है; स्कैन की ज़रूरत बहुत कम होती है।",
   "दर्द शुरू होते ही आराम करें और डॉक्टर की दी हुई दर्द की दवा लें।",
   "अगर सिरदर्द बार-बार होता है, तो इसे रोकने के लिए रोज़ाना ली जाने वाली दवाइयां लें।",
   "एक डायरी में लिखें कि दर्द कब और क्यों हुआ, ताकि सही इलाज मिल सके।"
  ],
  "anemia": [
   "खून की पूरी जांच (CBC) और आयरन टेस्ट से इसका कारण पता चलता है।",
   "आयरन वाला खाना खाएं या आयरन, विटामिन बी12 और फोलेट की गोलियां लें।",
   "अगर कमी ज़्यादा है, तो नस के ज़रिए आयरन लेना या विशेषज्ञ से इलाज कराना ज़रूरी है।",
   "खून की दोबारा जांच कराएं ताकि पता चले कि सुधार हो रहा है या नहीं।"
  ],
  "adhd": [
   "डॉक्टर बातचीत और कुछ पैमानों के ज़रिए व्यवहार की जांच करते हैं।",
   "काम करने के नए तरीके सीखें, रूटीन बनाएं और स्कूल या काम में मदद लें।",
   "एकाग्रता बढ़ाने वाली या अन्य ज़रूरी दवाइयां लें।",
   "दवा की सही मात्रा तय करने के लिए समय-समय पर डॉक्टर से मिलते रहें।"
  ],
  "chronic-kidney-disease": [
   "खून और पेशाब की जांच से पता चलता है कि गुर्दे (किडनी) कितना काम कर रहे हैं।",
   "ब्लड प्रेशर और शुगर को काबू में रखें और नमक कम खाएं।",
   "गुर्दा रोग विशेषज्ञ से मिलें और गुर्दे की सुरक्षा करने वाली दवाइयां लें।",
   "अगर गुर्दे खराब हो रहे हों, तो आगे के लिए डायलिसिस या ट्रांसप्लांट की योजना बनाएं।"
  ],
  "pre-diabetes": [
   "अगर खून की जांच (A1C) 5.7–6.4% के बीच हो, तो इसे प्री-डायबिटीज कहते हैं।",
   "अपने वजन का थोड़ा हिस्सा कम करें और हफ्ते में कम से कम 150 मिनट कसरत करें।",
   "शुगर से बचने के प्रोग्राम में शामिल हों; कभी-कभी मेटफोर्मिन दवा दी जाती है।",
   "हर साल शुगर की जांच कराएं ताकि बीमारी को बढ़ने से रोका जा सके।"
  ]
 },
 "ur": {
  "type-2-diabetes": [
   "خون کے ٹیسٹ جیسے A1C یا شوگر ٹیسٹ سے ذیابیطس کا پتہ چلتا ہے۔",
   "اچھی خوراک، ورزش اور وزن کم کرنا، اور اکثر میٹفارمین گولی کا استعمال۔",
   "کچھ صورتوں میں دیگر گولیاں، ٹیکے یا انسولین بھی دی جا سکتی ہے۔",
   "ہر 3 سے 6 ماہ بعد شوگر کا چیک اپ، اور سالانہ آنکھوں، پاؤں اور گردوں کا معائنہ۔"
  ],
  "high-blood-pressure": [
   "گھر یا کلینک پر بار بار بلڈ پریشر کا 130/80 سے اوپر آنا اس کی علامت ہے۔",
   "نمک کم کریں، ورزش کریں اور اگر ضرورت ہو تو وزن کم کریں۔",
   "بلڈ پریشر کم کرنے والی مختلف دوائیں استعمال کی جاتی ہیں۔",
   "گھر پر چیک اپ کرتے رہیں اور گردوں کا معائنہ کرواتے رہیں۔"
  ],
  "high-cholesterol": [
   "خون کے ٹیسٹ کے ذریعے چربی یا کولیسٹرول کی مقدار ناپی جاتی ہے۔",
   "دل کے لیے اچھی غذا کھائیں، ورزش کریں اور سگریٹ نوشی چھوڑ دیں۔",
   "کولیسٹرول کم کرنے والی دوائیں جیسے اسٹیٹنز (Statins) دی جاتی ہیں۔",
   "دوا شروع کرنے کے 4 سے 12 ہفتوں بعد دوبارہ ٹیسٹ کروائیں، پھر سال میں ایک بار۔"
  ],
  "asthma": [
   "پھیپھڑوں کے ٹیسٹ کے ذریعے دیکھا جاتا ہے کہ آپ کتنا اچھا سانس لے رہے ہیں۔",
   "فوری آرام پہنچانے والا انہیلر استعمال کریں اور ان چیزوں سے بچیں جن سے سانس پھولتا ہے۔",
   "روزانہ استعمال والے انہیلر اور شدید دمہ کی صورت میں خاص ٹیکے۔",
   "دمہ سے نمٹنے کا تحریری منصوبہ اور علامات پر مسلسل نظر رکھنا۔"
  ],
  "anxiety": [
   "ڈاکٹر بات چیت اور سوالنامے کے ذریعے آپ کی پریشانی کی وجہ جانتا ہے۔",
   "بات چیت کے ذریعے علاج، اچھی نیند، ورزش اور ذہنی دباؤ کم کرنے کے طریقے سیکھنا۔",
   "ڈاکٹر کی ہدایت کے مطابق خاص دوائیں استعمال کرنا۔",
   "باقاعدگی سے ڈاکٹر سے ملیں تاکہ دیکھا جا سکے کہ علاج کتنا اثر کر رہا ہے۔"
  ],
  "depression": [
   "ڈاکٹر آپ کے موڈ کے بارے میں پوچھتا ہے اور کچھ سوالات کرتا ہے۔",
   "بات چیت کے ذریعے علاج، ادویات، اور روزانہ کی زندگی میں مدد حاصل کرنا۔",
   "ضرورت پڑنے پر ادویات بدلنا یا دیگر جدید طریقے اپنانا۔",
   "شروع میں ہر چند ہفتوں بعد ڈاکٹر سے ملیں؛ اگر خود کو خطرے میں محسوس کریں تو فوراً مدد لیں۔"
  ],
  "heart-disease": [
   "ٹیسٹ جیسے ای سی جی (ECG) یا خون کے ٹیسٹ سے دل کی حالت دیکھی جاتی ہے۔",
   "طرز زندگی میں تبدیلی اور اسپرین یا کولیسٹرول کی دوائیں استعمال کرنا۔",
   "خون کا بہاؤ بہتر بنانے کے لیے اسٹنٹ یا بائی پاس سرجری۔",
   "دل کی بحالی کے پروگرام اور باقاعدگی سے ڈاکٹر کو چیک کروانا۔"
  ],
  "kidney-disease": [
   "خون اور پیشاب کے ٹیسٹ سے پتہ چلتا ہے کہ گردے کتنی صفائی کر رہے ہیں۔",
   "بلڈ پریشر اور شوگر پر قابو پانا، اور درد کی نقصان دہ گولیوں سے بچنا۔",
   "گردوں کی حفاظت والی دوائیں اور گردوں کے ماہر ڈاکٹر سے مشورہ۔",
   "باقاعدگی سے لیب ٹیسٹ؛ اگر گردے کام کرنا چھوڑ دیں تو ڈائلیسس یا پیوند کاری۔"
  ],
  "thyroid-disease": [
   "خون کے ٹیسٹ (TSH) کے ذریعے تھائیرائڈ کے کام کا پتہ لگایا جاتا ہے۔",
   "تھائیرائڈ کم ہونے پر روزانہ ایک گولی، اور زیادہ ہونے پر اسے کم کرنے کی دوا۔",
   "تھائیرائڈ زیادہ ہونے کی صورت میں خاص علاج یا سرجری۔",
   "حالت بہتر ہونے تک ہر 6 سے 12 ہفتوں بعد ٹیسٹ، پھر سالانہ معائنہ۔"
  ],
  "acid-reflux": [
   "عام طور پر علامات سے پتہ چلتا ہے؛ کبھی کبھی پیٹ کا اندرونی معائنہ کیا جاتا ہے۔",
   "تھوڑا کھانا کھائیں، سونے سے پہلے نہ کھائیں اور تیز مرچ مسالوں سے بچیں۔",
   "تیزابیت کم کرنے والی دوائیں یا گولیاں۔",
   "اگر علامات نہ جائیں تو ماہر ڈاکٹر معائنہ کرتا ہے؛ سرجری کی ضرورت کم ہی پڑتی ہے۔"
  ],
  "stroke": [
   "دماغ کے فوراً اسکین (CT یا MRI) کیے جاتے ہیں۔ ایمرجنسی نمبر پر کال کریں۔",
   "اگر بروقت پتہ چل جائے تو خون کا لوتھڑا ختم کرنے والی دوا یا عمل۔",
   "بولنے اور چلنے پھرنے کی دوبارہ مشق اور تھراپی۔",
   "دوبارہ فالج سے بچنے کے لیے دوائیں اور طرز زندگی میں تبدیلی۔"
  ],
  "copd": [
   "سانس کے ٹیسٹ سے پھیپھڑوں کی اس بیماری کی تصدیق کی جاتی ہے۔",
   "سگریٹ نوشی چھوڑنا اور روزانہ انہیلر کا استعمال کرنا۔",
   "مزید انہیلر، پھیپھڑوں کی ورزش اور ضرورت پڑنے پر آکسیجن۔",
   "سالانہ فلو ویکسین اور پھیپھڑوں کا باقاعدہ معائنہ۔"
  ],
  "arthritis": [
   "معائنے، ایکسرے اور خون کے ٹیسٹ سے جوڑوں کے درد کی قسم معلوم کی جاتی ہے۔",
   "ورزش، وزن پر قابو اور درد کم کرنے والی عام دوائیں۔",
   "فزیکل تھراپی، جوڑوں میں ٹیکے یا جوڑوں کی بیماری کم کرنے والی خاص دوائیں۔",
   "شدید نقصان کی صورت میں جوڑ بدلنے کی سرجری اور باقاعدہ چیک اپ۔"
  ],
  "osteoporosis": [
   "ہڈیوں کی مضبوطی ناپنے کے لیے ایک خاص اسکین (DEXA) کیا جاتا ہے۔",
   "کیلشیم، وٹامن ڈی، ورزش اور گرنے سے بچنے کی کوشش۔",
   "ہڈیوں کو مضبوط بنانے والی دوائیں استعمال کرنا۔",
   "بہتری دیکھنے کے لیے ہر 1 سے 2 سال بعد ہڈیوں کا دوبارہ ٹیسٹ۔"
  ],
  "sleep-apnea": [
   "نیند کا ٹیسٹ (گھر پر یا لیب میں) کر کے بیماری کا پتہ لگایا جاتا ہے۔",
   "وزن کم کریں، کروٹ لے کر سوئیں اور رات کو نشہ آور چیزوں سے بچیں۔",
   "سانس کی مشین (CPAP)، منہ میں رکھنے والا آلہ یا سرجری۔",
   "یہ دیکھنے کے لیے چیک اپ کہ علاج صحیح کام کر رہا ہے۔"
  ],
  "ibs": [
   "دیگر مسائل کو خارج کرنے کے بعد علامات کی بنیاد پر تشخیص کی جاتی ہے۔",
   "غذا میں تبدیلی، ریشہ دار خوراک، ذہنی سکون اور وقت پر کھانا۔",
   "پیٹ خراب ہونے، قبض یا مروڑ کے لیے دوائیں۔",
   "تکلیف بڑھانے والی چیزوں پر نظر رکھیں اور ڈاکٹر سے مشورہ کریں۔"
  ],
  "eczema-psoriasis": [
   "ڈاکٹر جلد کو دیکھ کر اس بیماری کا پتہ لگاتا ہے۔",
   "روزانہ موئسچرائزر، ہلکا صابن اور خارش والی جگہ کے لیے کریمیں استعمال کریں۔",
   "شدید بیماری کی صورت میں لائٹ تھراپی، گولیاں یا ٹیکے۔",
   "جلد کا باقاعدہ معائنہ اور بیماری بڑھنے پر علاج میں تبدیلی۔"
  ],
  "migraines": [
   "سر درد کی ہسٹری سے پتہ چلتا ہے؛ اسکین کی ضرورت کم ہی پڑتی ہے۔",
   "درد شروع ہوتے ہی آرام کریں اور درد کش دوا لیں۔",
   "اگر سر درد بار بار ہو تو روزانہ بچاؤ کی دوائیں لیں۔",
   "سر درد کا ریکارڈ رکھیں تاکہ وجہ اور علاج کا اثر معلوم ہو سکے۔"
  ],
  "anemia": [
   "خون کے مکمل ٹیسٹ (CBC) سے خون کی کمی اور اس کی وجہ معلوم کی جاتی ہے۔",
   "آئرن والی غذائیں، سپلیمنٹس یا وٹامنز کا استعمال۔",
   "آئرن کی بوتل لگوانا یا خون بہنے کی اصل وجہ کا علاج۔",
   "خون میں بہتری دیکھنے کے لیے دوبارہ ٹیسٹ کروانا۔"
  ],
  "adhd": [
   "ڈاکٹر بات چیت اور خاص سوالات کے ذریعے تشخیص کرتا ہے۔",
   "سیکھنے کے طریقے، روزمرہ کا ٹائم ٹیبل اور اسکول یا کام میں مدد۔",
   "توجہ بہتر بنانے والی ادویات۔",
   "دوا کی مقدار اور مدد کو بہتر بنانے کے لیے باقاعدہ چیک اپ۔"
  ],
  "chronic-kidney-disease": [
   "خون اور پیشاب کے ٹیسٹ سے گردوں کی کارکردگی دیکھی جاتی ہے۔",
   "بلڈ پریشر اور شوگر پر قابو، اور نمک کا کم استعمال۔",
   "گردوں کے ماہر ڈاکٹر سے علاج اور حفاظتی دوائیں لینا۔",
   "اگر گردے زیادہ خراب ہوں تو ڈائلیسس یا پیوند کاری کی منصوبہ بندی۔"
  ],
  "pre-diabetes": [
   "خون کے ٹیسٹ میں شوگر کی مقدار تھوڑی زیادہ ہونا اس کی علامت ہے۔",
   "تھوڑا وزن کم کریں اور ہفتے میں کم از کم 150 منٹ ورزش کریں۔",
   "شوگر سے بچاؤ کا پروگرام اور کبھی کبھی خاص دوا میٹفارمین۔",
   "تبدیلی کو جلد پکڑنے کے لیے ہر سال شوگر چیک کروائیں۔"
  ]
 }
};

export const getPathway = (lang: Language, id: string): string[] | undefined => PATHWAYS[lang]?.[id] ?? PATHWAYS.en[id];
