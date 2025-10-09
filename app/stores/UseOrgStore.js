import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const orgConfigs = {
  DearCare: {
    color: '#11516F',
    logo: '/logo.png',
  },
  tcs: {
    color: '#BD6000',
    logo: '/TATA.png',
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


export function Sidebar(props) {
  const { branding, _hasHydrated } = useOrgStore()

  if (!_hasHydrated) {
    
    return null
  }


  return (
    <div style={{ backgroundColor: branding?.color || '#1e40af' }}>
      {/* ... */}
    </div>
  )
}

export default useOrgStore
