import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FormulaireContact() {
  return (
    <Card
      id="formulaire-contact"
      className="card-hover-premium shimmer-wrap rounded-[32px] border border-border bg-card/75 shadow-[0_18px_45px_rgba(131,110,181,0.14)] backdrop-blur-[10px]"
      style={{
        animation: 'fadeUpSoft 0.85s ease-out 0.12s both',
      }}
    >
      <CardContent className="p-8">
        <h2 className="text-4xl font-bold text-dream-heading">
          Envoyez-nous un message
        </h2>

        <form className="mt-8 space-y-4">
          <div style={{ animation: 'fadeUpSoft 0.7s ease-out 0.2s both' }}>
            <Input
              type="text"
              placeholder="Nom complet"
              className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading placeholder:text-[#a290bf] transition duration-300 focus-visible:-translate-y-0.5 focus-visible:border-[#d7c0ff] focus-visible:bg-white focus-visible:ring-[#d7c0ff]/30"
            />
          </div>

          <div style={{ animation: 'fadeUpSoft 0.7s ease-out 0.28s both' }}>
            <Input
              type="email"
              placeholder="Email"
              className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading placeholder:text-[#a290bf] transition duration-300 focus-visible:-translate-y-0.5 focus-visible:border-[#d7c0ff] focus-visible:bg-white focus-visible:ring-[#d7c0ff]/30"
            />
          </div>

          <div
            className="grid gap-4 md:grid-cols-3"
            style={{ animation: 'fadeUpSoft 0.7s ease-out 0.36s both' }}
          >
            <Input
              type="text"
              placeholder="Téléphone"
              className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading placeholder:text-[#a290bf] transition duration-300 focus-visible:-translate-y-0.5 focus-visible:border-[#d7c0ff] focus-visible:bg-white focus-visible:ring-[#d7c0ff]/30"
            />

            <Select>
              <SelectTrigger className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading focus:ring-[#d7c0ff]/30">
                <SelectValue placeholder="Profil" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-white/95 text-dream-heading">
                <SelectItem value="etudiant">Étudiant</SelectItem>
                <SelectItem value="psychologue">Psychologue</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading focus:ring-[#d7c0ff]/30">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-white/95 text-dream-heading">
                <SelectItem value="normale">Priorité normale</SelectItem>
                <SelectItem value="haute">Priorité haute</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            className="grid gap-4 md:grid-cols-2"
            style={{ animation: 'fadeUpSoft 0.7s ease-out 0.44s both' }}
          >
            <Select>
              <SelectTrigger className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading focus:ring-[#d7c0ff]/30">
                <SelectValue placeholder="Type de demande" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-white/95 text-dream-heading">
                <SelectItem value="journal-reves">Journal de rêves</SelectItem>
                <SelectItem value="analyse-ia">Analyse IA</SelectItem>
                <SelectItem value="seances">Séances</SelectItem>
                <SelectItem value="rapports">Rapports</SelectItem>
                <SelectItem value="support-technique">Support technique</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Sujet"
              className="h-14 rounded-2xl border-border bg-white/88 text-dream-heading placeholder:text-[#a290bf] transition duration-300 focus-visible:-translate-y-0.5 focus-visible:border-[#d7c0ff] focus-visible:bg-white focus-visible:ring-[#d7c0ff]/30"
            />
          </div>

          <div style={{ animation: 'fadeUpSoft 0.7s ease-out 0.52s both' }}>
            <Textarea
              placeholder="Décrivez votre demande..."
              className="min-h-[170px] rounded-2xl border-border bg-white/88 py-4 text-dream-heading placeholder:text-[#a290bf] transition duration-300 focus-visible:-translate-y-0.5 focus-visible:border-[#d7c0ff] focus-visible:bg-white focus-visible:ring-[#d7c0ff]/30"
            />
          </div>

          <div
            className="pt-2 text-center"
            style={{ animation: 'fadeUpSoft 0.7s ease-out 0.6s both' }}
          >
            <Button
              type="submit"
              className="anim-pulse-button min-w-[240px] rounded-full bg-gradient-to-r from-[#e1a7d9] via-[#b79ef6] to-[#8c90ff] px-8 py-6 font-semibold text-white shadow-[0_10px_30px_rgba(140,144,255,0.28)] transition duration-300 hover:scale-[1.03] hover:opacity-100"
            >
              Envoyer la demande
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}