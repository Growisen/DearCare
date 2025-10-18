import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const orgConfigs = {
  TataHomeNursing: {
    color: '#BD6000',
    logo: '/TATA.png',
  },
  DearCare: {
    color: '#11516F',
    logo: '/logo.png',
  }
}

const useOrgStore = create(
  persist(
    (set) => ({
      organization: null,
      branding: null,
      _hasHydrated: false,
      setOrganization: (orgId) => {
        const config = orgConfigs[orgId] || { color: '#000', logo: '/logo.png' }
        set({ organization: orgId, branding: config })
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'organization-storage',
      partialize: (state) => ({
        organization: state.organization,
        branding: state.branding,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export default useOrgStore
