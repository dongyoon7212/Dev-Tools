export function useProcessingState(input, debouncedInput) {
  return { isProcessing: input !== debouncedInput };
}
