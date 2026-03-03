export interface AttendanceRecord {
    studentId: string;
    present: boolean;
    date?: string;
}
export declare class AttendanceService {
    static recordAttendance(date: string | undefined, records: AttendanceRecord[]): Promise<never[] | {
        createdCount: number;
    }>;
    static getStats(): Promise<{
        id: string | number;
        name: any;
        avatar: any;
        patrolId: any;
        presentCount: number;
        absentCount: number;
    }[]>;
}
//# sourceMappingURL=attendance.d.ts.map