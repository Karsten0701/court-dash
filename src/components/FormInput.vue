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
    <label :for="id" class="block text-sm font-medium text-snow">
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
      class="mt-1 block w-full px-3 py-2 bg-asphalt text-snow border border-asphalt-light rounded-md shadow-sm focus:outline-none focus:ring-racket focus:border-racket disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
</template>
