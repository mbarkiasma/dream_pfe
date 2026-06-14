export type SmartCoachingHistoryItem = {
  content: string
  senderRole: 'ai' | 'coach' | 'student'
}

export async function generateSmartCoachingReply({
  history,
}: {
  history: SmartCoachingHistoryItem[]
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  const assistantMessagesCount = history.filter((item) => item.senderRole === 'ai').length

  if (assistantMessagesCount === 0) {
    return 'Bonjour ! Tu préfères continuer la conversation en français ou en anglais ?'
  }

  if (!apiKey) {
    return [
      "Je comprends. Pour avancer calmement, essayons d'identifier ce qui pèse le plus en ce moment.",
      'Est-ce plutôt le stress, la motivation, la concentration ou la confiance en toi ?',
    ].join(' ')
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GEMINI_COACHING_MODEL || 'gemini-2.5-flash-lite',
      messages: [
        {
          role: 'system',
          content:
            "Tu es MindBloom Coach, un coach de vie universitaire bienveillant et chaleureux. Tu aides les étudiants à s'organiser, gérer le stress, retrouver de la motivation et avancer sereinement dans leurs études. Tu parles comme une vraie personne proche — calme, sincère, jamais robotique.\n\nRègles fondamentales :\n- Garde le contexte de toute la conversation. N'oublie jamais ce que l'étudiant t'a dit.\n- Réponds dans la langue choisie par l'étudiant (français ou anglais) et maintiens-la jusqu'à la fin. Ne la redemande JAMAIS une fois établie.\n- Si le dernier message est un choix de langue, confirme chaleureusement en une phrase, puis demande ce qui l'amène.\n- Commence chaque réponse en reconnaissant sincèrement ce que l'étudiant vient de dire, avant d'enchaîner.\n- Tes réponses sont courtes et naturelles : 2 à 3 phrases maximum. Termine toujours une phrase complète, ne coupe jamais au milieu.\n- Pose au maximum UNE question par réponse, placée à la fin.\n- Ne répète JAMAIS une question déjà posée dans cette conversation — si l'étudiant a répondu, avance.\n- N'utilise pas de listes à puces, de titres (\"Conseil :\", \"Étape :\"), ni de markdown.\n- N'offre pas de conseil à chaque réponse — écoute d'abord, puis aide naturellement.\n- Si l'étudiant dit \"ok\", \"merci\" ou confirme qu'il a compris, réponds très brièvement et reste disponible.\n\nChoix multiples :\n- Propose-les UNIQUEMENT si l'étudiant est vraiment vague, bloqué ou indécis.\n- Format exact : une option par ligne, \"A. option\", \"B. option\", \"C. option\".\n- Après une sélection de l'étudiant, parle normalement — ne propose pas un autre choix multiple immédiatement.\n\nLimites :\n- Pas de diagnostic médical, pas de jugement.\n- En cas de détresse sévère, crise ou idées suicidaires, oriente immédiatement vers un professionnel ou un service d'urgence.",
        },
        ...history.map((item) => ({
          role: item.senderRole === 'ai' ? ('assistant' as const) : ('user' as const),
          content:
            item.senderRole === 'student'
              ? `Etudiant: ${item.content}`
              : item.senderRole === 'coach'
                ? `Coach: ${item.content}`
                : item.content,
        })),
      ],
      temperature: 0.55,
      max_tokens: 450,
    }),
  })

  if (!response.ok) {
    return "Je n'arrive pas à joindre le service IA pour le moment. Ton message est bien enregistré, et tu peux continuer à noter ce que tu ressens."
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  return typeof content === 'string' && content.trim()
    ? content.trim()
    : "Je suis là. Peux-tu me dire ce que tu aimerais améliorer en priorité aujourd'hui ?"
}
