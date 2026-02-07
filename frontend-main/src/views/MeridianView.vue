<script setup>
import NavBar from '../components/NavBar.vue'
import FooterSection from '../components/FooterSection.vue'
</script>

<template>
  <div>
    <NavBar />
    <main>
      <!-- Hero -->
      <section class="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-night-950 via-night-950 to-night-900"></div>
        <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-atlas-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div class="absolute inset-0 bg-[linear-gradient(rgba(94,107,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(94,107,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="mb-6 animate-fade-in-up flex items-center justify-center" style="animation-delay: 0.2s;">
            <img
              src="/atlas-meridian-wordmark.svg"
              alt="Atlas Meridian"
              class="h-14 md:h-20 w-auto animate-float"
            />
          </h1>
          <p class="text-xl md:text-2xl text-night-300 mb-4 animate-fade-in-up" style="animation-delay: 0.3s;">
            Interactive Canvas Platform
          </p>
          <p class="text-lg text-night-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style="animation-delay: 0.4s;">
            A desktop-first visual workspace for mapping ideas, systems, and creative projects with
            linked nodes, rich media editing, and spatial organization.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style="animation-delay: 0.5s;">
            <a href="mailto:contact@atlasuniversalis.com?subject=Atlas%20Meridian%20Updates" class="btn btn-primary text-lg px-8 py-4">
              Join the Waitlist
            </a>
            <a href="#download" class="btn btn-secondary text-lg px-8 py-4">
              Download Preview
            </a>
          </div>
        </div>
      </section>

      <!-- Vision -->
      <section class="section bg-night-900/30">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <span class="text-atlas-400 font-medium text-sm uppercase tracking-wider mb-2 block">
              Vision
            </span>
            <h2 class="section-title">A Canvas Built for Systems Thinking</h2>
            <p class="section-subtitle mx-auto">
              Meridian combines visual mapping, media editing, and structured organization into a single
              fluid workspace.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Spatial First</h3>
              <p class="text-night-400">
                Nodes, frames, and links are arranged on a limitless canvas with deep zoom and fast navigation.
              </p>
            </div>
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Media Rich</h3>
              <p class="text-night-400">
                Text, images, and video are edited in place with typography and layout controls.
              </p>
            </div>
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Structured Systems</h3>
              <p class="text-night-400">
                Links, nested nodes, and frames allow complex systems to be modeled and explored.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Status -->
      <section class="section">
        <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 class="text-3xl font-bold text-white mb-4">Current Status</h2>
            <p class="text-night-400 mb-6">
              Meridian is in active planning and prototype development. The core focus is building a stable
              interactive canvas foundation before advanced editing and collaboration.
            </p>
            <ul class="space-y-3 text-night-300">
              <li class="flex items-start gap-3">
                <span class="text-atlas-400">•</span>
                Interactive canvas foundation in progress
              </li>
              <li class="flex items-start gap-3">
                <span class="text-atlas-400">•</span>
                Linked and nested node model defined
              </li>
              <li class="flex items-start gap-3">
                <span class="text-atlas-400">•</span>
                Editor roadmap for text/image/video controls
              </li>
            </ul>
          </div>
          <div class="card card-hover border border-night-700">
            <h3 class="text-lg font-semibold text-white mb-3">Technical Direction</h3>
            <p class="text-night-400 mb-4">
              Desktop-first with .NET and Avalonia, using Skia for high-performance rendering. Cloud sync and
              collaboration planned for later phases.
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 text-xs rounded-full bg-night-800 text-night-300">.NET</span>
              <span class="px-3 py-1 text-xs rounded-full bg-night-800 text-night-300">Avalonia</span>
              <span class="px-3 py-1 text-xs rounded-full bg-night-800 text-night-300">Skia</span>
              <span class="px-3 py-1 text-xs rounded-full bg-night-800 text-night-300">Local-first</span>
              <span class="px-3 py-1 text-xs rounded-full bg-night-800 text-night-300">Sync-ready</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Download -->
      <section id="download" class="section bg-night-900/30">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <span class="text-atlas-400 font-medium text-sm uppercase tracking-wider mb-2 block">
              Download
            </span>
            <h2 class="section-title">Meridian Preview Builds</h2>
            <p class="section-subtitle mx-auto">
              Meridian is in active development. Request access to preview builds or get notified when new releases drop.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Windows</h3>
              <p class="text-night-400 mb-4">Primary desktop target with early preview availability.</p>
              <a
                href="mailto:contact@atlasuniversalis.com?subject=Atlas%20Meridian%20Windows%20Preview"
                class="btn btn-primary w-full text-center"
              >
                Request Windows Preview
              </a>
            </div>
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">macOS</h3>
              <p class="text-night-400 mb-4">Planned after the Windows preview stabilizes.</p>
              <button class="btn btn-secondary w-full opacity-60 cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Linux</h3>
              <p class="text-night-400 mb-4">Roadmapped once core canvas performance is validated.</p>
              <button class="btn btn-secondary w-full opacity-60 cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Roadmap -->
      <section id="roadmap" class="section bg-night-900/30">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <span class="text-atlas-400 font-medium text-sm uppercase tracking-wider mb-2 block">
              Roadmap
            </span>
            <h2 class="section-title">Meridian Next Steps</h2>
            <p class="section-subtitle mx-auto">
              A staged rollout focused on stability, editing power, and collaboration.
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Phase 1</h3>
              <p class="text-night-400">
                Core canvas, selection, and link system with file save/load.
              </p>
            </div>
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Phase 2</h3>
              <p class="text-night-400">
                Advanced text and image editing tools, inspector panels, and templates.
              </p>
            </div>
            <div class="card card-hover">
              <h3 class="text-lg font-semibold text-white mb-2">Phase 3</h3>
              <p class="text-night-400">
                Collaboration, shared canvases, and live nodes for dynamic data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <FooterSection />
  </div>
</template>
