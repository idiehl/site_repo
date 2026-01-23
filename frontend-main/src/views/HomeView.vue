<script setup>
import HeroSection from '../components/HeroSection.vue'
import AppsSection from '../components/AppsSection.vue'
import ProjectsSection from '../components/ProjectsSection.vue'
import AboutSection from '../components/AboutSection.vue'
import FooterSection from '../components/FooterSection.vue'
import NavBar from '../components/NavBar.vue'
</script>

<template>
  <div>
    <NavBar />
    <main>
      <HeroSection />
      <AppsSection />
      <ProjectsSection />
      <AboutSection />
    </main>
    <FooterSection />
  </div>
</template>
