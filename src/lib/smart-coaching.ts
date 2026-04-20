export type SmartCoachingHistoryItem = {
  content: string
  senderRole: 'ai' | 'coach' | 'student'
}

export async function generateSmartCoachingReply({
  history,
}: {
  history: SmartCoachingHistoryItem[]
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  const assistantMessagesCount = history.filter((item) => item.senderRole === 'ai').length

  if (assistantMessagesCount === 0) {
    return 'Bonjour ! Tu preferes continuer la conversation en francais ou en anglais ?'
  }

  if (!apiKey) {
    return [
      "Je comprends. Pour avancer calmement, essayons d'identifier ce qui pese le plus en ce moment.",
      'Est-ce plutot le stress, la motivation, la concentration ou la confiance en toi ?',
    ].join(' ')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_COACHING_MODEL || 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un coach de vie universitaire bienveillant qui parle comme une vraie personne calme, simple et rassurante. Tu dois garder le contexte de la conversation. Si l etudiant a choisi francais, reponds en francais. S il a choisi anglais, reponds en anglais. Ne redemarre jamais la conversation apres le choix de langue. Ne redemande pas la langue si elle a deja ete demandee. Si le dernier message est seulement un choix de langue, confirme brievement puis demande ce qui l amene. Reponds naturellement, comme dans une discussion reelle: pas de ton robotique, pas de grand cours, pas de structure lourde. Tes reponses doivent etre courtes: 1 a 3 phrases la plupart du temps. Tu peux parfois donner un petit conseil simple, mais integre-le dans la phrase, sans titre comme "Conseil :", "Astuce :" ou "Etape :". Ne donne pas un conseil a chaque reponse. Si l etudiant repond juste "ok", "merci" ou confirme qu il a compris, reponds tres brievement et reste disponible. Utilise les choix multiples rarement: seulement si l etudiant est vraiment vague, bloque, indecis, ou s il demande des choix. Apres que l etudiant selectionne un choix ("Je choisis..."), ne reponds pas immediatement par un autre choix multiple; parle normalement et aide-le sur ce choix. Quand tu proposes un choix multiple, mets chaque option sur une ligne separee exactement sous la forme "A. option", "B. option", "C. option" ou "D. option". Ne pose jamais plus d une question par reponse. Si l etudiant dit "je n ai pas compris", reformule plus simplement avec un exemple court. Ne sois jamais sec ou jugeant. N utilise pas de markdown lourd, pas de listes longues, pas de symboles decoratifs. Tu ne poses pas de diagnostic medical. En cas de danger, crise ou idee suicidaire, recommande de contacter rapidement un professionnel ou un service d urgence.',
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
      temperature: 0.5,
      max_tokens: 280,
    }),
  })

  if (!response.ok) {
    return "Je n'arrive pas a joindre le service IA pour le moment. Ton message est bien enregistre, et tu peux continuer a noter ce que tu ressens."
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  return typeof content === 'string' && content.trim()
    ? content.trim()
    : "Je suis la. Peux-tu me dire ce que tu aimerais ameliorer en priorite aujourd'hui ?"
}
