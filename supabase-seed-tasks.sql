-- SQL to seed default tasks for a specific user in Supabase
-- Replace {USER_ID} with the actual user's UUID from auth.users

-- Generate default tasks for user {USER_ID}
INSERT INTO public.tasks (
    id, user_id, category_id, title, description, due_date, priority, status, 
    completed_at, notes, assigned_to, helpful_link, created_at, updated_at
) VALUES
-- FAFSA and Financial Aid (Critical Timeline)
(
    gen_random_uuid(),
    '{USER_ID}', -- Replace with actual user ID
    'c1a83e9c-8619-48be-a76c-997a6579c000', -- Financial Aid & FAFSA
    '🚨 Complete FAFSA Application',
    'Submit the Free Application for Federal Student Aid (FAFSA) as early as possible. Federal deadline is June 30, but state and college deadlines are much earlier.',
    '2026-01-01 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'Early submission recommended for maximum aid eligibility. Need tax documents from parents.',
    'parent',
    'https://studentaid.gov/h/apply-for-aid/fafsa',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    'c1a83e9c-8619-48be-a76c-997a6579c000', -- Financial Aid & FAFSA
    'CSS Profile Application',
    'Complete CSS Profile for private colleges and additional aid programs',
    '2026-01-01 23:59:00+00',
    'high',
    'pending',
    NULL,
    'Required by many private colleges. Check college-specific deadlines.',
    'parent',
    'https://cssprofile.collegeboard.org/',
    NOW(),
    NOW()
),

-- College Application Deadlines
(
    gen_random_uuid(),
    '{USER_ID}',
    'df6a446f-ab40-49ac-845f-9fc7c192a000', -- College Applications
    'Early Decision/Action Applications',
    'Submit early decision and early action applications for priority consideration',
    '2025-11-01 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'ED is binding, EA is not. Check each school''s specific requirements.',
    'student',
    'https://www.commonapp.org/',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    'df6a446f-ab40-49ac-845f-9fc7c192a000', -- College Applications
    'Common Application Deadline',
    'Submit Common Application for regular decision to all selected colleges',
    '2026-01-01 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'Most colleges use Common App. Check for any school-specific supplements.',
    'student',
    'https://www.commonapp.org/',
    NOW(),
    NOW()
),

-- Major Scholarships
(
    gen_random_uuid(),
    '{USER_ID}',
    'c1a83e9c-8619-48be-a76c-997a6579c000', -- Financial Aid & FAFSA
    '💰 National Merit Scholarship',
    'Complete National Merit Scholarship application if semi-finalist',
    '2026-02-15 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'Only for PSAT National Merit Semi-finalists. Up to $2,500 award. Extended deadline for 2026 graduates.',
    'student',
    'https://www.nationalmerit.org/',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    'c1a83e9c-8619-48be-a76c-997a6579c000', -- Financial Aid & FAFSA
    '💰 Coca-Cola Scholars Program',
    'Apply for $20,000 Coca-Cola Scholars Program scholarship',
    '2026-01-31 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'Leadership and academic excellence. 150 winners annually. Must be high school senior.',
    'student',
    'https://www.coca-colascholarsfoundation.org/',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    'c1a83e9c-8619-48be-a76c-997a6579c000', -- Financial Aid & FAFSA
    '💰 Jack Kent Cooke Foundation Scholarship',
    'Apply for Jack Kent Cooke Foundation College Scholarship (up to $55,000/year)',
    '2026-11-15 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'High-achieving students with financial need. Must have 3.5+ GPA and demonstrate leadership.',
    'student',
    'https://www.jkcf.org/our-scholarships/college-scholarship-program/',
    NOW(),
    NOW()
),

-- Testing and Transcripts
(
    gen_random_uuid(),
    '{USER_ID}',
    'a807e9bc-133b-4b8c-aad6-e513ff16bf4c', -- Testing & Transcripts
    'Send SAT/ACT Scores',
    'Send official test scores to all colleges on your list',
    '2025-12-15 23:59:00+00',
    'high',
    'pending',
    NULL,
    'Order through College Board (SAT) or ACT.org. Allow 2-3 weeks for delivery.',
    'student',
    'https://www.collegeboard.org/send-scores',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    'a807e9bc-133b-4b8c-aad6-e513ff16bf4c', -- Testing & Transcripts
    'Request High School Transcripts',
    'Request official transcripts from high school for all college applications',
    '2025-12-01 23:59:00+00',
    'high',
    'pending',
    NULL,
    'Contact guidance counselor early. Some schools need 2+ weeks processing time.',
    'student',
    NULL,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    'a807e9bc-133b-4b8c-aad6-e513ff16bf4c', -- Testing & Transcripts
    'Final Transcript After Graduation',
    'Send final high school transcript to enrolled college',
    '2026-07-01 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'CRITICAL: Required for enrollment. Must show graduation and final grades.',
    'student',
    NULL,
    NOW(),
    NOW()
),

-- Housing and Health
(
    gen_random_uuid(),
    '{USER_ID}',
    '8ee12cdc-45aa-409c-bcf4-a69167a0859e', -- Housing & Registration
    'Housing Application Deposit',
    'Submit housing application and deposit to secure on-campus housing',
    '2026-05-01 23:59:00+00',
    'high',
    'pending',
    NULL,
    'Most colleges require housing deposit by May 1st. Usually $200-500.',
    'parent',
    'https://bigfuture.collegeboard.org/plan-for-college/college-basics/applying-to-college/college-application-checklist',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    '{USER_ID}',
    '5a20dd15-4d99-457e-9313-af22d3e6ae00', -- Health & Documentation
    'Immunization Records',
    'Submit required immunization records to college health center',
    '2026-07-01 23:59:00+00',
    'urgent',
    'pending',
    NULL,
    'Required for enrollment. May need additional vaccines like meningitis.',
    'parent',
    NULL,
    NOW(),
    NOW()
);

-- Optional: Verify the tasks were created correctly
SELECT 
    t.title,
    c.name as category_name,
    t.due_date,
    t.priority,
    t.assigned_to
FROM public.tasks t
JOIN public.categories c ON t.category_id = c.id
WHERE t.user_id = '{USER_ID}'
ORDER BY t.due_date;