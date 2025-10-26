// Actual Supabase Category UUIDs
// Generated when running the schema on Supabase
export const SUPABASE_CATEGORY_IDS = {
  'College Applications': 'df6a446f-ab40-49ac-845f-9fc7c192a000',
  'Financial Aid & FAFSA': 'c1a83e9c-8619-48be-a76c-997a6579c000',
  'Housing & Registration': '8ee12cdc-45aa-409c-bcf4-a69167a0859e',
  'Testing & Transcripts': 'a807e9bc-133b-4b8c-aad6-e513ff16bf4c',
  'Health & Documentation': '5a20dd15-4d99-457e-9313-af22d3e6ae00',
  'Move-In Preparation': '3b871a7d-31a5-4385-b21c-a14bf239ffeb'
} as const;

// Mapping for backward compatibility with existing code
export const CATEGORY_ID_MAPPING = {
  'cat-1': 'df6a446f-ab40-49ac-845f-9fc7c192a000', // College Applications
  'cat-2': 'c1a83e9c-8619-48be-a76c-997a6579c000', // Financial Aid & FAFSA
  'cat-3': '8ee12cdc-45aa-409c-bcf4-a69167a0859e', // Housing & Registration
  'cat-4': 'a807e9bc-133b-4b8c-aad6-e513ff16bf4c', // Testing & Transcripts
  'cat-5': '5a20dd15-4d99-457e-9313-af22d3e6ae00', // Health & Documentation
  'cat-6': '3b871a7d-31a5-4385-b21c-a14bf239ffeb'  // Move-In Preparation
} as const;

// Helper function to get Supabase UUID from old category ID
export function getSupabaseCategoryId(oldCategoryId: string): string {
  return CATEGORY_ID_MAPPING[oldCategoryId as keyof typeof CATEGORY_ID_MAPPING] || oldCategoryId;
}

// Helper function to get category name from Supabase UUID
export function getCategoryNameFromId(supabaseId: string): string {
  const entry = Object.entries(SUPABASE_CATEGORY_IDS).find(([, id]) => id === supabaseId);
  return entry ? entry[0] : 'Unknown Category';
}