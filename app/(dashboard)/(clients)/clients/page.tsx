"use client"
import { useState } from "react"
import { useClientData } from "@/hooks/useClientData"
import { useExportClients } from "@/hooks/useExportClients"
import { Client } from "@/types/client.types"

import { ClientHeader } from "@/components/client/clients/ClientHeader"
import { ClientFilters } from "@/components/client/clients/ClientFilters" 
import { ClientTable } from "@/components/client/clients/ClientTable"
import { ClientDetailsOverlay } from "@/components/client-details-overlay"
import { AddClientOverlay } from "@/components/add-client-overlay"
import { LoadingState } from "@/components/Loader"
import { ErrorState } from "@/components/client/clients/ErrorState"
import { EmptyState } from "@/components/client/clients/EmptyState"
import { PaginationControls } from "@/components/client/clients/PaginationControls"

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)
  
  const { 
    clients,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    handleSearch,
    handleStatusChange,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    refreshData
  } = useClientData()

  const { isExporting, handleExport } = useExportClients(selectedStatus, searchQuery)

  const handleClientAdded = () => {
    setShowAddClient(false)
    refreshData()
  }

  const handleClientStatusChange = () => {
    refreshData()
  }

  const handleResetFilters = () => {
    console.log("handleResetFilters called");
    try {
      setSearchInput("");
      
      setSearchQuery(""); 
      
      refreshData();
    } catch (error) {
      console.error("Error in handleResetFilters:", error);
    }
  }

  return (
    <div>
      <div className="space-y-5 sm:space-y-7">
        <ClientHeader 
          onAddClient={() => setShowAddClient(true)}
          onExport={handleExport}
          isExporting={isExporting}
          selectedStatus={selectedStatus}
        />

        <ClientFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedStatus={selectedStatus}
          handleStatusChange={handleStatusChange}
          handleSearch={handleSearch}
          handleResetFilters={handleResetFilters}
        />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {isLoading ? (
            <LoadingState message="Loading clients..." />
          ) : error ? (
            <ErrorState 
              error={error} 
              onRetry={refreshData} 
            />
          ) : clients.length === 0 ? (
            <EmptyState 
              title="No clients found"
              message="Try changing your filters or search criteria" 
              handleResetFilters={handleResetFilters}
            />
          ) : (
            <>
              <ClientTable 
                clients={clients} 
                onReviewDetails={setSelectedClient} 
              />
              
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemsLength={clients.length}
                onPageChange={handlePageChange}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            </>
          )}
        </div>
      </div>

      {showAddClient && (
        <AddClientOverlay 
          onClose={() => setShowAddClient(false)}
          onAdd={handleClientAdded}
        />
      )}

      {selectedClient && (
        <ClientDetailsOverlay 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)}
          onStatusChange={handleClientStatusChange}
        />
      )}
    </div>
  )
}