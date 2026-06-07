echo "y" | bunx vercel env rm SUPABASE_URL production
echo "y" | bunx vercel env rm SUPABASE_URL preview
echo "y" | bunx vercel env rm SUPABASE_URL development
printf "%s" "https://bdqxfbizakkzazsowhuz.supabase.co" | bunx vercel env add SUPABASE_URL production
printf "%s" "https://bdqxfbizakkzazsowhuz.supabase.co" | bunx vercel env add SUPABASE_URL preview
printf "%s" "https://bdqxfbizakkzazsowhuz.supabase.co" | bunx vercel env add SUPABASE_URL development

echo "y" | bunx vercel env rm NEXT_PUBLIC_SUPABASE_URL production
echo "y" | bunx vercel env rm NEXT_PUBLIC_SUPABASE_URL preview
echo "y" | bunx vercel env rm NEXT_PUBLIC_SUPABASE_URL development
printf "%s" "https://bdqxfbizakkzazsowhuz.supabase.co" | bunx vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf "%s" "https://bdqxfbizakkzazsowhuz.supabase.co" | bunx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
printf "%s" "https://bdqxfbizakkzazsowhuz.supabase.co" | bunx vercel env add NEXT_PUBLIC_SUPABASE_URL development

echo "y" | bunx vercel env rm SUPABASE_ANON_KEY production
echo "y" | bunx vercel env rm SUPABASE_ANON_KEY preview
echo "y" | bunx vercel env rm SUPABASE_ANON_KEY development
printf "%s" "sb_publishable_8UlzKVKFjwkuCMQfXebqgQ_LE-C05_l" | bunx vercel env add SUPABASE_ANON_KEY production
printf "%s" "sb_publishable_8UlzKVKFjwkuCMQfXebqgQ_LE-C05_l" | bunx vercel env add SUPABASE_ANON_KEY preview
printf "%s" "sb_publishable_8UlzKVKFjwkuCMQfXebqgQ_LE-C05_l" | bunx vercel env add SUPABASE_ANON_KEY development

echo "y" | bunx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "y" | bunx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "y" | bunx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY development
printf "%s" "sb_publishable_8UlzKVKFjwkuCMQfXebqgQ_LE-C05_l" | bunx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
printf "%s" "sb_publishable_8UlzKVKFjwkuCMQfXebqgQ_LE-C05_l" | bunx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
printf "%s" "sb_publishable_8UlzKVKFjwkuCMQfXebqgQ_LE-C05_l" | bunx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo "y" | bunx vercel env rm SUPABASE_SERVICE_ROLE_KEY production
echo "y" | bunx vercel env rm SUPABASE_SERVICE_ROLE_KEY preview
echo "y" | bunx vercel env rm SUPABASE_SERVICE_ROLE_KEY development
printf "%s" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXhmYml6YWtremF6c293aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2NTY3NywiZXhwIjoyMDk2MzQxNjc3fQ.KiT4ejUEahgFAiB0_bl8AGS_3hZQ_2mBly35d2MktAI" | bunx vercel env add SUPABASE_SERVICE_ROLE_KEY production
printf "%s" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXhmYml6YWtremF6c293aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2NTY3NywiZXhwIjoyMDk2MzQxNjc3fQ.KiT4ejUEahgFAiB0_bl8AGS_3hZQ_2mBly35d2MktAI" | bunx vercel env add SUPABASE_SERVICE_ROLE_KEY preview
printf "%s" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXhmYml6YWtremF6c293aHV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc2NTY3NywiZXhwIjoyMDk2MzQxNjc3fQ.KiT4ejUEahgFAiB0_bl8AGS_3hZQ_2mBly35d2MktAI" | bunx vercel env add SUPABASE_SERVICE_ROLE_KEY development
