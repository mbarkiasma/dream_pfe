import type { Block } from 'payload'

export const AuthBlock: Block = {
  slug: 'authBlock',
  labels: {
    singular: 'Auth Block',
    plural: 'Auth Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Create your account',
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
      defaultValue: 'Join us to explore your dreams',
    },
    {
      name: 'firstNamePlaceholder',
      type: 'text',
      defaultValue: 'First name',
    },
    {
      name: 'lastNamePlaceholder',
      type: 'text',
      defaultValue: 'Last name',
    },
    {
      name: 'emailPlaceholder',
      type: 'text',
      defaultValue: 'user@example.com',
    },
    {
      name: 'passwordPlaceholder',
      type: 'text',
      defaultValue: 'Choose a secure password',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      defaultValue: 'Sign Up',
    },
    {
      name: 'bottomText',
      type: 'text',
      defaultValue: 'Already have an account?',
    },
    {
      name: 'bottomLinkLabel',
      type: 'text',
      defaultValue: 'Log in',
    },
    {
      name: 'bottomLinkUrl',
      type: 'text',
      defaultValue: '/sign-in',
    },
  ],
}