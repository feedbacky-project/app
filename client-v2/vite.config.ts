import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [react(), vike()],
  resolve: {
    alias: {
      "#": __dirname,
    }
  },
}

export default config
