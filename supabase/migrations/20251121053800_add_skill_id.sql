alter table "public"."test_attempts" add column "skill_id" uuid;

alter table "public"."test_attempts" add constraint "test_attempts_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE not valid;

alter table "public"."test_attempts" validate constraint "test_attempts_skill_id_fkey";
