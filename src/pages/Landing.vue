<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import appConfig from "@/config/appConfig";

const route = useRoute();

const steps = [
  {
    icon: "calendar-days",
    title: "Join a session",
    text: "Pick an upcoming court game and sign up. Spots are limited so the ladder stays competitive.",
  },
  {
    icon: "table-tennis-paddle-ball",
    title: "Play it out",
    text: "Everyone on court gets a match. Results go in after the game — no manual scorekeeping on your phone.",
  },
  {
    icon: "trophy",
    title: "Move up the board",
    text: "Your ELO updates when a game is processed. Check the leaderboard to see where you stand.",
  },
];

const faqs = [
  {
    q: "What is King of the Court?",
    a: "A ranking ladder for our court sessions. You sign up for games, play, and your ELO moves based on results.",
  },
  {
    q: "How does ELO work here?",
    a: "Same idea as elsewhere: beat stronger players, gain more points. Lose to weaker players, drop more. It resets the incentive to show up and play seriously.",
  },
  {
    q: "Do I need an account?",
    a: "Yes, to sign up for games and appear on the leaderboard. Ask an admin if you need an invite or help getting set up.",
  },
  {
    q: "Who runs the games?",
    a: "Admins schedule sessions, manage signups, and process results through the dashboard after each court day.",
  },
  {
    q: "I run the league — where do I log in?",
    a: "Use the Log in button. Admin accounts land in the dashboard to manage players, games, and standings.",
  },
];

onMounted(() => {
  if (route.hash) {
    const id = route.hash.replace("#", "");
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }
});
</script>

<template>
  <div>
    <!-- Hero -->
    <section id="home" class="scroll-mt-20 px-4 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
      <div class="mx-auto max-w-6xl">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-snow-dim"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-turf"></span>
          Court ranking ladder
        </span>

        <h1
          class="mt-5 max-w-2xl bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
        >
          {{ appConfig.name }}
        </h1>

        <p class="mt-5 max-w-xl text-base leading-relaxed text-snow-dim sm:text-lg">
          Sign up for court games, play your matches, and climb the leaderboard.
          Built for our group — not another generic sports app.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <router-link to="/login" class="btn-violet">
            <font-awesome-icon icon="sign-in-alt" />
            Log in to dashboard
          </router-link>
          <a href="#how-it-works" class="btn-glass">
            How it works
          </a>
        </div>

        <div class="mt-14 grid gap-4 sm:grid-cols-3">
          <div class="glass-card p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-asphalt-muted">
              Games
            </p>
            <p class="mt-2 text-2xl font-bold text-snow">Scheduled</p>
            <p class="mt-1 text-sm text-snow-dim">Upcoming court sessions with open spots.</p>
          </div>
          <div class="glass-card p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-asphalt-muted">
              Rankings
            </p>
            <p class="mt-2 text-2xl font-bold text-snow">ELO ladder</p>
            <p class="mt-1 text-sm text-snow-dim">Updated after every processed game.</p>
          </div>
          <div class="glass-card p-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-asphalt-muted">
              Admin
            </p>
            <p class="mt-2 text-2xl font-bold text-snow">Dashboard</p>
            <p class="mt-1 text-sm text-snow-dim">Players, games, and results in one place.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section
      id="how-it-works"
      class="scroll-mt-20 border-t border-white/5 px-4 py-16 lg:px-8 lg:py-20"
    >
      <div class="mx-auto max-w-6xl">
        <h2
          class="bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-3xl font-extrabold tracking-tight text-transparent"
        >
          How it works
        </h2>
        <p class="mt-2 max-w-lg text-sm text-snow-dim">
          Three steps. Show up, play, check the board.
        </p>

        <ol class="mt-10 grid gap-5 md:grid-cols-3">
          <li
            v-for="(step, index) in steps"
            :key="step.title"
            class="glass-card relative p-6"
          >
            <span
              class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-soft text-racket"
            >
              <font-awesome-icon :icon="step.icon" />
            </span>
            <p class="text-xs font-semibold uppercase tracking-wide text-asphalt-muted">
              Step {{ index + 1 }}
            </p>
            <h3 class="mt-1 text-lg font-bold text-snow">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-snow-dim">
              {{ step.text }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="scroll-mt-20 border-t border-white/5 px-4 py-16 lg:px-8 lg:py-20">
      <div class="mx-auto max-w-6xl">
        <h2
          class="bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-3xl font-extrabold tracking-tight text-transparent"
        >
          FAQ
        </h2>
        <p class="mt-2 text-sm text-snow-dim">
          Common questions before your first game.
        </p>

        <div class="mt-8 space-y-3">
          <details
            v-for="item in faqs"
            :key="item.q"
            class="group glass-card px-5 py-4"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-snow"
            >
              {{ item.q }}
              <font-awesome-icon
                icon="chevron-right"
                class="shrink-0 text-xs text-asphalt-muted transition-transform group-open:rotate-90"
              />
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-snow-dim">
              {{ item.a }}
            </p>
          </details>
        </div>

        <div class="mt-10 rounded-2xl border border-white/5 bg-white/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p class="font-semibold text-snow">Ready to manage the court?</p>
            <p class="mt-1 text-sm text-snow-dim">
              Admins use the dashboard to run games and update standings.
            </p>
          </div>
          <router-link to="/login" class="btn-violet mt-4 shrink-0 sm:mt-0">
            Go to dashboard
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
