import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref([])
  const currentJob = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const pendingJobs = computed(() => 
    jobs.value.filter(j => j.status === 'pending' || j.status === 'processing')
  )
  
  const completedJobs = computed(() => 
    jobs.value.filter(j => j.status === 'completed')
  )

  async function fetchJobs() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/api/v1/jobs')
      jobs.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to fetch jobs'
    } finally {
      loading.value = false
    }
  }

  async function fetchJob(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/api/v1/jobs/${id}`)
      currentJob.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to fetch job'
      return null
    } finally {
      loading.value = false
    }
  }

  async function ingestJobs(urls) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/api/v1/jobs/ingest', { urls })
      // Refresh job list
      await fetchJobs()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to ingest jobs'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteJob(id) {
    try {
      await api.delete(`/api/v1/jobs/${id}`)
      jobs.value = jobs.value.filter(j => j.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to delete job'
      return false
    }
  }

  return {
    jobs,
    currentJob,
    loading,
    error,
    pendingJobs,
    completedJobs,
    fetchJobs,
    fetchJob,
    ingestJobs,
    deleteJob,
  }
})
