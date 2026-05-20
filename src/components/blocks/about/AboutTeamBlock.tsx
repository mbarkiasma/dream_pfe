'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { AppBadge, sectionBadgeClass, sectionBadgeDotClass } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'

const fondatrices = [
  {
    nom: 'Oumaima Bouzayen',
    roleFr: 'Etudiante en informatique',
    roleEn: 'Computer science student',
    descriptionFr: "Co-developpeuse de la solution et proposante de l'idee MindBloom.",
    descriptionEn: 'Co-developer of the solution and co-creator of the MindBloom concept.',
    specialiteFr: 'AI et dev web',
    specialiteEn: 'AI and web development',
    photo: '/fondatrices/oumaima.jpg',
  },
  {
    nom: 'Asma Mbarki',
    roleFr: 'Etudiante en informatique',
    roleEn: 'Computer science student',
    descriptionFr: "Co-developpeuse de la solution et proposante de l'idee MindBloom.",
    descriptionEn: 'Co-developer of the solution and co-creator of the MindBloom concept.',
    specialiteFr: 'AI et dev web',
    specialiteEn: 'AI and web development',
    photo: '/fondatrices/asma.jpg',
  },
]

const specialistes = [
 {
  nom: 'Sana Belhadj',
  titreFr: 'Coach en accompagnement educatif',
  titreEn: 'Educational support coach',
  descriptionFr: "Accompagne les etudiants dans l'organisation de leurs etudes, la gestion du stress et l'amelioration de leur parcours academique.",
  descriptionEn: 'Supports students in organizing their studies, managing stress, and improving their academic journey.',
  note: '4.9',
  specialitesFr: ['Organisation', 'Stress', 'Parcours scolaire'],
  specialitesEn: ['Organization', 'Stress', 'Academic path'],
  photo: '/specialistes/sana.png',
},
{
  nom: 'Mehdi Chaabane',
  titreFr: 'Coach en developpement personnel',
  titreEn: 'Personal development coach',
  descriptionFr: "Soutient les etudiants dans leur motivation, leur confiance en soi et leurs choix d'orientation.",
  descriptionEn: 'Supports students with motivation, self-confidence, and orientation choices.',
  note: '4.8',
  specialitesFr: ['Motivation', 'Confiance', 'Orientation'],
  specialitesEn: ['Motivation', 'Confidence', 'Orientation'],
  photo: '/specialistes/mehdi.png',
},
{
  nom: 'Rim Trabelsi',
  titreFr: 'Coach en reussite academique',
  titreEn: 'Academic success coach',
  descriptionFr: "Aide a ameliorer la productivite, la gestion du temps et les methodes d'apprentissage.",
  descriptionEn: 'Helps improve productivity, time management, and learning methods.',
  note: '5',
  specialitesFr: ['Productivite', 'Methodes', 'Gestion du temps'],
  specialitesEn: ['Productivity', 'Methods', 'Time management'],
  photo: '/specialistes/rim.png',
},
  {
    nom: 'Yassine Ferchichi',
    titreFr: 'Coach en gestion emotionnelle',
    titreEn: 'Emotional regulation coach',
    descriptionFr:
      'Accompagne les etudiants dans la regulation des emotions, la communication relationnelle et la prevention des situations de surcharge emotionnelle.',
    descriptionEn:
      'Supports students in emotional regulation, interpersonal communication, and prevention of emotional overload situations.',
    note: '4.9',
    specialitesFr: ['Emotions', 'Communication', 'Surcharge'],
    specialitesEn: ['Emotions', 'Communication', 'Overload'],
    photo: '/specialistes/yassine.png',
  },
  {
    nom: 'Nour Ben Salah',
    titreFr: 'Coach en communication bienveillante',
    titreEn: 'Compassionate communication coach',
    descriptionFr:
      'Guide les etudiants dans la prise de parole, la communication non violente et la gestion des conflits en contexte universitaire.',
    descriptionEn:
      'Guides students in public speaking, non-violent communication, and conflict management in university settings.',
    note: '4.7',
    specialitesFr: ['CNV', 'Prise de parole', 'Conflits'],
    specialitesEn: ['NVC', 'Public speaking', 'Conflicts'],
    photo: '/specialistes/nour.png',
  },
  {
    nom: 'Dr. Amira Nasri',
    titreFr: 'Psychologue clinicienne universitaire',
    titreEn: 'University clinical psychologist',
    descriptionFr:
      'Assure un accompagnement psychologique professionnel pour les troubles anxieux, le mal-etre etudiant et les situations de vulnerabilite.',
    descriptionEn:
      'Provides professional psychological support for anxiety disorders, student distress, and vulnerability situations.',
    note: '5',
    specialitesFr: ['Anxiete', 'Psychologie', 'Bien-etre'],
    specialitesEn: ['Anxiety', 'Psychology', 'Well-being'],
    photo: '/specialistes/amira.png',
  },
]

const descriptionTextClass =
  'text-[15px] font-normal leading-[1.7] tracking-normal text-[var(--mindly-purple-muted)]'

const leadTextClass =
  'text-[16px] font-normal leading-[1.75] tracking-normal text-[var(--mindly-purple-muted)]'

export default function AboutTeamBlock() {
  const { t, lang } = useLanguage()
  const eq = t.equipe
  const familyBadgeClass = sectionBadgeClass
  const shouldReduceMotion = useReducedMotion()

  const badgeInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }
  const titleInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const cardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }
  const cardAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
  const specialistSectionInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const specialistCardInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.96 }
  const specialistItemInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
  const imageInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08 }
  const imageAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
  const badgeInsideInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
  const badgeInsideAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const smoothEase = [0.22, 1, 0.36, 1] as const

  return (
    <section id="equipe" className="mx-auto max-w-[1200px] space-y-10 px-5 py-10 font-[family-name:var(--font-zain)] sm:px-8">
      {/* Fondatrices */}
      <div id="fondatrices-encadrante" className="scroll-mt-28 space-y-6">
        <div className="text-left">
          <motion.div
            className="flex justify-start"
            initial={badgeInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: smoothEase }}
          >
            <AppBadge dot dotClassName={sectionBadgeDotClass} variant="outline" casing="upper" className={familyBadgeClass}>
              {lang === 'fr' ? "A L'ORIGINE DE L'IDEE" : 'BEHIND THE IDEA'}
            </AppBadge>
          </motion.div>
          <motion.h2
            className="mt-4 font-[family-name:var(--font-zain)] text-[32px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px]"
            initial={titleInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.08, ease: smoothEase }}
          >
            {lang === 'fr' ? (
              <>
                Les fondatrices{' '}
                <span className="text-[var(--mindly-text)]">du projet</span>
              </>
            ) : (
              <>
                Project{' '}
                <span className="text-[var(--mindly-text)]">founders</span>
              </>
            )}
          </motion.h2>
        </div>
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {fondatrices.map((fondatrice, index) => (
            <motion.div
              key={fondatrice.nom}
              className="group h-full"
              initial={cardInitial}
              whileInView={cardAnimate}
              viewport={{ once: true, amount: 0.22 }}
              transition={{
                duration: 0.65,
                delay: shouldReduceMotion ? 0 : index * 0.12,
                ease: smoothEase,
              }}
            >
            <Card
              className="relative h-full min-h-[250px] overflow-hidden rounded-[1.6rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-7 shadow-[0_18px_44px_rgba(111,77,215,0.11)] transition-all duration-300 ease-out group-hover:-translate-y-[6px] group-hover:border-[var(--mindly-purple-border)] group-hover:shadow-[0_24px_62px_rgba(111,77,215,0.18)]"
            >
              <span className="pointer-events-none absolute -left-6 top-[-14px] h-20 w-20 rounded-full bg-[var(--mindly-primary)]/14" />
              <span className="pointer-events-none absolute -right-8 bottom-3 h-32 w-32 rounded-full bg-[var(--mindly-primary-light)]/16" />
              <CardContent className="relative p-0">
                <div className="grid gap-5 sm:grid-cols-[1fr_150px] sm:items-start">
                  <div className="space-y-3">
                    <motion.div
                      className="w-fit"
                      initial={badgeInsideInitial}
                      whileInView={badgeInsideAnimate}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.12 + 0.18, ease: smoothEase }}
                    >
                      <AppBadge
                        variant="outline"
                        size="sm"
                        casing="upper"
                        icon={<Sparkles className="h-3 w-3" />}
                        radius="pill"
                        className={`w-fit ${familyBadgeClass}`}
                      >
                        {lang === 'fr' ? 'Fondatrice' : 'Founder'}
                      </AppBadge>
                    </motion.div>
                    <div className="space-y-1">
                      <p className="text-[26px] font-bold leading-tight text-[var(--mindly-text-strong)]">{fondatrice.nom}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--mindly-secondary)]">
                        {lang === 'fr' ? fondatrice.roleFr : fondatrice.roleEn}
                      </p>
                    </div>
                    <div className="h-[2px] w-7 rounded-full bg-[var(--mindly-primary-soft)]" />
                    <p className="text-[15px] leading-7 text-[var(--mindly-text)]">
                      {lang === 'fr' ? fondatrice.descriptionFr : fondatrice.descriptionEn}
                    </p>
                    <p className="flex items-center gap-2 text-[14px] text-[var(--mindly-text)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--mindly-primary)]" />
                      <span>
                        <span className="font-semibold">{lang === 'fr' ? 'Specialite' : 'Specialty'} :</span>{' '}
                        {lang === 'fr' ? fondatrice.specialiteFr : fondatrice.specialiteEn}
                      </span>
                    </p>
                    <motion.div
                      className="w-fit"
                      initial={badgeInsideInitial}
                      whileInView={badgeInsideAnimate}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.12 + 0.26, ease: smoothEase }}
                    >
                      <AppBadge variant="outline" size="sm" casing="upper" className={`w-fit ${familyBadgeClass}`}>
                        IA · Web
                      </AppBadge>
                    </motion.div>
                  </div>
                  <div className="relative h-[180px] w-full max-w-[150px] justify-self-end overflow-hidden rounded-[1.25rem] border border-[var(--mindly-border)] bg-[var(--mindly-lavender-350)] shadow-[0_10px_26px_rgba(111,77,215,0.16)]">
                    <motion.div
                      className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                      initial={imageInitial}
                      whileInView={imageAnimate}
                      viewport={{ once: true, amount: 0.45 }}
                      transition={{ duration: 0.75, delay: shouldReduceMotion ? 0 : index * 0.12 + 0.12, ease: smoothEase }}
                    >
                      <Image src={fondatrice.photo} alt={fondatrice.nom} fill className="object-cover object-top" sizes="(max-width: 640px) 140px, 150px" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Encadrante */}
      <div className="scroll-mt-28 space-y-6">
        <div className="text-left">
          <div className="flex justify-start">
            <AppBadge dot dotClassName={sectionBadgeDotClass} variant="outline" casing="upper" className={familyBadgeClass}>
              {lang === 'fr' ? 'ENCADREMENT ACADEMIQUE' : 'ACADEMIC SUPERVISION'}
            </AppBadge>
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-zain)] text-[32px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[42px]">
            {lang === 'fr' ? (
              <>
                Encadrante{' '}
                <span className="text-[var(--mindly-text)]">académique</span>
              </>
            ) : (
              <>
                Academic{' '}
                <span className="text-[var(--mindly-text)]">supervisor</span>
              </>
            )}
          </h2>
        </div>
        <div className="max-w-3xl">
          <Card className="rounded-[1.4rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6 shadow-[0_16px_38px_rgba(111,77,215,0.10)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[var(--mindly-primary-soft)] hover:shadow-[0_22px_54px_rgba(111,77,215,0.14)]">
            <CardContent className="space-y-4 p-0">
              <AppBadge variant="outline" size="sm" casing="upper" className={familyBadgeClass}>
                {lang === 'fr' ? 'Encadrante' : 'Supervisor'}
              </AppBadge>
              <div className="space-y-2">
                <p className="text-[26px] font-bold leading-tight text-[var(--mindly-text-strong)]">Lobna Hlaoua</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--mindly-secondary)]">
                  {lang === 'fr' ? 'Maitre de conferences' : 'Associate professor'}
                </p>
              </div>
              <p className="text-[15px] leading-7 text-[var(--mindly-text)]">
                {lang === 'fr'
                  ? 'Encadrante du projet MindBloom - accompagnement methodologique et validation scientifique de la solution.'
                  : 'MindBloom project supervisor — methodological guidance and scientific validation of the solution.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Spécialistes */}
      <motion.div
        id="equipe-specialistes"
        className="scroll-mt-28 space-y-6"
        initial={specialistSectionInitial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: smoothEase }}
      >
        <div className="text-left">
          <div className="flex justify-start">
            <AppBadge dot dotClassName={sectionBadgeDotClass} variant="outline" casing="upper" className={familyBadgeClass}>
              {eq.specialistesBadge}
            </AppBadge>
          </div>
          <motion.h2
            className="mt-3 font-[family-name:var(--font-zain)] text-[30px] font-bold leading-[1.08] tracking-normal text-[var(--mindly-text)] sm:text-[38px]"
            initial={specialistSectionInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.08, ease: smoothEase }}
          >
            {lang === 'fr' ? (
              <>
                Notre équipe{' '}
                <span className="text-[var(--mindly-text)]">de spécialistes</span>
              </>
            ) : (
              <>
                Our team{' '}
                <span className="text-[var(--mindly-text)]">of specialists</span>
              </>
            )}
          </motion.h2>
          <motion.p
            className={`mt-5 max-w-[880px] ${leadTextClass}`}
            initial={specialistItemInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.35, delay: 0.18, ease: smoothEase }}
          >
            {lang === 'fr'
              ? 'Chaque étudiant peut choisir le spécialiste le plus adapté à ses besoins pour un accompagnement personnalisé, humain et rassurant.'
              : eq.specialistesDesc}
          </motion.p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {specialistes.map((specialiste, index) => (
            <motion.div
              key={specialiste.nom}
              className="h-full"
              initial={specialistCardInitial}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: 0.1 + index * 0.1, ease: smoothEase }}
            >
              <Card
                className="group relative flex h-full overflow-hidden rounded-[1.5rem] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-5 shadow-[0_14px_36px_rgba(111,77,215,0.10)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[var(--mindly-purple-border)] hover:shadow-[0_20px_52px_rgba(111,77,215,0.16)]"
              >
                <CardContent className="relative flex h-full w-full flex-col p-0">
                  <div className="flex items-start justify-between gap-3">
                    <AppBadge size="sm" className={familyBadgeClass}>
                      {lang === 'fr' ? specialiste.titreFr : specialiste.titreEn}
                    </AppBadge>
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] border border-[var(--mindly-border)] bg-[var(--mindly-lavender-300)]">
                      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-[var(--mindly-purple-note)]">
                        {specialiste.nom.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </span>
                      {specialiste.photo ? (
                        <Image src={specialiste.photo} alt={specialiste.nom} fill className="object-cover object-center" sizes="64px" />
                      ) : null}
                    </div>
                  </div>
                  <motion.p
                    className="mt-4 text-[18px] font-bold leading-tight text-[var(--mindly-text)]"
                    initial={specialistItemInitial}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: 0.24 + index * 0.1, ease: smoothEase }}
                  >
                    {specialiste.nom}
                  </motion.p>
                  <motion.div
                    className="mt-1.5 flex items-center gap-2"
                    initial={specialistItemInitial}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: 0.28 + index * 0.1, ease: smoothEase }}
                  >
                    <span
                      aria-label={`${specialiste.note} sur 5`}
                      className="text-[13px] tracking-[0.22em] text-[var(--mindly-warning)]"
                    >
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <span key={starIndex} aria-hidden="true">
                          ★
                        </span>
                      ))}
                    </span>
                    <span className="text-[13px] font-semibold text-[var(--mindly-primary-muted)]">{specialiste.note}</span>
                  </motion.div>
                  <motion.p
                    className={`${descriptionTextClass} flex-1`}
                    initial={specialistItemInitial}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: 0.32 + index * 0.1, ease: smoothEase }}
                  >
                    {lang === 'fr' ? specialiste.descriptionFr : specialiste.descriptionEn}
                  </motion.p>
                  <motion.div
                    className="mt-5 flex flex-wrap gap-2"
                    initial={specialistItemInitial}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: 0.36 + index * 0.1, ease: smoothEase }}
                  >
                    {(lang === 'fr' ? specialiste.specialitesFr : specialiste.specialitesEn).map((specialite) => (
                      <AppBadge
                        key={`${specialiste.nom}-${specialite}`}
                        size="xs"
                        className="border-[var(--mindly-lavender-700)] bg-[var(--mindly-bg)] text-[var(--mindly-primary-muted)] font-medium tracking-[0.06em]"
                      >
                        {specialite}
                      </AppBadge>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

