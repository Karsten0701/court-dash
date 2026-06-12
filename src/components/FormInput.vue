<script setup>
defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: "text" },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <label
      :for="id"
      class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
    >
      {{ label }} <span v-if="required" class="text-danger">*</span>
    </label>
    <input
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      class="mt-2 block w-full rounded-xl border border-white/10 bg-asphalt/60 px-4 py-3 text-snow placeholder:text-asphalt-muted transition-all focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
</template>
