import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/client'

export const useApplicationsStore = defineStore('applications', () => {
  const applications = ref([])
  const currentApplication = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchApplications() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/api/v1/applications')
      applications.value = response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to fetch applications'
      console.error('Failed to fetch applications:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchApplication(id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/api/v1/applications/${id}`)
      currentApplication.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to fetch application'
      console.error('Failed to fetch application:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createApplication(jobPostingId, notes = null) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/api/v1/applications', {
        job_posting_id: jobPostingId,
        notes
      })
      applications.value.unshift(response.data)
      currentApplication.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to create application'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateApplicationStatus(appId, status, notes = null) {
    loading.value = true
    error.value = null
    try {
      const payload = { status }
      if (notes) payload.notes = notes
      
      const response = await api.patch(`/api/v1/applications/${appId}`, payload)
      
      // Update in list
      const idx = applications.value.findIndex(a => a.id === appId)
      if (idx !== -1) {
        applications.value[idx] = response.data
      }
      
      // Update current if it's the same
      if (currentApplication.value?.id === appId) {
        currentApplication.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to update application'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function generateInterviewPrep(appId) {
    try {
      const response = await api.post(`/api/v1/applications/${appId}/interview-prep`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to generate interview prep'
      throw err
    }
  }

  async function generateImprovementSuggestions(appId) {
    try {
      const response = await api.post(`/api/v1/applications/${appId}/improvement`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to generate suggestions'
      throw err
    }
  }

  async function generateFollowupMessage(appId) {
    try {
      const response = await api.post(`/api/v1/applications/${appId}/followup-message`)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to generate follow-up message'
      throw err
    }
  }

  function getApplicationForJob(jobId) {
    return applications.value.find(app => app.job_posting_id === jobId)
  }

  function clearCurrent() {
    currentApplication.value = null
  }

  return {
    applications,
    currentApplication,
    loading,
    error,
    fetchApplications,
    fetchApplication,
    createApplication,
    updateApplicationStatus,
    generateInterviewPrep,
    generateImprovementSuggestions,
    generateFollowupMessage,
    getApplicationForJob,
    clearCurrent
  }
})
