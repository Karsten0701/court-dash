<script setup>
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";

const plans = [
  {
    name: "Club night",
    price: "Free",
    description: "For small groups that need a simple admin dashboard.",
    items: ["Player overview", "Game planning", "Manual score flow"],
  },
  {
    name: "Organizer",
    price: "Pro",
    description: "For recurring sessions with more players and cleaner operations.",
    items: ["Admin roles", "Ranking visibility", "API health checks"],
    highlighted: true,
  },
  {
    name: "Venue",
    price: "Custom",
    description: "For clubs that want the dashboard adapted to their setup.",
    items: ["Multiple courts", "Custom workflows", "Setup support"],
  },
];
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <PublicSiteHeader />

      <main class="py-12 lg:py-16">
        <section class="max-w-3xl">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-asphalt-muted">
            Pricing
          </p>
          <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl">
            Start simple, scale when the club gets busier.
          </h1>
          <p class="mt-5 text-base leading-7 text-snow-dim">
            Keep the pricing page clean and honest. The dashboard can support a
            small group first, then grow into a more complete club tool.
          </p>
        </section>

        <section class="mt-10 grid gap-4 lg:grid-cols-3">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="rounded-lg border p-5"
            :class="plan.highlighted ? 'border-racket bg-charcoal shadow-xl' : 'border-asphalt-light bg-charcoal'"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-snow">{{ plan.name }}</h2>
                <p class="mt-2 text-sm leading-6 text-snow-dim">{{ plan.description }}</p>
              </div>
              <span
                v-if="plan.highlighted"
                class="rounded-full bg-racket/20 px-3 py-1 text-xs font-medium text-racket"
              >
                Popular
              </span>
            </div>

            <p class="mt-6 text-3xl font-semibold text-snow">{{ plan.price }}</p>

            <ul class="mt-6 space-y-3">
              <li
                v-for="item in plan.items"
                :key="item"
                class="flex items-center gap-3 text-sm text-snow-dim"
              >
                <font-awesome-icon icon="check" class="text-turf" />
                {{ item }}
              </li>
            </ul>

            <router-link
              to="/contact"
              class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium"
              :class="plan.highlighted ? 'bg-racket text-white hover:bg-racket-hover' : 'border border-asphalt-light text-snow hover:bg-asphalt'"
            >
              <font-awesome-icon icon="chevron-right" />
              Talk about this
            </router-link>
          </article>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
