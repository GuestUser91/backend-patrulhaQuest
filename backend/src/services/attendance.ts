import prisma from '../prisma';

export interface AttendanceRecord {
  studentId: string;
  present: boolean;
  date?: string;
}

export class AttendanceService {
  static async recordAttendance(date: string | undefined, records: AttendanceRecord[]) {
    const d = date ? new Date(date) : new Date();
    // Use createMany to avoid opening many connections in a loop which can exhaust the pool
    if (!records || records.length === 0) return [];

    const data = records.map(r => ({
      studentId: r.studentId,
      present: r.present,
      date: d,
    }));

    try {
      const result = await prisma.attendance.createMany({ data });
      // createMany returns count of created records; fetch created rows if necessary
      return { createdCount: result.count };
    } catch (err) {
      // rethrow for route handler to format
      throw err;
    }
  }

  static async getStats() {
    // Get list of students
    const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, avatar: true, patrolId: true } });

    // Aggregate attendance counts grouped by studentId and present flag to minimize DB calls
    const groups = await prisma.attendance.groupBy({
      by: ['studentId', 'present'],
      _count: { _all: true },
    });

    const countsMap: Record<string, { presentCount: number; absentCount: number }> = {};
    for (const g of groups) {
      const sid = g.studentId;
      if (!countsMap[sid]) countsMap[sid] = { presentCount: 0, absentCount: 0 };
      if (g.present) countsMap[sid].presentCount = g._count._all;
      else countsMap[sid].absentCount = g._count._all;
    }

    const stats = students.map((s: { id: string | number; name: any; avatar: any; patrolId: any; }) => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      patrolId: s.patrolId,
      presentCount: countsMap[s.id]?.presentCount || 0,
      absentCount: countsMap[s.id]?.absentCount || 0,
    }));

    return stats;
  }
}
