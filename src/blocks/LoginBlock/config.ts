import type { Block } from 'payload'

export const LoginBlock: Block = {
  slug: 'loginBlock',
  labels: {
    singular: 'Login Block',
    plural: 'Login Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Welcome Back!',
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'Log in to your account',
    },
    {
      name: 'emailPlaceholder',
      type: 'text',
      defaultValue: 'user@example.com',
    },
    {
      name: 'passwordPlaceholder',
      type: 'text',
      defaultValue: 'Enter your password',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      defaultValue: 'Log In',
    },
    {
      name: 'signupText',
      type: 'text',
      defaultValue: "Don't have an account?",
    },
    {
      name: 'signupLabel',
      type: 'text',
      defaultValue: 'Sign up',
    },
    {
      name: 'signupUrl',
      type: 'text',
      defaultValue: '/sign-up',
    },
  ],
}