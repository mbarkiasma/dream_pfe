import { Block } from "payload/types"

export const EntretienBlock: Block = {

  slug: "entretienBlock",

  labels: {
    singular: "Entretien",
    plural: "Entretiens",
  },

  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Entretien",
    },
  ],

}