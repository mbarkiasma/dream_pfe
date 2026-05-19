import { Banner } from '@payloadcms/ui/elements/Banner'
import Link from 'next/link'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Bienvenue dans le tableau de bord administrateur</h4>
      </Banner>
      <div className={`${baseClass}__actions`}>
        <Link className={`${baseClass}__logout`} href="/logout">
          Deconnecter ce navigateur
        </Link>
        <Link
          className={`${baseClass}__logout ${baseClass}__logout--secondary`}
          href="/api/auth/logout"
          prefetch={false}
        >
          Forcer la fermeture de session
        </Link>
      </div>
      <p className={`${baseClass}__help`}>
        Si vous avez ouvert l&apos;admin avec un mauvais compte dans ce navigateur, utilisez
        d&apos;abord la deconnexion normale. Si Chrome garde encore une session, utilisez la fermeture
        forcee.
      </p>
    </div>
  )
}

export default BeforeDashboard
