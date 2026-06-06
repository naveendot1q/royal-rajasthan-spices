#!/bin/bash
supabase gen types typescript --local \
  > packages/database/src/database.types.ts
echo "✅ Types written to packages/database/src/database.types.ts"
