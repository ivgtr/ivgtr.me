import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const incrementCountSQL = `
  INSERT INTO tb_count (name, count)
  VALUES ('ivgtr', 1)
  ON CONFLICT (name)
  DO UPDATE SET count = tb_count.count + 1
  RETURNING count;
`;

export async function GET() {
	const sql = neon(process.env.DB_URL!);
	const [count] = await sql(incrementCountSQL);

	return NextResponse.json({
		count: Number(count.count) + 1,
	});
}
