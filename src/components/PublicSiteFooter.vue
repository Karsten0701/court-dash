<template>
  <footer class="mt-6 border-t border-asphalt-light py-8">
    <div class="grid gap-6 text-sm text-snow-dim md:grid-cols-[1.2fr_0.8fr] md:items-center">
      <div>
        <p class="font-semibold text-snow">{{ $t("common.appName") }}</p>
        <p class="mt-2 max-w-xl text-sm leading-6 text-snow-dim">{{ $t("footer.tagline") }}</p>
      </div>
      <div class="flex flex-wrap gap-4 md:justify-end">
        <router-link to="/" class="hover:text-snow">{{ $t("nav.home") }}</router-link>
        <router-link to="/features" class="hover:text-snow">{{ $t("nav.features") }}</router-link>
        <router-link to="/pricing" class="hover:text-snow">{{ $t("nav.pricing") }}</router-link>
        <router-link to="/contact" class="hover:text-snow">{{ $t("nav.contact") }}</router-link>
      </div>
    </div>
  </footer>
</template>
