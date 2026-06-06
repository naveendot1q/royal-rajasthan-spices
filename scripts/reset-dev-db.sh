#!/bin/bash
set -e
echo "🗄️  Resetting development database..."
echo "⚠️  This deletes all local Supabase data!"
read -p "Continue? (yes/no): " confirm
[ "$confirm" != "yes" ] && { echo "Aborted."; exit 0; }

supabase db reset
echo "✅ Reset complete — seeding..."
pnpm --filter @rrs/database run seed
echo "✨ Done!"
