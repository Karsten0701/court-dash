<script setup>
const links = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];
</script>

<template>
  <header class="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
    <router-link to="/" class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-lg bg-racket text-snow"
      >
        <font-awesome-icon icon="table-tennis-paddle-ball" />
      </div>
      <div>
        <p class="text-sm font-semibold leading-tight text-snow">
          King of the Court
        </p>
        <p class="text-xs text-asphalt-muted">Court management dashboard</p>
      </div>
    </router-link>

    <div class="flex flex-wrap items-center gap-2">
      <nav class="flex flex-wrap items-center gap-1 text-sm" aria-label="Public navigation">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-snow-dim hover:bg-asphalt hover:text-snow"
          exact-active-class="border-asphalt-light bg-asphalt text-snow"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <a
        href="/login#login"
        class="inline-flex items-center gap-2 rounded-md border border-asphalt-light bg-charcoal/70 px-3 py-2 text-xs font-medium text-snow hover:bg-asphalt"
      >
        <font-awesome-icon icon="sign-in-alt" />
        Login
      </a>
    </div>
  </header>
</template>
