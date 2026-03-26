import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const timestapms = {
  createAt: timestamp("created_at").defaultNow().notNull(),
  //// 생성 시 자동 시간, 업데이트 시 자동 갱신
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/**
 * 담당 부서들
 * @ interger : 정수(숫자연산)
 * @ varchar : 문자열(길이 변동이 심할떄)
 * @ primaryKey : 테이블 기본 키
 * @ generateAlwaysAsldentity : postgresSQL 에서 지원하는 최신 ID 생성 방식
 * @@ IDENTITY: 시스템이 자동으로 숫자를 생성
 * @@ ALWAYS: 사용자가 INSERT 문에서 직접 id 값을 명시적으로 삽입하려고 하면 오류가 발생 (데이터 시퀀스가 항상 자신의 시퀀스 값을 사용하여 덷이터 무결성을 보장)
 * @@ notNull :  필수값
 * @@ unique : 컬럼 값은 중복될수 없음.
 */
//담당 부서들
export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 250 }).notNull(),
  description: varchar("description", { length: 255 }),
  ...timestapms,
});

// 과목
export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  departmentsId: integer("departments_id")
    .notNull()
    .references(() => departments.id, {
      onDelete: "restrict", //부모 테이블의 데이터가 자식테이블에서 참족되고있을때 부모테이블 삭제할수 없음.
    }),
  name: varchar("name", { length: 250 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  ...timestapms,
});

// 관련 부서 : many(subjects) → 하나의 department에 subject가 여러 개 연결됨
export const departmentRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));

// 관련 부서 : many(subjects) → 하나의 department에 subject가 여러 개 연결됨
export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentsId],
    references: [departments.id],
  }),
}));

//$inferInsert: 데이터베이스 로 전송하는 내용을 나타냅니다 (일련번호는 제외, 기본값은 선택 사항으로 포함).
//$inferSelect: 데이터베이스 에서 가져온 값을 나타냅니다 (모든 필드가 포함되며, 일반적으로 null 허용 필드는 로 표시됩니다 | null).
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Subjects = typeof subjects.$inferSelect;
export type NewSubjects = typeof subjects.$inferInsert;
