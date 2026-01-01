"use client"
import { useState } from "react"
import { useClientData } from "@/hooks/useClientData"
import { useExportClients } from "@/hooks/useExportClients"
import { Client } from "@/types/client.types"

import { ClientHeader } from "@/components/client/clients/ClientHeader"
import { ClientTable } from "@/components/client/clients/ClientTable"
import { ClientDetailsOverlay } from "@/components/client-details-overlay"
import { AddClientOverlay } from "@/components/add-client-overlay"
import { LoadingState } from "@/components/Loader"
import { ErrorState } from "@/components/client/clients/ErrorState"
import { EmptyState } from "@/components/client/clients/EmptyState"
import { PaginationControls } from "@/components/client/clients/PaginationControls"
import { logger } from "@/utils/logger"

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
    setSelectedStatus,
    selectedCategory,
    handleSearch,
    handleStatusChange,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    refreshData,
    createdAt,
    setCreatedAt,
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
    try {
      setSearchInput("");
      setSelectedStatus("all")
      setCreatedAt(null);
      
      setSearchQuery(""); 
      
      refreshData();
    } catch (error) {
      logger.debug("Error in handleResetFilters:", error);
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-3">
        <ClientHeader 
          onAddClient={() => setShowAddClient(true)}
          onExport={handleExport}
          isExporting={isExporting}
          selectedStatus={selectedStatus}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleStatusChange={handleStatusChange}
          handleSearch={handleSearch}
          selectedCategory={selectedCategory}
          handleResetFilters={handleResetFilters}
          createdAt={createdAt ? createdAt.toISOString().split('T')[0] : ""}
          setCreatedAt={(date: string) => setCreatedAt(date ? new Date(date) : null)}
        />

        {/* <ClientFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedStatus={selectedStatus}
          handleStatusChange={handleStatusChange}
          handleSearch={handleSearch}
          handleResetFilters={handleResetFilters}
        /> */}

        <div className="bg-white rounded-sm shadow-none overflow-hidden border border-slate-200">
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
                setPageSize={handlePageSizeChange}
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