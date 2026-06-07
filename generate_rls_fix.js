const { execSync } = require('child_process');

const connectionString = 'postgres://postgres:qitma6-fojfer-hYrvyk@db.bdqxfbizakkzazsowhuz.supabase.co:5432/postgres';
const query = `
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND (qual ILIKE '%EXISTS ( SELECT 1%FROM profiles%' OR with_check ILIKE '%EXISTS ( SELECT 1%FROM profiles%');
`;

const output = execSync(`psql "${connectionString}" -t -A -F "|" -c "${query.trim()}"`).toString();

const lines = output.split('\n').filter(l => l.trim().length > 0);

let sql = '';
for (const line of lines) {
  const [tablename, policyname, qual, with_check] = line.split('|');
  if (tablename && policyname) {
    sql += `ALTER POLICY "${policyname}" ON public.${tablename} `;
    let changed = false;
    if (qual && qual.includes('profiles')) {
        sql += `USING (public.is_admin(auth.uid())) `;
        changed = true;
    }
    if (with_check && with_check.includes('profiles')) {
        sql += `WITH CHECK (public.is_admin(auth.uid())) `;
        changed = true;
    }
    sql += `;\n`;
  }
}

const fs = require('fs');
fs.writeFileSync('supabase/migrations/20260607052800_fix_all_rls_n1.sql', sql);
