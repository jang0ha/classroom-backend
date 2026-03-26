import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema/app.js";
import { db } from "../db/index.js";

const router = express.Router();

//get all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
    const limitPerPage = Math.min(
      Math.max(1, parseInt(String(limit), 10) || 10),
      100,
    ); // 페이지당 표시할 항목수

    const offset = (currentPage - 1) * limitPerPage;
    const filterConditions = [];

    // if search query exists, filter by subject name OR subject code
    // or(...)이름 이나 코드가 일치하면 해당 레코드가 반환되도록 합니다.
    //ilike(col, pattern): 대소문자를 구분하지 않고 검색합니다.
    //%${search}%검색어로 끝나는 모든 문자열과 일치합니다. => 텍스트 어느 위치에서든 문자열과 일치시키려면 %${TEXT}%
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }
    // If dpartment filter exists, match department name
    if (department) {
      const deptPattern = `%${String(department).replace(/[%_]/g, `\\$&`)}%`;
      filterConditions.push(ilike(departments.name, deptPattern));
    }

    //combine all filters using AND if any exits
    //and() : &&
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentsId, departments.id)) //  whereClause에서 학과 기준에 따라 주제를 필터링하는 데 사용될 departments 테이블을 조인,
      .where(whereClause);

    // 전체 데이터 항목수
    const totalCount = countResult[0]?.count ?? 0; //?? 0 => 빈 배열을 반환하는 경우 undefined 대신 0 반환

    const subjectList = await db
      .select({
        ...getTableColumns(subjects),
        department: {
          ...getTableColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentsId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage), //정수로 올림
      },
    });
  } catch (error) {
    console.error(`GET /subjects error: ${error}`);
    res.status(500).json({ error: "Failed to get subjects" });
  }
});

export default router;
