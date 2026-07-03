# AthletiGolf Supabase Deployment Checklist

Use this after pulling the latest code into Bolt or before testing a fresh Supabase project.

## Apply migrations

Apply all pending files in `supabase/migrations` in timestamp order. The recent feature work depends on these areas:

- Username social discovery: profile username fields, display-name search preference, friend search RPCs.
- Wellness nutrition: source IDs, per-100g macros, serving grams, saturated fat and sugars on nutrition entries and saved foods.
- Feedback and notifications: `feedback_reports` and `notifications` for tester reports, admin review, and data requests.
- Cardio: `cardio_sessions` for manual run and walk logging, with Strava rows kept private if imported later.

If a migration has already been applied in Supabase, do not paste a duplicated copy into the SQL editor. Confirm the objects exist instead.

## Verify tables and columns

Check that these exist before beta testing:

- `profiles.username`, `profiles.username_search`, `profiles.show_display_name_in_search`, `profiles.role`.
- `nutrition_entries.source`, `external_id`, `serving_grams`, `calories_per_100g`, `protein_per_100g`, `carbs_per_100g`, `fats_per_100g`, `saturated_fats_per_100g`, `sugars_per_100g`.
- `saved_foods.source`, `external_id`, `serving_grams`, `calories_per_100g`, `protein_per_100g`, `carbs_per_100g`, `fats_per_100g`, `saturated_fats_per_100g`, `sugars_per_100g`.
- `cardio_sessions`.
- `feedback_reports`.
- `notifications`.
- `friend_connections`.

## Verify functions and edge functions

- RPC: `search_profiles_for_friend`.
- RPC: `get_friend_connections_with_profiles`.
- Edge Function: `food-search`.
- Environment variable for `food-search`: `USDA_API_KEY`.

## Smoke test after deploy

- Create an account and complete onboarding with a username.
- Search for another user by username.
- Log wellness nutrition from USDA search and edit the serving grams.
- Copy a meal into another meal slot.
- Request data export from Settings.
- Add a manual cardio run or walk.
- Open Dashboard and confirm the Today checklist, cardio tile and next action update.

## Policy notes

- USDA FoodData Central data is public domain/CC0, but AthletiGolf should keep source labels and the USDA notice visible.
- Nutrition values are estimates, not medical advice or exact product labels.
- Strava data, if imported later, should stay private to the user and should not be used for AthletiAI, social sharing, advertising, or cross-user analytics without a separate reviewed change.
